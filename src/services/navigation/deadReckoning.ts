/**
 * Malaysian Highway Tunnel Dead-Reckoning & GPS Smoothing Engine
 *
 * When navigating through tunnels (e.g. SMART Tunnel E38, Genting Sempah Karak E8,
 * Penchala Tunnel SPRINT E23, or deep multi-level underpasses), satellite signals
 * are blocked and GPS accuracy degrades (>75m) or position updates stall entirely.
 *
 * This engine extrapolates the vehicle's position smoothly forward along the active
 * route polyline using the vehicle's last recorded velocity and heading for up to
 * 90 seconds, smoothly relinquishing back to GNSS satellite lock upon exiting.
 */

export interface NavPosition {
  coord: [number, number]; // [lng, lat]
  heading: number;
  speedKmH: number;
  accuracy: number;
  timestamp: number;
}

export const DEAD_RECKONING_MAX_DURATION_MS = 90 * 1000; // 90 seconds max
export const DEGRADED_ACCURACY_THRESHOLD_METERS = 75; // Accuracy worse than 75m
export const STALLED_UPDATE_THRESHOLD_MS = 2500; // 2.5s without GPS update while driving
export const MIN_DEAD_RECKONING_SPEED_KMH = 8; // At least walking/crawling speed

/**
 * Calculates distance in meters between two [lng, lat] points (equirectangular approximation).
 */
export function distanceMeters(p1: [number, number], p2: [number, number]): number {
  const dLng = (p2[0] - p1[0]) * 111320 * Math.cos(((p1[1] + p2[1]) / 2) * (Math.PI / 180));
  const dLat = (p2[1] - p1[1]) * 110540;
  return Math.hypot(dLng, dLat);
}

/**
 * Calculates compass heading (0-360°) from p1 to p2.
 */
export function bearingDegrees(p1: [number, number], p2: [number, number]): number {
  const y = Math.sin((p2[0] - p1[0]) * (Math.PI / 180)) * Math.cos(p2[1] * (Math.PI / 180));
  const x =
    Math.cos(p1[1] * (Math.PI / 180)) * Math.sin(p2[1] * (Math.PI / 180)) -
    Math.sin(p1[1] * (Math.PI / 180)) *
      Math.cos(p2[1] * (Math.PI / 180)) *
      Math.cos((p2[0] - p1[0]) * (Math.PI / 180));
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

/**
 * Finds the closest segment on the polyline and advances forward along the line
 * by the requested distance in meters.
 */
export function advanceAlongPolyline(
  polyline: [number, number][],
  currentCoord: [number, number],
  advanceMeters: number
): { coord: [number, number]; heading: number } {
  if (!polyline || polyline.length < 2) {
    return { coord: currentCoord, heading: 0 };
  }

  // 1. Build cumulative distance array
  const cumDists: number[] = [0];
  for (let i = 0; i < polyline.length - 1; i++) {
    cumDists.push(cumDists[i] + distanceMeters(polyline[i], polyline[i + 1]));
  }
  const totalDist = cumDists[cumDists.length - 1];

  // 2. Project currentCoord onto closest segment to find current progress along line
  let bestDist = Infinity;
  let currentS = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];
    const segLen = cumDists[i + 1] - cumDists[i];
    if (segLen === 0) continue;

    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((currentCoord[0] - a[0]) * dx + (currentCoord[1] - a[1]) * dy) / lenSq));
    const proj: [number, number] = [a[0] + t * dx, a[1] + t * dy];
    const d = distanceMeters(currentCoord, proj);

    if (d < bestDist) {
      bestDist = d;
      currentS = cumDists[i] + t * segLen;
    }
  }

  // 3. Target distance forward along route
  const targetS = Math.min(totalDist, currentS + advanceMeters);
  if (targetS >= totalDist) {
    const lastP = polyline[polyline.length - 1];
    const prevP = polyline[polyline.length - 2];
    return {
      coord: [Number(lastP[0].toFixed(6)), Number(lastP[1].toFixed(6))],
      heading: Math.round(bearingDegrees(prevP, lastP))
    };
  }

  // 4. Find segment containing targetS via binary search
  let low = 0, high = cumDists.length - 1;
  while (low < high - 1) {
    const mid = (low + high) >> 1;
    if (cumDists[mid] <= targetS) low = mid;
    else high = mid;
  }
  const segStart = cumDists[low];
  const segEnd = cumDists[low + 1];
  const segRatio = segEnd > segStart ? (targetS - segStart) / (segEnd - segStart) : 0;
  const p1 = polyline[low];
  const p2 = polyline[low + 1];
  const lng = p1[0] + (p2[0] - p1[0]) * segRatio;
  const lat = p1[1] + (p2[1] - p1[1]) * segRatio;
  const heading = bearingDegrees(p1, p2);

  return {
    coord: [Number(lng.toFixed(6)), Number(lat.toFixed(6))],
    heading: Math.round(heading)
  };
}

