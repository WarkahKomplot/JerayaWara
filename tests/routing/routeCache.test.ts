import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  cacheRoute,
  getCachedRoute,
  clearRouteCacheForTest
} from '../../src/services/routing/routeCache';
import { RouteResult } from '../../src/services/routing/types';

function makeRoute(destinationName: string): RouteResult {
  return {
    coordinates: [
      [101.693, 3.141],
      [101.7, 3.13],
      [101.71, 3.12]
    ],
    distanceKm: 2.4,
    durationMinutes: 6,
    steps: [],
    tollPlazaKeys: [],
    profile: 'car',
    destinationName
  };
}

const START: [number, number] = [101.693, 3.141];
const DEST: [number, number] = [101.71, 3.12];

beforeEach(() => {
  clearRouteCacheForTest();
});

afterEach(() => {
  clearRouteCacheForTest();
});

describe('Last-good route cache', () => {
  it('returns a cached route for the same start, destination and profile', () => {
    cacheRoute(makeRoute('KLCC'), START, DEST);

    const hit = getCachedRoute(START, DEST, 'car');

    expect(hit).not.toBeNull();
    expect(hit?.route.destinationName).toBe('KLCC');
    expect(hit?.route.coordinates).toHaveLength(3);
    expect(hit?.savedAt).toBeGreaterThan(0);
  });

  it('does not return a route for a different destination', () => {
    cacheRoute(makeRoute('KLCC'), START, DEST);

    const hit = getCachedRoute(START, [101.8, 3.2], 'car');

    expect(hit).toBeNull();
  });

  it('treats coordinates within ~100 m as the same trip', () => {
    cacheRoute(makeRoute('KLCC'), START, DEST);

    const slightlyDifferentStart: [number, number] = [101.6933, 3.1412];
    const slightlyDifferentDestination: [number, number] = [101.7103, 3.1202];

    expect(getCachedRoute(slightlyDifferentStart, slightlyDifferentDestination, 'car')).not.toBeNull();
  });
});
