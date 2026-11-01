import { EnRouteAmenity } from './types';

export interface OsmEvTagMap {
  name?: string;
  operator?: string;
  brand?: string;
  network?: string;
  capacity?: string;
  'socket:type2_combo'?: string;
  'socket:type2_combo:output'?: string;
  'socket:type2'?: string;
  'socket:type2:output'?: string;
  'socket:chademo'?: string;
  'socket:chademo:output'?: string;
  'socket:tesla_supercharger'?: string;
  max_power?: string;
  highway?: string;
  ref?: string;
  'addr:street'?: string;
  'addr:city'?: string;
  [key: string]: string | undefined;
}

export interface OsmEvElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmEvTagMap;
}

export interface OsmOverpassResponse {
  version?: number;
  generator?: string;
  elements: OsmEvElement[];
}

export const OSM_EV_CACHE_KEY = 'jerayawara_cached_osm_ev_stations';
export const OSM_EV_CACHE_TIMESTAMP_KEY = 'jerayawara_cached_osm_ev_time';

export const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

/**
 * Generate a direct 1-tap PlugShare web and app deep link for exact coordinates.
 * Allows Malaysian drivers to view real-time check-ins, user photos, connector availability,
 * and driver community reviews without paid API credentials.
 */
export function getPlugShareUrl(coordinates: [number, number]): string {
  const [lng, lat] = coordinates;
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat.toFixed(6) : '3.139000';
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng.toFixed(6) : '101.686900';
  return `https://www.plugshare.com/?latitude=${safeLat}&longitude=${safeLng}&spanLat=0.005&spanLng=0.005`;
}

/**
 * Parse power output in kW from OSM tag strings (e.g., '180 kW', '350kW', '22', '120.0kW').
 */
export function parseKwOutput(tagOutput?: string, defaultKw: number = 60): number {
  if (!tagOutput) return defaultKw;
  const match = tagOutput.match(/(\d+(?:\.\d+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) return Math.round(val);
  }
  return defaultKw;
}

/**
 * Extract supported plug types from OSM tags.
 */
export function extractPlugs(tags: OsmEvTagMap = {}): string[] {
  const plugs: string[] = [];

  if (tags['socket:type2_combo'] || tags['socket:type2_combo:output']) {
    plugs.push('CCS2');
  }
  if (tags['socket:type2'] || tags['socket:type2:output']) {
    plugs.push('Type 2');
  }
  if (tags['socket:chademo'] || tags['socket:chademo:output']) {
    plugs.push('CHAdeMO');
  }
  if (tags['socket:tesla_supercharger']) {
    plugs.push('Tesla Supercharger');
  }

  // If no specific sockets were tagged, default to Malaysia standard CCS2
  if (plugs.length === 0) {
    plugs.push('CCS2');
  }

  return plugs;
}

/**
 * Convert an OpenStreetMap element into a JerayaWara EnRouteAmenity object.
 */
export function parseOsmEvElement(element: OsmEvElement): EnRouteAmenity | null {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
    return null;
  }

  const tags = element.tags || {};
  const operator = tags.operator || tags.brand || tags.network || 'EV Fast';
  const brand = tags.brand || tags.operator || 'EV';
  const name = tags.name || `${operator} Charging Station`;
  const expressway = tags.ref || tags.highway || tags['addr:street'] || tags['addr:city'] || 'Malaysia Highway / City';
  
  const kw = parseKwOutput(
    tags['socket:type2_combo:output'] ||
    tags['socket:chademo:output'] ||
    tags.max_power ||
    tags['socket:type2:output'],
    60
  );

  const plugs = extractPlugs(tags);

  return {
    id: `osm-ev-${element.id}`,
    name,
    type: 'ev_fast_charger',
    brand,
    expressway,
    kmMarker: tags.ref ? tags.ref : undefined,
    coordinates: [lon, lat],
    evSpecs: {
      operator,
      maxKw: kw,
      plugs
    }
  };
}

