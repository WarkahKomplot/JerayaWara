import { distanceKm } from '../routing/malaysiaRoadNetwork';

export interface AESCamera {
  id: string;
  name: string;
  nameEn?: string;
  highway: string;
  km: string;
  speedLimitKmH: number;
  direction: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound' | 'Both' | string;
  coordinates: [number, number]; // [lng, lat]
  locationDescription: string;
  locationDescriptionEn?: string;
}

export interface NearbyAESAlert {
  camera: AESCamera;
  distanceMeters: number;
}

export interface FindAESCameraOptions {
  userCoord: [number, number];
  routePolyline?: [number, number][];
  heading?: number;
  speedKmH?: number;
  thresholdKm?: number;
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
    nameEn: 'AES Slim River (Southbound)',
    highway: 'PLUS E1',
    km: 'KM 375.9',
    speedLimitKmH: 110,
    direction: 'Southbound',
    coordinates: [101.4012, 3.8291],
    locationDescription: 'Slim River - Behrang',
    locationDescriptionEn: 'Slim River - Behrang'
  },
  {
    id: 'aes-e1-slimriver-nb',
    name: 'AES Slim River (Arah Utara)',
    nameEn: 'AES Slim River (Northbound)',
    highway: 'PLUS E1',
    km: 'KM 375.9',
    speedLimitKmH: 110,
    direction: 'Northbound',
    coordinates: [101.4014, 3.8295],
    locationDescription: 'Behrang - Slim River',
    locationDescriptionEn: 'Behrang - Slim River'
  },
  {
    id: 'aes-e1-bktgantang-nb',
    name: 'AES Bukit Gantang (Arah Utara)',
    nameEn: 'AES Bukit Gantang (Northbound)',
    highway: 'PLUS E1',
    km: 'KM 204.6',
    speedLimitKmH: 110,
    direction: 'Northbound',
    coordinates: [100.7512, 4.7891],
    locationDescription: 'Changkat Jering - Taiping Utara',
    locationDescriptionEn: 'Changkat Jering - Taiping North'
  },
  {
    id: 'aes-e1-bktgantang-sb',
    name: 'AES Bukit Gantang (Arah Selatan)',
    nameEn: 'AES Bukit Gantang (Southbound)',
    highway: 'PLUS E1',
    km: 'KM 204.6',
    speedLimitKmH: 110,
    direction: 'Southbound',
    coordinates: [100.7515, 4.7888],
    locationDescription: 'Taiping Utara - Changkat Jering',
    locationDescriptionEn: 'Taiping North - Changkat Jering'
  },
  {
    id: 'aes-e1-sungaidua',
    name: 'AES Sungai Dua',
    nameEn: 'AES Sungai Dua',
    highway: 'PLUS E1',
    km: 'KM 135.8',
    speedLimitKmH: 110,
    direction: 'Southbound',
    coordinates: [100.4321, 5.4412],
    locationDescription: 'Sungai Dua - Seberang Jaya',
    locationDescriptionEn: 'Sungai Dua - Seberang Jaya'
  },

  // PLUS E2 (Kajang to Johor Bahru)
  {
    id: 'aes-e2-kajang-sb',
    name: 'AES Kajang (Arah Selatan)',
    nameEn: 'AES Kajang (Southbound)',
    highway: 'PLUS E2',
    km: 'KM 301.6',
    speedLimitKmH: 90,
    direction: 'Southbound',
    coordinates: [101.7451, 2.9812],
    locationDescription: 'Sungai Besi - Kajang',
    locationDescriptionEn: 'Sungai Besi - Kajang'
  },
  {
    id: 'aes-e2-bangi-nb',
    name: 'AES Bangi (Arah Utara)',
    nameEn: 'AES Bangi (Northbound)',
    highway: 'PLUS E2',
    km: 'KM 299.9',
    speedLimitKmH: 90,
    direction: 'Northbound',
    coordinates: [101.7512, 2.9612],
    locationDescription: 'Bangi - Kajang',
    locationDescriptionEn: 'Bangi - Kajang'
  },
  {
    id: 'aes-e2-alorgajah',
    name: 'AES Alor Gajah (KM 214)',
    nameEn: 'AES Alor Gajah (KM 214)',
    highway: 'PLUS E2',
    km: 'KM 214.4',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.1951, 2.4215],
    locationDescription: 'Simpang Ampat - Ayer Keroh',
    locationDescriptionEn: 'Simpang Ampat - Ayer Keroh'
  },
  {
    id: 'aes-e2-jasin',
    name: 'AES Jasin (KM 184)',
    nameEn: 'AES Jasin (KM 184)',
    highway: 'PLUS E2',
    km: 'KM 184.2',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.4312, 2.3112],
    locationDescription: 'Ayer Keroh - Jasin',
    locationDescriptionEn: 'Ayer Keroh - Jasin'
  },
  {
    id: 'aes-e2-pagoh',
    name: 'AES Pagoh (KM 146)',
    nameEn: 'AES Pagoh (KM 146)',
    highway: 'PLUS E2',
    km: 'KM 146.8',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.7654, 2.1489],
    locationDescription: 'Tangkak - Pagoh',
    locationDescriptionEn: 'Tangkak - Pagoh'
  },

  // Federal Highway (Route 2)
  {
    id: 'aes-fed-subang',
    name: 'AES Lebuhraya Persekutuan (Subang)',
    nameEn: 'AES Federal Highway (Subang)',
    highway: 'Federal Hwy (Rt 2)',
    km: 'KM 13.8',
    speedLimitKmH: 80,
    direction: 'Both',
    coordinates: [101.5912, 3.0812],
    locationDescription: 'Persimpangan Batu Tiga - Subang Jaya',
    locationDescriptionEn: 'Batu Tiga Interchange - Subang Jaya'
  },
  {
    id: 'aes-fed-pj',
    name: 'AES Lebuhraya Persekutuan (PJ)',
    nameEn: 'AES Federal Highway (PJ)',
    highway: 'Federal Hwy (Rt 2)',
    km: 'KM 8.5',
    speedLimitKmH: 80,
    direction: 'Both',
    coordinates: [101.6451, 3.1091],
    locationDescription: 'Jalan Barat - Seri Setia',
    locationDescriptionEn: 'Jalan Barat - Seri Setia'
  },

  // SKVE, SILK, Karak & LPT
  {
    id: 'aes-skve',
    name: 'AES SKVE (KM 6.8)',
    nameEn: 'AES SKVE (KM 6.8)',
    highway: 'SKVE E26',
    km: 'KM 6.8',
    speedLimitKmH: 90,
    direction: 'Both',
    coordinates: [101.6112, 2.9712],
    locationDescription: 'Bandar Saujana Putra - Telok Panglima Garang',
    locationDescriptionEn: 'Bandar Saujana Putra - Telok Panglima Garang'
  },
  {
    id: 'aes-silk-kajang',
    name: 'AES Kajang SILK (KM 17.4)',
    nameEn: 'AES Kajang SILK (KM 17.4)',
    highway: 'SILK E18',
    km: 'KM 17.4',
    speedLimitKmH: 90,
    direction: 'Both',
    coordinates: [101.7821, 2.9912],
    locationDescription: 'Sungai Ramal - Balakong',
    locationDescriptionEn: 'Sungai Ramal - Balakong'
  },
  {
    id: 'aes-karak-gombak',
    name: 'AES Karak (Gombak)',
    nameEn: 'AES Karak (Gombak)',
    highway: 'Karak E8',
    km: 'KM 28.5',
    speedLimitKmH: 90,
    direction: 'Eastbound',
    coordinates: [101.7512, 3.2812],
    locationDescription: 'Plaza Tol Gombak - Terowong Genting Sempah',
    locationDescriptionEn: 'Gombak Toll Plaza - Genting Sempah Tunnel'
  },
  {
    id: 'aes-lpt-lanchang',
    name: 'AES LPT1 (Lanchang)',
    nameEn: 'AES LPT1 (Lanchang)',
    highway: 'LPT E8',
    km: 'KM 85.5',
    speedLimitKmH: 110,
    direction: 'Both',
    coordinates: [102.1612, 3.4812],
    locationDescription: 'Karak - Lanchang',
    locationDescriptionEn: 'Karak - Lanchang'
  }
];

