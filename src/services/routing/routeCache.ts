import { RouteResult } from './types';
import { VehicleClass } from '../toll/types';

/**
 * Small last-good route cache.
 *
 * Routing is online-only, so a provider outage currently means no preview at
 * all. Keeping a handful of recent routes in localStorage lets the app offer the
 * route it calculated for the same start/destination in the last week, clearly
 * labelled as cached.
 */
const ROUTE_CACHE_PREFIX = 'jerayawara_route_cache_v1:';
const ROUTE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ROUTE_CACHE_MAX_ENTRIES = 6;

interface RouteCacheEntry {
  savedAt: number;
  route: RouteResult;
}

export interface CachedRouteHit {
  route: RouteResult;
  savedAt: number;
}

function routeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function coordinateKey(coordinate: [number, number]): string {
  // ~100 m precision: a route calculated a few metres apart is still valid.
  return `${coordinate[0].toFixed(3)},${coordinate[1].toFixed(3)}`;
}

function routeCacheKey(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass
): string {
  return `${ROUTE_CACHE_PREFIX}${profile}:${coordinateKey(start)}>${coordinateKey(destination)}`;
}

export function cacheRoute(
  route: RouteResult,
  start: [number, number],
  destination: [number, number]
): void {
  const store = routeStorage();
  if (!store) return;

  try {
    const entry: RouteCacheEntry = { savedAt: Date.now(), route };
    store.setItem(routeCacheKey(start, destination, route.profile), JSON.stringify(entry));
    pruneRouteCache(store);
  } catch {
    // Quota or private mode: the cache is optional.
  }
}

export function getCachedRoute(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass
): CachedRouteHit | null {
  const store = routeStorage();
  if (!store) return null;

  const key = routeCacheKey(start, destination, profile);
  try {
    const raw = store.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw) as RouteCacheEntry;
    if (!entry?.route?.coordinates || Date.now() - entry.savedAt > ROUTE_CACHE_TTL_MS) {
      store.removeItem(key);
      return null;
    }
    return { route: entry.route, savedAt: entry.savedAt };
  } catch {
    store.removeItem(key);
    return null;
  }
}

function pruneRouteCache(store: Storage): void {
  const now = Date.now();
  const entries: Array<{ key: string; savedAt: number }> = [];

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key?.startsWith(ROUTE_CACHE_PREFIX)) continue;
    try {
      const entry = JSON.parse(store.getItem(key) ?? '') as RouteCacheEntry;
      if (!entry?.savedAt || now - entry.savedAt > ROUTE_CACHE_TTL_MS) {
        store.removeItem(key);
      } else {
        entries.push({ key, savedAt: entry.savedAt });
      }
    } catch {
      store.removeItem(key);
    }
  }

  if (entries.length > ROUTE_CACHE_MAX_ENTRIES) {
    entries
      .sort((a, b) => a.savedAt - b.savedAt)
      .slice(0, entries.length - ROUTE_CACHE_MAX_ENTRIES)
      .forEach(entry => store.removeItem(entry.key));
  }
}

/** Test-only: removes every cached route. */
export function clearRouteCacheForTest(): void {
  const store = routeStorage();
  if (!store) return;
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key?.startsWith(ROUTE_CACHE_PREFIX)) keys.push(key);
  }
  keys.forEach(key => store.removeItem(key));
}
