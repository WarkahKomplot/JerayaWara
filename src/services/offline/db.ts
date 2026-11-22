import Dexie, { Table } from 'dexie';

export interface SavedPlaceRecord {
  id?: number;
  name: string;
  category: 'home' | 'work' | 'favorite' | 'recent';
  coordinates: [number, number]; // [lng, lat]
  address?: string;
  savedAt: number;
}

export interface OfflinePOIRecord {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  coordinates: [number, number]; // [lng, lat]
  regionId: string;
  expressway?: string;
  tokens: string[]; // For multi-token prefix searching
}

export class JerayaWaraDatabase extends Dexie {
  savedPlaces!: Table<SavedPlaceRecord, number>;
  pois!: Table<OfflinePOIRecord, string>;

  constructor() {
    super('JerayaWaraDB');
    this.version(1).stores({
      regions: 'regionId, status, downloadedAt',
      tiles: 'key, regionId, savedAt',
      savedPlaces: '++id, category, name, savedAt'
    });

    this.version(2).stores({
      regions: 'regionId, status, downloadedAt',
      tiles: 'key, regionId, savedAt',
      savedPlaces: '++id, category, name, savedAt',
      pois: 'id, category, regionId, *tokens'
    });

    // The simulated regional-pack manager was removed; drop its tables.
    this.version(3).stores({
      regions: null,
      tiles: null,
      savedPlaces: '++id, category, name, savedAt',
      pois: 'id, category, regionId, *tokens'
    });
  }
}

export const offlineDb = new JerayaWaraDatabase();

