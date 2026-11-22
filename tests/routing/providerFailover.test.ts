import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateRoute,
  isActuallyOnline,
  decodePolyline,
  resetLivenessCacheForTest,
  resetProviderHealthForTest,
  RouteUnavailableError
} from '../../src/services/routing/routingEngine';

/**
 * Valhalla fixture for a short KL route. Shape is polyline6 for
 * [101.693,3.141] -> [101.700,3.130] -> [101.710,3.120].
 */
const VALHALLA_SHAPE = 'owu~Docz}`EnnTotL~oR_pR';
const VALHALLA_FIXTURE = {
  trip: {
    summary: { length: 2.4, time: 300 },
    legs: [
      {
        shape: VALHALLA_SHAPE,
        maneuvers: [
          {
            type: 1,
            instruction: 'Drive west on Jalan Ampang.',
            street_names: ['Jalan Ampang'],
            length: 0.4,
            time: 50,
            begin_shape_index: 0
          },
          {
            type: 10,
            instruction: 'Turn right onto Jalan Tun Razak.',
            street_names: ['Jalan Tun Razak'],
            length: 1.5,
            time: 200,
            begin_shape_index: 1
          },
          {
            type: 5,
            instruction: 'Your destination is on the right.',
            length: 0,
            time: 0,
            begin_shape_index: 2
          }
        ]
      }
    ]
  }
};

const START: [number, number] = [101.693, 3.141];
const DEST: [number, number] = [101.710, 3.12];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

beforeEach(() => {
  resetLivenessCacheForTest();
  resetProviderHealthForTest();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Routing provider failover', () => {
  it('falls back to Valhalla when both OSRM endpoints fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/status')) return jsonResponse({ status: 0 });
        if (url.includes('valhalla') && url.includes('/route')) return jsonResponse(VALHALLA_FIXTURE);
        return jsonResponse({}, 503);
      })
    );

    const route = await calculateRoute(START, DEST, 'car', 'Test destination');

    expect(route.distanceKm).toBe(2.4);
    expect(route.profile).toBe('car');
    expect(route.destinationName).toBe('Test destination');
    expect(route.coordinates).toHaveLength(4);
    expect(route.steps.at(-1)?.maneuver).toBe('arrive');
    expect(route.steps.some(step => step.maneuver === 'turn_right')).toBe(true);
    expect(route.steps.at(-1)?.destinationSide).toBe('right');
  });

  it('reports online when only the Valhalla status endpoint is reachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/status')) return jsonResponse({ status: 0 });
        return jsonResponse({}, 503);
      })
    );

    await expect(isActuallyOnline()).resolves.toBe(true);
  });

  it('throws RouteUnavailableError when no provider is reachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, 503))
    );

    await expect(calculateRoute(START, DEST, 'car', 'Nowhere')).rejects.toBeInstanceOf(
      RouteUnavailableError
    );
  });

  it('decodes Valhalla polyline6 geometry into lng/lat pairs', () => {
    const points = decodePolyline(VALHALLA_SHAPE, 6);

    expect(points).toHaveLength(3);
    expect(points[0][0]).toBeCloseTo(101.693, 4);
    expect(points[0][1]).toBeCloseTo(3.141, 4);
    expect(points[2][0]).toBeCloseTo(101.71, 4);
    expect(points[2][1]).toBeCloseTo(3.12, 4);
  });
});
