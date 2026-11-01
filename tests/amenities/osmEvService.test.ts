import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPlugShareUrl,
  parseKwOutput,
  extractPlugs,
  parseOsmEvElement,
  getCachedOsmEvStations,
  saveOsmEvStations,
  clearOsmEvCache,
  getLastOsmEvSyncTime,
  buildOverpassEvQuery,
  syncOsmEvStations,
  OsmEvElement
} from '../../src/services/amenities/osmEvService';
import { getAllAvailableAmenities } from '../../src/services/amenities/amenitiesService';

describe('OpenStreetMap Overpass EV Service & PlugShare Integration', () => {
  beforeEach(() => {
    clearOsmEvCache();
  });

  afterEach(() => {
    clearOsmEvCache();
    vi.restoreAllMocks();
  });

  describe('getPlugShareUrl', () => {
    it('generates a valid PlugShare map URL with exact coordinates', () => {
      const coord: [number, number] = [101.6869, 3.1390];
      const url = getPlugShareUrl(coord);
      expect(url).toContain('https://www.plugshare.com/?latitude=3.139000&longitude=101.686900');
      expect(url).toContain('spanLat=0.005&spanLng=0.005');
    });

    it('handles negative or zero coordinate values safely', () => {
      const coord: [number, number] = [0, 0];
      const url = getPlugShareUrl(coord);
      expect(url).toBe('https://www.plugshare.com/?latitude=0.000000&longitude=0.000000&spanLat=0.005&spanLng=0.005');
    });
  });

  describe('parseKwOutput', () => {
    it('parses various power tag formats accurately', () => {
      expect(parseKwOutput('180 kW')).toBe(180);
      expect(parseKwOutput('350kW')).toBe(350);
      expect(parseKwOutput('60')).toBe(60);
      expect(parseKwOutput('22.5 kW')).toBe(23);
      expect(parseKwOutput(undefined, 50)).toBe(50);
      expect(parseKwOutput('invalid', 60)).toBe(60);
    });
  });

  describe('extractPlugs', () => {
    it('extracts CCS2, Type 2, CHAdeMO and Tesla connectors', () => {
      expect(extractPlugs({ 'socket:type2_combo': '2' })).toContain('CCS2');
      expect(extractPlugs({ 'socket:type2': '2' })).toContain('Type 2');
      expect(extractPlugs({ 'socket:chademo': '1' })).toContain('CHAdeMO');
      expect(extractPlugs({ 'socket:tesla_supercharger': '4' })).toContain('Tesla Supercharger');
    });

    it('defaults to CCS2 if no sockets are explicitly tagged', () => {
      expect(extractPlugs({})).toEqual(['CCS2']);
    });
  });

  describe('parseOsmEvElement', () => {
    it('parses a node element into an EnRouteAmenity', () => {
      const element: OsmEvElement = {
        id: 991234,
        type: 'node',
        lat: 3.14159,
        lon: 101.6888,
        tags: {
          amenity: 'charging_station',
          name: 'Gentari KLCC Suria',
          operator: 'Gentari',
          brand: 'Gentari',
          'socket:type2_combo:output': '180 kW',
          'socket:type2_combo': '2'
        }
      };

      const parsed = parseOsmEvElement(element);
      expect(parsed).not.toBeNull();
      expect(parsed?.id).toBe('osm-ev-991234');
      expect(parsed?.name).toBe('Gentari KLCC Suria');
      expect(parsed?.type).toBe('ev_fast_charger');
      expect(parsed?.coordinates).toEqual([101.6888, 3.14159]);
      expect(parsed?.evSpecs?.maxKw).toBe(180);
      expect(parsed?.evSpecs?.plugs).toContain('CCS2');
    });

    it('parses a way element with center coordinates', () => {
      const element: OsmEvElement = {
        id: 887654,
        type: 'way',
        center: { lat: 2.9234, lon: 101.6543 },
        tags: {
          amenity: 'charging_station',
          operator: 'TNB Electron',
          'socket:type2_combo:output': '150 kW'
        }
      };

      const parsed = parseOsmEvElement(element);
      expect(parsed).not.toBeNull();
      expect(parsed?.id).toBe('osm-ev-887654');
      expect(parsed?.coordinates).toEqual([101.6543, 2.9234]);
      expect(parsed?.name).toBe('TNB Electron Charging Station');
      expect(parsed?.evSpecs?.maxKw).toBe(150);
    });

    it('returns null if coordinates are missing', () => {
      const element: OsmEvElement = {
        id: 111,
        type: 'node',
        tags: { amenity: 'charging_station' }
      };
      expect(parseOsmEvElement(element)).toBeNull();
    });
  });

  describe('Persistent Cache Management', () => {
    it('saves and retrieves cached EV stations from localStorage', () => {
      expect(getCachedOsmEvStations()).toEqual([]);
      expect(getLastOsmEvSyncTime()).toBeNull();

      const sample = [
        {
          id: 'osm-ev-1',
          name: 'Test Charger',
          type: 'ev_fast_charger' as const,
          brand: 'Test',
          expressway: 'PLUS',
          coordinates: [101.5, 3.1] as [number, number]
        }
      ];

      saveOsmEvStations(sample);
      const cached = getCachedOsmEvStations();
      expect(cached.length).toBe(1);
      expect(cached[0].id).toBe('osm-ev-1');
      expect(getLastOsmEvSyncTime()).toBeGreaterThan(0);

      clearOsmEvCache();
      expect(getCachedOsmEvStations()).toEqual([]);
      expect(getLastOsmEvSyncTime()).toBeNull();
    });
  });

  describe('buildOverpassEvQuery', () => {
    it('constructs a bounding box query for charging stations', () => {
      const query = buildOverpassEvQuery([2.5, 101.0, 3.5, 102.0]);
      expect(query).toContain('amenity"="charging_station"');
      expect(query).toContain('(2.5,101,3.5,102)');
      expect(query).toContain('[out:json]');
    });
  });

  describe('syncOsmEvStations', () => {
    it('fetches stations from Overpass and caches them', async () => {
      const mockResponse = {
        elements: [
          {
            id: 12345,
            type: 'node',
            lat: 3.15,
            lon: 101.71,
            tags: {
              amenity: 'charging_station',
              name: 'ChargeEV Menara',
              operator: 'ChargeEV',
              'socket:type2_combo:output': '120 kW'
            }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await syncOsmEvStations([3.0, 101.5, 3.3, 101.8]);
      expect(result.success).toBe(true);
      expect(result.newCount).toBe(1);
      expect(result.stations.some(s => s.id === 'osm-ev-12345')).toBe(true);

      const cached = getCachedOsmEvStations();
      expect(cached.length).toBe(1);
    });

    it('falls back to cached stations on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // Pre-populate cache
      saveOsmEvStations([
        {
          id: 'osm-cached-1',
          name: 'Offline Station',
          type: 'ev_fast_charger',
          brand: 'Offline',
          expressway: 'PLUS',
          coordinates: [101.5, 3.2]
        }
      ]);

      const result = await syncOsmEvStations();
      expect(result.success).toBe(false);
      expect(result.stations.length).toBe(1);
      expect(result.stations[0].id).toBe('osm-cached-1');
    });
  });

  describe('getAllAvailableAmenities integration', () => {
    it('combines baseline expressway amenities with non-duplicate cached OSM stations', () => {
      // Station far away from existing baseline stations
      saveOsmEvStations([
        {
          id: 'osm-ev-new',
          name: 'Unique Kedah Charger',
          type: 'ev_fast_charger',
          brand: 'Gentari',
          expressway: 'PLUS E1',
          coordinates: [100.40, 5.80]
        }
      ]);

      const all = getAllAvailableAmenities();
      expect(all.some(a => a.id === 'osm-ev-new')).toBe(true);
    });

    it('deduplicates OSM stations that are near (<150m) an existing baseline station', () => {
      // Gentari 60kW DC Fast Charger R&R Rawang is at [101.576, 3.326]
      saveOsmEvStations([
        {
          id: 'osm-duplicate-rawang',
          name: 'Rawang Duplicate',
          type: 'ev_fast_charger',
          brand: 'Gentari',
          expressway: 'PLUS E1',
          coordinates: [101.57601, 3.32601] // within 2 meters!
        }
      ]);

      const all = getAllAvailableAmenities();
      // Should NOT duplicate the station
      const rawangEvs = all.filter(a => a.coordinates[0] === 101.57601 && a.coordinates[1] === 3.32601);
      expect(rawangEvs.length).toBe(0);
    });
  });
});
