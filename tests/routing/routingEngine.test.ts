import { describe, it, expect } from 'vitest';
import { calculateRoute, calculateOfflineRoute } from '../../src/services/routing/routingEngine';

describe('Routing Engine', () => {
  const klCoords: [number, number] = [101.693, 3.141];
  const serembanCoords: [number, number] = [101.938, 2.725];
  const tapahCoords: [number, number] = [101.305, 4.192];

  it('generates real road route with rich coordinates and expressway toll plazas', async () => {
    const route = await calculateRoute(klCoords, serembanCoords, 'car', 'Seremban');
    expect(route.distanceKm).toBeGreaterThan(40);
    // Road geometry must have multiple waypoints following actual curves, not a straight 2-point line
    expect(route.coordinates.length).toBeGreaterThanOrEqual(6);
    expect(route.steps.length).toBeGreaterThan(1);
    expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
    expect(route.destinationName).toBe('Seremban');
  });

  it('motorcycle route flags dedicated motorcycle lanes and exemptions', async () => {
    const route = await calculateRoute(klCoords, serembanCoords, 'motorcycle');
    expect(route.profile).toBe('motorcycle');
    expect(route.steps.some(s => s.instruction.toLowerCase().includes('motosikal') || s.isMotorcycleLane)).toBe(true);
  });

  it('walker route avoids expressways and generates pedestrian instructions', async () => {
    const route = await calculateRoute([101.693, 3.141], [101.710, 3.150], 'walker');
    expect(route.profile).toBe('walker');
    expect(route.tollPlazaKeys.length).toBe(0);
  });

  it('offline highway snapper traces along real PLUS E1 curves instead of straight line to Tapah', () => {
    const offlineRoute = calculateOfflineRoute(klCoords, tapahCoords, 'car', 'Tapah R&R');
    expect(offlineRoute.distanceKm).toBeGreaterThan(100);
    // Must snap through PLUS E1 waypoints (Rawang, Tg Malim, Slim River, Sungkai, Bidor, Tapah)
    expect(offlineRoute.coordinates.length).toBeGreaterThanOrEqual(10);
    expect(offlineRoute.steps.some(s => s.instruction.includes('E1') || s.instruction.includes('PLUS'))).toBe(true);
    expect(offlineRoute.tollPlazaKeys).toContain('PLUS_E1_TAPAH');
  });
});
