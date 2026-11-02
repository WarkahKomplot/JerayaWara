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
  bearing?: number; // Target capture azimuth in degrees (0-359).
  toleranceDegrees?: number; // Angular tolerance cone (defaults to 55°)
  locationDescription: string;
  locationDescriptionEn?: string;
}

export interface NearbyAESAlert {
  camera: AESCamera;
  distanceMeters: number;
  isOverSpeed?: boolean;
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
    id: 'aes-e1-kualamuda-sb',
    name: 'AES Kuala Muda (Arah Selatan)',
    nameEn: 'AES Kuala Muda (Southbound)',
    highway: 'PLUS E1',
    km: 'KM 96.3',
    speedLimitKmH: 110,
    direction: 'Southbound',
    bearing: 165,
    coordinates: [100.4782, 5.5681],
    locationDescription: 'Kuala Muda - Sungai Petani',
    locationDescriptionEn: 'Kuala Muda - Sungai Petani'
  },
  {
    id: 'aes-e1-sungaidua',
    name: 'AES Sungai Dua',
    nameEn: 'AES Sungai Dua',
    highway: 'PLUS E1',
    km: 'KM 135.8',
    speedLimitKmH: 110,
    direction: 'Southbound',
    bearing: 180,
    coordinates: [100.4321, 5.4412],
    locationDescription: 'Sungai Dua - Seberang Jaya',
    locationDescriptionEn: 'Sungai Dua - Seberang Jaya'
  },
  {
    id: 'aes-e1-bktgantang-nb',
    name: 'AES Bukit Gantang (Arah Utara)',
    nameEn: 'AES Bukit Gantang (Northbound)',
    highway: 'PLUS E1',
    km: 'KM 204.6',
    speedLimitKmH: 110,
    direction: 'Northbound',
    bearing: 345,
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
    bearing: 165,
    coordinates: [100.7515, 4.7888],
    locationDescription: 'Taiping Utara - Changkat Jering',
    locationDescriptionEn: 'Taiping North - Changkat Jering'
  },
  {
    id: 'aes-e1-gopeng-sb',
    name: 'AES Gopeng (Arah Selatan)',
    nameEn: 'AES Gopeng (Southbound)',
    highway: 'PLUS E1',
    km: 'KM 301.5',
    speedLimitKmH: 110,
    direction: 'Southbound',
    bearing: 155,
    coordinates: [101.1712, 4.4412],
    locationDescription: 'Gopeng - Tapah',
    locationDescriptionEn: 'Gopeng - Tapah'
  },
  {
    id: 'aes-e1-slimriver-sb',
    name: 'AES Slim River (Arah Selatan)',
    nameEn: 'AES Slim River (Southbound)',
    highway: 'PLUS E1',
    km: 'KM 375.9',
    speedLimitKmH: 110,
    direction: 'Southbound',
    bearing: 165,
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
    bearing: 345,
    coordinates: [101.4014, 3.8295],
    locationDescription: 'Behrang - Slim River',
    locationDescriptionEn: 'Behrang - Slim River'
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
    bearing: 155,
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
    bearing: 335,
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
    bearing: 140,
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
    bearing: 125,
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
    bearing: 135,
    coordinates: [102.7654, 2.1489],
    locationDescription: 'Tangkak - Pagoh',
    locationDescriptionEn: 'Tangkak - Pagoh'
  },

  // ELITE E6
  {
    id: 'aes-e6-dengkil',
    name: 'AES ELITE Dengkil (KM 28.4)',
    nameEn: 'AES ELITE Dengkil (KM 28.4)',
    highway: 'ELITE E6',
    km: 'KM 28.4',
    speedLimitKmH: 110,
    direction: 'Both',
    bearing: 160,
    coordinates: [101.6321, 2.8712],
    locationDescription: 'Putrajaya - Dengkil',
    locationDescriptionEn: 'Putrajaya - Dengkil'
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
    bearing: 85,
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
    bearing: 75,
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
    bearing: 90,
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
    bearing: 70,
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
    bearing: 45,
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
    bearing: 80,
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
 * Checks if a vehicle/route heading is compatible with a camera's monitored direction.
 */
export function isHeadingCompatible(
  travelHeading: number,
  cam: AESCamera,
  defaultTolerance: number = 55
): boolean {
  if (cam.bearing === undefined) {
    return true; // No bearing defined -> bi-directional fallback
  }

  const tolerance = cam.toleranceDegrees ?? defaultTolerance;
  const diff = Math.abs((travelHeading - cam.bearing + 540) % 360 - 180);

  if (cam.direction === 'Both') {
    const diffOpposite = Math.abs((travelHeading - ((cam.bearing + 180) % 360) + 540) % 360 - 180);
    return diff <= tolerance || diffOpposite <= tolerance;
  }

  return diff <= tolerance;
}

/**
 * Projects a point onto a line segment defined by segA -> segB.
 * Returns:
 * - t: scalar projection parameter (0 at segA, 1 at segB)
 * - lateralDistanceMeters: perpendicular distance from point to the line
 */
export function projectPointOntoSegment(
  point: [number, number],
  segA: [number, number],
  segB: [number, number]
): { t: number; lateralDistanceMeters: number } {
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
    return { t: 0, lateralDistanceMeters: Math.hypot(px - ax, py - ay) };
  }

  const t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  const lateralDistanceMeters = Math.hypot(px - projX, py - projY);

  return { t, lateralDistanceMeters };
}

