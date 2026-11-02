import { VehicleClass, TollItem, TollBreakdown } from './types';
import { PLUS_E1_INTERCHANGES, PLUS_E2_INTERCHANGES, ClosedInterchange } from './closedTollNetwork';

export interface PhysicalTollGate {
  id: string;
  name: string;
  expressway: string;
  operator: 'PLUS' | 'MEX' | 'KESAS' | 'LDP' | 'SMART' | 'LPT' | 'PENANG_BRIDGE' | string;
  system: 'open' | 'closed';
  coordinates: [number, number]; // [lng, lat]
  bearing?: number; // Monitored direction in degrees. If undefined, bidirectional.
  carRate?: number;
  motorcycleRate?: number;
  motorcycleProhibited?: boolean;
}

export interface GateCrossingHit {
  gate: PhysicalTollGate;
  distanceToGateMeters: number;
  routeOffsetMeters: number;
  bearingAtCrossing: number;
  segmentIndex: number;
}

// Convert geographic coordinates to local meters relative to an origin point
export function tollXY(p: [number, number], origin: [number, number]): [number, number] {
  const cosLat = Math.cos((origin[1] * Math.PI) / 180);
  return [
    (p[0] - origin[0]) * 111195 * cosLat,
    (p[1] - origin[1]) * 111195
  ];
}

export function tollSegmentLength(a: [number, number], b: [number, number]): number {
  const [dx, dy] = tollXY(b, a);
  return Math.hypot(dx, dy);
}

/**
 * Computes cumulative meter offsets along every node in a polyline.
 */
export function computeRouteOffsets(points: [number, number][]): number[] {
  const offsets = [0];
  for (let i = 1; i < points.length; i++) {
    offsets.push(offsets[i - 1] + tollSegmentLength(points[i - 1], points[i]));
  }
  return offsets;
}

/**
 * Detects if a route physically crosses a toll gate with:
 * 1. Proximity check (distance <= maxGateDistanceMeters, default 45m)
 * 2. Bearing alignment check (heading diff <= tolerance, default 55°)
 * 3. The 80-Meter Continuation Rule: The route must continue at least minContinuationMeters (80m)
 *    on both sides of the gate canopy (not starting, ending, or turning off prematurely).
 */
