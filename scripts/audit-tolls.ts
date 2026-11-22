/**
 * Informational toll audit: calculates live OSRM routes through the app's toll
 * engine and prints the charged items plus how close expected gate canopies are
 * to the calculated geometry.
 *
 * Usage: npm run audit:tolls
 */
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });

import { calculateRoute } from '../src/services/routing/routingEngine';
import { estimateRouteTolls } from '../src/services/toll/tollCalculator';
import { PHYSICAL_TOLL_GATES } from '../src/services/toll/tollCrossing';

interface AuditTrip {
  name: string;
  a: [number, number];
  b: [number, number];
  gates: string[];
}

const trips: AuditTrip[] = [
  { name: 'Sg Besi -> Seremban', a: [101.712, 3.052], b: [101.938, 2.725], gates: ['PLUS_E2_GATE_SG_BESI'] },
  { name: 'Kajang -> Cheras', a: [101.7888, 2.9911], b: [101.764479, 3.0332544], gates: ['GRAND_SAGA_BATU_9', 'GRAND_SAGA_BATU_11'] },
  { name: 'KL -> Putrajaya (MEX)', a: [101.693, 3.141], b: [101.6685, 2.9465], gates: ['MEX_PUTRAJAYA'] },
  { name: 'KL -> Ipoh', a: [101.693, 3.141], b: [101.09, 4.597], gates: ['PLUS_E1_GATE_JALAN_DUTA', 'PLUS_E1_GATE_IPOH_SELATAN'] },
  { name: 'KL -> Penang (Juru)', a: [101.693, 3.141], b: [100.4505, 5.3223], gates: ['PLUS_E1_GATE_JALAN_DUTA', 'PLUS_E1_GATE_JURU'] },
  { name: 'KL -> Kuantan (LPT)', a: [101.693, 3.141], b: [103.326, 3.807], gates: ['LPT_GOMBAK', 'LPT_BENTONG'] },
  { name: 'George Town -> Butterworth', a: [100.3298, 5.4145], b: [100.39, 5.44], gates: ['PENANG_BRIDGE_1'] }
];

function distanceToRouteMeters(route: [number, number][], point: [number, number]): number {
  const cos = Math.cos((point[1] * Math.PI) / 180);
  let best = Infinity;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    const ax = (a[0] - point[0]) * 111320 * cos;
    const ay = (a[1] - point[1]) * 110574;
    const bx = (b[0] - point[0]) * 111320 * cos;
    const by = (b[1] - point[1]) * 110574;
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lenSq));
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

let warnings = 0;

for (const trip of trips) {
  try {
    const route = await calculateRoute(trip.a, trip.b, 'car', trip.name, 'full');
    const tolls = estimateRouteTolls(route.tollPlazaKeys, 'car', route.coordinates);

    console.log(`\n${trip.name} — ${route.distanceKm} km — RM ${tolls.totalCost.toFixed(2)}`);
    if (tolls.items.length === 0) {
      console.log('  (no toll detected)');
      if (route.tollPlazaKeys.length > 0) {
        console.log(`  WARN: engine keywords suggested ${route.tollPlazaKeys.join(', ')}`);
        warnings++;
      }
    }
    for (const item of tolls.items) {
      console.log(`  charged: ${item.id} — RM ${item.cost.toFixed(2)}`);
    }
    for (const id of trip.gates) {
      const gate = PHYSICAL_TOLL_GATES.find(candidate => candidate.id === id);
      if (gate) {
        const distance = distanceToRouteMeters(route.coordinates, gate.coordinates);
        console.log(`  gate ${id}: ${distance.toFixed(0)} m from route`);
      }
    }
  } catch (error) {
    console.error(`${trip.name}: route calculation failed — ${String(error)}`);
    process.exitCode = 1;
  }
}

console.log(`\nAudit complete. ${warnings} route(s) returned RM 0 despite toll keywords.`);
