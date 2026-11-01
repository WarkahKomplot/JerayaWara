import { describe, it, expect } from 'vitest';
import { calculateRoute } from '../../src/services/routing/routingEngine';

describe('Routing Engine', () => {
  const klCoords: [number, number] = [101.693, 3.141];
  const serembanCoords: [number, number] = [101.938, 2.725];

  it('generates car route via PLUS expressway with toll plazas', () => {
    const route = calculateRoute(klCoords, serembanCoords, 'car');
    expect(route.distanceKm).toBeGreaterThan(40);
    expect(route.steps.length).toBeGreaterThan(1);
    expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
  });

  it('motorcycle route flags dedicated motorcycle lanes when available', () => {
    const route = calculateRoute(klCoords, serembanCoords, 'motorcycle');
    expect(route.profile).toBe('motorcycle');
    expect(route.steps.some(s => s.instruction.toLowerCase().includes('motosikal') || s.isMotorcycleLane)).toBe(true);
  });

  it('walker route avoids expressways and generates pedestrian instructions', () => {
    const route = calculateRoute([101.693, 3.141], [101.710, 3.150], 'walker');
    expect(route.profile).toBe('walker');
    expect(route.tollPlazaKeys.length).toBe(0);
  });
});
