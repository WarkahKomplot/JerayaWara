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

  // 1. Find closest vertex/segment index on polyline
  let closestIdx = 0;
  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceMeters(currentCoord, polyline[i]);
    if (d < minDistance) {
      minDistance = d;
      closestIdx = i;
    }
  }

  // 2. Trace forward from closestIdx by advanceMeters
  let remainingMeters = advanceMeters;
  let currPoint: [number, number] = polyline[closestIdx];
  let currHeading = bearingDegrees(polyline[closestIdx], polyline[Math.min(polyline.length - 1, closestIdx + 1)]);

  for (let i = closestIdx; i < polyline.length - 1; i++) {
    const nextPoint = polyline[i + 1];
    const segLen = distanceMeters(currPoint, nextPoint);

    if (segLen === 0) continue;

    currHeading = Math.round(bearingDegrees(currPoint, nextPoint));

    if (remainingMeters <= segLen) {
      const ratio = remainingMeters / segLen;
      const interpLng = currPoint[0] + (nextPoint[0] - currPoint[0]) * ratio;
      const interpLat = currPoint[1] + (nextPoint[1] - currPoint[1]) * ratio;
      return {
        coord: [Number(interpLng.toFixed(6)), Number(interpLat.toFixed(6))],
        heading: currHeading
      };
    }

    remainingMeters -= segLen;
    currPoint = nextPoint;
  }

  // Reached end of polyline
  const lastPoint = polyline[polyline.length - 1];
  return { coord: lastPoint, heading: currHeading };
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
