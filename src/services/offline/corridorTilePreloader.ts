/**
 * Malaysian Route Corridor Tile Pre-loader
 *
 * Pre-caches raster map tiles along an active route polyline into CacheStorage
 * ('jerayawara-tiles-v1') so that driving through tunnels, highway mountain passes
 * (e.g. Karak, Genting Sempah), and rural cellular dead-zones has zero grey map tiles.
 */

export const TILE_CACHE_NAME = 'jerayawara-tiles-v1';
export const DEFAULT_TILE_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export interface TileCoord {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts WGS-84 longitude/latitude to Slippy Map tile coordinates at a given zoom level.
 */
export function lngLatToTile(lng: number, lat: number, zoom: number): TileCoord {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );

  return {
    x: Math.max(0, Math.min(n - 1, x)),
    y: Math.max(0, Math.min(n - 1, y)),
    z: zoom
  };
}

/**
 * Generates deduplicated tile coordinates along a route polyline across specified zoom levels.
 * Includes a 1-tile buffer around each sampled position for lateral corridor visibility.
 */
export function getTilesAlongRoute(
  coordinates: [number, number][],
  zoomLevels: number[] = [14, 15, 16],
  sampleIntervalMeters: number = 350
): TileCoord[] {
  if (!coordinates || coordinates.length === 0) return [];

  const seen = new Set<string>();
  const tiles: TileCoord[] = [];

  // Always sample start and end
  const sampledCoords: [number, number][] = [coordinates[0]];
  let accumDist = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const [pLng, pLat] = coordinates[i - 1];
    const [cLng, cLat] = coordinates[i];

    // Rough distance in meters
    const dLng = (cLng - pLng) * 111320 * Math.cos((pLat * Math.PI) / 180);
    const dLat = (cLat - pLat) * 110540;
    const segDist = Math.hypot(dLng, dLat);

    accumDist += segDist;
    if (accumDist >= sampleIntervalMeters || i === coordinates.length - 1) {
      sampledCoords.push(coordinates[i]);
      accumDist = 0;
    }
  }

  for (const zoom of zoomLevels) {
    const maxCoord = Math.pow(2, zoom) - 1;

    for (const [lng, lat] of sampledCoords) {
      const center = lngLatToTile(lng, lat, zoom);

      // Include center and immediate neighbors (1-tile margin for highway corridor width)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const tx = Math.max(0, Math.min(maxCoord, center.x + dx));
          const ty = Math.max(0, Math.min(maxCoord, center.y + dy));
          const key = `${zoom}/${tx}/${ty}`;

          if (!seen.has(key)) {
            seen.add(key);
            tiles.push({ x: tx, y: ty, z: zoom });
          }
        }
      }
    }
  }

  return tiles;
}

/**
 * Builds the URL for a tile given a template.
 */
export function buildTileUrl(
  tile: TileCoord,
  template: string = DEFAULT_TILE_URL_TEMPLATE
): string {
  return template
    .replace('{z}', tile.z.toString())
    .replace('{x}', tile.x.toString())
    .replace('{y}', tile.y.toString());
}

/**
 * Preloads corridor tiles in batches into the CacheStorage API.
 * Runs non-blocking with low concurrency (4 parallel downloads) to avoid saturating network.
 */
export async function preloadCorridorTiles(
  coordinates: [number, number][],
  options?: {
    zoomLevels?: number[];
    maxTiles?: number;
    tileUrlTemplate?: string;
    concurrency?: number;
    onProgress?: (downloaded: number, total: number) => void;
  }
): Promise<{ total: number; downloaded: number }> {
  if (typeof caches === 'undefined' || !coordinates || coordinates.length === 0) {
    return { total: 0, downloaded: 0 };
  }

  const zoomLevels = options?.zoomLevels ?? [14, 15, 16];
  const maxTiles = options?.maxTiles ?? 350; // Cap to ~6-8MB max per route
  const template = options?.tileUrlTemplate ?? DEFAULT_TILE_URL_TEMPLATE;
  const concurrency = options?.concurrency ?? 4;

  const allTiles = getTilesAlongRoute(coordinates, zoomLevels);
  const tilesToFetch = allTiles.slice(0, maxTiles);
  const total = tilesToFetch.length;

  let downloaded = 0;
  let cache: Cache | null = null;

  try {
    cache = await caches.open(TILE_CACHE_NAME);
  } catch {
    return { total: 0, downloaded: 0 };
  }

  // Batch runner
  let index = 0;
  async function worker() {
    while (index < tilesToFetch.length) {
      const tile = tilesToFetch[index++];
      const url = buildTileUrl(tile, template);

      try {
        const match = await cache!.match(url);
        if (!match) {
          const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
          if (res.ok) {
            await cache!.put(url, res.clone());
          }
        }
        downloaded++;
        options?.onProgress?.(downloaded, total);
      } catch {
        // Continue worker even if an individual tile download fails
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  return { total, downloaded };
}

