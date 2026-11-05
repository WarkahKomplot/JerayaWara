import { describe, it, expect } from 'vitest';
import {
  advanceAlongPolyline,
  distanceMeters,
  bearingDegrees,
  DeadReckoningEngine
} from '../../src/services/navigation/deadReckoning';

describe('Tunnel Dead-Reckoning Engine', () => {
  // Straight North route: [101.693, 3.140] -> [101.693, 3.150] (~1100m)
  const tunnelRoute: [number, number][] = [
    [101.693, 3.140],
    [101.693, 3.145],
    [101.693, 3.150]
  ];

  it('calculates distance and bearings accurately', () => {
    const dist = distanceMeters([101.693, 3.140], [101.693, 3.145]);
    expect(dist).toBeGreaterThan(500);
    expect(dist).toBeLessThan(600);

    const heading = bearingDegrees([101.693, 3.140], [101.693, 3.150]);
    // True North is ~0 or 360 deg
    expect(heading).toBeCloseTo(0, 0);
  });

  it('advances vehicle position smoothly along route polyline', () => {
    const startCoord: [number, number] = [101.693, 3.140];
    const advanced = advanceAlongPolyline(tunnelRoute, startCoord, 250); // Advance 250m north

    expect(advanced.coord[0]).toBeCloseTo(101.693, 4);
    expect(advanced.coord[1]).toBeGreaterThan(3.140);
    expect(advanced.coord[1]).toBeLessThan(3.145);
  });

  it('engages dead-reckoning when satellite GPS degrades in tunnel', () => {
    const engine = new DeadReckoningEngine();
    const t0 = 100000;

    // Normal driving before tunnel entrance at 60 km/h (~16.67 m/s)
    engine.updateGpsPosition({
      coord: [101.693, 3.140],
      heading: 0,
      speedKmH: 60,
      accuracy: 10,
      timestamp: t0
    });

    // 5 seconds into the tunnel: GPS accuracy degrades to 120m
    const rawDegraded = {
      coord: [101.693, 3.140] as [number, number], // Stalled or inaccurate
      heading: 0,
      speedKmH: 60,
      accuracy: 120,
      timestamp: t0 + 5000
    };

    const resolved = engine.getResolvedPosition(rawDegraded, tunnelRoute, t0 + 5000);

    expect(resolved.isExtrapolated).toBe(true);
    // 60 km/h * 5s = ~83.3 meters forward
    expect(resolved.position.coord[1]).toBeGreaterThan(3.140);
    expect(resolved.position.accuracy).toBe(15);
  });

  it('relinquishes dead-reckoning and snaps to real GPS upon tunnel exit', () => {
    const engine = new DeadReckoningEngine();
    const t0 = 100000;

    engine.updateGpsPosition({
      coord: [101.693, 3.140],
      heading: 0,
      speedKmH: 60,
      accuracy: 10,
      timestamp: t0
    });

    // Tunnel exit after 30s: strong satellite lock (accuracy 8m)
    const exitGps = {
      coord: [101.693, 3.145] as [number, number],
      heading: 0,
      speedKmH: 60,
      accuracy: 8,
      timestamp: t0 + 30000
    };

    const resolved = engine.getResolvedPosition(exitGps, tunnelRoute, t0 + 30000);
    expect(resolved.isExtrapolated).toBe(false);
    expect(resolved.position.coord).toEqual([101.693, 3.145]);
  });
});