export function getLocalizedCameraName(camera: AESCamera, lang: 'ms' | 'en' = 'ms'): string {
  if (lang === 'en' && camera.nameEn) {
    return camera.nameEn;
  }
  return camera.name;
}

/**
 * Computes shortest distance in meters from a point P to a line segment AB.
 */
export function distancePointToSegmentMeters(
  point: [number, number],
  segA: [number, number],
  segB: [number, number]
): number {
  const [pLng, pLat] = point;
  const [aLng, aLat] = segA;
  const [bLng, bLat] = segB;

  const midLatRad = ((aLat + bLat) / 2) * (Math.PI / 180);
  const mPerDegLng = 111320 * Math.cos(midLatRad);
  const mPerDegLat = 110574;

  const px = pLng * mPerDegLng;
  const py = pLat * mPerDegLat;
  const ax = aLng * mPerDegLng;
  const ay = aLat * mPerDegLat;
  const bx = bLng * mPerDegLng;
  const by = bLat * mPerDegLat;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq < 0.0001) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return Math.hypot(px - projX, py - projY);
}

/**
 * Computes cardinal bearing (0-360 degrees) from coordinate 1 to coordinate 2.
 */
export function getBearing(c1: [number, number], c2: [number, number]): number {
  const [lng1, lat1] = c1;
  const [lng2, lat2] = c2;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

/**
 * Finds if there is an AES speed camera within proximity.
 * - When routePolyline is provided (Navigation mode), verifies that the camera lies strictly
 *   within the route corridor (<= 75m) and is ahead of the driver along the path (eliminates
 *   false alarms from parallel highways or perpendicular cross-town roads).
 * - When free cruising, checks forward heading cone (within 45 degrees) to avoid false alerts
 *   for cameras behind the driver or across parallel roads.
 */
export function findNearbyAESCamera(
  optionsOrCoord: [number, number] | FindAESCameraOptions,
  legacyThresholdKm: number = 1.0
): NearbyAESAlert | null {
  const options: FindAESCameraOptions = Array.isArray(optionsOrCoord)
    ? { userCoord: optionsOrCoord, thresholdKm: legacyThresholdKm }
    : optionsOrCoord;

  const { userCoord, routePolyline, heading, speedKmH } = options;
  const thresholdMeters = (options.thresholdKm ?? legacyThresholdKm) * 1000;

  // Case 1: Active Navigation Route Corridor Aware Scan
  if (routePolyline && routePolyline.length >= 2) {
    // 1. Locate closest segment to current vehicle location
    let userMinDist = Infinity;
    let userClosestSegIdx = 0;

    for (let i = 0; i < routePolyline.length - 1; i++) {
      const d = distancePointToSegmentMeters(userCoord, routePolyline[i], routePolyline[i + 1]);
      if (d < userMinDist) {
        userMinDist = d;
        userClosestSegIdx = i;
      }
    }

    let closestAlert: NearbyAESAlert | null = null;
    let minRouteDist = Infinity;

    for (const cam of MALAYSIA_AES_CAMERAS) {
      // Fast radial pre-filter (ignore cameras > 2km away)
      const straightDistKm = distanceKm(userCoord, cam.coordinates);
      if (straightDistKm > 2.0) continue;

      // Find closest segment from the camera to the upcoming route
      let camMinDistToRoute = Infinity;
      let camClosestSegIdx = -1;

      for (let j = userClosestSegIdx; j < routePolyline.length - 1; j++) {
        const d = distancePointToSegmentMeters(cam.coordinates, routePolyline[j], routePolyline[j + 1]);
        if (d < camMinDistToRoute) {
          camMinDistToRoute = d;
          camClosestSegIdx = j;
        }
      }

      // Camera MUST be within 75 meters of the active road corridor.
      // If it is on a parallel highway or adjacent street, camMinDistToRoute will be 300-1000m, so it is rejected!
      if (camMinDistToRoute > 75 || camClosestSegIdx < userClosestSegIdx) {
        continue;
      }

      // Calculate path distance along route polyline
      let distAlongRouteMeters = 0;
      if (camClosestSegIdx === userClosestSegIdx) {
        distAlongRouteMeters = Math.round(distanceKm(userCoord, cam.coordinates) * 1000);
      } else {
        distAlongRouteMeters += Math.round(distanceKm(userCoord, routePolyline[userClosestSegIdx + 1]) * 1000);
        for (let k = userClosestSegIdx + 1; k < camClosestSegIdx; k++) {
          distAlongRouteMeters += Math.round(distanceKm(routePolyline[k], routePolyline[k + 1]) * 1000);
        }
        distAlongRouteMeters += Math.round(distanceKm(routePolyline[camClosestSegIdx], cam.coordinates) * 1000);
      }

      if (distAlongRouteMeters <= thresholdMeters && distAlongRouteMeters < minRouteDist) {
        minRouteDist = distAlongRouteMeters;
        closestAlert = {
          camera: cam,
          distanceMeters: Math.max(50, distAlongRouteMeters)
        };
      }
    }

    return closestAlert;
  }

  // Case 2: Free Cruising (No Active Route Polyline)
  let closestCamera: AESCamera | null = null;
  let minDistanceMeters = Infinity;

  for (const cam of MALAYSIA_AES_CAMERAS) {
    const distMeters = Math.round(distanceKm(userCoord, cam.coordinates) * 1000);

    if (distMeters <= thresholdMeters && distMeters < minDistanceMeters) {
      // If moving and heading is available, verify camera is in the forward cone (within 45 degrees)
      if (heading !== undefined && heading >= 0 && (speedKmH ?? 0) >= 10) {
        const bearingToCam = getBearing(userCoord, cam.coordinates);
        let angleDiff = Math.abs(heading - bearingToCam);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        if (angleDiff > 45) {
          // Camera is to the side or behind the vehicle
          continue;
        }
      }

      minDistanceMeters = distMeters;
      closestCamera = cam;
    }
  }

  if (closestCamera && minDistanceMeters <= thresholdMeters) {
    return {
      camera: closestCamera,
      distanceMeters: minDistanceMeters
    };
  }

  return null;
}
