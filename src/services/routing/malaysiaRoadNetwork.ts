export interface RoadCorridor {
  id: string;
  name: string;
  expresswayCode?: string;
  speedLimit: number;
  tollPlazaKeys: string[];
  coordinates: [number, number][]; // [lng, lat]
}

export const MALAYSIA_ROAD_CORRIDORS: RoadCorridor[] = [
  {
    id: 'plus-north-e1',
    name: 'North-South Expressway Northern Route (PLUS E1)',
    expresswayCode: 'E1',
    speedLimit: 110,
    tollPlazaKeys: ['PLUS_JALAN_DUTA', 'PLUS_E1_TAPAH', 'PLUS_IPOH_SELATAN', 'PLUS_JURU'],
    coordinates: [
      [101.668, 3.178], // Jalan Duta
      [101.620, 3.250], // Sungai Buloh
      [101.574, 3.321], // Rawang
      [101.554, 3.415], // Bukit Beruntung
      [101.540, 3.520], // Bukit Tagar
      [101.518, 3.684], // Tanjung Malim
      [101.401, 3.829], // Slim River
      [101.312, 3.996], // Sungkai
      [101.288, 4.112], // Bidor
      [101.305, 4.192], // Tapah
      [101.220, 4.310], // Temoh / Kampar
      [101.168, 4.450], // Gopeng
      [101.127, 4.530], // Simpang Pulai
      [101.090, 4.597], // Ipoh
      [101.060, 4.650], // Jelapang
      [100.940, 4.767], // Kuala Kangsar
      [100.720, 4.795], // Taiping / Changkat Jering
      [100.655, 5.035], // Bukit Merah
      [100.495, 5.135], // Bandar Baharu
      [100.495, 5.195], // Jawi
      [100.450, 5.275], // Bukit Tambun
      [100.420, 5.315], // Juru
      [100.400, 5.390], // Seberang Jaya / Penang Bridge junction
      [100.430, 5.500], // Bertam
      [100.490, 5.645], // Sungai Petani
      [100.480, 5.850], // Gurun
      [100.420, 6.000], // Pendang
      [100.368, 6.120], // Alor Setar
      [100.420, 6.265], // Jitra
      [100.419, 6.518]  // Bukit Kayu Hitam / Border
    ]
  },
  {
    id: 'plus-south-e2',
    name: 'North-South Expressway Southern Route (PLUS E2)',
    expresswayCode: 'E2',
    speedLimit: 110,
    tollPlazaKeys: ['PLUS_SG_BESI', 'PLUS_E2_SG_BESI_SEREMBAN', 'PLUS_AYER_KEROH', 'PLUS_SKUDAI'],
    coordinates: [
      [101.712, 3.052], // Sungai Besi
      [101.715, 3.005], // Serdang / UPM
      [101.750, 2.990], // Kajang
      [101.770, 2.930], // Bangi
      [101.800, 2.810], // Nilai
      [101.938, 2.725], // Seremban
      [101.980, 2.680], // Senawang
      [102.090, 2.590], // Rembau
      [102.180, 2.430], // Simpang Ampat / Alor Gajah
      [102.280, 2.280], // Ayer Keroh / Melaka
      [102.430, 2.310], // Jasin
      [102.540, 2.270], // Tangkak
      [102.660, 2.210], // Bukit Gambir
      [102.770, 2.150], // Pagoh
      [103.060, 2.010], // Yong Peng
      [103.180, 1.918], // Ayer Hitam
      [103.260, 1.880], // Machap
      [103.310, 1.820], // Simpang Renggam
      [103.530, 1.710], // Sedenak
      [103.600, 1.660], // Kulai
      [103.640, 1.600], // Senai
      [103.660, 1.530], // Skudai
      [103.710, 1.510], // Kempas
      [103.757, 1.465]  // Johor Bahru City
    ]
  },
  {
    id: 'east-coast-e8',
    name: 'Karak & East Coast Expressway (LPT E8)',
    expresswayCode: 'E8',
    speedLimit: 110,
    tollPlazaKeys: ['LPT_BENTONG', 'LPT_KARAK', 'LPT_KUANTAN'],
    coordinates: [
      [101.730, 3.235], // Gombak
      [101.790, 3.355], // Genting Sempah
      [101.825, 3.350], // Bukit Tinggi
      [101.910, 3.520], // Bentong
      [102.035, 3.415], // Karak
      [102.185, 3.490], // Lanchang
      [102.420, 3.450], // Temerloh
      [102.590, 3.480], // Chenor
      [102.775, 3.585], // Maran
      [103.100, 3.710], // Gambang
      [103.325, 3.812], // Kuantan
      [103.310, 3.920], // Jabor
      [103.420, 4.250], // Chukai
      [103.450, 4.350], // Kijal
      [103.445, 4.515], // Kerteh
      [103.420, 4.770], // Dungun
      [103.140, 5.330]  // Kuala Terengganu
    ]
  },
  {
    id: 'federal-highway-route2',
    name: 'Federal Highway (Route 2 / FT2)',
    speedLimit: 90,
    tollPlazaKeys: [], // Toll-free
    coordinates: [
      [101.693, 3.141], // KL City Centre
      [101.677, 3.118], // Mid Valley
      [101.645, 3.107], // Petaling Jaya
      [101.587, 3.075], // Subang Jaya
      [101.518, 3.073], // Shah Alam
      [101.445, 3.044]  // Klang
    ]
  },
  {
    id: 'mex-e20',
    name: 'Maju Expressway (MEX E20)',
    expresswayCode: 'E20',
    speedLimit: 110,
    tollPlazaKeys: ['MEX_SALAK_SELATAN', 'MEX_SERI_KEMBANGAN', 'MEX_PUTRAJAYA'],
    coordinates: [
      [101.693, 3.141], // KL (Tun Razak / Kampung Pandan)
      [101.705, 3.090], // Salak Selatan
      [101.688, 3.080], // Kuchai Lama
      [101.695, 3.020], // Seri Kembangan
      [101.680, 2.930], // Putrajaya
      [101.656, 2.921]  // Cyberjaya
    ]
  },
  {
    id: 'penang-bridge-e36',
    name: 'Penang Bridge (E36)',
    expresswayCode: 'E36',
    speedLimit: 80,
    tollPlazaKeys: ['PENANG_BRIDGE_1'],
    coordinates: [
      [100.410, 5.355], // Seberang Prai / Juru Junction
      [100.350, 5.353], // Penang Bridge Midspan
      [100.310, 5.360], // Gelugor (Island side)
      [100.330, 5.414]  // George Town
    ]
  },
  {
    id: 'pan-borneo-sarawak',
    name: 'Pan Borneo Highway Sarawak (AH150)',
    speedLimit: 90,
    tollPlazaKeys: [],
    coordinates: [
      [110.359, 1.553], // Kuching
      [110.568, 1.168], // Serian
      [111.462, 1.238], // Sri Aman
      [111.528, 1.411], // Betong
      [111.524, 2.127], // Sarikei
      [111.830, 2.287], // Sibu
      [113.042, 3.179], // Bintulu
      [113.991, 4.399]  // Miri
    ]
  },
  {
    id: 'pan-borneo-sabah',
    name: 'Pan Borneo Highway Sabah (AH150)',
    speedLimit: 90,
    tollPlazaKeys: [],
    coordinates: [
      [116.073, 5.980], // Kota Kinabalu
      [116.230, 6.182], // Tuaran
      [116.664, 5.953], // Ranau
      [117.118, 5.603], // Telupid
      [118.117, 5.840], // Sandakan
      [118.327, 5.026], // Lahad Datu
      [117.891, 4.244]  // Tawau
    ]
  }
];

