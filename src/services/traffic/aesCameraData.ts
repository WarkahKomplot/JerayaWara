import { distanceKm } from '../routing/malaysiaRoadNetwork';

export interface AESCamera {
  id: string;
  name: string;
  highway: string;
  km: string;
  speedLimitKmH: number;
  direction: string;
  coordinates: [number, number]; // [lng, lat]
  locationDescription: string;
}

export interface NearbyAESAlert {
  camera: AESCamera;
  distanceMeters: number;
}

/**
 * Verified Malaysian Automated Enforcement System (AES / AwAS) speed cameras
 * operated along major expressway corridors.
 */
export const MALAYSIA_AES_CAMERAS: AESCamera[] = [
  // PLUS E1 (Northbound & Southbound)
  {
    id: 'aes-e1-slimriver-sb',
    name: 'AES Slim River (Arah Selatan)',
    highway: 'PLUS E1',
    km: 'KM 375.9',
    speedLimitKmH: 110,
    direction: 'Southbound',
    coordinates: [101.4012, 3.8291],
    locationDescription: 'Slim River - Behrang'
  },
  {
    id: 'aes-e1-slimriver-nb',
    name: 'AES Slim River (Arah Utara)',
    highway: 'PLUS E1',
    km: 'KM 375.9',
    speedLimitKmH: 110,
    direction: 'Northbound',
    coordinates: [101.4014, 3.8295],
    locationDescription: 'Behrang - Slim River'
  },
  {
    id: 'aes-e1-bktgantang-nb',
    name: 'AES Bukit Gantang (Arah Utara)',
    highway: 'PLUS E1',
    km: 'KM 204.6',
    speedLimitKmH: 110,
    direction: 'Northbound',
    coordinates: [100.7512, 4.7891],
    locationDescription: 'Changkat Jering - Taiping Utara'
  },
  {
    id: 'aes-e1-bktgantang-sb',
    name: 'AES Bukit Gantang (Arah Selatan)',
    highway: 'PLUS E1',
    km: 'KM 204.6',
    speedLimitKmH: 110,
    direction: 'Southbound',
    coordinates: [100.7515, 4.7888],
    locationDescription: 'Taiping Utara - Changkat Jering'
  },
  {
    id: 'aes-e1-sungaidua',
    name: 'AES Sungai Dua',
    highway: 'PLUS E1',
    km: 'KM 135.8',
    speedLimitKmH: 110,
    direction: 'Southbound',
    coordinates: [100.4321, 5.4412],
    locationDescription: 'Sungai Dua - Seberang Jaya'
  },

  // PLUS E2 (Kajang to Johor Bahru)
  {
    id: 'aes-e2-kajang-sb',
    name: 'AES Kajang (Arah Selatan)',
    highway: 'PLUS E2',
    km: 'KM 301.6',
    speedLimitKmH: 90,
    direction: 'Southbound',
    coordinates: [101.7451, 2.9812],
    locationDescription: 'Sungai Besi - Kajang'
  },
  {
    id: 'aes-e2-bangi-nb',
    name: 'AES Bangi (Arah Utara)',
    highway: 'PLUS E2',
    km: 'KM 299.9',
    speedLimitKmH: 90,
    direction: 'Northbound',
    coordinates: [101.7512, 2.9612],
    locationDescription: 'Bangi - Kajang'
  },
  {
    id: 'aes-e2-alorgajah',
    name: 'AES Alor Gajah (KM 214)',
    highway: 'PLUS E2',
    km: 'KM 214.4',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.1951, 2.4215],
    locationDescription: 'Simpang Ampat - Ayer Keroh'
  },
  {
    id: 'aes-e2-jasin',
    name: 'AES Jasin (KM 184)',
    highway: 'PLUS E2',
    km: 'KM 184.2',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.4312, 2.3112],
    locationDescription: 'Ayer Keroh - Jasin'
  },
  {
    id: 'aes-e2-pagoh',
    name: 'AES Pagoh (KM 146)',
    highway: 'PLUS E2',
    km: 'KM 146.8',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.7654, 2.1489],
    locationDescription: 'Tangkak - Pagoh'
  },

  // Federal Highway (Route 2)
  {
    id: 'aes-fed-subang',
    name: 'AES Lebuhraya Persekutuan (Subang)',
    highway: 'Federal Hwy (Rt 2)',
    km: 'KM 13.8',
    speedLimitKmH: 80,
    direction: 'Both',
    coordinates: [101.5912, 3.0812],
    locationDescription: 'Persimpangan Batu Tiga - Subang Jaya'
  },
  {
    id: 'aes-fed-pj',
    name: 'AES Lebuhraya Persekutuan (PJ)',
    highway: 'Federal Hwy (Rt 2)',
    km: 'KM 8.5',
    speedLimitKmH: 80,
    direction: 'Both',
    coordinates: [101.6451, 3.1091],
    locationDescription: 'Jalan Barat - Seri Setia'
  },

  // SKVE, SILK, Karak & LPT
  {
    id: 'aes-skve',
    name: 'AES SKVE (KM 6.8)',
    highway: 'SKVE E26',
    km: 'KM 6.8',
    speedLimitKmH: 90,
    direction: 'Both',
    coordinates: [101.6112, 2.9712],
    locationDescription: 'Bandar Saujana Putra - Telok Panglima Garang'
  },
  {
    id: 'aes-silk-kajang',
    name: 'AES Kajang SILK (KM 17.4)',
    highway: 'SILK E18',
    km: 'KM 17.4',
    speedLimitKmH: 90,
    direction: 'Both',
    coordinates: [101.7821, 2.9912],
    locationDescription: 'Sungai Ramal - Balakong'
  },
  {
    id: 'aes-karak-gombak',
    name: 'AES Karak (Gombak)',
    highway: 'Karak E8',
    km: 'KM 28.5',
    speedLimitKmH: 90,
    direction: 'Eastbound',
    coordinates: [101.7512, 3.2812],
    locationDescription: 'Plaza Tol Gombak - Terowong Genting Sempah'
  },
  {
    id: 'aes-lpt-lanchang',
    name: 'AES LPT1 (Lanchang)',
    highway: 'LPT E8',
    km: 'KM 85.5',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.1612, 3.4812],
    locationDescription: 'Karak - Lanchang'
  }
];

/**
 * Finds if there is an AES speed camera within proximity (default 1.2 km).
 * Returns the closest camera and the exact distance in meters.
 */
export function findNearbyAESCamera(
  userCoord: [number, number],
  thresholdKm: number = 1.2
): NearbyAESAlert | null {
  let closestCamera: AESCamera | null = null;
  let minDistanceKm = Infinity;

  for (const cam of MALAYSIA_AES_CAMERAS) {
    const dist = distanceKm(userCoord, cam.coordinates);
    if (dist <= thresholdKm && dist < minDistanceKm) {
      minDistanceKm = dist;
      closestCamera = cam;
    }
  }

  if (closestCamera && minDistanceKm <= thresholdKm) {
    return {
      camera: closestCamera,
      distanceMeters: Math.round(minDistanceKm * 1000)
    };
  }

  return null;
}

