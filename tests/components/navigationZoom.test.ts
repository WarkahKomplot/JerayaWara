import { describe, it, expect } from 'vitest';
import {
  navigationZoomForSpeed,
  clampUserZoomOffset
} from '../../src/services/map/navigationZoom';

describe('Navigation camera zoom', () => {
  it('zooms in for slow city driving and out for highway speeds', () => {
    expect(navigationZoomForSpeed(0)).toBeCloseTo(17.2, 2);
    expect(navigationZoomForSpeed(20)).toBeCloseTo(17.2, 2);
    expect(navigationZoomForSpeed(40)).toBeCloseTo(16.9, 2);
    expect(navigationZoomForSpeed(90)).toBeCloseTo(16.2, 2);
    expect(navigationZoomForSpeed(130)).toBeCloseTo(16.2, 2);
  });

  it('decreases monotonically as speed rises', () => {
    const samples = [0, 10, 30, 50, 70, 90, 120];
    const zooms = samples.map(navigationZoomForSpeed);
    for (let i = 1; i < zooms.length; i++) {
      expect(zooms[i]).toBeLessThanOrEqual(zooms[i - 1]);
    }
  });

  it('keeps a manual zoom offset within safe bounds', () => {
    expect(clampUserZoomOffset(10)).toBe(4);
    expect(clampUserZoomOffset(-10)).toBe(-3);
    expect(clampUserZoomOffset(1.5)).toBe(1.5);
  });
});
