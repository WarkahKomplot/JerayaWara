import { describe, it, expect } from 'vitest';
import {
  searchDestinations,
  parseCoordinatesOrMapLink,
  expandAbbreviations
} from '../../src/services/search/searchEngine';

describe('Search & Geocoding Engine', () => {
  it('finds Malaysian highway exits and R&Rs offline', async () => {
    const results = await searchDestinations('Tapah', false);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Tapah');
    expect(results[0].coordinates).toBeDefined();
  });

  it('finds major toll plazas offline', async () => {
    const results = await searchDestinations('Sungai Besi', false);
    expect(results.some(r => r.category === 'toll_plaza')).toBe(true);
  });

  it('finds major Borneo locations offline (Sarawak & Sabah)', async () => {
    const results = await searchDestinations('Kuching', false);
    expect(results.some(r => r.title.includes('Kuching'))).toBe(true);
  });

  it('finds major hospitals, shopping malls, and universities offline', async () => {
    const hospitals = await searchDestinations('Hospital Kajang', false);
    expect(hospitals.some(h => h.category === 'hospital')).toBe(true);

    const malls = await searchDestinations('Mid Valley Megamall', false);
    expect(malls.some(m => m.category === 'shopping')).toBe(true);

    const unis = await searchDestinations('Universiti Malaya', false);
    expect(unis.some(u => u.category === 'university')).toBe(true);
  });

  it('correctly parses raw decimal coordinates', () => {
    const parsed = parseCoordinatesOrMapLink('2.9904, 101.7925');
    expect(parsed).not.toBeNull();
    expect(parsed?.category).toBe('pinned');
    expect(parsed?.coordinates[0]).toBeCloseTo(101.7925, 4);
    expect(parsed?.coordinates[1]).toBeCloseTo(2.9904, 4);

    // Swap if longitude is passed first
    const swapped = parseCoordinatesOrMapLink('101.7925, 2.9904');
    expect(swapped).not.toBeNull();
    expect(swapped?.coordinates[0]).toBeCloseTo(101.7925, 4);
    expect(swapped?.coordinates[1]).toBeCloseTo(2.9904, 4);
  });

  it('correctly extracts coordinates from Google Maps URLs', () => {
    const url1 = parseCoordinatesOrMapLink(
      'https://www.google.com/maps/place/KLCC/@3.1579,101.7116,17z'
    );
    expect(url1).not.toBeNull();
    expect(url1?.coordinates[0]).toBeCloseTo(101.7116, 4);
    expect(url1?.coordinates[1]).toBeCloseTo(3.1579, 4);

    const url2 = parseCoordinatesOrMapLink(
      'https://www.google.com/maps?q=3.1390,101.6869'
    );
    expect(url2).not.toBeNull();
    expect(url2?.coordinates[0]).toBeCloseTo(101.6869, 4);
    expect(url2?.coordinates[1]).toBeCloseTo(3.1390, 4);
  });

  it('expands common colloquial Malaysian abbreviations', async () => {
    expect(expandAbbreviations('hosp kajang')).toBe('hospital kajang');
    expect(expandAbbreviations('bdr tun hussein onn')).toBe('bandar tun hussein onn');
    expect(expandAbbreviations('tmn melawati')).toBe('taman melawati');

    // Searching 'hosp kajang' should find Hospital Kajang
    const results = await searchDestinations('hosp kajang', false);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Kajang');
  });
});
