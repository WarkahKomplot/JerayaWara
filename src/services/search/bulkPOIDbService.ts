import { offlineDb, OfflinePOIRecord } from '../offline/db';
import { SearchItem, POICategory } from './types';

// Haversine distance in kilometers
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Resolves the bundled POI index against the Vite base path so the app works when
 * hosted under a sub-path (GitHub Pages project sites) as well as at the domain
 * root. A root-absolute '/data/...' fetch silently 404s under '/JerayaWara/'.
 */
export function buildPoiIndexUrl(baseUrl: string = import.meta.env.BASE_URL): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${base}data/malaysia-poi-index.json`;
}

// Bump alongside public/data/malaysia-poi-index.json's updatedAt.
const POI_INDEX_VERSION_KEY = 'jerayawara_poi_index_version';
const POI_INDEX_VERSION = '2026-11-22';

let syncPromise: Promise<void> | null = null;

export function resetBulkSyncPromiseForTest() {
  syncPromise = null;
}

function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .match(/[a-z0-9]{2,}/g) || []
  );
}

/**
 * Initializes and syncs bulk offline POIs from the compressed static asset into IndexedDB.
 * Runs in the background with zero UI blocking.
 */
export async function syncBulkPOIsInStore(): Promise<void> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const count = await offlineDb.pois.count();
      let storedVersion: string | null = null;
      try {
        storedVersion = localStorage.getItem(POI_INDEX_VERSION_KEY);
      } catch {
        // Private mode / sandboxed iframe
      }

      // The old 17-record Overture sample is still in some installs; the version
      // marker forces a one-time replacement with the GeoNames index.
      if (count > 0 && storedVersion === POI_INDEX_VERSION) {
        return;
      }

      const res = await fetch(buildPoiIndexUrl());
      if (!res.ok) throw new Error(`POI index HTTP ${res.status}`);

      const data = await res.json();
      if (!data || !Array.isArray(data.records) || data.records.length === 0) {
        throw new Error('POI index empty');
      }

      const recordsToInsert: OfflinePOIRecord[] = data.records.map((r: any, idx: number) => {
        const title = r[0];
        const lng = r[1];
        const lat = r[2];
        const cat = r[3] || 'landmark';
        const city = r[4] || '';

        const fullText = `${title} ${city} ${cat}`;
        const tokens = Array.from(new Set(tokenize(fullText)));

        return {
          id: `bulk-${idx}-${lng.toFixed(4)}-${lat.toFixed(4)}`,
          title,
          subtitle: city ? `${city} · ${cat.replace(/_/g, ' ')}` : cat.replace(/_/g, ' '),
          category: cat,
          coordinates: [lng, lat],
          regionId: 'bulk',
          tokens
        };
      });

      // Replace only after the new asset has parsed successfully.
      if (count > 0) {
        await offlineDb.pois.clear();
      }
      await offlineDb.pois.bulkPut(recordsToInsert);

      try {
        localStorage.setItem(POI_INDEX_VERSION_KEY, POI_INDEX_VERSION);
      } catch {
        // Cache marker is best-effort.
      }
    } catch {
      // Offline or asset failure: allow a later search to retry.
      syncPromise = null;
    }
  })();

  return syncPromise;
}

/**
 * Fast search in IndexedDB for bulk Malaysian POIs.
 * Completes in 2-10ms using Dexie multi-entry index on tokens.
 */
export async function searchBulkPOIs(
  query: string,
  limit: number = 8,
  userLocation?: [number, number]
): Promise<SearchItem[]> {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  try {
    // If not yet loaded, wait for the one-time import so the first search still
    // finds towns from the bundled index (normally warmed at app startup).
    let totalCount = await offlineDb.pois.count();
    if (totalCount === 0) {
      await syncBulkPOIsInStore();
      totalCount = await offlineDb.pois.count();
      if (totalCount === 0) return [];
    }

    // Query matching tokens
    const allRecords = await offlineDb.pois.toArray();
    const candidateRecords = allRecords.filter(rec => {
      const fullText = `${rec.title} ${rec.subtitle}`.toLowerCase();
      return tokens.every(t => fullText.includes(t) || rec.tokens?.some(tok => tok.startsWith(t)));
    }).slice(0, limit);

    const items: SearchItem[] = candidateRecords.map(rec => ({
      id: rec.id,
      title: rec.title,
      subtitle: rec.subtitle,
      category: (rec.category as POICategory) || 'landmark',
      coordinates: rec.coordinates,
      regionId: rec.regionId,
      expressway: rec.expressway
    }));

    if (userLocation) {
      const itemsWithDistance = items
        .map(item => ({
          ...item,
          distanceKm: calculateDistanceKm(userLocation, item.coordinates)
        }))
        .filter(item => (item.distanceKm ?? Infinity) < 500); // within 500km

      return itemsWithDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return items;
  } catch {
    return [];
  }
}
