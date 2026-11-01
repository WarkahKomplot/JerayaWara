export type AmenityType =
  | 'petronas'
  | 'shell'
  | 'caltex'
  | 'bhp'
  | 'ev_fast_charger';

export interface EnRouteAmenity {
  id: string;
  name: string;
  type: AmenityType;
  brand: string;
  expressway: string;
  kmMarker?: string;
  coordinates: [number, number]; // [lng, lat]
  evSpecs?: {
    operator: string;
    maxKw: number;
    plugs: string[];
  };
}

export interface EnRouteAmenityWithDistance extends EnRouteAmenity {
  distanceKm: number;
}
