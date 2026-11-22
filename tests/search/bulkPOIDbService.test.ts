import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { offlineDb } from '../../src/services/offline/db';
import {
  searchBulkPOIs,
  resetBulkSyncPromiseForTest
} from '../../src/services/search/bulkPOIDbService';

describe('Bulk POI IndexedDB Service', () => {
  beforeEach(async () => {
    await offlineDb.pois.clear();
  });

  it('stores and queries indexed bulk POIs with tokens', async () => {
    await offlineDb.pois.bulkPut([
      {
        id: 'poi-1',
        title: 'Restoran Nasi Kandar Deen Maju',
        subtitle: 'George Town, Penang',
        category: 'restaurant',
        coordinates: [100.3255, 5.4123],
        regionId: 'northern',
        tokens: ['restoran', 'nasi', 'kandar', 'deen', 'maju', 'george', 'town', 'penang']
      },
      {
        id: 'poi-2',
        title: 'Arjuna Event Hall JB',
        subtitle: 'Tampoi, Johor Bahru',
        category: 'landmark',
        coordinates: [103.6967, 1.5006],
        regionId: 'southern',
        tokens: ['arjuna', 'event', 'hall', 'jb', 'tampoi', 'johor', 'bahru']
      }
    ]);

    const count = await offlineDb.pois.count();
    expect(count).toBe(2);

    const deenResults = await searchBulkPOIs('deen maju');
    expect(deenResults.length).toBe(1);
    expect(deenResults[0].title).toContain('Deen Maju');

    const arjunaResults = await searchBulkPOIs('arjuna tampoi');
    expect(arjunaResults.length).toBe(1);
    expect(arjunaResults[0].title).toContain('Arjuna');
  });

  it('calculates distance when userLocation is supplied', async () => {
    await offlineDb.pois.put({
      id: 'poi-penang',
      title: 'Penang Hill Station',
      subtitle: 'Air Itam, Penang',
      category: 'landmark',
      coordinates: [100.2685, 5.4085],
      regionId: 'northern',
      tokens: ['penang', 'hill', 'station']
    });

    const cnt = await offlineDb.pois.count();
    expect(cnt).toBe(1);

    const results = await searchBulkPOIs('penang hill', 5, [100.2600, 5.4000]);
    expect(results.length).toBe(1);
    expect(results[0].distanceKm).toBeDefined();
    expect(results[0].distanceKm).toBeLessThan(5);
  });

  it('imports the bundled index on the first search when the store is empty', async () => {
    const payload = {
      count: 2,
      updatedAt: '2026-11-22',
      records: [
        ['Kajang', 101.79, 2.99, 'city', 'Selangor'],
        ['Tapah', 101.26, 4.2, 'city', 'Perak']
      ]
    };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })));

    resetBulkSyncPromiseForTest();
    localStorage.removeItem('jerayawara_poi_index_version');

    const results = await searchBulkPOIs('Kajang', 5);

    expect(results.some(result => result.title === 'Kajang')).toBe(true);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
