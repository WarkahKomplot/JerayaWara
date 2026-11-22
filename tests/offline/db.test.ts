import { describe, it, expect } from 'vitest';
import { offlineDb } from '../../src/services/offline/db';

describe('Offline database schema', () => {
  it('retires the removed region/tile tables and keeps POIs', async () => {
    await offlineDb.open();

    const tableNames = offlineDb.tables.map(table => table.name).sort();

    expect(tableNames).toEqual(['pois', 'savedPlaces']);
    expect(offlineDb.tables.some(table => table.name === 'regions')).toBe(false);
    expect(offlineDb.tables.some(table => table.name === 'tiles')).toBe(false);
  });
});
