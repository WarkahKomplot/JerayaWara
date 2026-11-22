import { SearchItem } from './types';
import { MALAYSIA_OFFLINE_POIS } from './malaysiaPOIData';
import { searchBulkPOIs, syncBulkPOIsInStore } from './bulkPOIDbService';
export { syncBulkPOIsInStore, searchBulkPOIs };

const MALAYSIAN_ABBREVIATIONS: Record<string, string> = {
  // Common brand abbreviations
  mcd: 'mcdonald',
  mcdonalds: 'mcdonald',
  "mcdonald's": 'mcdonald',
  bk: 'burger king',
  sbux: 'starbucks',
  starbuck: 'starbucks',
  speedmart: '99 speedmart',
  '99speedmart': '99 speedmart',
  familymart: 'family mart',
  tealive: 'tealive',

  // Facilities & location prefixes
  hosp: 'hospital',
  bdr: 'bandar',
  tmn: 'taman',
  jln: 'jalan',
  stn: 'stesen',
  kg: 'kampung',
  bt: 'batu',
  sg: 'sungai',
  pg: 'pulau pinang',
  penang: 'pulau pinang',
  klia: 'kuala lumpur international airport',
  klia2: 'klia terminal 2',
  klcc: 'kuala lumpur city centre',
  lowyat: 'plaza low yat',
  'low yat': 'plaza low yat',
  plazalowyat: 'plaza low yat',
  trx: 'the exchange trx',
  tunrazakexchange: 'the exchange trx',
  midvalley: 'mid valley megamall',
  pavillion: 'pavilion kuala lumpur',
  pavilion: 'pavilion kuala lumpur',
  sunwaypyramid: 'sunway pyramid',
  digitalmall: 'digital mall',
  sungeiwang: 'sungei wang',
  ioicitymall: 'ioi city mall',
  '1utama': '1 utama',
  oneutama: '1 utama',
  ikeadamansara: 'ikea damansara',
  ikeacheras: 'ikea cheras',
  mytown: 'mytown shopping centre',
  metrokajang: 'plaza metro kajang',
  'metro kajang': 'plaza metro kajang',
  vape: 'vapor',
  'vape hub': 'vapor hub',
  'vape hub kajang': 'vapor hub kajang',
  hkl: 'hospital kuala lumpur',
  hsa: 'hospital sultanah aminah',
  hsb: 'hospital sungai buloh',
  ktmb: 'keretapi tanah melayu',
  onesentrum: '1 sentrum',
  'one sentrum': '1 sentrum',
  'menara one sentrum': 'menara 1 sentrum',
  onesentral: '1 sentral',
  'one sentral': '1 sentral',
  'menara one sentral': 'menara 1 sentral',
  'one utama': '1 utama',
  oneutamashopping: '1 utama'
};

/**
 * Expand colloquial Malaysian abbreviations and common compound place names.
 */
export function expandAbbreviations(query: string): string {
  const clean = query.trim().toLowerCase();
  // Check exact full match first (e.g. 'lowyat', 'plazalowyat', 'trx')
  if (MALAYSIAN_ABBREVIATIONS[clean]) {
    return MALAYSIAN_ABBREVIATIONS[clean];
  }

  // Strip standalone trailing modifiers like 'dt' / 'd/t' (drive-thru) or 'rnr' that don't exist in registered POI names
  const cleanStripped = clean.replace(/\b(?:dt|d\/t)\b/g, '').replace(/\s+/g, ' ').trim();

  // Generic number-word normalization (e.g. "one sentrum" -> "1 sentrum", "two" -> "2")
  const normalizedNumberQuery = cleanStripped
    .replace(/\bone\b/g, '1')
    .replace(/\btwo\b/g, '2')
    .replace(/\bthree\b/g, '3');

  const words = normalizedNumberQuery.split(/\s+/);
  const expanded = words.map(w => MALAYSIAN_ABBREVIATIONS[w] || w);
  return expanded.join(' ');
}

/**
 * Parse raw GPS coordinates (e.g., "2.9904, 101.7925") or Google Maps share links.
 */
