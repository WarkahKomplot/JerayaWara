export interface FloodHotspot {
  id: string;
  name: string;
  state: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  radiusKm: number;
}

// Distance helper using Haversine formula
function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth radius in km

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

export const MALAYSIA_FLOOD_HOTSPOTS: FloodHotspot[] = [
  {
    id: 'flood-jtr-kl',
    name: 'Jalan Tun Razak (Terowong & Laluan Bawah)',
    state: 'Kuala Lumpur',
    description: 'Kawasan laluan bawah kerap dinaiki air kilat semasa hujan lebat berterusan.',
    coordinates: [101.719, 3.171],
    radiusKm: 2.0
  },
  {
    id: 'flood-bulatan-pahang',
    name: 'Bulatan Pahang (Laluan Bawah HKL)',
    state: 'Kuala Lumpur',
    description: 'Takungan air deras di laluan bawah Bulatan Pahang menghala ke Setapak.',
    coordinates: [101.705, 3.175],
    radiusKm: 1.5
  },
  {
    id: 'flood-shah-alam-sec13',
    name: 'Shah Alam Seksyen 13 (Kawasan Stadium)',
    state: 'Selangor',
    description: 'Limpahan air Sungai Damansara melimpah ke bulatan dan jalan utama.',
    coordinates: [101.545, 3.080],
    radiusKm: 2.5
  },
  {
    id: 'flood-klang-meru',
    name: 'Persimpangan Meru & Bukit Raja, Klang',
    state: 'Selangor',
    description: 'Laluan arteri rendah terdedah kepada banjir kilat serentak dengan air pasang.',
    coordinates: [101.445, 3.060],
    radiusKm: 2.0
  },
  {
    id: 'flood-batu-pahat',
    name: 'Batu Pahat FT50 (Laluan Pantai Rendah)',
    state: 'Johor',
    description: 'Kawasan bertakung akibat perparitan sempit semasa hujan lebat monsun.',
    coordinates: [103.045, 1.855],
    radiusKm: 2.5
  },
  {
    id: 'flood-segamat',
    name: 'Lembah Sungai Segamat (Laluan FT1)',
    state: 'Johor',
    description: 'Kawasan lintasan sungai berisiko limpahan air semasa monsun timur laut.',
    coordinates: [102.815, 2.510],
    radiusKm: 3.0
  },
  {
    id: 'flood-kota-tinggi',
    name: 'Jambatan Kota Tinggi (Lembah Sungai Johor)',
    state: 'Johor',
    description: 'Titik hitam banjir monsun bersejarah laluan bandar Kota Tinggi.',
    coordinates: [103.900, 1.730],
    radiusKm: 2.5
  },
  {
    id: 'flood-kuantan-sg-lembing',
    name: 'Koridor Jalan Sungai Lembing, Kuantan',
    state: 'Pahang',
    description: 'Laluan rendah terdedah banjir limpahan sungai Kuantan semasa musim tengkujuh.',
    coordinates: [103.250, 3.820],
    radiusKm: 2.5
  }
];

export function getAllFloodHotspots(): FloodHotspot[] {
  return MALAYSIA_FLOOD_HOTSPOTS;
}

/**
 * Detect if driver is approaching a known Malaysian flash flood blackspot while raining.
 */
export function findNearbyFloodHotspot(
  coord: [number, number],
  isRaining: boolean,
  thresholdKm = 2.0
): FloodHotspot | null {
  if (!isRaining) return null;

  for (const hotspot of MALAYSIA_FLOOD_HOTSPOTS) {
    const dist = calculateDistanceKm(coord, hotspot.coordinates);
    if (dist <= thresholdKm) {
      return hotspot;
    }
  }

  return null;
}

