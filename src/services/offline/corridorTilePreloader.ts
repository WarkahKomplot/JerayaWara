/**
 * Malaysian Route Corridor Tile Pre-loader
 *
 * Pre-caches raster map tiles along an active route polyline into CacheStorage
 * ('jerayawara-tiles-v1') so that driving through tunnels, highway mountain passes
 * (e.g. Karak, Genting Sempah), and rural cellular dead-zones has zero grey map tiles.
 *
 * Tiles are planned at the zoom levels MapLibre actually requests for the
 * navigation camera (z16–18 for the 256 px raster source — see tileMath.ts),
 * ordered by distance along the route, and capped by an estimated byte budget
 * instead of a flat tile count. Long trips are topped up incrementally from the
 * current position (startFromCoord) so coverage stays ahead of the vehicle.
 */

import { DEFAULT_PRELOAD_ZOOM_LEVELS } from './tileMath';

export const TILE_CACHE_NAME = 'jerayawara-tiles-v1';
export const DEFAULT_TILE_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Conservative per-tile size estimates used to budget preloads before fetching. */
const TILE_BYTES_BY_ZOOM: Record<number, number> = {
  14: 12000,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 22000,
  19: 26000
};

export const DEFAULT_MAX_BYTES = 12 * 1024 * 1024; // ~12 MB per preload pass
export const DEFAULT_MAX_TILES = 6000;
export const DEFAULT_AHEAD_METERS = 25000; // keep roughly 25 km of corridor cached
export const MIN_METERS_BEHIND_CURRENT = 250; // retain the tiles just behind the puck

export interface TileCoord {
  x: number;
  y: number;
  z: number;
}

export interface PlannedTile extends TileCoord {
  /** Distance from the route start at which this tile first becomes useful. */
  offsetMeters: number;
}

export interface PlanCorridorOptions {
  zoomLevels?: number[];
  sampleIntervalMeters?: number;
  /** Current position; tiles before it (minus a small margin) are skipped. */
  startFromCoord?: [number, number];
  /** Only plan this far ahead of startFromCoord (default 25 km). */
  aheadMeters?: number;
  maxTiles?: number;
  maxBytes?: number;
  estimateBytes?: (zoom: number) => number;
}

export function estimateTileBytes(zoom: number): number {
  return TILE_BYTES_BY_ZOOM[zoom] ?? 20000;
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

function segmentMeters(a: [number, number], b: [number, number]): number {
  const dLng = (b[0] - a[0]) * 111320 * Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180);
  const dLat = (b[1] - a[1]) * 110540;
  return Math.hypot(dLng, dLat);
}

/**
 * Distance in meters from the route start to the point on the polyline closest
 * to `point`. Used to start a streaming preload from the vehicle's position.
 */
export function nearestRouteOffsetMeters(
  polyline: [number, number][],
  point: [number, number]
): number {
  if (polyline.length < 2) return 0;

  const cosLat = Math.cos((point[1] * Math.PI) / 180);
  let bestDistance = Infinity;
  let bestOffset = 0;
  let accumulated = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];
    const segLen = segmentMeters(a, b);

    // Local planar projection relative to the query point.
    const ax = (a[0] - point[0]) * 111320 * cosLat;
    const ay = (a[1] - point[1]) * 110540;
    const bx = (b[0] - point[0]) * 111320 * cosLat;
    const by = (b[1] - point[1]) * 110540;
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lenSq));
    const distance = Math.hypot(ax + t * dx, ay + t * dy);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = accumulated + t * segLen;
    }
    accumulated += segLen;
  }

  return bestOffset;
}

/**
 * Plans which tiles to cache, in priority order:
 *   1. closest to the current position first (distance along the route),
 *   2. within one sample, the deepest zoom first (z18 driving before z16 overview),
 *   3. stop once the estimated byte budget is exhausted.
 *
 * Deduplication keeps a tile at the earliest offset where it is needed.
 */
