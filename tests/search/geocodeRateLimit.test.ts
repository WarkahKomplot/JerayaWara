import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchDestinations,
  resetGeocodeMachineryForTest
} from '../../src/services/search/searchEngine';

const NOMINATIM_ITEM = {
  place_id: 1,
  display_name: 'KLCC, Kuala Lumpur, Malaysia',
  lat: '3.1578',
  lon: '101.7118',
  class: 'tourism',
  type: 'attraction'
};

const PHOTON_RESPONSE = {
  features: [
    {
      geometry: { coordinates: [101.7118, 3.1578] },
      properties: {
        name: 'KLCC',
        country: 'Malaysia',
        osm_id: 1,
        osm_key: 'tourism',
        osm_value: 'attraction',
        city: 'Kuala Lumpur'
      }
    }
  ]
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

beforeEach(() => {
  resetGeocodeMachineryForTest();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Online geocoding rate limiting and caching', () => {
  it('caps each search at four requests and serves repeats from cache', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('nominatim.openstreetmap.org')) return jsonResponse([NOMINATIM_ITEM]);
      if (url.includes('photon.komoot.io')) return jsonResponse(PHOTON_RESPONSE);
      return jsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const geocodeCalls = () =>
      fetchMock.mock.calls.filter(call => /nominatim|photon/.test(String(call[0]))).length;

    const first = await searchDestinations('KLCC', true);
    const callsAfterFirst = geocodeCalls();

    expect(callsAfterFirst).toBeGreaterThan(0);
    expect(callsAfterFirst).toBeLessThanOrEqual(4);
    expect(first.some(item => item.title.includes('KLCC'))).toBe(true);

    const second = await searchDestinations('KLCC', true);

    expect(geocodeCalls()).toBe(callsAfterFirst);
    expect(second.length).toBe(first.length);
  });

  it('resolves with offline results when the caller aborts a queued search', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      // The bulk POI import runs before geocoding; answer it immediately.
      if (String(input).includes('/data/')) {
        return Promise.resolve(jsonResponse({ count: 0, records: [] }));
      }
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        const abort = () => reject(new DOMException('Aborted', 'AbortError'));
        if (signal?.aborted) {
          abort();
          return;
        }
        signal?.addEventListener('abort', abort, { once: true });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const pending = searchDestinations('Nowhere Special', true, undefined, controller.signal);
    controller.abort();

    const results = await pending;

    expect(Array.isArray(results)).toBe(true);
  });
});
