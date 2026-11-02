import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  calculateRoute,
  routeGapMeters,
  verifyRouteIntegrity,
  resetLivenessCacheForTest
} from '../../src/services/routing/routingEngine';

/**
 * Online-only engine: these tests stub a successful OSRM response (both the
 * liveness probe and the route query) instead of hitting the live service.
 */
const OSRM_FIXTURE = {
  code: 'Ok',
  routes: [{
    distance: 55000,
    duration: 2700,
    geometry: {
      coordinates: [
        [101.693, 3.141],
        [101.72, 3.1],
        [101.75, 3.05],
        [101.8, 2.95],
        [101.86, 2.83],
        [101.9, 2.76],
        [101.938, 2.725]
      ]
    },
    legs: [{
      steps: [
        { name: 'Jalan Damansara', distance: 1200, duration: 120, maneuver: { type: 'depart', location: [101.693, 3.141] } },
        { name: 'E2', distance: 50000, duration: 2400, maneuver: { type: 'on ramp', modifier: 'right', location: [101.72, 3.1] } },
        { name: 'E2', distance: 3800, duration: 180, maneuver: { type: 'off ramp', modifier: 'left', location: [101.9, 2.76] } },
        { name: 'Jalan Seremban', distance: 200, duration: 20, maneuver: { type: 'arrive', modifier: 'left', location: [101.938, 2.725] } }
      ]
    }]
  }]
};

beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(OSRM_FIXTURE), { status: 200 })));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('Routing Engine', () => {
  const klCoords: [number, number] = [101.693, 3.141];
  const serembanCoords: [number, number] = [101.938, 2.725];

  beforeEach(() => {
    resetLivenessCacheForTest();
  });

  it('generates real road route with rich coordinates and expressway toll plazas', async () => {
    const route = await calculateRoute(klCoords, serembanCoords, 'car', 'Seremban');
    expect(route.distanceKm).toBeGreaterThan(40);
    expect(route.coordinates.length).toBeGreaterThanOrEqual(6);
    expect(route.steps.length).toBeGreaterThan(1);
    expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
    expect(route.destinationName).toBe('Seremban');
  });

  it('motorcycle route flags dedicated motorcycle lanes and exemptions', async () => {
    const route = await calculateRoute(klCoords, serembanCoords, 'motorcycle');
    expect(route.profile).toBe('motorcycle');
    expect(route.steps.some(s => s.instruction.toLowerCase().includes('motosikal') || s.isMotorcycleLane)).toBe(true);
  });

  it('walker route avoids expressways and generates pedestrian instructions', async () => {
    const route = await calculateRoute([101.693, 3.141], [101.710, 3.150], 'walker');
    expect(route.profile).toBe('walker');
    expect(route.tollPlazaKeys.length).toBe(0);
  });

  describe('Route Drift & Geometry Integrity (routeGap Algorithm)', () => {
    const referenceCorridor: [number, number][] = [
      [101.693, 3.141],
      [101.710, 3.050],
      [101.745, 2.981],
      [101.770, 2.930],
      [101.800, 2.810],
      [101.938, 2.725]
    ];

    it('computes exact zero/near-zero gap for points lying on the corridor', () => {
      const onCorridorPoint: [number, number] = [101.745, 2.981];
      const gap = routeGapMeters(onCorridorPoint, referenceCorridor);
      expect(gap).toBeLessThan(1.0); // Less than 1 meter
    });

    it('computes accurate gap in meters for points offset from the corridor', () => {
      // Point offset slightly (~110m away)
      const offsetPoint: [number, number] = [101.746, 2.981];
      const gap = routeGapMeters(offsetPoint, referenceCorridor);
      expect(gap).toBeGreaterThan(80);
      expect(gap).toBeLessThan(150);
    });

    it('validates a conforming route corridor with isValid: true and hasDrifted: false', () => {
      // Candidate route tightly following the reference corridor
      const candidate: [number, number][] = referenceCorridor.map(([lng, lat]) => [
        lng + 0.0001, // ~11m jitter
        lat + 0.0001
      ]);

      const result = verifyRouteIntegrity(candidate, referenceCorridor, {
        maxAllowedGapMeters: 150,
        maxMissPercentage: 0.05
      });

      expect(result.isValid).toBe(true);
      expect(result.hasDrifted).toBe(false);
      expect(result.driftPercentage).toBe(0);
      expect(result.maxObservedGapMeters).toBeLessThan(50);
    });

    it('flags a drifted route when candidate deviates onto an unauthorized detour > 150m away', () => {
      // Candidate route that detours into a distant area halfway through
      const detouredRoute: [number, number][] = [
        [101.693, 3.141],
        [101.710, 3.050],
        [101.850, 3.050], // Detours > 10 km away to the East!
        [101.890, 3.010],
        [101.800, 2.810],
        [101.938, 2.725]
      ];

      const result = verifyRouteIntegrity(detouredRoute, referenceCorridor, {
        maxAllowedGapMeters: 150,
        maxMissPercentage: 0.05
      });

      expect(result.isValid).toBe(false);
      expect(result.hasDrifted).toBe(true);
      expect(result.driftPercentage).toBeGreaterThan(5);
      expect(result.maxObservedGapMeters).toBeGreaterThan(1000);
      expect(result.reason).toContain('Route drifted');
    });
  });
});
