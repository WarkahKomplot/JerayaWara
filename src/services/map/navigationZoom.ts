/** Speed-adaptive follow zoom, roughly matching Google Maps' driving view. */
export function navigationZoomForSpeed(speedKmH: number): number {
  const speed = Math.max(0, Math.min(130, speedKmH));
  if (speed <= 20) return 17.2;
  if (speed <= 40) return 17.2 - ((speed - 20) / 20) * 0.3;
  if (speed <= 90) return 16.9 - ((speed - 40) / 50) * 0.7;
  return 16.2;
}

/** Keep manual zoom within 3 levels out / 4 levels in of the auto zoom. */
export function clampUserZoomOffset(offset: number): number {
  return Math.max(-3, Math.min(4, offset));
}