export function parseCoordinatesOrMapLink(input: string): SearchItem | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let lat: number | null = null;
  let lng: number | null = null;

  // 1. Google Maps / Apple Maps / Waze URL coordinate extraction
  if (
    trimmed.includes('google.com/maps') ||
    trimmed.includes('maps.app.goo.gl') ||
    trimmed.includes('maps.apple.com') ||
    trimmed.includes('waze.com') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    // Check @lat,lng
    const atMatch = trimmed.match(/@([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
    if (atMatch) {
      lat = parseFloat(atMatch[1]);
      lng = parseFloat(atMatch[2]);
    } else {
      // Check ?q=lat,lng or &query=lat,lng or ?ll=lat,lng
      const queryMatch = trimmed.match(/[?&](?:q|query|ll|loc)=([+-]?\d+\.\d+),([+-]?\d+\.\d+)/i);
      if (queryMatch) {
        lat = parseFloat(queryMatch[1]);
        lng = parseFloat(queryMatch[2]);
      }
    }
  }

  // 2. Direct decimal coordinates (e.g., "3.1390, 101.6869" or "3.1390 101.6869" or "@3.1390,101.6869")
  if (lat === null || lng === null) {
    const cleanStr = trimmed.replace(/^@/, '');
    const coordMatch = cleanStr.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
    if (coordMatch) {
      const n1 = parseFloat(coordMatch[1]);
      const n2 = parseFloat(coordMatch[2]);

      // Smart swap if longitude is entered before latitude (e.g. 101.6869, 3.1390)
      if (Math.abs(n1) > 90 && Math.abs(n2) <= 90) {
        lat = n2;
        lng = n1;
      } else if (Math.abs(n1) <= 90 && Math.abs(n2) <= 180) {
        lat = n1;
        lng = n2;
      }
    }
  }

  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        id: `coord-${lat.toFixed(5)}-${lng.toFixed(5)}`,
        title: `📌 ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        subtitle: 'GPS Coordinates / Lokasi Koordinat',
        category: 'pinned',
        coordinates: [lng, lat],
        regionId: 'pinned'
      };
    }
  }

  return null;
}

export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}


// ---------------------------------------------------------------------------
// Online geocoding: rate limiting, caching and cancellation
//
// Nominatim's usage policy is one request per second, and the previous code
// fired every query variant at both Nominatim and Photon in parallel on each
// keystroke. A small serialised queue plus a localStorage TTL cache keeps us
// inside the policy and makes repeat searches instant. Aborting the caller's
// signal removes queued work when the user keeps typing.
// ---------------------------------------------------------------------------

const NOMINATIM_DEFAULT_INTERVAL_MS = 1100;
const PHOTON_DEFAULT_INTERVAL_MS = 400;
const GEOCODE_REQUEST_TIMEOUT_MS = 3500;
const GEOCODE_CACHE_PREFIX = 'jerayawara_geocode_v1:';
const GEOCODE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GEOCODE_CACHE_MAX_ENTRIES = 100;

type GeocodeProvider = 'nominatim' | 'photon';

interface GeocodeCacheEntry {
  savedAt: number;
  items: SearchItem[];
}

let nominatimIntervalMs = NOMINATIM_DEFAULT_INTERVAL_MS;
let photonIntervalMs = PHOTON_DEFAULT_INTERVAL_MS;
let nominatimQueue: Promise<void> = Promise.resolve();
let photonQueue: Promise<void> = Promise.resolve();
let lastNominatimAt = 0;
let lastPhotonAt = 0;

/** Test-only: shortens the queue delay and resets queue state. */
export function resetGeocodeMachineryForTest(): void {
  nominatimIntervalMs = 0;
  photonIntervalMs = 0;
  nominatimQueue = Promise.resolve();
  photonQueue = Promise.resolve();
  lastNominatimAt = 0;
  lastPhotonAt = 0;
  clearGeocodeCacheForTest();
}

/** Test-only: removes all cached geocoding results. */
export function clearGeocodeCacheForTest(): void {
  const store = geocodeStorage();
  if (!store) return;
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key?.startsWith(GEOCODE_CACHE_PREFIX)) keys.push(key);
  }
  keys.forEach(key => store.removeItem(key));
}

function geocodeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function geocodeCacheKey(provider: GeocodeProvider, query: string): string {
  return `${GEOCODE_CACHE_PREFIX}${provider}:${query.trim().toLowerCase()}`;
}

function readGeocodeCache(provider: GeocodeProvider, query: string): SearchItem[] | null {
  const store = geocodeStorage();
  if (!store) return null;
  const key = geocodeCacheKey(provider, query);
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as GeocodeCacheEntry;
    if (!Array.isArray(entry?.items) || Date.now() - entry.savedAt > GEOCODE_CACHE_TTL_MS) {
      store.removeItem(key);
      return null;
    }
    return entry.items;
  } catch {
    store.removeItem(key);
    return null;
  }
}

function writeGeocodeCache(provider: GeocodeProvider, query: string, items: SearchItem[]): void {
  if (items.length === 0) return;
  const store = geocodeStorage();
  if (!store) return;
  try {
    const entry: GeocodeCacheEntry = { savedAt: Date.now(), items };
    store.setItem(geocodeCacheKey(provider, query), JSON.stringify(entry));
    pruneGeocodeCache(store);
  } catch {
    // Quota/private mode: caching is an optimisation, never a requirement.
  }
}

function pruneGeocodeCache(store: Storage): void {
  const now = Date.now();
  const entries: Array<{ key: string; savedAt: number }> = [];

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key?.startsWith(GEOCODE_CACHE_PREFIX)) continue;
    try {
      const entry = JSON.parse(store.getItem(key) ?? '') as GeocodeCacheEntry;
      if (!entry?.savedAt || now - entry.savedAt > GEOCODE_CACHE_TTL_MS) {
        store.removeItem(key);
      } else {
        entries.push({ key, savedAt: entry.savedAt });
      }
    } catch {
      store.removeItem(key);
    }
  }

  if (entries.length > GEOCODE_CACHE_MAX_ENTRIES) {
    entries
      .sort((a, b) => a.savedAt - b.savedAt)
      .slice(0, entries.length - GEOCODE_CACHE_MAX_ENTRIES)
      .forEach(entry => store.removeItem(entry.key));
  }
}

function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError');
}

function delayWithSignal(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      cleanup();
      reject(abortError());
    };
    const cleanup = () => signal?.removeEventListener('abort', onAbort);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function enqueueGeocodeRequest(
  provider: GeocodeProvider,
  signal?: AbortSignal
): Promise<void> {
  const isNominatim = provider === 'nominatim';
  const previous = isNominatim ? nominatimQueue : photonQueue;

  const run = previous.then(async () => {
    const last = isNominatim ? lastNominatimAt : lastPhotonAt;
    const interval = isNominatim ? nominatimIntervalMs : photonIntervalMs;
    const waitMs = Math.max(0, last + interval - Date.now());
    if (waitMs > 0) await delayWithSignal(waitMs, signal);
    if (isNominatim) lastNominatimAt = Date.now();
    else lastPhotonAt = Date.now();
  });

  // Keep the queue moving even if this particular request was aborted.
  const tail = run.catch(() => {});
  if (isNominatim) nominatimQueue = tail;
  else photonQueue = tail;

  await run;
}

function createRequestSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  };
}

function parseNominatimResults(raw: any[]): SearchItem[] {
  const results: SearchItem[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const id = `osm-${item.place_id}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const parts = item.display_name
      ? String(item.display_name).split(',').map((part: string) => part.trim())
      : [];
    const title = parts[0] || item.display_name || 'Location';
    const subtitle = parts.slice(1, 4).join(', ') || item.display_name || 'Malaysia';

    const type = String(item.type || '').toLowerCase();
    const osmClass = String(item.class || '').toLowerCase();
    let category: SearchItem['category'] = 'landmark';

    if (osmClass === 'shop' || type.includes('mall') || type.includes('supermarket')) {
      category = 'shopping';
    } else if (osmClass === 'amenity' && (type === 'hospital' || type === 'clinic')) {
      category = 'hospital';
    } else if (osmClass === 'amenity' && (type === 'university' || type === 'college')) {
      category = 'university';
    } else if (osmClass === 'highway' && type.includes('toll')) {
      category = 'toll_plaza';
    } else if (osmClass === 'aeroway' || osmClass === 'railway') {
      category = 'transit';
    }

    results.push({
      id,
      title,
      subtitle,
      category,
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
      regionId: 'online',
      _osmClass: osmClass,
      _osmType: type
    } as SearchItem & { _osmClass?: string; _osmType?: string });
  }

  return results;
}

function parsePhotonResults(geojson: any, fallbackTitle: string): SearchItem[] {
  return (geojson?.features || [])
    .filter((feature: any) => {
      const country = String(
        feature.properties?.country || feature.properties?.countrycode || ''
      ).toLowerCase();
      return country.includes('malaysia') || country === 'my';
    })
    .map((feature: any) => {
      const properties = feature.properties || {};
      const subtitleParts = [
        properties.street,
        properties.locality,
        properties.city,
        properties.state
      ].filter(Boolean);

      return {
        id: `photon-${properties.osm_id || Math.random()}`,
        title: properties.name || fallbackTitle,
        subtitle: subtitleParts.join(', ') || 'Malaysia',
        category:
          properties.osm_key === 'shop' || properties.osm_value === 'mall'
            ? 'shopping'
            : 'landmark',
        coordinates: [
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1]
        ] as [number, number],
        regionId: 'online',
        _osmClass: properties.osm_key || '',
        _osmType: properties.osm_value || ''
      } as SearchItem & { _osmClass?: string; _osmType?: string };
    });
}

