import { describe, it, expect } from 'vitest';
import { detectProximityBoundary, isLocationCached } from '../../src/services/offline/regions';

describe('Regional Offline Management', () => {
  it('detects proximity when within 15km of Northern region boundary (near Tg Malim border)', () => {
    // Tanjung Malim (approx [101.518, 3.684]) near Selangor-Perak border
    const nearby = detectProximityBoundary([101.518, 3.684], 15);
    const regionIds = nearby.map(r => r.id);
    expect(regionIds).toContain('northern');
    expect(regionIds).toContain('klang-valley');
  });

  it('correctly verifies if coordinate is within cached regions', () => {
    // KL Tower [101.703, 3.152] in klang-valley
    expect(isLocationCached([101.703, 3.152], ['klang-valley'])).toBe(true);
    expect(isLocationCached([101.703, 3.152], ['northern'])).toBe(false);
  });
});
