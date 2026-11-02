/**
 * Route Drift & Geometry Integrity Verification.
 * Computes lateral road deviation (routeGap) between a candidate route
 * and a reference road corridor using fast planar projection.
 *
 * Ensures alternative routes, GPS updates, and traffic replans do not
 * stray into unauthorized detours, restricted paths, or off-corridor loops.
 */

export interface RouteIntegrityOptions {
  maxAllowedGapMeters?: number; // Maximum allowed distance from corridor (default: 150m)
  maxMissPercentage?: number;   // Maximum allowed proportion of drifting points (default: 0.05 = 5%)
  targetSampleCount?: number;   // Number of evenly-spaced sample points (default: 60)
}

export interface RouteIntegrityResult {
  isValid: boolean;
  hasDrifted: boolean;
  driftPercentage: number;
  maxObservedGapMeters: number;
  sampleCount: number;
  missCount: number;
  reason?: string;
}

/**
 * Calculates the shortest distance in meters from a point P to a reference polyline.
 * Uses high-speed local cosine projection.
 */
export function routeGapMeters(
  point: [number, number],
  referencePolyline: [number, number][]
): number {
  if (referencePolyline.length < 2) return Infinity;

  let bestDist = Infinity;
  const pLng = point[0];
  const pLat = point[1];
  const cosLat = Math.cos((pLat * Math.PI) / 180);

  for (let i = 0; i < referencePolyline.length - 1; i++) {
    const a = referencePolyline[i];
    const b = referencePolyline[i + 1];

    // Local meter conversion
    const ax = (a[0] - pLng) * cosLat * 111320;
    const ay = (a[1] - pLat) * 110574;
    const dx = (b[0] - a[0]) * cosLat * 111320;
    const dy = (b[1] - a[1]) * 110574;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 0.001) {
      const d = Math.hypot(ax, ay);
      if (d < bestDist) bestDist = d;
      continue;
    }

    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lenSq));
    const dist = Math.hypot(ax + t * dx, ay + t * dy);
    if (dist < bestDist) {
      bestDist = dist;
    }
  }

  return bestDist;
}

/**
 * Verifies that a candidate route polyline does not drift materially
 * from the reference highway/arterial route corridor.
 */
export function verifyRouteIntegrity(
  candidatePolyline: [number, number][],
  referencePolyline: [number, number][],
  options?: RouteIntegrityOptions
): RouteIntegrityResult {
  const maxGap = options?.maxAllowedGapMeters ?? 150;
  const maxMissRatio = options?.maxMissPercentage ?? 0.05;
  const targetSamples = options?.targetSampleCount ?? 60;

  if (candidatePolyline.length < 2 || referencePolyline.length < 2) {
    return {
      isValid: false,
      hasDrifted: true,
      driftPercentage: 100,
      maxObservedGapMeters: Infinity,
      sampleCount: 0,
      missCount: 0,
      reason: 'Insufficient route geometry coordinates'
    };
  }

  const stride = Math.max(1, Math.floor(candidatePolyline.length / targetSamples));
  let samples = 0;
  let misses = 0;
  let maxObservedGap = 0;

  for (let i = 0; i < candidatePolyline.length; i += stride) {
    samples++;
    const pt = candidatePolyline[i];
    const gap = routeGapMeters(pt, referencePolyline);

    if (gap > maxObservedGap) {
      maxObservedGap = gap;
    }

    if (gap > maxGap) {
      misses++;
    }
  }

  // Also verify end point proximity (must arrive near reference destination)
  const lastCandidate = candidatePolyline[candidatePolyline.length - 1];
  const lastReference = referencePolyline[referencePolyline.length - 1];
  const destGap = routeGapMeters(lastCandidate, [lastReference, lastReference]);
  if (destGap > maxGap * 2) {
    misses += 2;
  }

  const missRatio = misses / Math.max(1, samples);
  const driftPercentage = Math.round(missRatio * 1000) / 10;
  const hasDrifted = missRatio > maxMissRatio;

  return {
    isValid: !hasDrifted,
    hasDrifted,
    driftPercentage,
    maxObservedGapMeters: Math.round(maxObservedGap * 10) / 10,
    sampleCount: samples,
    missCount: misses,
    reason: hasDrifted
      ? `Route drifted > ${maxGap}m from expected corridor (${misses}/${samples} points outside tolerance)`
      : undefined
  };
}

