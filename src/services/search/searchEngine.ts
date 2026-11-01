import { SearchItem } from './types';
import { MALAYSIA_OFFLINE_POIS } from './malaysiaPOIData';

export async function searchDestinations(query: string, isOnline: boolean = false): Promise<SearchItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // 1. Search embedded offline directory
  const offlineMatches = MALAYSIA_OFFLINE_POIS.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(cleanQuery);
    const subtitleMatch = item.subtitle.toLowerCase().includes(cleanQuery);
    const expresswayMatch = item.expressway?.toLowerCase().includes(cleanQuery) ?? false;
    return titleMatch || subtitleMatch || expresswayMatch;
  });

  // Sort: direct startsWith higher than general contains
  offlineMatches.sort((a, b) => {
    const aStarts = a.title.toLowerCase().startsWith(cleanQuery);
    const bStarts = b.title.toLowerCase().startsWith(cleanQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });

  if (!isOnline) {
    return offlineMatches;
  }

  // 2. If online, optionally fetch from open Nominatim API (Malaysia restricted)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&countrycodes=my&format=json&limit=5`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JerayaWara-Malaysia-Nav-PWA/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const onlineResults: SearchItem[] = data.map((item: any) => ({
        id: `osm-${item.place_id}`,
        title: item.display_name.split(',')[0],
        subtitle: item.display_name,
        category: 'landmark',
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        regionId: 'online'
      }));

      // Merge and deduplicate by title
      const seenTitles = new Set(offlineMatches.map(m => m.title.toLowerCase()));
      const filteredOnline = onlineResults.filter(
        o => !seenTitles.has(o.title.toLowerCase())
      );

      return [...offlineMatches, ...filteredOnline];
    }
  } catch {
    // If online search fails or timeouts, smoothly fall back to offline directory
  }

  return offlineMatches;
}