export function planCorridorTiles(
  coordinates: [number, number][],
  options: PlanCorridorOptions = {}
): PlannedTile[] {
  if (!coordinates || coordinates.length === 0) return [];

  const zoomLevels = options.zoomLevels ?? DEFAULT_PRELOAD_ZOOM_LEVELS;
  const sampleInterval = options.sampleIntervalMeters ?? 350;
  const aheadMeters = options.aheadMeters ?? DEFAULT_AHEAD_METERS;
  const maxTiles = options.maxTiles ?? DEFAULT_MAX_TILES;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const estimateBytes = options.estimateBytes ?? estimateTileBytes;

  // Cumulative distance along the route for every node.
  const cumulative: number[] = [0];
  for (let i = 1; i < coordinates.length; i++) {
    cumulative.push(cumulative[i - 1] + segmentMeters(coordinates[i - 1], coordinates[i]));
  }

  // Sample roughly every `sampleInterval` meters, always keeping the endpoints.
  const samples: Array<{ coord: [number, number]; offset: number }> = [];
  let nextSampleAt = 0;
  for (let i = 0; i < coordinates.length; i++) {
    if (i === 0 || i === coordinates.length - 1 || cumulative[i] >= nextSampleAt) {
      samples.push({ coord: coordinates[i], offset: cumulative[i] });
      nextSampleAt = cumulative[i] + sampleInterval;
    }
  }

  let windowStart = 0;
  if (options.startFromCoord) {
    windowStart = Math.max(
      0,
      nearestRouteOffsetMeters(coordinates, options.startFromCoord) - MIN_METERS_BEHIND_CURRENT
    );
  }
  const windowEnd = windowStart + aheadMeters;

  const seen = new Map<string, PlannedTile>();

  for (const zoom of zoomLevels) {
    const maxCoord = Math.pow(2, zoom) - 1;

    for (const { coord, offset } of samples) {
      if (offset < windowStart || offset > windowEnd) continue;

      const center = lngLatToTile(coord[0], coord[1], zoom);

      // Include center and immediate neighbors (1-tile margin for corridor width).
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const tx = Math.max(0, Math.min(maxCoord, center.x + dx));
          const ty = Math.max(0, Math.min(maxCoord, center.y + dy));
          const key = `${zoom}/${tx}/${ty}`;
          if (!seen.has(key)) {
            seen.set(key, { x: tx, y: ty, z: zoom, offsetMeters: offset });
          }
        }
      }
    }
  }

  const ordered = Array.from(seen.values()).sort(
    (a, b) => a.offsetMeters - b.offsetMeters || b.z - a.z || a.x - b.x || a.y - b.y
  );

  const planned: PlannedTile[] = [];
  let plannedBytes = 0;

  for (const tile of ordered) {
    if (planned.length >= maxTiles) break;
    const cost = estimateBytes(tile.z);
    if (plannedBytes + cost > maxBytes) break;
    planned.push(tile);
    plannedBytes += cost;
  }

  return planned;
}

/**
 * Generates deduplicated tile coordinates along a route polyline across the
 * given zoom levels. Kept for callers that want the raw set (tests, tooling);
 * the preloader uses `planCorridorTiles` for prioritisation.
 */
export function getTilesAlongRoute(
  coordinates: [number, number][],
  zoomLevels: number[] = DEFAULT_PRELOAD_ZOOM_LEVELS,
  sampleIntervalMeters: number = 350
): TileCoord[] {
  return planCorridorTiles(coordinates, {
    zoomLevels,
    sampleIntervalMeters,
    aheadMeters: Infinity,
    maxTiles: Infinity,
    maxBytes: Infinity
  }).map(({ x, y, z }) => ({ x, y, z }));
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
  options?: PlanCorridorOptions & {
    tileUrlTemplate?: string;
    concurrency?: number;
    onProgress?: (downloaded: number, total: number) => void;
  }
): Promise<{ total: number; downloaded: number }> {
  if (typeof caches === 'undefined' || !coordinates || coordinates.length === 0) {
    return { total: 0, downloaded: 0 };
  }

  const template = options?.tileUrlTemplate ?? DEFAULT_TILE_URL_TEMPLATE;
  const concurrency = options?.concurrency ?? 4;

  const plan = planCorridorTiles(coordinates, options);
  const total = plan.length;

  let downloaded = 0;
  let cache: Cache | null = null;

  try {
    cache = await caches.open(TILE_CACHE_NAME);
  } catch {
    return { total: 0, downloaded: 0 };
  }

  let index = 0;
  async function worker() {
    while (index < plan.length) {
      const tile = plan[index++];
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
