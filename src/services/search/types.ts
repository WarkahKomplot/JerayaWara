export type POICategory =
  | 'city'
  | 'toll_plaza'
  | 'rnr'
  | 'landmark'
  | 'junction'
  | 'transit'
  | 'shopping'
  | 'hospital'
  | 'university'
  | 'pinned';

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: POICategory;
  coordinates: [number, number]; // [lng, lat]
  expressway?: string;
  regionId: string;
}


