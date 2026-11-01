export interface MotorcycleShelter {
  id: string;
  name: string;
  expressway: string;
  kmMarker: string;
  coordinates: [number, number]; // [lng, lat]
  hasDedicatedBay: boolean;
}

function calculateDistanceKm(
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

export const MALAYSIA_MOTORCYCLE_SHELTERS: MotorcycleShelter[] = [
  // PLUS E1
  {
    id: 'shelter-plus-km445',
    name: 'Pondok Teduhan Jejantas KM 445 (Rawang)',
    expressway: 'PLUS E1',
    kmMarker: 'KM 445',
    coordinates: [101.579, 3.321],
    hasDedicatedBay: true
  },
  {
    id: 'shelter-plus-km412',
    name: 'Pondok Teduhan Jejantas KM 412 (Sungai Buaya)',
    expressway: 'PLUS E1',
    kmMarker: 'KM 412',
    coordinates: [101.520, 3.420],
    hasDedicatedBay: true
  },
  {
    id: 'shelter-plus-km360',
    name: 'Pondok Teduhan Jejantas KM 360 (Sungkai)',
    expressway: 'PLUS E1',
    kmMarker: 'KM 360',
    coordinates: [101.310, 3.990],
    hasDedicatedBay: true
  },
  {
    id: 'shelter-plus-km312',
    name: 'Pondok Teduhan Jejantas KM 312 (Tapah)',
    expressway: 'PLUS E1',
    kmMarker: 'KM 312',
    coordinates: [101.270, 4.210],
    hasDedicatedBay: true
  },

  // PLUS E2
  {
    id: 'shelter-plus-km280',
    name: 'Pondok Teduhan Jejantas KM 280 (Nilai)',
    expressway: 'PLUS E2',
    kmMarker: 'KM 280',
    coordinates: [101.800, 2.820],
    hasDedicatedBay: true
  },
  {
    id: 'shelter-plus-km240',
    name: 'Pondok Teduhan Jejantas KM 240 (Senawang)',
    expressway: 'PLUS E2',
    kmMarker: 'KM 240',
    coordinates: [101.990, 2.650],
    hasDedicatedBay: true
  },

  // Federal Highway (Route 2)
  {
    id: 'shelter-federal-km14',
    name: 'Pondok Teduhan Motosikal Batu Tiga',
    expressway: 'Federal Highway (Route 2)',
    kmMarker: 'KM 14',
    coordinates: [101.560, 3.070],
    hasDedicatedBay: true
  },
  {
    id: 'shelter-federal-km18',
    name: 'Pondok Teduhan Motosikal Subang Jaya',
    expressway: 'Federal Highway (Route 2)',
    kmMarker: 'KM 18',
    coordinates: [101.590, 3.080],
    hasDedicatedBay: true
  },

  // KESAS E5
  {
    id: 'shelter-kesas-km28',
    name: 'Pondok Teduhan Jejantas KM 28 (Kinrara)',
    expressway: 'KESAS E5',
    kmMarker: 'KM 28',
    coordinates: [101.650, 3.055],
    hasDedicatedBay: true
  },
  {
    id: 'shelter-kesas-km38',
    name: 'Pondok Teduhan Jejantas KM 38 (Bukit Rimau)',
    expressway: 'KESAS E5',
    kmMarker: 'KM 38',
    coordinates: [101.510, 3.010],
    hasDedicatedBay: true
  }
];

export function getAllMotorcycleShelters(): MotorcycleShelter[] {
  return MALAYSIA_MOTORCYCLE_SHELTERS;
}

/**
 * Detect nearest Malaysian expressway motorcycle rain shelter
 * when in motorcycle mode and raining.
 */
export function findNearbyMotorcycleShelter(
  coord: [number, number],
  isRaining: boolean,
  travelMode: string,
  thresholdKm = 3.0
): MotorcycleShelter | null {
  if (!isRaining || travelMode !== 'motorcycle') {
    return null;
  }

  let nearestShelter: MotorcycleShelter | null = null;
  let minDistance = Infinity;

  for (const shelter of MALAYSIA_MOTORCYCLE_SHELTERS) {
    const dist = calculateDistanceKm(coord, shelter.coordinates);
    if (dist <= thresholdKm && dist < minDistance) {
      minDistance = dist;
      nearestShelter = shelter;
    }
  }

  return nearestShelter;
}

