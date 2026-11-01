import { EnRouteAmenity, EnRouteAmenityWithDistance } from './types';
import { MALAYSIA_EXPRESSWAY_AMENITIES } from './expresswayAmenitiesData';
import { getCachedOsmEvStations } from './osmEvService';

export function haversineDistanceKm(
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
 * Retrieve combined baseline expressway amenities and cached OpenStreetMap EV stations,
 * deduplicating entries within 150 meters.
 */
export function getAllAvailableAmenities(): EnRouteAmenity[] {
  const cachedEv = getCachedOsmEvStations();
  if (!cachedEv || cachedEv.length === 0) {
    return MALAYSIA_EXPRESSWAY_AMENITIES;
  }

  const merged: EnRouteAmenity[] = [...MALAYSIA_EXPRESSWAY_AMENITIES];
  for (const ev of cachedEv) {
    const isDuplicate = MALAYSIA_EXPRESSWAY_AMENITIES.some(base => {
      if (base.type !== 'ev_fast_charger') return false;
      const d = haversineDistanceKm(base.coordinates, ev.coordinates);
      return d < 0.15;
    });
    if (!isDuplicate) {
      merged.push(ev);
    }
  }
  return merged;
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

  // Compute route bounding box with 22km (~0.2deg) margin for O(1) early rejection
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (let i = 0; i < routeCoordinates.length; i++) {
    const [lng, lat] = routeCoordinates[i];
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const buffer = 0.22;
  const bboxMinLng = minLng - buffer;
  const bboxMaxLng = maxLng + buffer;
  const bboxMinLat = minLat - buffer;
  const bboxMaxLat = maxLat + buffer;

  const allAmenities = getAllAvailableAmenities();

  // Filter by category
  const filtered = allAmenities.filter(item => {
    if (category === 'all') return true;
    if (category === 'ev') return item.type === 'ev_fast_charger';
    if (category === 'petrol') return item.type !== 'ev_fast_charger';
    return true;
  });

  const candidates: EnRouteAmenityWithDistance[] = [];

  for (const amenity of filtered) {
    const [aLng, aLat] = amenity.coordinates;
    // O(1) Spatial bounding box pre-filter to bypass expensive polyline iteration
    if (aLng < bboxMinLng || aLng > bboxMaxLng || aLat < bboxMinLat || aLat > bboxMaxLat) {
      continue;
    }

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