export class DeadReckoningEngine {
  private lastGoodPosition: NavPosition | null = null;
  private deadReckoningStartTime: number | null = null;

  /**
   * Feed a new raw GPS position from the device watch.
   */
  public updateGpsPosition(pos: NavPosition): void {
    if (pos.accuracy <= DEGRADED_ACCURACY_THRESHOLD_METERS) {
      // Good satellite lock
      this.lastGoodPosition = { ...pos };
      this.deadReckoningStartTime = null;
    } else if (this.lastGoodPosition && !this.deadReckoningStartTime) {
      // Accuracy just degraded (e.g. entered tunnel)
      this.deadReckoningStartTime = pos.timestamp;
    }
  }

  /**
   * Determines whether dead-reckoning extrapolation is currently active.
   */
  public isDeadReckoningActive(now: number = Date.now()): boolean {
    if (!this.lastGoodPosition) return false;
    if (this.lastGoodPosition.speedKmH < MIN_DEAD_RECKONING_SPEED_KMH) return false;

    const timeSinceLastGood = now - this.lastGoodPosition.timestamp;
    if (timeSinceLastGood < STALLED_UPDATE_THRESHOLD_MS && !this.deadReckoningStartTime) {
      return false;
    }

    if (timeSinceLastGood > DEAD_RECKONING_MAX_DURATION_MS) {
      return false;
    }

    return true;
  }

  /**
   * Returns either real GPS coordinates or extrapolated tunnel position along the route.
   */
  public getResolvedPosition(
    currentRaw: NavPosition,
    activeRoutePolyline?: [number, number][],
    now: number = Date.now()
  ): { position: NavPosition; isExtrapolated: boolean } {
    // If raw GPS is high accuracy and fresh, use it directly
    const timeSinceRaw = now - currentRaw.timestamp;
    if (currentRaw.accuracy <= DEGRADED_ACCURACY_THRESHOLD_METERS && timeSinceRaw < STALLED_UPDATE_THRESHOLD_MS) {
      this.lastGoodPosition = { ...currentRaw };
      this.deadReckoningStartTime = null;
      return { position: currentRaw, isExtrapolated: false };
    }

    // Check if dead-reckoning should engage
    if (
      activeRoutePolyline &&
      activeRoutePolyline.length >= 2 &&
      this.isDeadReckoningActive(now) &&
      this.lastGoodPosition
    ) {
      const elapsedSeconds = (now - this.lastGoodPosition.timestamp) / 1000;
      const speedMetersPerSec = (this.lastGoodPosition.speedKmH * 1000) / 3600;
      const advanceDist = speedMetersPerSec * elapsedSeconds;

      const advanced = advanceAlongPolyline(activeRoutePolyline, this.lastGoodPosition.coord, advanceDist);

      return {
        position: {
          coord: advanced.coord,
          heading: advanced.heading,
          speedKmH: this.lastGoodPosition.speedKmH,
          accuracy: 15, // Synthetic locked tunnel accuracy
          timestamp: now
        },
        isExtrapolated: true
      };
    }

    // Default fallback to raw
    return { position: currentRaw, isExtrapolated: false };
  }

  public reset(): void {
    this.lastGoodPosition = null;
    this.deadReckoningStartTime = null;
  }
}