/**
 * Read cached OSM EV stations from persistent storage (localStorage).
 * Guaranteed safe against missing localStorage or parsing exceptions.
 */
export function getCachedOsmEvStations(): EnRouteAmenity[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const raw = window.localStorage.getItem(OSM_EV_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('[OSM EV] Failed to read cached stations:', err);
    return [];
  }
}

/**
 * Save OSM EV stations to persistent storage (localStorage) and record sync timestamp.
 */
export function saveOsmEvStations(stations: EnRouteAmenity[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(OSM_EV_CACHE_KEY, JSON.stringify(stations));
    window.localStorage.setItem(OSM_EV_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    console.warn('[OSM EV] Failed to save stations to cache:', err);
  }
}

/**
 * Retrieve timestamp of last successful OSM EV stations sync.
 */
export function getLastOsmEvSyncTime(): number | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(OSM_EV_CACHE_TIMESTAMP_KEY);
    if (!raw) return null;
    const ts = parseInt(raw, 10);
    return isNaN(ts) ? null : ts;
  } catch {
    return null;
  }
}

/**
 * Clear cached OSM EV stations.
 */
export function clearOsmEvCache(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(OSM_EV_CACHE_KEY);
      window.localStorage.removeItem(OSM_EV_CACHE_TIMESTAMP_KEY);
    }
  } catch {
    // Ignore clear failures
  }
}

/**
 * Builds an optimized Overpass QL query string for Malaysian EV charging stations.
 * Bounding box is [south, west, north, east] = [minLat, minLng, maxLat, maxLng].
 */
export function buildOverpassEvQuery(bounds?: [number, number, number, number]): string {
  // Default Peninsular Malaysia bounds if unspecified: [1.2, 99.6, 6.8, 104.6]
  const [south, west, north, east] = bounds || [1.2, 99.6, 6.8, 104.6];
  return `[out:json][timeout:6];(node["amenity"="charging_station"](${south},${west},${north},${east});way["amenity"="charging_station"](${south},${west},${north},${east}););out center 120;`;
}

/**
 * Fetches Malaysian EV charging stations from OpenStreetMap Overpass API
 * with timeout and mirror fallback. Merges with existing cache and persists to storage.
 */
export async function syncOsmEvStations(
  bounds?: [number, number, number, number],
  timeoutMs: number = 6000
): Promise<{ success: boolean; stations: EnRouteAmenity[]; newCount: number; error?: string }> {
  const query = buildOverpassEvQuery(bounds);
  let fetchedElements: OsmEvElement[] = [];
  let lastError: Error | null = null;

  for (const mirror of OVERPASS_MIRRORS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json: OsmOverpassResponse = await response.json();
        if (json && Array.isArray(json.elements)) {
          fetchedElements = json.elements;
          break; // Successfully received data!
        }
      } else {
        lastError = new Error(`Overpass HTTP ${response.status}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      // Try next mirror
    }
  }

  if (fetchedElements.length === 0) {
    const cached = getCachedOsmEvStations();
    return {
      success: false,
      stations: cached,
      newCount: 0,
      error: lastError ? lastError.message : 'Overpass servers busy or offline'
    };
  }

  // Parse valid stations
  const parsedNew: EnRouteAmenity[] = [];
  for (const el of fetchedElements) {
    const parsed = parseOsmEvElement(el);
    if (parsed) {
      parsedNew.push(parsed);
    }
  }

  // Merge with existing cached stations (deduplicate by id or coordinate proximity < 50m)
  const existing = getCachedOsmEvStations();
  const existingMap = new Map<string, EnRouteAmenity>();
  for (const s of existing) {
    existingMap.set(s.id, s);
  }

  let newCount = 0;
  for (const s of parsedNew) {
    if (!existingMap.has(s.id)) {
      existingMap.set(s.id, s);
      newCount++;
    }
  }

  const merged = Array.from(existingMap.values());
  saveOsmEvStations(merged);

  return {
    success: true,
    stations: merged,
    newCount
  };
}

