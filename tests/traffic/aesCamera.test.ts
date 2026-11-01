import { describe, it, expect } from 'vitest';
import {
  MALAYSIA_AES_CAMERAS,
  findNearbyAESCamera
} from '../../src/services/traffic/aesCameraData';

describe('AES Camera Proximity Detection', () => {
  it('contains verified major Malaysian expressway AES speed cameras', () => {
    expect(MALAYSIA_AES_CAMERAS.length).toBeGreaterThan(10);
    const slimRiver = MALAYSIA_AES_CAMERAS.find(c => c.id === 'aes-e1-slimriver-sb');
    expect(slimRiver).toBeDefined();
    expect(slimRiver?.speedLimitKmH).toBe(110);
  });

  it('detects AES camera when user is within 1.2 km threshold', () => {
    // Coordinate near Kajang SILK AES [101.7821, 2.9912]
    // ~500m away
    const userCoord: [number, number] = [101.7821, 2.9870];
    const alert = findNearbyAESCamera(userCoord, 1.2);

    expect(alert).not.toBeNull();
    expect(alert?.camera.name).toContain('Kajang SILK');
    expect(alert?.distanceMeters).toBeLessThan(1200);
    expect(alert?.camera.speedLimitKmH).toBe(90);
  });

  it('returns null when user is far away from all AES cameras', () => {
    // In deep jungle or remote point
    const userCoord: [number, number] = [102.5, 4.5];
    const alert = findNearbyAESCamera(userCoord, 1.2);
    expect(alert).toBeNull();
  });
});

