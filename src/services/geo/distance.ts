/** Great-circle distance in kilometers between two [lng, lat] points. */
export function distanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/** Precise distance in meters between two [lng, lat] points. */
export function distanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const dLng =
    (coord2[0] - coord1[0]) *
    111320 *
    Math.cos((((coord1[1] + coord2[1]) / 2) * Math.PI) / 180);
  const dLat = (coord2[1] - coord1[1]) * 110574;
  return Math.hypot(dLng, dLat);
}
