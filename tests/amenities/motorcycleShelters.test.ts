import { describe, it, expect } from 'vitest';
import {
  findNearbyMotorcycleShelter,
  getAllMotorcycleShelters
} from '../../src/services/amenities/motorcycleSheltersData';

describe('Motorcycle Rain Shelter Radar', () => {
  it('loads verified expressway motorcycle overhead bridge shelters', () => {
    const shelters = getAllMotorcycleShelters();
    expect(shelters.length).toBeGreaterThanOrEqual(8);
    expect(shelters.some(s => s.expressway.includes('PLUS') || s.expressway.includes('E1'))).toBe(true);
    expect(shelters.some(s => s.expressway.includes('Federal') || s.expressway.includes('Route 2'))).toBe(true);
  });

  it('detects nearest rain shelter when motorcycle mode is active and raining', () => {
    // Near PLUS KM 445 Rawang overhead bridge
    const detected = findNearbyMotorcycleShelter([101.579, 3.321], true, 'motorcycle', 3.0);
    expect(detected).not.toBeNull();
    expect(detected?.name).toContain('Pondok Teduhan');
  });

  it('does not trigger shelter alert when car mode is active even if raining', () => {
    const detected = findNearbyMotorcycleShelter([101.579, 3.321], true, 'car', 3.0);
    expect(detected).toBeNull();
  });

  it('does not trigger shelter alert when sunny even in motorcycle mode', () => {
    const detected = findNearbyMotorcycleShelter([101.579, 3.321], false, 'motorcycle', 3.0);
    expect(detected).toBeNull();
  });
});
