import { describe, it, expect, vi } from 'vitest';
import {
  lngLatToTile,
  getTilesAlongRoute,
  buildTileUrl,
  preloadCorridorTiles,
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
});
