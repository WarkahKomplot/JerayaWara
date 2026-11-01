import { describe, it, expect } from 'vitest';
import { getUpcomingAmenities } from '../../src/services/amenities/amenitiesService';
import { MALAYSIA_EXPRESSWAY_AMENITIES } from '../../src/services/amenities/expresswayAmenitiesData';

describe('Expressway En-Route Amenities Service', () => {
  it('contains verified PLUS and LPT petrol and EV charger stations', () => {
    expect(MALAYSIA_EXPRESSWAY_AMENITIES.length).toBeGreaterThanOrEqual(15);
    expect(MALAYSIA_EXPRESSWAY_AMENITIES.some(a => a.type === 'petronas')).toBe(true);
    expect(MALAYSIA_EXPRESSWAY_AMENITIES.some(a => a.type === 'ev_fast_charger')).toBe(true);
  });

  it('calculates upcoming amenities along route polyline ordered by distance', () => {
    // Route along PLUS E1 near Rawang heading north towards Tapah
    const routeCoords: [number, number][] = [
      [101.579, 3.321],
      [101.401, 3.650],
      [101.296, 4.020],
      [101.189, 4.200]
    ];
    const currentCoord: [number, number] = [101.579, 3.321];

    const upcoming = getUpcomingAmenities(routeCoords, currentCoord, 'all', 3);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming[0].distanceKm).toBeGreaterThan(0);
    if (upcoming.length > 1) {
      expect(upcoming[1].distanceKm).toBeGreaterThanOrEqual(upcoming[0].distanceKm);
    }
  });

  it('filters specifically for EV fast chargers when ev category requested', () => {
    const routeCoords: [number, number][] = [
      [101.579, 3.321],
      [101.401, 3.650],
      [101.296, 4.020],
      [101.189, 4.200]
    ];
    const currentCoord: [number, number] = [101.579, 3.321];

    const evOnly = getUpcomingAmenities(routeCoords, currentCoord, 'ev', 3);
    expect(evOnly.every(a => a.type === 'ev_fast_charger')).toBe(true);
  });
});