async function fetchNominatimItems(
  query: string,
  signal?: AbortSignal
): Promise<SearchItem[]> {
  const cached = readGeocodeCache('nominatim', query);
  if (cached) return cached;

  await enqueueGeocodeRequest('nominatim', signal);

  const { signal: requestSignal, cleanup } = createRequestSignal(
    signal,
    GEOCODE_REQUEST_TIMEOUT_MS
  );

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&countrycodes=my&format=json&addressdetails=1&limit=8`;
    const res = await fetch(url, {
      signal: requestSignal,
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return [];

    const items = parseNominatimResults(await res.json());
    writeGeocodeCache('nominatim', query, items);
    return items;
  } catch {
    return [];
  } finally {
    cleanup();
  }
}

async function fetchPhotonItems(
  query: string,
  signal?: AbortSignal,
  userLocation?: [number, number]
): Promise<SearchItem[]> {
  const cached = readGeocodeCache('photon', query);
  if (cached) return cached;

  await enqueueGeocodeRequest('photon', signal);

  const { signal: requestSignal, cleanup } = createRequestSignal(
    signal,
    GEOCODE_REQUEST_TIMEOUT_MS
  );

  try {
    const centerLat = userLocation ? userLocation[1].toFixed(4) : '3.1390';
    const centerLng = userLocation ? userLocation[0].toFixed(4) : '101.6869';
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&lat=${centerLat}&lon=${centerLng}&limit=8`;

    const res = await fetch(url, {
      signal: requestSignal,
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return [];

    const items = parsePhotonResults(await res.json(), query);
    writeGeocodeCache('photon', query, items);
    return items;
  } catch {
    return [];
  } finally {
    cleanup();
  }
}

export async function searchDestinations(
  query: string,
  isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true,
  userLocation?: [number, number],
  signal?: AbortSignal
): Promise<SearchItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Check if query is a coordinate or map link
  const coordinateMatch = parseCoordinatesOrMapLink(query);
  if (coordinateMatch) {
    return [coordinateMatch];
  }

  const expandedQuery = expandAbbreviations(cleanQuery);
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
  const expandedTokens = expandedQuery.split(/\s+/).filter(Boolean);

  // 1. Search embedded offline directory
  const offlineMatches = MALAYSIA_OFFLINE_POIS.filter(item => {
    const title = item.title.toLowerCase();
    const subtitle = item.subtitle.toLowerCase();
    const expressway = item.expressway?.toLowerCase() ?? '';

    // Direct substring match
    if (
      title.includes(cleanQuery) ||
      subtitle.includes(cleanQuery) ||
      expressway.includes(cleanQuery) ||
      title.includes(expandedQuery) ||
      subtitle.includes(expandedQuery)
    ) {
      return true;
    }

    // Token-based match (all tokens match either title or subtitle)
    const allTokensMatch = queryTokens.length > 1 && queryTokens.every(
      t => title.includes(t) || subtitle.includes(t) || expressway.includes(t)
    );
    if (allTokensMatch) return true;

    const allExpandedTokensMatch = expandedTokens.length > 1 && expandedTokens.every(
      t => title.includes(t) || subtitle.includes(t) || expressway.includes(t)
    );
    return allExpandedTokensMatch;
  });

  // Sort: direct startsWith higher than general contains
  offlineMatches.sort((a, b) => {
    const aStarts = a.title.toLowerCase().startsWith(cleanQuery) || a.title.toLowerCase().startsWith(expandedQuery);
    const bStarts = b.title.toLowerCase().startsWith(cleanQuery) || b.title.toLowerCase().startsWith(expandedQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });

  // Query Tier 2: Bulk IndexedDB POIs
  let bulkMatches: SearchItem[] = [];
  try {
    bulkMatches = await searchBulkPOIs(expandedQuery, 5, userLocation);
  } catch {
    // Graceful fallback
  }

  const combinedOffline = [...offlineMatches];
  const seenOfflineIds = new Set(offlineMatches.map(m => m.id));
  for (const b of bulkMatches) {
    if (!seenOfflineIds.has(b.id)) {
      combinedOffline.push(b);
      seenOfflineIds.add(b.id);
    }
  }

  if (!isOnline) {
    if (userLocation) {
      return combinedOffline
        .map(item => ({
          ...item,
          distanceKm: item.distanceKm ?? calculateDistanceKm(userLocation, item.coordinates)
        }))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }
    return combinedOffline;
  }

  // 2. Online: Nominatim + Photon through the rate-limited, cached client.
  const searchQueryParam = expandedQuery !== cleanQuery ? expandedQuery : query;
  // Cap the variants: every extra variant costs one request per provider and
  // Nominatim allows one request per second.
  const onlineQueries = Array.from(new Set([searchQueryParam, cleanQuery])).slice(0, 2);

  const settled = await Promise.allSettled(
    onlineQueries.flatMap(queryVariant => [
      fetchNominatimItems(queryVariant, signal),
      fetchPhotonItems(queryVariant, signal, userLocation)
    ])
  );

  const combinedOnline: SearchItem[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') combinedOnline.push(...result.value);
  }

  const onlineResults: SearchItem[] = [];
  const seenOnlineIds = new Set<string>();
  for (const item of combinedOnline) {
    if (seenOnlineIds.has(item.id)) continue;
    seenOnlineIds.add(item.id);
    onlineResults.push(item);
  }

  // Rank venues/destinations above railway tracks or bus stops.
  onlineResults.sort((a: any, b: any) => {
    const aIsInfrastructure =
      a._osmClass === 'railway' || a._osmType === 'bus_stop' || a._osmClass === 'highway';
    const bIsInfrastructure =
      b._osmClass === 'railway' || b._osmType === 'bus_stop' || b._osmClass === 'highway';
    if (!aIsInfrastructure && bIsInfrastructure) return -1;
    if (aIsInfrastructure && !bIsInfrastructure) return 1;
    return 0;
  });

  // Merge and deduplicate by title.
  const seenTitles = new Set(combinedOffline.map(item => item.title.toLowerCase()));
  const filteredOnline = onlineResults.filter(
    item => !seenTitles.has(item.title.toLowerCase())
  );

  const rankResults = (items: SearchItem[]): SearchItem[] => {
    if (!userLocation) return items;
    return items
      .map(item => ({
        ...item,
        distanceKm:
          item.distanceKm ?? calculateDistanceKm(userLocation, item.coordinates)
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  };

  return rankResults([...combinedOffline, ...filteredOnline]);
}
