import { TollBreakdown, TollItem, VehicleClass } from './types';
import { MALAYSIA_TOLL_REGISTRY } from './tollData';
import { calculatePhysicalRouteTolls, PHYSICAL_TOLL_GATES } from './tollCrossing';
export { calculatePhysicalRouteTolls, detectGateCrossing, computeRouteOffsets, PHYSICAL_TOLL_GATES } from './tollCrossing';
export type { PhysicalTollGate, GateCrossingHit } from './tollCrossing';

/**
 * Estimates route tolls from the best available evidence:
 * 1. Real route geometry (OSRM or highway-snapped): physically detects gate canopies
 *    along the polyline via the 80m proximity + bearing system, and verifies the
 *    closed-system entry/exit pair. Independent of road names entirely.
 * 2. Keyword fallback (approximate/synthetic geometry): resolves plaza keys against
 *    the registry — used only when the coordinates are not real road data.
 *
 * When geometry is available, plazas with a physical gate entry are geometry's
 * authority — keyword keys for those are dropped (a route whose polyline never
 * crosses the Sunway canopy is not tolled, whatever its road names say). Keyword
 * keys are only merged for plazas with no physical gate, which geometry cannot see.
 */
export function estimateRouteTolls(
  plazaKeys: string[],
  vehicleClass: VehicleClass,
  routeCoordinates?: [number, number][],
  isApproximate?: boolean
): TollBreakdown {
  if (!isApproximate && routeCoordinates && routeCoordinates.length >= 2) {
    const geometric = calculatePhysicalRouteTolls(routeCoordinates, vehicleClass);
    const gatedIds = new Set(PHYSICAL_TOLL_GATES.map(g => g.id));
    const keyword = calculateRouteTolls(plazaKeys, vehicleClass);
    for (const item of keyword.items) {
      // Plazas covered (or excluded) by geometry, and the closed-system fallback item
      if (gatedIds.has(item.id) || item.id.startsWith('PLUS_')) continue;
      geometric.items.push(item);
      geometric.totalCost += item.cost;
    }
    geometric.totalCost = Math.round(geometric.totalCost * 100) / 100;
    return geometric;
  }

  return calculateRouteTolls(plazaKeys, vehicleClass);
}

export function calculateRouteTolls(plazaKeys: string[], vehicleClass: VehicleClass): TollBreakdown {
  if (vehicleClass === 'walker') {
    return {
      totalCost: 0,
      currency: 'MYR',
      items: [],
      vehicleClass: 'walker',
      note: 'Pedestrian route avoids all expressways and toll plazas.'
    };
  }

  const items: TollItem[] = [];
  let totalCost = 0;
  let hasMotorcycleRestriction = false;
  let hasUnmatchedClosedPlaza = false;

  for (const key of plazaKeys) {
    const plaza = MALAYSIA_TOLL_REGISTRY[key];
    if (!plaza) {
      if (key.startsWith('PLUS_')) {
        hasUnmatchedClosedPlaza = true;
      }
      continue;
    }

    if (vehicleClass === 'motorcycle' && plaza.motorcycleProhibited) {
      hasMotorcycleRestriction = true;
    }

    const cost = vehicleClass === 'motorcycle' ? plaza.motorcycleRate : plaza.carRate;
    totalCost += cost;

    items.push({
      id: plaza.id,
      plazaName: plaza.plazaName,
      expressway: plaza.expressway,
      cost,
      paymentMethods: plaza.paymentMethods
    });
  }

  // Handle unmatched closed-toll plaza fallback (penalty maximum rate per LLM regulations)
  if (hasUnmatchedClosedPlaza && vehicleClass === 'car') {
    const maxPenaltyRate = 43.30; // Max rate Juru to Skudai
    totalCost += maxPenaltyRate;
    items.push({
      id: 'PLUS_FALLBACK_MAX',
      plazaName: 'Unmatched Closed Entry (Maximum Rate)',
      expressway: 'PLUS Expressway',
      cost: maxPenaltyRate,
      paymentMethods: ['TnG', 'RFID']
    });
  }

  // Round total to 2 decimal places to avoid floating point inaccuracies
  totalCost = Math.round(totalCost * 100) / 100;

  let note: string | undefined;
  if (hasMotorcycleRestriction && vehicleClass === 'motorcycle') {
    note = 'WARNING: Motorcycles are strictly prohibited on SMART Tunnel E38 (Akta Pengangkutan Jalan). Please use alternative surface route.';
  } else if (hasUnmatchedClosedPlaza && vehicleClass === 'car') {
    note = 'Maximum toll rate applied due to unconfirmed entry/exit ticket junction.';
  } else if (vehicleClass === 'motorcycle') {
    note = totalCost === 0 
      ? 'Motorcycles are toll-exempt across standard Malaysian expressways.'
      : 'Special motorcycle bridge rates apply.';
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

