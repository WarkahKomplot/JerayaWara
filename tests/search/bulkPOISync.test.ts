import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { offlineDb } from '../../src/services/offline/db';
import {
  syncBulkPOIsInStore,
  searchBulkPOIs,
  resetBulkSyncPromiseForTest
} from '../../src/services/search/bulkPOIDbService';

const indexJson = readFileSync(
  resolve(process.cwd(), 'public/data/malaysia-poi-index.json'),
  'utf8'
);

beforeEach(async () => {
  await offlineDb.pois.clear();
  resetBulkSyncPromiseForTest();
  localStorage.removeItem('jerayawara_poi_index_version');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Bulk POI index synchronisation', () => {
  it('imports the bundled index and finds a Malaysian town', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(indexJson, { status: 200 }))
    );

    await syncBulkPOIsInStore();

    expect(await offlineDb.pois.count()).toBeGreaterThan(20000);

    const results = await searchBulkPOIs('Kajang', 5);
    expect(results.some(result => result.title.toLowerCase().includes('kajang'))).toBe(true);
  }, 120000);
});
