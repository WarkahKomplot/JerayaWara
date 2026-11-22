import { describe, it, expect } from 'vitest';
import { distanceKm } from '../../src/services/geo/distance';

describe('distanceKm', () => {
  it('returns zero for the same coordinate', () => {
    expect(distanceKm([101.693, 3.141], [101.693, 3.141])).toBe(0);
  });

  it('measures KL to Seremban at roughly 64 km', () => {
    const km = distanceKm([101.693, 3.141], [101.938, 2.725]);

    expect(km).toBeGreaterThan(50);
    expect(km).toBeLessThan(80);
  });
});
