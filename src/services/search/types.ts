export type POICategory =
  | 'city'
  | 'toll_plaza'
  | 'rnr'
  | 'landmark'
  | 'junction'
  | 'transit'
  | 'shopping'
  | 'restaurant'
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
  distanceKm?: number; // Distance in km from user's current GPS location
}


