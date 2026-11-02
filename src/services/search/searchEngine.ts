import { SearchItem } from './types';
import { MALAYSIA_OFFLINE_POIS } from './malaysiaPOIData';
import { searchBulkPOIs, syncBulkPOIsInStore } from './bulkPOIDbService';
export { searchOvertureIndex, bucketHash } from './overturePOIService';
export type { OvertureIndexData } from './overturePOIService';
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

export async function searchDestinations(
  query: string,
  isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true,
  userLocation?: [number, number]
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

  // 2. If online, fetch from open Nominatim API and Photon fallback (Malaysia restricted)
  let timeoutId: any;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 3500);

    const searchQueryParam = expandedQuery !== cleanQuery ? expandedQuery : query;
    const fetchNominatim = async (q: string) => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&countrycodes=my&format=json&addressdetails=1&limit=8`;
      const r = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'JerayaWara-Malaysia-Nav-PWA/1.0'
        }
      });
      return r.ok ? await r.json() : [];
    };

    const fetchPhoton = async (q: string): Promise<SearchItem[]> => {
      try {
        const centerLat = userLocation ? userLocation[1].toFixed(4) : '3.1390';
        const centerLng = userLocation ? userLocation[0].toFixed(4) : '101.6869';
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${centerLat}&lon=${centerLng}&limit=8`;
        const r = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        if (!r.ok) return [];
        const geojson = await r.json();
        return (geojson.features || [])
          .filter((f: any) => {
            const country = (f.properties?.country || f.properties?.countrycode || '').toLowerCase();
            return country.includes('malaysia') || country === 'my';
          })
          .map((f: any) => {
            const p = f.properties || {};
            const subtitleParts = [p.street, p.locality, p.city, p.state].filter(Boolean);
            return {
              id: `photon-${p.osm_id || Math.random()}`,
              title: p.name || query,
              subtitle: subtitleParts.join(', ') || 'Malaysia',
              category: (p.osm_key === 'shop' || p.osm_value === 'mall' ? 'shopping' : 'landmark') as SearchItem['category'],
              coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] as [number, number],
              regionId: 'online',
              _osmClass: p.osm_key || '',
              _osmType: p.osm_value || ''
            };
          });
      } catch {
        return [];
      }
    };

    // Parallel multi-query synthesis: Search exact query + expanded colloquial query
    const searchQueries = new Set<string>();
    searchQueries.add(searchQueryParam);
    if (cleanQuery !== searchQueryParam) {
      searchQueries.add(cleanQuery);
    }

    // Generic prefix & suffix expansion for all Malaysian commercial POIs:
    // If a user types "metro kajang" or "paradigm", also check "plaza metro kajang", "metro kajang mall", etc.
    const genericPrefixes = ['plaza', 'mall', 'kompleks', 'pasar raya', 'hospital', 'klinik', 'masjid'];
    const genericSuffixes = ['mall', 'plaza', 'centre', 'center', 'supermarket', 'hypermarket'];

    // Suffix variants
    for (const s of genericSuffixes) {
      if (!cleanQuery.includes(s)) {
        searchQueries.add(`${cleanQuery} ${s}`);
        break; // Add top suffix variant
      }
    }

    // Prefix variants (e.g. "metro kajang" -> "plaza metro kajang")
    if (!genericPrefixes.some(p => cleanQuery.startsWith(p))) {
      searchQueries.add(`plaza ${cleanQuery}`);
    }

    // Execute queries in parallel
    const queryPromises: Promise<any[]>[] = [];
    searchQueries.forEach(q => {
      queryPromises.push(fetchNominatim(q));
      queryPromises.push(fetchPhoton(q));
    });

    const settled = await Promise.allSettled(queryPromises);
    const combinedOnlineRaw: any[] = [];
    settled.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        combinedOnlineRaw.push(...res.value);
      }
    });

    const onlineResults: SearchItem[] = [];
    const seenOnlineIds = new Set<string>();

    for (const item of combinedOnlineRaw) {
      // Determine if item is from Nominatim or Photon
      const isPhoton = item.id && String(item.id).startsWith('photon-');
      if (isPhoton) {
        if (!seenOnlineIds.has(item.id)) {
          seenOnlineIds.add(item.id);
          onlineResults.push(item);
        }
        continue;
      }

      // Nominatim item parsing
      const id = `osm-${item.place_id}`;
      if (seenOnlineIds.has(id)) continue;
      seenOnlineIds.add(id);

      const parts = item.display_name ? item.display_name.split(',').map((p: string) => p.trim()) : [];
      const primaryTitle = parts[0] || item.display_name || 'Location';
      const secondarySubtitle = parts.slice(1, 4).join(', ') || item.display_name || 'Malaysia';

      let category: SearchItem['category'] = 'landmark';
      const type = (item.type || '').toLowerCase();
      const osmClass = (item.class || '').toLowerCase();

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

      onlineResults.push({
        id,
        title: primaryTitle,
        subtitle: secondarySubtitle,
        category,
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        regionId: 'online',
        _osmClass: osmClass,
        _osmType: type
      } as SearchItem & { _osmClass?: string; _osmType?: string });
    }

    // Rank venues / destinations (shops, buildings, amenities, hospitals) ABOVE railway tracks or bus stops
    onlineResults.sort((a: any, b: any) => {
      const aIsInfrastructure = a._osmClass === 'railway' || a._osmType === 'bus_stop' || a._osmClass === 'highway';
      const bIsInfrastructure = b._osmClass === 'railway' || b._osmType === 'bus_stop' || b._osmClass === 'highway';
      if (!aIsInfrastructure && bIsInfrastructure) return -1;
      if (aIsInfrastructure && !bIsInfrastructure) return 1;
      return 0;
    });

    // Merge and deduplicate by title
    const seenTitles = new Set(combinedOffline.map(m => m.title.toLowerCase()));
    const filteredOnline = onlineResults.filter(
      o => !seenTitles.has(o.title.toLowerCase())
    );

    // Helper to enrich and sort by distance
    const rankResults = (items: SearchItem[]): SearchItem[] => {
      if (!userLocation) return items;
      return items
        .map(item => ({
          ...item,
          distanceKm: item.distanceKm ?? calculateDistanceKm(userLocation, item.coordinates)
        }))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    };

    return rankResults([...combinedOffline, ...filteredOnline]);
  } catch {
    // If online search fails or timeouts, smoothly fall back to offline directory
  } finally {
    clearTimeout(timeoutId);
  }

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
