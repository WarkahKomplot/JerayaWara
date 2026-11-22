import { describe, it, expect, vi } from 'vitest';
import {
  lngLatToTile,
  getTilesAlongRoute,
  buildTileUrl,
  preloadCorridorTiles,
  planCorridorTiles,
  nearestRouteOffsetMeters,
  estimateTileBytes,
  TILE_CACHE_NAME
} from '../../src/services/offline/corridorTilePreloader';

describe('Corridor Tile Preloader', () => {
  it('correctly converts KL coordinates to Slippy Map tile numbers', () => {
    // KLCC: lng = 101.7118, lat = 3.1578
    const tileZ15 = lngLatToTile(101.7118, 3.1578, 15);
    expect(tileZ15.z).toBe(15);
    expect(tileZ15.x).toBeGreaterThan(0);
    expect(tileZ15.y).toBeGreaterThan(0);

    const tileZ10 = lngLatToTile(101.7118, 3.1578, 10);
    expect(tileZ10.x).toBeLessThan(tileZ15.x);
    expect(tileZ10.y).toBeLessThan(tileZ15.y);
  });

  it('generates deduplicated tile coordinates along a route polyline', () => {
    // Federal Highway sample coords: KL to Petaling Jaya
    const routeCoords: [number, number][] = [
      [101.693, 3.141],
      [101.670, 3.125],
      [101.650, 3.110],
      [101.615, 3.100]
    ];

    const tiles = getTilesAlongRoute(routeCoords, [14, 15]);
    expect(tiles.length).toBeGreaterThan(0);

    // Verify deduplication
    const keys = tiles.map(t => `${t.z}/${t.x}/${t.y}`);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('formats tile URLs with z, x, y placeholders correctly', () => {
    const tile = { z: 14, x: 12850, y: 7920 };
    const url = buildTileUrl(tile, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(url).toBe('https://tile.openstreetmap.org/14/12850/7920.png');
  });

  it('preloads corridor tiles into CacheStorage', async () => {
    const mockPut = vi.fn().mockResolvedValue(undefined);
    const mockMatch = vi.fn().mockResolvedValue(null);
    const mockCache = {
      match: mockMatch,
      put: mockPut
    };

    const mockCaches = {
      open: vi.fn().mockResolvedValue(mockCache)
    };

    // Mock global caches and fetch
    vi.stubGlobal('caches', mockCaches);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      clone: () => ({ ok: true })
    }));

    const routeCoords: [number, number][] = [
      [101.693, 3.141],
      [101.680, 3.135]
    ];

    const result = await preloadCorridorTiles(routeCoords, {
      zoomLevels: [14],
      maxTiles: 10
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.downloaded).toBe(result.total);
    expect(mockCaches.open).toHaveBeenCalledWith(TILE_CACHE_NAME);
    expect(mockPut).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('preloads z18 tiles used by the navigation camera by default', async () => {
    const mockCache = { match: vi.fn().mockResolvedValue(null), put: vi.fn().mockResolvedValue(undefined) };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, clone: () => ({ ok: true }) });

    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue(mockCache) });
    vi.stubGlobal('fetch', fetchMock);

    await preloadCorridorTiles([
      [101.693, 3.141],
      [101.680, 3.135]
    ]);

    const urls = fetchMock.mock.calls.map(call => String(call[0]));
    expect(urls.some(url => /\/18\//.test(url))).toBe(true);
    expect(urls.some(url => /\/16\//.test(url))).toBe(true);

    vi.unstubAllGlobals();
  });

  it('plans the driving zoom first, ordered by distance along the route', () => {
    const route: [number, number][] = [
      [101.693, 3.141],
      [101.680, 3.135],
      [101.660, 3.120],
      [101.640, 3.100]
    ];

    const plan = planCorridorTiles(route, {
      zoomLevels: [16, 17, 18],
      maxBytes: 50 * 1024 * 1024
    });

    expect(plan.length).toBeGreaterThan(0);
    expect(plan[0].z).toBe(18);
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].offsetMeters).toBeGreaterThanOrEqual(plan[i - 1].offsetMeters);
    }
  });

  it('stops planning at the byte budget instead of slicing by tile count', () => {
    const route: [number, number][] = [
      [101.693, 3.141],
      [101.680, 3.135],
      [101.660, 3.120]
    ];
    const cost = estimateTileBytes(18);

    const plan = planCorridorTiles(route, { zoomLevels: [18], maxBytes: cost * 2 });

    expect(plan).toHaveLength(2);
  });

  it('skips tiles behind the current position during streaming top-ups', () => {
    const route: [number, number][] = [
      [101.693, 3.141],
      [101.700, 3.130],
      [101.710, 3.120],
      [101.720, 3.110]
    ];
    const here = route[1];
    const startTile = lngLatToTile(route[0][0], route[0][1], 18);

    const plan = planCorridorTiles(route, {
      zoomLevels: [18],
      startFromCoord: here,
      aheadMeters: 20000,
      maxBytes: 50 * 1024 * 1024
    });

    expect(plan.length).toBeGreaterThan(0);
    expect(plan.some(t => t.x === startTile.x && t.y === startTile.y)).toBe(false);
    const minOffset = Math.min(...plan.map(t => t.offsetMeters));
    expect(minOffset).toBeGreaterThanOrEqual(nearestRouteOffsetMeters(route, here) - 250);
  });
});
