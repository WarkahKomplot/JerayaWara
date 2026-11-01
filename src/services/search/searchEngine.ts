import { SearchItem } from './types';
import { MALAYSIA_OFFLINE_POIS } from './malaysiaPOIData';

const MALAYSIAN_ABBREVIATIONS: Record<string, string> = {
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
  midvalley: 'mid valley',
  pavillion: 'pavilion',
  hkl: 'hospital kuala lumpur',
  hsa: 'hospital sultanah aminah',
  hsb: 'hospital sungai buloh',
  ktmb: 'keretapi tanah melayu'
};

/**
 * Expand colloquial Malaysian abbreviations (e.g., 'hosp kajang' -> 'hospital kajang')
 */
export function expandAbbreviations(query: string): string {
  const words = query.trim().toLowerCase().split(/\s+/);
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

export async function searchDestinations(query: string, isOnline: boolean = false): Promise<SearchItem[]> {
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

  if (!isOnline) {
    return offlineMatches;
  }

  // 2. If online, fetch from open Nominatim API (Malaysia restricted)
  let timeoutId: any;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 2500);

    const searchQueryParam = expandedQuery !== cleanQuery ? expandedQuery : query;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQueryParam
    )}&countrycodes=my&format=json&addressdetails=1&limit=8`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'JerayaWara-Malaysia-Nav-PWA/1.0'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const onlineResults: SearchItem[] = data.map((item: any) => {
        const parts = item.display_name.split(',').map((p: string) => p.trim());
        const primaryTitle = parts[0] || item.display_name;
        const secondarySubtitle = parts.slice(1, 4).join(', ') || item.display_name;

        // Categorize based on OSM type
        let category: SearchItem['category'] = 'landmark';
        const type = (item.type || '').toLowerCase();
        const osmClass = (item.class || '').toLowerCase();

        if (osmClass === 'shop' || type.includes('mall')) {
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

        return {
          id: `osm-${item.place_id}`,
          title: primaryTitle,
          subtitle: secondarySubtitle,
          category,
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
          regionId: 'online'
        };
      });

      // Merge and deduplicate by title
      const seenTitles = new Set(offlineMatches.map(m => m.title.toLowerCase()));
      const filteredOnline = onlineResults.filter(
        o => !seenTitles.has(o.title.toLowerCase())
      );

      return [...offlineMatches, ...filteredOnline];
    }
  } catch {
    // If online search fails or timeouts, smoothly fall back to offline directory
  } finally {
    clearTimeout(timeoutId);
  }

  return offlineMatches;
}