/**
 * Finds if there is an AES speed camera within proximity.
 * - When routePolyline is provided (Navigation mode), verifies that the camera lies strictly
 *   within the route corridor (<= 65m) and is ahead of the driver along the path (eliminates
 *   false alarms from parallel highways or perpendicular cross-town roads).
 * - Verifies bearing & direction compatibility so cameras on opposite carriageways do not alert.
 * - In free cruising, checks forward heading cone (within 45 degrees) and direction compatibility.
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
      // Fast radial pre-filter (ignore cameras > 2.5km away)
      const straightDistKm = distanceKm(userCoord, cam.coordinates);
      if (straightDistKm > 2.5) continue;

      // Find closest segment from the camera to the upcoming route
      let camMinDistToRoute = Infinity;
      let camClosestSegIdx = -1;

      for (let j = userClosestSegIdx; j < routePolyline.length - 1; j++) {
        // Performance optimization: stop lookahead once segments are far past camera proximity
        if (j - userClosestSegIdx > 35 && distanceKm(cam.coordinates, routePolyline[j]) > 2.5) {
          break;
        }
        const d = distancePointToSegmentMeters(cam.coordinates, routePolyline[j], routePolyline[j + 1]);
        if (d < camMinDistToRoute) {
          camMinDistToRoute = d;
          camClosestSegIdx = j;
        }
      }

      // Camera MUST be within 65 meters of the active road corridor.
      // If it is on a parallel highway or adjacent street, camMinDistToRoute will be 300-1000m, so it is rejected!
      if (camMinDistToRoute > 65 || camClosestSegIdx < userClosestSegIdx) {
        continue;
      }

      // 2. DIRECTIONAL CHECK: Route segment heading must match camera monitored direction!
      const segA = routePolyline[camClosestSegIdx];
      const segB = routePolyline[camClosestSegIdx + 1];
      const segmentBearing = getBearing(segA, segB);

      if (!isHeadingCompatible(segmentBearing, cam)) {
        // Vehicle is driving in opposite carriageway or unmonitored vector!
        continue;
      }

      // 3. LONGITUDINAL CHECK: If on the very same segment, has the user already passed the camera?
      if (camClosestSegIdx === userClosestSegIdx) {
        const segLenMeters = Math.hypot(
          (segB[0] - segA[0]) * 111320 * Math.cos(((segA[1] + segB[1]) / 2) * (Math.PI / 180)),
          (segB[1] - segA[1]) * 110574
        );
        const { t: tUser } = projectPointOntoSegment(userCoord, segA, segB);
        const { t: tCam } = projectPointOntoSegment(cam.coordinates, segA, segB);

        // If user is already past the camera by more than 15 meters:
        const bufferT = segLenMeters > 0 ? 15 / segLenMeters : 0;
        if (tUser > tCam + bufferT) {
          // Passed camera already!
          continue;
        }
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
          distanceMeters: Math.max(50, distAlongRouteMeters),
          isOverSpeed: (speedKmH ?? 0) > cam.speedLimitKmH
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
      // If moving and heading is available:
      if (heading !== undefined && heading >= 0 && (speedKmH ?? 0) >= 10) {
        // 1. Camera must be in forward cone (within 45 degrees of vehicle heading)
        const bearingToCam = getBearing(userCoord, cam.coordinates);
        let angleDiff = Math.abs(heading - bearingToCam);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        if (angleDiff > 45) {
          // Camera is to the side or behind the vehicle
          continue;
        }

        // 2. Vehicle travel heading must match the camera's monitored direction!
        if (!isHeadingCompatible(heading, cam)) {
          // Traveling in opposite direction to what this camera monitors!
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
      distanceMeters: minDistanceMeters,
      isOverSpeed: (speedKmH ?? 0) > closestCamera.speedLimitKmH
    };
  }

  return null;
}
