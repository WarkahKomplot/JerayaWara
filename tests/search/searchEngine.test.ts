import { describe, it, expect } from 'vitest';
import { searchDestinations } from '../../src/services/search/searchEngine';

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
});

