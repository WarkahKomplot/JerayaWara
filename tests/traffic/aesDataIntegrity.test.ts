import { describe, it, expect } from 'vitest';
import { MALAYSIA_AES_CAMERAS } from '../../src/services/traffic/aesCameraData';

describe('AES camera data integrity', () => {
  it('keeps IDs unique, coordinates in Malaysia and plausible limits/bearings', () => {
    const ids = new Set<string>();

    for (const camera of MALAYSIA_AES_CAMERAS) {
      expect(ids.has(camera.id)).toBe(false);
      ids.add(camera.id);
      expect(camera.coordinates[0]).toBeGreaterThanOrEqual(99);
      expect(camera.coordinates[0]).toBeLessThanOrEqual(120);
      expect(camera.coordinates[1]).toBeGreaterThanOrEqual(0.8);
      expect(camera.coordinates[1]).toBeLessThanOrEqual(7.6);
      expect([80, 90, 110]).toContain(camera.speedLimitKmH);
      if (camera.bearing !== undefined) {
        expect(camera.bearing).toBeGreaterThanOrEqual(0);
        expect(camera.bearing).toBeLessThan(360);
      }
    }
  });
});
