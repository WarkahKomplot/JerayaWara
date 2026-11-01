import { HighwayCamera } from './types';

export const HIGHWAY_CAMERAS_DATABASE: HighwayCamera[] = [
  // --- PLUS E2 (North-South Expressway South) ---
  {
    id: 'e2-sgbesi-toll',
    title: 'Plaza Tol Sungai Besi (Arah Utara / Northbound)',
    highway: 'PLUS E2',
    km: 'KM 309.8',
    direction: 'Northbound',
    coordinates: [101.7126, 3.0531],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km309_8_u.jpg',
    fallbackUrl: 'https://images.weserv.nl/?url=www.plustrafik.com.my/cctv/km309.8.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-upm',
    title: 'Persimpangan UPM (KM 301.7)',
    highway: 'PLUS E2',
    km: 'KM 301.7',
    direction: 'Both',
    coordinates: [101.7335, 2.9984],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km301_7.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-kajang',
    title: 'Persimpangan Kajang / Bangi (KM 296.5)',
    highway: 'PLUS E2',
    km: 'KM 296.5',
    direction: 'Both',
    coordinates: [101.7580, 2.9640],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km296_5.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-bangi-south',
    title: 'Persimpangan Bandar Baru Bangi (KM 289.4)',
    highway: 'PLUS E2',
    km: 'KM 289.4',
    direction: 'Both',
    coordinates: [101.7650, 2.8940],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km289_4.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-nilai-north',
    title: 'Persimpangan Nilai Utara (KM 283.5)',
    highway: 'PLUS E2',
    km: 'KM 283.5',
    direction: 'Both',
    coordinates: [101.7820, 2.8420],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km283_5.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-nilai',
    title: 'Persimpangan Nilai Selatan (KM 279.8)',
    highway: 'PLUS E2',
    km: 'KM 279.8',
    direction: 'Both',
    coordinates: [101.7920, 2.8120],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km279_8.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-ainsdale',
    title: 'Persimpangan Bandar Ainsdale (KM 268.0)',
    highway: 'PLUS E2',
    km: 'KM 268.0',
    direction: 'Both',
    coordinates: [101.8900, 2.7400],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km268_0.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-seremban-rr',
    title: 'Seremban R&R & Plaza Tol Seremban (KM 263.2)',
    highway: 'PLUS E2',
    km: 'KM 263.2',
    direction: 'Both',
    coordinates: [101.9180, 2.7150],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km263_2.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-senawang',
    title: 'Persimpangan Senawang (KM 251.2)',
    highway: 'PLUS E2',
    km: 'KM 251.2',
    direction: 'Both',
    coordinates: [101.9850, 2.6580],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km251_2.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-ayerkeroh',
    title: 'Plaza Tol Ayer Keroh Melaka (KM 195.4)',
    highway: 'PLUS E2',
    km: 'KM 195.4',
    direction: 'Both',
    coordinates: [102.2980, 2.3020],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km195_4.jpg',
    source: 'PLUS'
  },
  {
    id: 'e2-skudai',
    title: 'Plaza Tol Skudai Johor (KM 14.5)',
    highway: 'PLUS E2',
    km: 'KM 14.5',
    direction: 'Both',
    coordinates: [103.6550, 1.5680],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e2/e2_km14_5.jpg',
    source: 'PLUS'
  },

  // --- PLUS E1 (North-South Expressway North) ---
  {
    id: 'e1-duta-toll',
    title: 'Plaza Tol Jalan Duta (KM 28.5)',
    highway: 'PLUS E1',
    km: 'KM 28.5',
    direction: 'Both',
    coordinates: [101.6620, 3.1850],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km28_5.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-bukitlanjan',
    title: 'Persimpangan Bukit Lanjan (KM 18.0)',
    highway: 'PLUS E1',
    km: 'KM 18.0',
    direction: 'Both',
    coordinates: [101.6150, 3.1810],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km18_0.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-rawang-south',
    title: 'Plaza Tol Rawang Selatan (KM 448.2)',
    highway: 'PLUS E1',
    km: 'KM 448.2',
    direction: 'Both',
    coordinates: [101.5720, 3.2840],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km448_2.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-rawang',
    title: 'Persimpangan Rawang (KM 445.0)',
    highway: 'PLUS E1',
    km: 'KM 445.0',
    direction: 'Both',
    coordinates: [101.5620, 3.3210],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km445_0.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-slimriver',
    title: 'Plaza Tol Slim River (KM 368.5)',
    highway: 'PLUS E1',
    km: 'KM 368.5',
    direction: 'Both',
    coordinates: [101.4020, 3.8240],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km368_5.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-tapah',
    title: 'Kawasan Rehat & Rawat (R&R) Tapah (KM 323.0)',
    highway: 'PLUS E1',
    km: 'KM 323.0',
    direction: 'Both',
    coordinates: [101.2720, 4.1950],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km323_0.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-ipoh-south',
    title: 'Plaza Tol Ipoh Selatan (KM 269.0)',
    highway: 'PLUS E1',
    km: 'KM 269.0',
    direction: 'Both',
    coordinates: [101.1210, 4.5780],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km269_0.jpg',
    source: 'PLUS'
  },
  {
    id: 'e1-juru-toll',
    title: 'Plaza Tol Juru Pulau Pinang (KM 148.0)',
    highway: 'PLUS E1',
    km: 'KM 148.0',
    direction: 'Both',
    coordinates: [100.4320, 5.3120],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/e1/e1_km148_0.jpg',
    source: 'PLUS'
  },

  // --- Klang Valley Expressways (Federal Hwy, LDP, MEX) ---
  {
    id: 'fed-subang',
    title: 'Lebuhraya Persekutuan - Susur Subang Jaya',
    highway: 'Federal Highway',
    direction: 'Both',
    coordinates: [101.5910, 3.0810],
    imageUrl: 'https://images.weserv.nl/?url=itis.dbkl.gov.my/cctv/fed_subang.jpg',
    source: 'ITIS'
  },
  {
    id: 'fed-pj-hilton',
    title: 'Lebuhraya Persekutuan - Seksyen 52 / PJ Hilton',
    highway: 'Federal Highway',
    direction: 'Both',
    coordinates: [101.6420, 3.1020],
    imageUrl: 'https://images.weserv.nl/?url=itis.dbkl.gov.my/cctv/fed_pj.jpg',
    source: 'ITIS'
  },
  {
    id: 'fed-midvalley',
    title: 'Lebuhraya Persekutuan - Mid Valley / Seputeh',
    highway: 'Federal Highway',
    direction: 'Both',
    coordinates: [101.6740, 3.1180],
    imageUrl: 'https://images.weserv.nl/?url=itis.dbkl.gov.my/cctv/fed_midvalley.jpg',
    source: 'ITIS'
  },
  {
    id: 'ldp-kelanajaya',
    title: 'LDP (E11) - Kelana Jaya Giant',
    highway: 'LDP',
    direction: 'Both',
    coordinates: [101.5980, 3.1020],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/litrak/ldp_kelana.jpg',
    source: 'LLM'
  },
  {
    id: 'ldp-puchong-ioi',
    title: 'LDP (E11) - IOI Mall Puchong',
    highway: 'LDP',
    direction: 'Both',
    coordinates: [101.6210, 3.0450],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/litrak/ldp_puchong.jpg',
    source: 'LLM'
  },
  {
    id: 'mex-serikembangan',
    title: 'Maju Expressway (MEX E20) - Plaza Tol Seri Kembangan',
    highway: 'MEX',
    direction: 'Both',
    coordinates: [101.6950, 3.0180],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/mex/mex_sk.jpg',
    source: 'LLM'
  },
  {
    id: 'mex-putrajaya',
    title: 'Maju Expressway (MEX E20) - Plaza Tol Putrajaya',
    highway: 'MEX',
    direction: 'Both',
    coordinates: [101.6820, 2.9450],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/mex/mex_putrajaya.jpg',
    source: 'LLM'
  },

  // --- KL - Karak Expressway (E8) ---
  {
    id: 'karak-gombak',
    title: 'Lebuhraya KL-Karak (E8) - Plaza Tol Gombak',
    highway: 'KL-Karak',
    km: 'KM 19.8',
    direction: 'Both',
    coordinates: [101.7480, 3.2540],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/ani/karak_gombak.jpg',
    source: 'LLM'
  },
  {
    id: 'karak-gentingsempah',
    title: 'Lebuhraya KL-Karak (E8) - Terowong Genting Sempah',
    highway: 'KL-Karak',
    km: 'KM 37.0',
    direction: 'Both',
    coordinates: [101.7850, 3.3580],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/ani/karak_terowong.jpg',
    source: 'LLM'
  },
  {
    id: 'karak-bentong',
    title: 'Lebuhraya KL-Karak (E8) - Plaza Tol Bentong',
    highway: 'KL-Karak',
    km: 'KM 61.0',
    direction: 'Both',
    coordinates: [101.9120, 3.4920],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/ani/karak_bentong.jpg',
    source: 'LLM'
  },

  // --- Penang Bridges ---
  {
    id: 'penang-bridge-1',
    title: 'Jambatan Pulau Pinang / Penang Bridge (E36) - Tengah Jambatan',
    highway: 'Penang Bridge',
    direction: 'Both',
    coordinates: [100.3540, 5.3520],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/penang/penang_mid.jpg',
    source: 'PLUS'
  },
  {
    id: 'penang-bridge-2',
    title: 'Jambatan Kedua Pulau Pinang / Penang 2nd Bridge (E28)',
    highway: 'Penang 2nd Bridge',
    direction: 'Both',
    coordinates: [100.3750, 5.2850],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/jksb/penang2_toll.jpg',
    source: 'LLM'
  },

  // --- Johor / Singapore Causeway & Second Link ---
  {
    id: 'jb-ciq-causeway',
    title: 'Kompleks CIQ Sultan Iskandar (Tambak Johor / Causeway)',
    highway: 'EDL / Causeway',
    direction: 'Both',
    coordinates: [103.7680, 1.4640],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/edl/ciq_causeway.jpg',
    source: 'PLUS'
  },
  {
    id: 'jb-tuas-link',
    title: 'Linkedua (E3) - Plaza Tol Tanjung Kupang / Tuas',
    highway: 'Linkedua',
    direction: 'Both',
    coordinates: [103.6120, 1.3980],
    imageUrl: 'https://images.weserv.nl/?url=www.llm.gov.my/cctv/plus/linkedua/tuas_toll.jpg',
    source: 'PLUS'
  }
];

