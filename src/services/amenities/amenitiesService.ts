import { EnRouteAmenity, EnRouteAmenityWithDistance } from './types';
import { MALAYSIA_EXPRESSWAY_AMENITIES } from './expresswayAmenitiesData';

function haversineDistanceKm(
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
  return R * c;
}

/**
 * Find the minimum distance from a coordinate to any point along the route polyline.
 */
function minDistanceToRoute(
  coord: [number, number],
  routeCoords: [number, number][]
): { minDist: number; closestIdx: number } {
  let minDist = Infinity;
  let closestIdx = 0;

  for (let i = 0; i < routeCoords.length; i++) {
    const dist = haversineDistanceKm(coord, routeCoords[i]);
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }

  return { minDist, closestIdx };
}

/**
 * Computes upcoming expressway amenities (petrol stations and EV fast chargers)
 * along the active navigation route polyline.
 */
export function getUpcomingAmenities(
  routeCoordinates: [number, number][],
  currentCoord: [number, number],
  category: 'all' | 'petrol' | 'ev' = 'all',
  limit: number = 3
): EnRouteAmenityWithDistance[] {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    return [];
  }

  // Find where current vehicle is along the route polyline
  const { closestIdx: currentRouteIdx } = minDistanceToRoute(
    currentCoord,
    routeCoordinates
  );

  // Filter by category
  const filtered = MALAYSIA_EXPRESSWAY_AMENITIES.filter(item => {
    if (category === 'all') return true;
    if (category === 'ev') return item.type === 'ev_fast_charger';
    if (category === 'petrol') return item.type !== 'ev_fast_charger';
    return true;
  });

  const candidates: EnRouteAmenityWithDistance[] = [];

  for (const amenity of filtered) {
    // Proximity to route corridor (within 20km of expressway polyline)
    const { minDist, closestIdx: amenityRouteIdx } = minDistanceToRoute(
      amenity.coordinates,
      routeCoordinates
    );

    // Must be in corridor, and along or ahead of current position
    if (minDist <= 20 && amenityRouteIdx >= Math.max(0, currentRouteIdx - 1)) {
      const distanceKm = haversineDistanceKm(currentCoord, amenity.coordinates);
      candidates.push({
        ...amenity,
        distanceKm: Math.round(distanceKm * 10) / 10
      });
    }
  }

  // Sort by progressive distance from current vehicle location
  candidates.sort((a, b) => a.distanceKm - b.distanceKm);

  return candidates.slice(0, limit);
}
