import { describe, it, expect } from 'vitest';
import {
  MALAYSIA_AES_CAMERAS,
  findNearbyAESCamera,
  getBearing
} from '../../src/services/traffic/aesCameraData';

const camera = MALAYSIA_AES_CAMERAS.find(item => item.id === 'aes-skve')!;

/** Straight 30 m-spaced corridor through the camera, matching its bearing. */
function corridor(): [number, number][] {
  const [lng, lat] = camera.coordinates;
  const bearing = ((camera.bearing ?? 90) * Math.PI) / 180;
  const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
  const points: [number, number][] = [];
  for (let offset = -3000; offset <= 500; offset += 30) {
    points.push([
      lng + (Math.sin(bearing) * offset) / metersPerDegLng,
      lat + (Math.cos(bearing) * offset) / 110574
    ]);
  }
  return points;
}

function positionBefore(route: [number, number][], gapMeters: number): [number, number] {
  return route[Math.round((3000 - gapMeters) / 30)];
}

describe('AES alert distance precision', () => {
  const route = corridor();
  const heading = getBearing(route[1], route[2]);

  it('does not alert for a camera 2.5 km ahead along a dense polyline', () => {
    const alert = findNearbyAESCamera({
      userCoord: positionBefore(route, 2500),
      routePolyline: route,
      heading,
      speedKmH: 90,
      thresholdKm: 1.0
    });

    expect(alert).toBeNull();
  });

  it('reports the real along-route distance instead of collapsing to 50 m', () => {
    const alert = findNearbyAESCamera({
      userCoord: positionBefore(route, 800),
      routePolyline: route,
      heading,
      speedKmH: 90,
      thresholdKm: 1.0
    });

    expect(alert).not.toBeNull();
    expect(alert?.distanceMeters).toBeGreaterThan(700);
    expect(alert?.distanceMeters).toBeLessThan(900);
  });

  it('still alerts when the camera is genuinely close', () => {
    const alert = findNearbyAESCamera({
      userCoord: positionBefore(route, 400),
      routePolyline: route,
      heading,
      speedKmH: 90,
      thresholdKm: 1.0
    });

    expect(alert).not.toBeNull();
    expect(alert?.distanceMeters).toBeGreaterThan(350);
    expect(alert?.distanceMeters).toBeLessThan(450);
  });
});