export function detectGateCrossing(
  points: [number, number][],
  gate: PhysicalTollGate,
  offsets: number[],
  maxGateDistanceMeters: number = 45,
  minContinuationMeters: number = 80
): GateCrossingHit | null {
  if (points.length < 2) return null;
  const gateCoord = gate.coordinates;
  const totalRouteLen = offsets[offsets.length - 1];

  let bestHit: GateCrossingHit | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];

    // Bounding box pre-filter (~65m box in degrees)
    if (
      Math.min(p[0], q[0]) > gateCoord[0] + 0.0006 ||
      Math.max(p[0], q[0]) < gateCoord[0] - 0.0006 ||
      Math.min(p[1], q[1]) > gateCoord[1] + 0.0006 ||
      Math.max(p[1], q[1]) < gateCoord[1] - 0.0006
    ) {
      continue;
    }

    const a = tollXY(p, gateCoord);
    const b = tollXY(q, gateCoord);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const segLen = Math.hypot(dx, dy);

    if (segLen < 0.1 || segLen > 15000) continue;

    const t = Math.max(0, Math.min(1, -(a[0] * dx + a[1] * dy) / (segLen * segLen)));
    const lateralDist = Math.hypot(a[0] + t * dx, a[1] + t * dy);
    const crossingOffset = offsets[i] + t * segLen;

    // 1. Gate Proximity Check
    if (lateralDist > maxGateDistanceMeters) continue;

    // A route starting or ending at a gate canopy is still a genuine paid
    // transit: closed systems take the ticket/settle the fare there, and open
    // barrier plazas are paid at the barrier itself — a trip ending exactly at
    // the canopy (e.g. LEKAS Ampangan, the last toll before Seremban) has paid.
    // Mid-route gates always need 80m of driven road on both sides.
    const startsAtGate = crossingOffset < minContinuationMeters;
    const endsAtGate = totalRouteLen - crossingOffset < minContinuationMeters;

    // Verify trajectory does not stop or take an immediate ramp turn right at the gate
    let beforeIdx = i;
    let afterIdx = i + 1;
    while (beforeIdx > 0 && crossingOffset - offsets[beforeIdx] < minContinuationMeters) {
      beforeIdx--;
    }
    while (afterIdx < points.length - 1 && offsets[afterIdx] - crossingOffset < minContinuationMeters) {
      afterIdx++;
    }

    const v = tollXY(points[beforeIdx], gateCoord);
    const w = tollXY(points[afterIdx], gateCoord);
    const projBefore = (v[0] * dx + v[1] * dy) / segLen;
    const projAfter = (w[0] * dx + w[1] * dy) / segLen;

    // Longitudinal continuation verify — endpoint-at-gate sides are relaxed:
    // a route beginning/ending at the canopy is a genuine paid transit.
    // The linear projection assumes the road is straight through the gate and
    // false-rejects curved ramp plazas (e.g. DUKE Segambut) where the 80m-back
    // along-route point is spatially "ahead" of the crossing on the segment
    // axis. The correct invariant: a real transit sweeps through the gate's
    // axis — the along-axis coordinate must change sign between the crossing
    // segment's start and its continuation points. A touch-and-reverse (T
    // junction tap) stays on one side and is still rejected.
    const sweepsThrough = a[0] > 0 !== w[0] > 0 || a[0] > 0 !== v[0] > 0;
    if (!startsAtGate && projBefore > -50 && !sweepsThrough) {
      continue;
    }
    if (!endsAtGate && projAfter < 50 && !sweepsThrough) {
      continue;
    }

    // 3. Bearing Alignment Check
    const crossingBearing = (Math.atan2(dx, dy) * (180 / Math.PI) + 360) % 360;
    if (gate.bearing !== undefined) {
      let angleDiff = Math.abs((crossingBearing - gate.bearing + 540) % 360 - 180);
      if (angleDiff > 55) {
        // If opposite direction on bidirectional gate
        const oppDiff = Math.abs((crossingBearing - ((gate.bearing + 180) % 360) + 540) % 360 - 180);
        if (oppDiff > 55) {
          continue;
        }
      }
    }

    if (!bestHit || lateralDist < bestHit.distanceToGateMeters) {
      bestHit = {
        gate,
        distanceToGateMeters: Math.round(lateralDist * 10) / 10,
        routeOffsetMeters: Math.round(crossingOffset),
        bearingAtCrossing: Math.round(crossingBearing),
        segmentIndex: i
      };
    }
  }

  return bestHit;
}

/**
 * Registry of physical Malaysian toll gates with accurate GPS canopies & bearings.
 */
