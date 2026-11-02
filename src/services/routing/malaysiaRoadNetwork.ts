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
      [101.712, 3.0521], // Sungai Besi
      [101.7066, 3.0313], // Serdang / UPM
      [101.7416, 2.9841], // Kajang Interchange
      [101.7569, 2.9159], // Bangi Interchange
      [101.7686, 2.8865], // Southville City
      [101.7893, 2.871],
      [101.7877, 2.8445],
      [101.8108, 2.8069], // Nilai
      [101.8155, 2.7761],
      [101.8859, 2.7397], // Bandar Ainsdale
      [101.9345, 2.6869], // Seremban
      [101.9638, 2.6813], // Senawang
      [101.9897, 2.6548],
      [102.0104, 2.6102], // Pedas Linggi
      [102.0333, 2.5942], // Rembau
      [102.106, 2.4768],
      [102.1539, 2.466],
      [102.1752, 2.4462], // Simpang Ampat / Alor Gajah
      [102.1988, 2.4409],
      [102.2322, 2.3808],
      [102.2844, 2.3236], // Ayer Keroh / Melaka
      [102.3169, 2.3026],
      [102.4155, 2.2832], // Jasin
      [102.4781, 2.2536],
      [102.5927, 2.2309], // Tangkak
      [102.663, 2.156], // Bukit Gambir
      [102.7375, 2.1312], // Pagoh
      [102.7802, 2.1335],
      [102.8042, 2.1102],
      [102.8574, 2.1048],
      [102.8873, 2.0732],
      [102.904, 2.0756],
      [102.9245, 2.0993],
      [102.9475, 2.0983],
      [103.0501, 1.996], // Yong Peng North
      [103.095, 1.9906], // Yong Peng South
      [103.2574, 1.8775], // Ayer Hitam / Machap
      [103.3557, 1.7629], // Simpang Renggam
      [103.3966, 1.7474],
      [103.5023, 1.6603], // Sedenak
      [103.5508, 1.6501], // Kulai
      [103.6408, 1.5846], // Senai / Skudai
      [103.765, 1.523], // Kempas
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
      [101.656, 2.921], // Cyberjaya
      [101.700, 2.750]  // KLIA extension
    ]
  },
  {
    id: 'elite-e6',
    name: 'North-South Expressway Central Link (ELITE E6)',
    expresswayCode: 'E6',
    speedLimit: 110,
    tollPlazaKeys: ['ELITE_BATU_TIGA', 'ELITE_SEAFIELE', 'ELITE_KLIA'],
    coordinates: [
      [101.545, 3.082], // Shah Alam
      [101.578, 3.045], // USJ / Ebor
      [101.570, 2.998], // Putra Heights
      [101.611, 2.971], // Bandar Saujana Putra
      [101.632, 2.871], // Dengkil
      [101.696, 2.760], // KLIA
      [101.770, 2.810]  // Nilai North (Merge PLUS E2)
    ]
  },
  {
    id: 'skve-e26',
    name: 'South Klang Valley Expressway (SKVE E26)',
    expresswayCode: 'E26',
    speedLimit: 90,
    tollPlazaKeys: ['SKVE_AYER_HITAM', 'SKVE_SAUJANA_PUTRA', 'SKVE_PULAU_INDAH'],
    coordinates: [
      [101.745, 2.981], // Kajang / SILK
      [101.680, 2.960], // Putrajaya / Hospital Serdang
      [101.611, 2.971], // Bandar Saujana Putra
      [101.512, 2.950], // Telok Panglima Garang
      [101.370, 2.930]  // Pulau Indah / Port Klang
    ]
  },
  {
    id: 'silk-e18',
    name: 'Kajang Dispersal Link Expressway (SILK E18)',
    expresswayCode: 'E18',
    speedLimit: 90,
    tollPlazaKeys: ['SILK_SG_RAMAL', 'SILK_BUKIT_KAJANG'],
    coordinates: [
      [101.745, 3.025], // Balakong
      [101.758, 2.991], // Sungai Ramal
      [101.782, 2.991], // Kajang Town
      [101.795, 2.975], // Kajang Perdana
      [101.765, 2.960]  // UPM / Country Heights
    ]
  },
  {
    id: 'kesas-e5',
    name: 'Shah Alam Expressway (KESAS E5)',
    expresswayCode: 'E5',
    speedLimit: 90,
    tollPlazaKeys: ['KESAS_SUNWAY', 'KESAS_KEMUNING'],
    coordinates: [
      [101.705, 3.065], // Sri Petaling / Bukit Jalil
      [101.670, 3.060], // Kinrara
      [101.605, 3.062], // Sunway
      [101.530, 3.005], // Kota Kemuning
      [101.445, 2.998]  // Pandamaran / Port Klang
    ]
  },
  {
    id: 'ldp-e11',
    name: 'Damansara-Puchong Expressway (LDP E11)',
    expresswayCode: 'E11',
    speedLimit: 90,
    tollPlazaKeys: ['LDP_PENCHALA', 'LDP_PUCHONG_BARAT'],
    coordinates: [
      [101.625, 3.165], // Sri Damansara
      [101.615, 3.145], // Bandar Utama / 1 Utama
      [101.605, 3.100], // Kelana Jaya
      [101.620, 3.045], // IOI Mall Puchong
      [101.610, 2.980]  // Puchong South / Putrajaya boundary
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

    // Match within generous threshold (up to 95km to expressway corridor)
    // so journeys between cities across states always snap to highways rather than straight lines
    if (minStartDist < 95 && minDestDist < 95) {
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

const CORRIDOR_TRANSFER_MAX_KM = 12;

interface CorridorApproach {
  corridor: RoadCorridor;
  nodeIndex: number;
  point: [number, number];
  distKm: number;
}

/** Nearest node on each corridor to an arbitrary point. */
function nearestNodePerCorridor(point: [number, number]): CorridorApproach[] {
  const approaches: CorridorApproach[] = [];
  for (const corridor of MALAYSIA_ROAD_CORRIDORS) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < corridor.coordinates.length; i++) {
      const d = distanceKm(point, corridor.coordinates[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      approaches.push({ corridor, nodeIndex: bestIdx, point: corridor.coordinates[bestIdx], distKm: bestDist });
    }
  }
  return approaches;
}

interface ChainedSegment {
  corridor: RoadCorridor;
  fromIdx: number;
  toIdx: number;
}

/**
 * Routes across MULTIPLE corridors by treating shared/nearby corridor nodes as
 * transfer points (e.g. KL → Kuantan via E8, or KL → Putrajaya via E2 → ELITE
 * → MEX). Uses Dijkstra over corridor nodes: edge weights are along-corridor
 * segment distances, plus small access/transfer penalties so it prefers
 * staying on one corridor and transferring where corridors actually meet.
 *
 * Falls back to null when no chain beats simply snapping to one corridor —
 * the caller (findNearestRoadPathChained) then uses the single-corridor match.
 */
export interface ChainedCorridorMatch {
  segments: ChainedSegment[];
  entryPoint: [number, number];
  exitPoint: [number, number];
  pathCoordinates: [number, number][];
  corridorsUsed: RoadCorridor[];
}

export function findChainedCorridorPath(
  start: [number, number],
  dest: [number, number]
): ChainedCorridorMatch | null {
  // Node key: `${corridorId}:${nodeIndex}`
  const adjacency = new Map<string, { to: string; distKm: number }[]>();

  const addEdge = (from: string, to: string, distKm: number) => {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from)!.push({ to, distKm });
  };

  // Along-corridor edges (bidirectional)
  for (const corridor of MALAYSIA_ROAD_CORRIDORS) {
    for (let i = 0; i < corridor.coordinates.length - 1; i++) {
      const d = distanceKm(corridor.coordinates[i], corridor.coordinates[i + 1]);
      addEdge(`${corridor.id}:${i}`, `${corridor.id}:${i + 1}`, d);
      addEdge(`${corridor.id}:${i + 1}`, `${corridor.id}:${i}`, d);
    }
  }

  // Transfer edges between corridors at nodes within walking-of-an-interchange distance
  for (let c = 0; c < MALAYSIA_ROAD_CORRIDORS.length; c++) {
    for (let d = c + 1; d < MALAYSIA_ROAD_CORRIDORS.length; d++) {
      const a = MALAYSIA_ROAD_CORRIDORS[c];
      const b = MALAYSIA_ROAD_CORRIDORS[d];
      for (let i = 0; i < a.coordinates.length; i++) {
        for (let j = 0; j < b.coordinates.length; j++) {
          const gap = distanceKm(a.coordinates[i], b.coordinates[j]);
          if (gap <= CORRIDOR_TRANSFER_MAX_KM) {
            // 2.5x penalty so direct corridor travel beats hopping between
            // loosely-adjacent corridors when both options exist
            addEdge(`${a.id}:${i}`, `${b.id}:${j}`, gap * 2.5);
            addEdge(`${b.id}:${j}`, `${a.id}:${i}`, gap * 2.5);
          }
        }
      }
    }
  }

  // Virtual source/target nodes connect to the nearest node on every corridor.
  // Access legs beyond ~40km mean the destination isn't realistically served by
  // the corridor network — caller falls back in that case via single-corridor snap.
  const SOURCE = '__source__';
  const TARGET = '__target__';
  const startApproaches = nearestNodePerCorridor(start);
  const destApproaches = nearestNodePerCorridor(dest);

  for (const a of startApproaches) {
    addEdge(SOURCE, `${a.corridor.id}:${a.nodeIndex}`, a.distKm * 1.2);
  }
  for (const a of destApproaches) {
    addEdge(`${a.corridor.id}:${a.nodeIndex}`, TARGET, a.distKm * 1.2);
  }

  // Dijkstra
  const dist = new Map<string, number>([[SOURCE, 0]]);
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  const queue: [string, number][] = [[SOURCE, 0]];

  while (queue.length > 0) {
    queue.sort((x, y) => x[1] - y[1]);
    const [node] = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);

    if (node === TARGET) break;

    for (const edge of adjacency.get(node) || []) {
      const nd = (dist.get(node) ?? Infinity) + edge.distKm;
      if (nd < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, nd);
        prev.set(edge.to, node);
        queue.push([edge.to, nd]);
      }
    }
  }

  if (!dist.has(TARGET)) return null;

  // Reconstruct node path (excluding virtual endpoints)
  const nodePath: string[] = [];
  let cur: string | undefined = TARGET;
  while (cur && cur !== SOURCE) {
    nodePath.unshift(cur);
    cur = prev.get(cur);
  }
  const realNodes = nodePath.filter(k => k !== TARGET && k !== SOURCE);
  if (realNodes.length < 2) return null;

  // Parse into per-corridor segments
  const parse = (key: string) => {
    const [corridorId, idxStr] = key.split(':');
    const corridor = MALAYSIA_ROAD_CORRIDORS.find(c => c.id === corridorId);
    return corridor ? { corridor, idx: parseInt(idxStr, 10) } : null;
  };

  const segments: ChainedSegment[] = [];
  for (const key of realNodes) {
    const parsed = parse(key);
    if (!parsed) continue;
    const last = segments[segments.length - 1];
    if (last && last.corridor.id === parsed.corridor.id) {
      if (last.toIdx !== parsed.idx) {
        // Extend segment toward the new node (handles both directions)
        last.toIdx = parsed.idx;
      }
    } else {
      segments.push({ corridor: parsed.corridor, fromIdx: parsed.idx, toIdx: parsed.idx });
    }
  }
  // Drop degenerate single-node segments (transfer entered+left at same node)
  const realSegments = segments.filter(s => s.fromIdx !== s.toIdx);
  if (realSegments.length === 0) return null;

  // Stitch coordinates
  const pathCoordinates: [number, number][] = [];
  for (const seg of realSegments) {
    const sliceStart = Math.min(seg.fromIdx, seg.toIdx);
    const sliceEnd = Math.max(seg.fromIdx, seg.toIdx);
    const slice = seg.corridor.coordinates.slice(sliceStart, sliceEnd + 1);
    if (seg.fromIdx > seg.toIdx) slice.reverse();
    // Avoid duplicate junction nodes between consecutive segments
    for (const coord of slice) {
      const lastCoord = pathCoordinates[pathCoordinates.length - 1];
      if (!lastCoord || lastCoord[0] !== coord[0] || lastCoord[1] !== coord[1]) {
        pathCoordinates.push(coord);
      }
    }
  }

  const firstParsed = parse(realNodes[0])!;
  const lastParsed = parse(realNodes[realNodes.length - 1])!;

  return {
    segments: realSegments,
    entryPoint: firstParsed.corridor.coordinates[firstParsed.idx],
    exitPoint: lastParsed.corridor.coordinates[lastParsed.idx],
    pathCoordinates,
    corridorsUsed: realSegments.map(s => s.corridor)
  };
}

/**
 * Multi-corridor snap: prefers a chained multi-highway route when it exists,
 * otherwise falls back to the classic single-corridor match.
 */
export function findNearestRoadPathChained(
  start: [number, number],
  dest: [number, number]
): SnappedCorridorMatch | null {
  const chained = findChainedCorridorPath(start, dest);
  if (chained && chained.segments.length > 0) {
    const primary = chained.segments[0].corridor;
    const lastSeg = chained.segments[chained.segments.length - 1];
    const firstSeg = chained.segments[0];
    return {
      corridor: primary,
      startIndex: firstSeg.fromIdx,
      endIndex: lastSeg.toIdx,
      entryPoint: chained.entryPoint,
      exitPoint: chained.exitPoint,
      pathCoordinates: chained.pathCoordinates
    };
  }
  return findNearestRoadPath(start, dest);
}

