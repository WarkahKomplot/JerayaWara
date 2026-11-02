import Dexie, { Table } from 'dexie';

export interface CachedRegionRecord {
  regionId: string;
  name: string;
  sizeMB: number;
  downloadedAt: number;
  version: string;
  status: 'downloading' | 'ready' | 'error';
}

export interface CachedTileRecord {
  key: string; // "regionId/z/x/y"
  regionId: string;
  data: ArrayBuffer;
  savedAt: number;
}

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
  regions!: Table<CachedRegionRecord, string>;
  tiles!: Table<CachedTileRecord, string>;
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
  }
}

export const offlineDb = new JerayaWaraDatabase();

