import { describe, it, expect } from 'vitest';
import {
  calculateRouteTolls,
  calculatePhysicalRouteTolls,
  detectGateCrossing,
  computeRouteOffsets,
  PHYSICAL_TOLL_GATES
} from '../../src/services/toll/tollCalculator';
import { TOLL_RATES_SNAPSHOT } from '../../src/services/toll/types';

describe('Malaysia Toll Calculator', () => {
  it('calculates open system flat toll for car (e.g. MEX Salak Selatan)', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN'], 'car');
    expect(result.totalCost).toBe(2.00);
    expect(result.items[0].expressway).toBe('MEX E20');
    expect(result.ratesUpdatedAt).toBe(TOLL_RATES_SNAPSHOT);
  });

  it('exempts motorcycle tolls for standard expressways (RM 0.00)', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN', 'PLUS_SG_BESI'], 'motorcycle');
    expect(result.totalCost).toBe(0.00);
    expect(result.items.every(i => i.cost === 0)).toBe(true);
  });

  it('calculates closed-system PLUS toll correctly (e.g. Sungai Besi to Seremban)', () => {
    const result = calculateRouteTolls(['PLUS_E2_SG_BESI_SEREMBAN'], 'car');
    expect(result.totalCost).toBe(4.10);
  });

  it('flags motorcycle prohibition on SMART Tunnel E38 with clear warning', () => {
    const result = calculateRouteTolls(['SMART_TUNNEL'], 'motorcycle');
    expect(result.hasMotorcycleRestriction).toBe(true);
    expect(result.note).toContain('strictly prohibited');
  });

  it('falls back to maximum distance rate with warning for unmatched closed toll entry', () => {
    const result = calculateRouteTolls(['PLUS_UNKNOWN_ENTRY'], 'car');
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.note).toContain('Maximum toll rate');
  });

  describe('80m Physical Toll Gate Crossing & Bearing Verification', () => {
    // Plaza Tol Salak Selatan (MEX E20) is at [101.71189, 3.11062], bearing 160° (SSE)
    const salakGate = PHYSICAL_TOLL_GATES.find(g => g.id === 'MEX_SALAK_SELATAN')!;

    it('detects toll crossing when route cleanly crosses the plaza and continues >= 80m on both sides', () => {
      // Route starting 300m before the gate, driving at 160° through it, and continuing 300m after
      const routeCrossing: [number, number][] = [
        [101.71096, 3.11317], // ~300m North-Northwest
        [101.71189, 3.11062], // exactly crosses gate
        [101.71282, 3.10807]  // ~300m South-Southeast
      ];

      const offsets = computeRouteOffsets(routeCrossing);
      const hit = detectGateCrossing(routeCrossing, salakGate, offsets);

      expect(hit).not.toBeNull();
      expect(hit?.gate.id).toBe('MEX_SALAK_SELATAN');
      expect(hit?.distanceToGateMeters).toBeLessThan(10);
    });

    it('accepts a crossing when the route terminates at the gate (paid at the barrier)', () => {
      // A trip ending exactly on the canopy is a genuine paid transit: open
      // barrier plazas are paid at the barrier, closed systems settle there.
      const shortRoute: [number, number][] = [
        [101.71096, 3.11317],
        [101.71189, 3.11062] // ends right on the gate canopy
      ];

      const offsets = computeRouteOffsets(shortRoute);
      const hit = detectGateCrossing(shortRoute, salakGate, offsets);

      expect(hit).not.toBeNull();
    });

    it('rejects a 30m "touch" where the route approaches and reverses away (no transit)', () => {
      // Route dips toward the gate but turns off before crossing — parallel
      // service road within 45m, no passage through the canopy line.
      const touchRoute: [number, number][] = [
        [101.71189 - 0.001, 3.11062],
        [101.71189 - 0.0002, 3.11062],
        [101.71189 - 0.001, 3.11112]
      ];
      const offsets = computeRouteOffsets(touchRoute);
      const hit = detectGateCrossing(touchRoute, salakGate, offsets);
      expect(hit).toBeNull();
    });

    it('rejects crossing when bearing does not match toll direction (opposite lane or perpendicular cross-traffic)', () => {
      // Route running East to West across or under the highway (bearing 270°)
      const perpendicularRoute: [number, number][] = [
        [101.70909, 3.11062],
        [101.71189, 3.11062],
        [101.71469, 3.11062]
      ];

      const offsets = computeRouteOffsets(perpendicularRoute);
      const hit = detectGateCrossing(perpendicularRoute, salakGate, offsets);

      // Must be rejected due to bearing mismatch (270° vs 160°)
      expect(hit).toBeNull();
    });

    it('calculates physical route tolls for car driving across MEX Salak Selatan and Seri Kembangan', () => {
      const fullMexRoute: [number, number][] = [
        [101.71096, 3.11317],
        [101.71189, 3.11062], // Salak Selatan gate
        [101.69700, 3.06500],
        [101.68356, 3.01711], // Seri Kembangan gate
        [101.68403, 3.01444]
      ];

      const breakdown = calculatePhysicalRouteTolls(fullMexRoute, 'car');
      expect(breakdown.totalCost).toBe(4.20); // 2.00 + 2.20
      expect(breakdown.items.length).toBe(2);
      expect(breakdown.items[0].id).toBe('MEX_SALAK_SELATAN');
      expect(breakdown.items[1].id).toBe('MEX_SERI_KEMBANGAN');
    });

    it('exempts motorcycle tolls across physical Malaysian expressway barriers', () => {
      const fullMexRoute: [number, number][] = [
        [101.71096, 3.11317],
        [101.71189, 3.11062],
        [101.71282, 3.10807]
      ];

      const breakdown = calculatePhysicalRouteTolls(fullMexRoute, 'motorcycle');
      expect(breakdown.totalCost).toBe(0.00);
      expect(breakdown.items[0].cost).toBe(0.00);
    });
  });
});