export const PHYSICAL_TOLL_GATES: PhysicalTollGate[] = [
  // MEX E20
  {
    id: 'MEX_SALAK_SELATAN',
    name: 'Plaza Tol Salak Selatan (MEX)',
    expressway: 'MEX E20',
    operator: 'MEX',
    system: 'open',
    coordinates: [101.7058, 3.0945],
    bearing: 160,
    carRate: 2.00,
    motorcycleRate: 0.00
  },
  {
    id: 'MEX_SERI_KEMBANGAN',
    name: 'Plaza Tol Seri Kembangan (MEX)',
    expressway: 'MEX E20',
    operator: 'MEX',
    system: 'open',
    coordinates: [101.6934, 3.0182],
    bearing: 170,
    carRate: 2.20,
    motorcycleRate: 0.00
  },
  {
    id: 'MEX_PUTRAJAYA',
    name: 'Plaza Tol Putrajaya (MEX)',
    expressway: 'MEX E20',
    operator: 'MEX',
    system: 'open',
    coordinates: [101.6685, 2.9465],
    bearing: 180,
    carRate: 3.50,
    motorcycleRate: 0.00
  },

  // KESAS E5
  {
    id: 'KESAS_SUNWAY',
    name: 'Plaza Tol Sunway (KESAS)',
    expressway: 'KESAS E5',
    operator: 'KESAS',
    system: 'open',
    coordinates: [101.6021, 3.0645],
    bearing: 90,
    carRate: 2.00,
    motorcycleRate: 0.00
  },
  {
    id: 'KESAS_KEMUNING',
    name: 'Plaza Tol Kota Kemuning (KESAS)',
    expressway: 'KESAS E5',
    operator: 'KESAS',
    system: 'open',
    coordinates: [101.5281, 3.0125],
    bearing: 90,
    carRate: 2.00,
    motorcycleRate: 0.00
  },

  // DUKE E33 (Duta-Ulu Klang Expressway) — interchange barriers, RM 1.60 class 1
  {
    id: 'DUKE_SEGAMBUT',
    name: 'Plaza Tol Segambut (DUKE)',
    expressway: 'DUKE E33',
    operator: 'DUKE',
    system: 'open',
    coordinates: [101.6555, 3.1874],
    bearing: 350,
    carRate: 1.60,
    motorcycleRate: 0.00
  },
  {
    id: 'DUKE_SENTUL_PASAR',
    name: 'Plaza Tol Sentul Pasar (DUKE)',
    expressway: 'DUKE E33',
    operator: 'DUKE',
    system: 'open',
    coordinates: [101.6995, 3.1965],
    bearing: 355,
    carRate: 1.60,
    motorcycleRate: 0.00
  },

  // Grand Saga E7 (Cheras-Kajang)
  {
    id: 'GRAND_SAGA_BATU_9',
    name: 'Plaza Tol Batu 9 (Grand Saga)',
    expressway: 'Grand Saga E7',
    operator: 'GRAND_SAGA',
    system: 'open',
    coordinates: [101.7604, 3.0745],
    bearing: 190,
    carRate: 1.30,
    motorcycleRate: 0.00
  },
  {
    id: 'GRAND_SAGA_BATU_11',
    name: 'Plaza Tol Batu 11 (Grand Saga)',
    expressway: 'Grand Saga E7',
    operator: 'GRAND_SAGA',
    system: 'open',
    coordinates: [101.7753, 3.0372],
    bearing: 10,
    carRate: 1.30,
    motorcycleRate: 0.00
  },

  // SILK E18 (Kajang Dispersal Link) — 4 barrier plazas, RM 1.66 each
  {
    id: 'SILK_SG_BALAK',
    name: 'Plaza Tol Sungai Balak (SILK)',
    expressway: 'SILK E18',
    operator: 'SILK',
    system: 'open',
    coordinates: [101.7704, 3.0079],
    bearing: 45,
    carRate: 1.66,
    motorcycleRate: 0.00
  },
  {
    id: 'SILK_SG_RAMAL',
    name: 'Plaza Tol Sungai Ramal (SILK)',
    expressway: 'SILK E18',
    operator: 'SILK',
    system: 'open',
    coordinates: [101.7754, 2.9795],
    bearing: 135,
    carRate: 1.66,
    motorcycleRate: 0.00
  },
  {
    id: 'SILK_BUKIT_KAJANG',
    name: 'Plaza Tol Bukit Kajang (SILK)',
    expressway: 'SILK E18',
    operator: 'SILK',
    system: 'open',
    coordinates: [101.8152, 2.9753],
    bearing: 225,
    carRate: 1.66,
    motorcycleRate: 0.00
  },
  {
    id: 'SILK_SG_LONG',
    name: 'Plaza Tol Sungai Long (SILK)',
    expressway: 'SILK E18',
    operator: 'SILK',
    system: 'open',
    coordinates: [101.8102, 3.0277],
    bearing: 315,
    carRate: 1.66,
    motorcycleRate: 0.00
  },

  // BESRAYA E9 (Sungai Besi Expressway) — RM 1.85 per plaza
  {
    id: 'BESRAYA_LOKE_YEW',
    name: 'Plaza Tol Loke Yew (BESRAYA)',
    expressway: 'BESRAYA E9',
    operator: 'BESRAYA',
    system: 'open',
    coordinates: [101.7246, 3.1210],
    bearing: 190,
    carRate: 1.85,
    motorcycleRate: 0.00
  },
  {
    id: 'BESRAYA_MINES',
    name: 'Plaza Tol Mines (BESRAYA)',
    expressway: 'BESRAYA E9',
    operator: 'BESRAYA',
    system: 'open',
    coordinates: [101.7084, 3.0440],
    bearing: 200,
    carRate: 1.85,
    motorcycleRate: 0.00
  },

  // NPE E10 (New Pantai Expressway) — direction-specific plazas
  {
    id: 'NPE_PJS2',
    name: 'Plaza Tol PJS 2 (NPE)',
    expressway: 'NPE E10',
    operator: 'NPE',
    system: 'open',
    coordinates: [101.6314, 3.0840],
    bearing: 80,
    carRate: 1.00,
    motorcycleRate: 0.00
  },
  {
    id: 'NPE_PJS5',
    name: 'Plaza Tol PJS 5 (NPE)',
    expressway: 'NPE E10',
    operator: 'NPE',
    system: 'open',
    coordinates: [101.6234, 3.0792],
    bearing: 260,
    carRate: 2.30,
    motorcycleRate: 0.00
  },
  {
    id: 'NPE_PANTAI_DALAM',
    name: 'Plaza Tol Pantai Dalam (NPE)',
    expressway: 'NPE E10',
    operator: 'NPE',
    system: 'open',
    coordinates: [101.6706, 3.0919],
    bearing: 250,
    carRate: 2.30,
    motorcycleRate: 0.00
  },

  // LEKAS E21 (Kajang-Seremban) — RM 3.20 + RM 2.30 = RM 5.50 full length
  {
    id: 'LEKAS_KAJANG_SELATAN',
    name: 'Plaza Tol Kajang Selatan (LEKAS)',
    expressway: 'LEKAS E21',
    operator: 'LEKAS',
    system: 'open',
    coordinates: [101.8349, 2.9730],
    bearing: 130,
    carRate: 3.20,
    motorcycleRate: 0.00
  },
  {
    id: 'LEKAS_AMPANGAN',
    name: 'Plaza Tol Ampangan (LEKAS)',
    expressway: 'LEKAS E21',
    operator: 'LEKAS',
    system: 'open',
    coordinates: [101.9676, 2.7597],
    bearing: 130,
    carRate: 2.30,
    motorcycleRate: 0.00
  },

  // LDP E11
  {
    id: 'LDP_PENCHALA',
    name: 'Plaza Tol Penchala (LDP)',
    expressway: 'LDP E11',
    operator: 'LDP',
    system: 'open',
    coordinates: [101.6212, 3.1652],
    bearing: 160,
    carRate: 2.10,
    motorcycleRate: 0.00
  },
  {
    id: 'LDP_PUCHONG_SELATAN',
    name: 'Plaza Tol Puchong Selatan (LDP)',
    expressway: 'LDP E11',
    operator: 'LDP',
    system: 'open',
    coordinates: [101.6712, 2.9845],
    bearing: 175,
    carRate: 2.10,
    motorcycleRate: 0.00
  },

  // Karak & LPT1 (E8)
  // Coordinates from OSM (old values were 750m / 3km off the E8 alignment)
  {
    id: 'LPT_GOMBAK',
    name: 'Plaza Tol Gombak (Karak)',
    expressway: 'Karak E8',
    operator: 'LPT',
    system: 'open',
    coordinates: [101.7272, 3.2420],
    bearing: 45,
    carRate: 6.00,
    motorcycleRate: 0.00
  },
  {
    id: 'LPT_BENTONG',
    name: 'Plaza Tol Karak / Bentong (E8)',
    expressway: 'Karak E8',
    operator: 'LPT',
    system: 'open',
    coordinates: [102.0275, 3.4437],
    bearing: 65,
    carRate: 3.50,
    motorcycleRate: 0.00
  },

  // SMART Tunnel E38
  {
    id: 'SMART_TUNNEL',
    name: 'Plaza Tol Terowong SMART (E38)',
    expressway: 'SMART E38',
    operator: 'SMART',
    system: 'open',
    coordinates: [101.7125, 3.1252],
    bearing: 160,
    carRate: 3.00,
    motorcycleRate: 0.00,
    motorcycleProhibited: true
  },

  // Penang Bridge 2 (Sultan Abdul Halim Muadzam Shah Bridge, E28) — RM 7.00 class 1
  // Plaza sits at the island-end approach (Batu Maung); toll charged entering the island
  {
    id: 'PENANG_BRIDGE_2',
    name: 'Plaza Tol Jambatan Kedua Pulau Pinang (Arah Pulau)',
    expressway: 'Penang Bridge 2',
    operator: 'PENANG_BRIDGE',
    system: 'open',
    coordinates: [100.2947, 5.2914],
    bearing: 65,
    carRate: 8.50,
    motorcycleRate: 1.70
  },

  // LPT2 E8 (East Coast — Kuantan stretch)
  {
    id: 'LPT_TEMERLOH',
    name: 'Plaza Tol Temerloh (LPT2)',
    expressway: 'LPT2 E8',
    operator: 'LPT',
    system: 'open',
    coordinates: [102.4041, 3.5044],
    bearing: 65,
    carRate: 5.00,
    motorcycleRate: 0.00
  },
  {
    id: 'LPT_JABOR',
    name: 'Plaza Tol Jabor (LPT2)',
    expressway: 'LPT2 E8',
    operator: 'LPT',
    system: 'open',
    coordinates: [103.3176, 3.9455],
    bearing: 60,
    carRate: 4.50,
    motorcycleRate: 0.00
  },

  // Penang Bridges
  {
    id: 'PENANG_BRIDGE_1',
    name: 'Plaza Tol Jambatan Pulau Pinang (Arah Pulau)',
    expressway: 'Penang Bridge',
    operator: 'PENANG_BRIDGE',
    system: 'open',
    coordinates: [100.3933, 5.3575],
    bearing: 225,
    carRate: 5.74,
    motorcycleRate: 1.40
  },

  // PLUS E2 Major Plaza Canopies — coordinates snapped to the real E2 carriageway
  // via OSRM full geometry (old values were 0.8–4.9 km off, so the 45m proximity
  // check never fired and closed-system trips came out RM 0.00)
  {
    id: 'PLUS_E2_GATE_SG_BESI',
    name: 'Plaza Tol Sungai Besi (PLUS E2)',
    expressway: 'PLUS E2',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [101.7052, 3.0520],
    bearing: 165
  },
  {
    id: 'PLUS_E2_GATE_SEREMBAN',
    name: 'Plaza Tol Seremban (PLUS E2)',
    expressway: 'PLUS E2',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [101.9194, 2.7124],
    bearing: 165
  },
  {
    id: 'PLUS_E2_GATE_AYER_KEROH',
    name: 'Plaza Tol Ayer Keroh (PLUS E2)',
    expressway: 'PLUS E2',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [102.2850, 2.2709],
    bearing: 145
  },
  {
    id: 'PLUS_E2_GATE_SKUDAI',
    name: 'Plaza Tol Skudai (PLUS E2)',
    expressway: 'PLUS E2',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [103.6681, 1.5738],
    bearing: 150
  },

  // PLUS E1 Major Plaza Canopies — snapped to the real E1 carriageway (see note above)
  {
    id: 'PLUS_E1_GATE_JALAN_DUTA',
    name: 'Plaza Tol Jalan Duta (PLUS E1)',
    expressway: 'PLUS E1',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [101.6615, 3.1762],
    bearing: 340
  },
  {
    id: 'PLUS_E1_GATE_IPOH_SELATAN',
    name: 'Plaza Tol Ipoh Selatan (PLUS E1)',
    expressway: 'PLUS E1',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [101.1039, 4.6273],
    bearing: 350
  },
  {
    id: 'PLUS_E1_GATE_JURU',
    name: 'Plaza Tol Juru (PLUS E1)',
    expressway: 'PLUS E1',
    operator: 'PLUS',
    system: 'closed',
    coordinates: [100.4505, 5.3223],
    bearing: 350
  }
];

