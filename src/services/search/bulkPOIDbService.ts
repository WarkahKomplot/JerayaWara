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
      if (count > 0) {
        return; // Already populated
      }

      // Fetch static asset
      const res = await fetch('/data/overture-poi-index.json');
      if (!res.ok) return;

      const data = await res.json();
      if (!data || !Array.isArray(data.records)) return;

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

      if (recordsToInsert.length > 0) {
        await offlineDb.pois.bulkPut(recordsToInsert);
      }
    } catch {
      // Graceful ignore if offline or fetch fails
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
    // If not yet loaded, trigger background sync
    const totalCount = await offlineDb.pois.count();
    if (totalCount === 0) {
      syncBulkPOIsInStore();
      return [];
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
