import { describe, it, expect } from 'vitest';
import {
  estimateRouteTolls,
  PHYSICAL_TOLL_GATES
} from '../../src/services/toll/tollCalculator';

/** Builds a synthetic northbound MEX polyline passing directly through the Salak Selatan gate canopy. */
function mexRouteThroughSalakSelatan(): [number, number][] {
  const gate = PHYSICAL_TOLL_GATES.find(g => g.id === 'MEX_SALAK_SELATAN')!;
  const [lng, lat] = gate.coordinates;
  return [
    [lng, lat + 0.01],
    [lng, lat],
    [lng, lat - 0.01]
  ];
}

describe('estimateRouteTolls (geometry-first toll estimation)', () => {
  it('detects MEX Salak Selatan physically when real route geometry passes the gate', () => {
    const result = estimateRouteTolls([], 'car', mexRouteThroughSalakSelatan());
    expect(result.items.some(i => i.id === 'MEX_SALAK_SELATAN')).toBe(true);
    expect(result.totalCost).toBe(2.00);
  });

  it('uses keyword fallback when no coordinates are available', () => {
    const result = estimateRouteTolls(['MEX_SALAK_SELATAN'], 'car', undefined);
    expect(result.totalCost).toBe(2.00);
  });

  it('does not charge KESAS when geometry never crosses the Sunway plaza', () => {
    // KL city route far from KESAS Sunway — keyword key says KESAS, geometry says no
    const klShortRoute: [number, number][] = [[101.6868, 3.1390], [101.6950, 3.1510]];
    const result = estimateRouteTolls(['KESAS_SUNWAY'], 'car', klShortRoute);
    expect(result.items.some(i => i.id === 'KESAS_SUNWAY')).toBe(false);
  });

  it('returns zero tolls for empty keyword keys and no coordinates', () => {
    const result = estimateRouteTolls([], 'car', undefined);
    expect(result.totalCost).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it('charges real chainage fare for closed-system PLUS trips (Sg Besi → Ayer Keroh = RM 15.60)', () => {
    const sgBes = PHYSICAL_TOLL_GATES.find(g => g.id === 'PLUS_E2_GATE_SG_BESI')!;
    const ayerKeroh = PHYSICAL_TOLL_GATES.find(g => g.id === 'PLUS_E2_GATE_AYER_KEROH')!;
    // Real-world shape: navigation starts at the entry gate and ends at the exit gate.
    // Densify into ~10km segments so each passes the crossing detector's 15km segment cap.
    const route: [number, number][] = [];
    const steps = 25;
    for (let i = 0; i <= steps; i++) {
      const r = i / steps;
      route.push([
        sgBes.coordinates[0] + (ayerKeroh.coordinates[0] - sgBes.coordinates[0]) * r,
        sgBes.coordinates[1] + (ayerKeroh.coordinates[1] - sgBes.coordinates[1]) * r
      ]);
    }
    const result = estimateRouteTolls([], 'car', route);
    const closed = result.items.find(i => i.id.includes('_TO_'));
    expect(closed).toBeDefined();
    expect(closed!.cost).toBe(15.60);
  });

  it('still rejects a mid-route gate pass with immediate perpendicular turn-off', () => {
    const gate = PHYSICAL_TOLL_GATES.find(g => g.id === 'MEX_SALAK_SELATAN')!;
    const [lng, lat] = gate.coordinates;
    // Drive north through the gate, then turn sharply west within a few metres
    const route: [number, number][] = [
      [lng, lat - 0.005],
      [lng, lat - 0.0005],
      [lng - 0.005, lat - 0.0004],
      [lng - 0.01, lat - 0.0003]
    ];
    const result = estimateRouteTolls([], 'car', route);
    expect(result.items.some(i => i.id === 'MEX_SALAK_SELATAN')).toBe(false);
  });

  it('charges full chainage when the trip ends near an interchange with no modeled exit canopy (KL → AEON Ayer Keroh)', () => {
    // Regression: real OSRM geometry from KL to AEON Ayer Keroh crosses the Sg Besi
    // canopy but leaves via the Ayer Keroh ramp, which is not a modeled gate — the
    // trip used to come out RM 0.00. The endpoint snap must resolve the exit.
    const sgBes = PHYSICAL_TOLL_GATES.find(g => g.id === 'PLUS_E2_GATE_SG_BESI')!;
    const ayerKerohIc = { coord: [102.2850, 2.2709] as [number, number] }; // near AEON, past the interchange
    const route: [number, number][] = [];
    const steps = 25;
    for (let i = 0; i <= steps; i++) {
      const r = i / steps;
      route.push([
        sgBes.coordinates[0] + (ayerKerohIc.coord[0] - sgBes.coordinates[0]) * r,
        sgBes.coordinates[1] + (ayerKerohIc.coord[1] - sgBes.coordinates[1]) * r
      ]);
    }
    const result = estimateRouteTolls([], 'car', route);
    const closed = result.items.find(i => i.id.includes('_TO_'));
    expect(closed).toBeDefined();
    expect(closed!.cost).toBe(15.60);
  });
});