/**
 * Calculates great-circle distance between two GPS coordinates in kilometers (Haversine Formula)
 */
export function haversineDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371; // Earth radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the perpendicular distance from point p to line segment [a, b] in km
 */
export function pointToSegmentDistanceKm(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return haversineDistanceKm(p, a);
  }

  // Projection scalar t onto segment [a, b]
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));

  const projPoint: [number, number] = [ax + t * dx, ay + t * dy];
  return haversineDistanceKm(p, projPoint);
}

/**
 * Finds all highway surveillance cameras within maxDistanceKm of an active route,
 * sorted sequentially along the driving direction of the route.
 */
export function findCamerasAlongRoute(
  routeCoordinates: [number, number][],
  maxDistanceKm: number = 3.5
): HighwayCamera[] {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return [];
  }

  interface CameraMatch {
    camera: HighwayCamera;
    segmentIndex: number;
    distanceKm: number;
  }

  const matches: CameraMatch[] = [];

  for (const cam of HIGHWAY_CAMERAS_DATABASE) {
    let minDistance = Infinity;
    let closestSegmentIdx = -1;

    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const segStart = routeCoordinates[i];
      const segEnd = routeCoordinates[i + 1];
      const dist = pointToSegmentDistanceKm(cam.coordinates, segStart, segEnd);

      if (dist < minDistance) {
        minDistance = dist;
        closestSegmentIdx = i;
      }
    }

    if (minDistance <= maxDistanceKm) {
      matches.push({
        camera: cam,
        segmentIndex: closestSegmentIdx,
        distanceKm: minDistance
      });
    }
  }

  // Sort matched cameras by their sequential position along the journey
  matches.sort((a, b) => a.segmentIndex - b.segmentIndex);

  return matches.map(m => m.camera);
}