/**
 * Calculates accurate route tolls using physical 80m gate crossings & bearing verification.
 */
export function calculatePhysicalRouteTolls(
  points: [number, number][],
  vehicleClass: VehicleClass
): TollBreakdown {
  if (vehicleClass === 'walker' || points.length < 2) {
    return {
      totalCost: 0,
      currency: 'MYR',
      items: [],
      vehicleClass: 'walker',
      note: 'Pedestrian route avoids all expressways and toll plazas.'
    };
  }

  const offsets = computeRouteOffsets(points);
  const items: TollItem[] = [];
  let totalCost = 0;
  let hasMotorcycleRestriction = false;

  // Resolves chainage fare for a closed-system entry/exit pair by interchange id
  // and appends the combined item. Physical gate hits prove the expressway was
  // transited; the chainage table prices it.
  const pushClosedPair = (entryGate: PhysicalTollGate, exitGate: PhysicalTollGate, cls: VehicleClass) => {
    const table = entryGate.expressway.includes('E1') ? PLUS_E1_INTERCHANGES : PLUS_E2_INTERCHANGES;
    const resolveInterchange = (gateId: string) => {
      const suffix = gateId.split('_GATE_')[1];
      return table.find(ic => ic.id === suffix);
    };
    const icEntry = resolveInterchange(entryGate.id);
    const icExit = resolveInterchange(exitGate.id);

    let closedCost = 0;
    if (icEntry && icExit && cls === 'car') {
      closedCost = Math.abs(icExit.chainageFare - icEntry.chainageFare);
    } else if (cls === 'car') {
      closedCost = 4.10; // Default verified transit segment
    }

    totalCost += closedCost;
    items.push({
      id: `${entryGate.id}_TO_${exitGate.id}`,
      plazaName: `${entryGate.name.replace('Plaza Tol ', '')} → ${exitGate.name.replace('Plaza Tol ', '')}`,
      expressway: entryGate.expressway,
      cost: closedCost,
      paymentMethods: ['TnG', 'RFID']
    });
  };

  const hits: GateCrossingHit[] = [];

  for (const gate of PHYSICAL_TOLL_GATES) {
    const hit = detectGateCrossing(points, gate, offsets);
    if (hit) {
      hits.push(hit);
    }
  }

  // Sort hits by progression along route
  hits.sort((a, b) => a.routeOffsetMeters - b.routeOffsetMeters);

  // Process open barrier plazas
  for (const h of hits) {
    if (h.gate.system === 'open') {
      if (vehicleClass === 'motorcycle' && h.gate.motorcycleProhibited) {
        hasMotorcycleRestriction = true;
      }
      const cost = vehicleClass === 'motorcycle' ? (h.gate.motorcycleRate ?? 0) : (h.gate.carRate ?? 0);
      totalCost += cost;

      items.push({
        id: h.gate.id,
        plazaName: h.gate.name,
        expressway: h.gate.expressway,
        cost,
        paymentMethods: ['TnG', 'RFID', 'SmartTAG']
      });
    }
  }

  // Closed PLUS system: a physical mainline canopy hit proves the expressway
  // was actually used (no false tolls on parallel arterials). The entry/exit
  // interchange pair is then resolved per trip end: snap the endpoint to the
  // nearest chainage-table interchange when the access leg is short (< 8 km);
  // when it isn't (city-center starts ~10 km from Sg Besi), fall back to the
  // first/last physically crossed mainline canopy, whose gate id maps to a
  // table interchange directly.
  const plusHits = hits.filter(h => h.gate.operator === 'PLUS' && h.gate.system === 'closed');
  if (plusHits.length > 0) {
    const expressway = plusHits[0].gate.expressway;
    const table = expressway.includes('E1') ? PLUS_E1_INTERCHANGES : PLUS_E2_INTERCHANGES;
    const prefix = expressway.includes('E1') ? 'PLUS_E1' : 'PLUS_E2';
    const toGate = (ic: ClosedInterchange): PhysicalTollGate => ({
      id: `${prefix}_GATE_${ic.id}`,
      name: `Plaza Tol ${ic.name}`,
      expressway,
      operator: 'PLUS',
      system: 'closed',
      coordinates: ic.coord
    });
    const snapNearest = (p: [number, number]): ClosedInterchange | null => {
      let best: ClosedInterchange | null = null;
      let bestDist = Infinity;
      for (const ic of table) {
        const [dx, dy] = tollXY(p, ic.coord);
        const d = Math.hypot(dx, dy);
        if (d < bestDist) {
          bestDist = d;
          best = ic;
        }
      }
      return bestDist <= 8000 ? best : null;
    };
    const icFromGate = (gateId: string): ClosedInterchange | null =>
      table.find(ic => ic.id === gateId.split('_GATE_')[1]) ?? null;

    const firstHit = plusHits[0];
    const lastHit = plusHits[plusHits.length - 1];
    const icStart = snapNearest(points[0]) ?? icFromGate(firstHit.gate.id);
    const icEnd = snapNearest(points[points.length - 1]) ?? icFromGate(lastHit.gate.id);

    if (icStart && icEnd && icStart.id !== icEnd.id) {
      pushClosedPair(toGate(icStart), toGate(icEnd), vehicleClass);
    }
  }

  totalCost = Math.round(totalCost * 100) / 100;

  let note: string | undefined;
  if (hasMotorcycleRestriction && vehicleClass === 'motorcycle') {
    note = 'WARNING: Motorcycles are strictly prohibited on SMART Tunnel E38 (Akta Pengangkutan Jalan).';
  } else if (items.length > 0) {
    note = 'Verified with 80m gate continuation & bearing alignment. Missing fares never mean toll-free.';
  }

  return {
    totalCost,
    currency: 'MYR',
    items,
    vehicleClass,
    note,
    hasMotorcycleRestriction
  };
}