export function distanceKm(c1: [number, number], c2: [number, number]): number {
  const [lng1, lat1] = c1;
  const [lng2, lat2] = c2;
  const R = 6371;
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

export interface SnappedCorridorMatch {
  corridor: RoadCorridor;
  startIndex: number;
  endIndex: number;
  entryPoint: [number, number];
  exitPoint: [number, number];
  pathCoordinates: [number, number][];
}

/**
 * Snaps origin and destination to the nearest Malaysian highway/arterial road corridor.
 */
export function findNearestRoadPath(
  start: [number, number],
  dest: [number, number]
): SnappedCorridorMatch | null {
  let bestMatch: SnappedCorridorMatch | null = null;
  let minTotalDistance = Infinity;

  for (const corridor of MALAYSIA_ROAD_CORRIDORS) {
    let bestStartIdx = -1;
    let minStartDist = Infinity;
    let bestDestIdx = -1;
    let minDestDist = Infinity;

    for (let i = 0; i < corridor.coordinates.length; i++) {
      const coord = corridor.coordinates[i];
      const dStart = distanceKm(start, coord);
      if (dStart < minStartDist) {
        minStartDist = dStart;
        bestStartIdx = i;
      }
      const dDest = distanceKm(dest, coord);
      if (dDest < minDestDist) {
        minDestDist = dDest;
        bestDestIdx = i;
      }
    }

    // Only match if the corridor actually helps travel closer to dest
    if (minStartDist < 50 && minDestDist < 60) {
      const corridorSubDist = Math.abs(bestStartIdx - bestDestIdx);
      if (corridorSubDist >= 1) {
        const totalDetour = minStartDist + minDestDist;
        if (totalDetour < minTotalDistance) {
          minTotalDistance = totalDetour;
          const sliceStart = Math.min(bestStartIdx, bestDestIdx);
          const sliceEnd = Math.max(bestStartIdx, bestDestIdx);
          let path = corridor.coordinates.slice(sliceStart, sliceEnd + 1);
          if (bestStartIdx > bestDestIdx) {
            path = path.reverse();
          }

          bestMatch = {
            corridor,
            startIndex: bestStartIdx,
            endIndex: bestDestIdx,
            entryPoint: corridor.coordinates[bestStartIdx],
            exitPoint: corridor.coordinates[bestDestIdx],
            pathCoordinates: path
          };
        }
      }
    }
  }

  return bestMatch;
}

