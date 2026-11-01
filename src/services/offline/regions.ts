export interface RegionPack {
  id: 'klang-valley' | 'northern' | 'southern' | 'east-coast' | 'sarawak' | 'sabah' | 'highway-spine';
  name: string;
  sizeMB: number;
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  states: string[];
  description: string;
}

export const MALAYSIA_REGIONS: RegionPack[] = [
  {
    id: 'highway-spine',
    name: 'Malaysia Highway Spine (Core)',
    sizeMB: 12,
    bounds: [99.6, 1.25, 119.3, 7.4],
    states: ['All Highways', 'PLUS', 'LPT', 'Pan-Borneo'],
    description: 'Nationwide expressways and primary highway corridors.'
  },
  {
    id: 'klang-valley',
    name: 'Klang Valley & Central',
    sizeMB: 65,
    bounds: [101.1, 2.6, 102.05, 3.72],
    states: ['Kuala Lumpur', 'Selangor', 'Putrajaya'],
    description: 'Metropolitan KL, Klang, Petaling Jaya, Shah Alam, Putrajaya & Cyberjaya.'
  },
  {
    id: 'northern',
    name: 'Northern Region',
    sizeMB: 55,
    bounds: [99.6, 3.65, 101.85, 6.75],
    states: ['Perak', 'Penang (Pulau Pinang)', 'Kedah', 'Perlis'],
    description: 'George Town, Ipoh, Alor Setar, Taiping, Kangar and Langkawi.'
  },
  {
    id: 'southern',
    name: 'Southern Region',
    sizeMB: 50,
    bounds: [101.7, 1.25, 104.4, 3.1],
    states: ['Negeri Sembilan', 'Melaka', 'Johor'],
    description: 'Seremban, Melaka City, Johor Bahru, Batu Pahat, Muar and Port Dickson.'
  },
  {
    id: 'east-coast',
    name: 'East Coast Region',
    sizeMB: 45,
    bounds: [101.3, 2.5, 103.6, 6.3],
    states: ['Pahang', 'Terengganu', 'Kelantan'],
    description: 'Kuantan, Kuala Terengganu, Kota Bharu, Temerloh and Genting Highlands.'
  },
  {
    id: 'sarawak',
    name: 'Sarawak Region',
    sizeMB: 45,
    bounds: [109.5, 0.8, 115.6, 5.0],
    states: ['Sarawak'],
    description: 'Kuching, Sibu, Bintulu, Miri and Pan-Borneo Highway.'
  },
  {
    id: 'sabah',
    name: 'Sabah & Labuan Region',
    sizeMB: 40,
    bounds: [115.1, 4.0, 119.3, 7.4],
    states: ['Sabah', 'WP Labuan'],
    description: 'Kota Kinabalu, Sandakan, Tawau, Kudat and WP Labuan.'
  }
];

/**
 * Checks if a coordinate is strictly inside a region's bounding box
 */
export function isPointInBounds(coord: [number, number], bounds: [number, number, number, number]): boolean {
  const [lng, lat] = coord;
  const [minLng, minLat, maxLng, maxLat] = bounds;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

/**
 * Approximate distance in kilometers from a coordinate to a bounding box.
 * Returns 0 if coordinate is inside.
 */
export function distanceKmToBoundingBox(coord: [number, number], bounds: [number, number, number, number]): number {
  const [lng, lat] = coord;
  const [minLng, minLat, maxLng, maxLat] = bounds;

  if (isPointInBounds(coord, bounds)) {
    return 0;
  }

  // Nearest point on box
  const clampLng = Math.max(minLng, Math.min(lng, maxLng));
  const clampLat = Math.max(minLat, Math.min(lat, maxLat));

  // Haversine formula between (lng, lat) and (clampLng, clampLat)
  const R = 6371; // Earth radius in km
  const dLat = ((clampLat - lat) * Math.PI) / 180;
  const dLng = ((clampLng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((clampLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Detects all regions within thresholdKm (default 15km)
 */
export function detectProximityBoundary(coord: [number, number], thresholdKm: number = 15): RegionPack[] {
  return MALAYSIA_REGIONS.filter(region => {
    // Exclude the nationwide spine from proximity triggers
    if (region.id === 'highway-spine') return false;
    const dist = distanceKmToBoundingBox(coord, region.bounds);
    return dist <= thresholdKm;
  });
}

/**
 * Checks if a coordinate is covered by any of the currently cached region IDs
 */
export function isLocationCached(coord: [number, number], cachedRegionIds: string[]): boolean {
  for (const regionId of cachedRegionIds) {
    if (regionId === 'highway-spine') continue;
    const region = MALAYSIA_REGIONS.find(r => r.id === regionId);
    if (region && isPointInBounds(coord, region.bounds)) {
      return true;
    }
  }
  return false;
}
