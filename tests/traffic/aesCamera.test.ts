import { describe, it, expect } from 'vitest';
import {
  MALAYSIA_AES_CAMERAS,
  findNearbyAESCamera,
  getLocalizedCameraName
} from '../../src/services/traffic/aesCameraData';

describe('AES Camera Proximity Detection', () => {
  it('contains verified major Malaysian expressway AES speed cameras', () => {
    expect(MALAYSIA_AES_CAMERAS.length).toBeGreaterThan(10);
    const slimRiver = MALAYSIA_AES_CAMERAS.find(c => c.id === 'aes-e1-slimriver-sb');
    expect(slimRiver).toBeDefined();
    expect(slimRiver?.speedLimitKmH).toBe(110);
  });

  it('detects AES camera when user is within 1.2 km threshold in legacy mode', () => {
    // Coordinate near Kajang SILK AES [101.7821, 2.9912]
    // ~500m away
    const userCoord: [number, number] = [101.7821, 2.9870];
    const alert = findNearbyAESCamera(userCoord, 1.2);

    expect(alert).not.toBeNull();
    expect(alert?.camera.name).toContain('Kajang SILK');
    expect(alert?.distanceMeters).toBeLessThan(1200);
    expect(alert?.camera.speedLimitKmH).toBe(90);
  });

  it('returns null when user is navigating on a route where the camera is on a separate parallel road', () => {
    // User is in Kajang town, driving on Route 1 / Jalan Semenyih heading South towards Mantin
    // Kajang SILK AES camera is at [101.7821, 2.9912], ~800m away on SILK E18
    const userCoord: [number, number] = [101.7920, 2.9900];
    const parallelRoute: [number, number][] = [
      [101.7920, 2.9900],
      [101.7930, 2.9800],
      [101.7950, 2.9600],
      [101.8000, 2.9400]
    ];

    const alert = findNearbyAESCamera({
      userCoord,
      routePolyline: parallelRoute,
      thresholdKm: 1.0
    });

    // Must be NULL because the camera on SILK is NOT on this route corridor!
    expect(alert).toBeNull();
  });

  it('detects AES camera when navigating along the exact highway corridor where camera is located', () => {
    // User is on PLUS E2 Southbound heading towards Kajang AES [101.7451, 2.9812]
    const userCoord: [number, number] = [101.7445, 2.9870]; // ~650m north on PLUS E2
    const highwayRoute: [number, number][] = [
      [101.7445, 2.9870],
      [101.7451, 2.9812], // passes right through the camera!
      [101.7512, 2.9612]
    ];

    const alert = findNearbyAESCamera({
      userCoord,
      routePolyline: highwayRoute,
      thresholdKm: 1.0
    });

    expect(alert).not.toBeNull();
    expect(alert?.camera.id).toBe('aes-e2-kajang-sb');
    expect(alert?.distanceMeters).toBeLessThan(1000);
  });

  it('filters out cameras behind vehicle when heading away in free cruising mode', () => {
    // User is at [101.7821, 2.9870], camera is North at [101.7821, 2.9912] (bearing ~0° North)
    // User is driving South (heading 180°) at 60 km/h away from camera
    const userCoord: [number, number] = [101.7821, 2.9870];
    const alert = findNearbyAESCamera({
      userCoord,
      heading: 180, // driving away from camera!
      speedKmH: 60,
      thresholdKm: 0.8
    });

    // Should NOT alert when driving in opposite direction away from camera
    expect(alert).toBeNull();
  });

  it('provides bilingual localized camera names in BM and EN', () => {
    const cam = MALAYSIA_AES_CAMERAS.find(c => c.id === 'aes-e1-slimriver-sb');
    expect(cam).toBeDefined();
    if (cam) {
      expect(getLocalizedCameraName(cam, 'ms')).toBe('AES Slim River (Arah Selatan)');
      expect(getLocalizedCameraName(cam, 'en')).toBe('AES Slim River (Southbound)');
    }
  });

  it('returns null when user is far away from all AES cameras', () => {
    // In deep jungle or remote point
    const userCoord: [number, number] = [102.5, 4.5];
    const alert = findNearbyAESCamera(userCoord, 1.2);
    expect(alert).toBeNull();
  });
});
