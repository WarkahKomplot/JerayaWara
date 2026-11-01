import { describe, it, expect } from 'vitest';
import { findNearbyFloodHotspot, getAllFloodHotspots } from '../../src/services/safety/floodHotspotsData';

describe('Banjir Kilat (Flash Flood) Safety Radar', () => {
  it('loads verified Malaysian flood blackspots', () => {
    const spots = getAllFloodHotspots();
    expect(spots.length).toBeGreaterThanOrEqual(7);
    expect(spots.some(s => s.name.includes('Jalan Tun Razak'))).toBe(true);
    expect(spots.some(s => s.name.includes('Shah Alam'))).toBe(true);
  });

  it('detects Jalan Tun Razak underpass flood hotspot when raining within threshold', () => {
    // Near Jalan Tun Razak KL: [101.719, 3.171]
    const detected = findNearbyFloodHotspot([101.719, 3.171], true, 2.0);
    expect(detected).not.toBeNull();
    expect(detected?.name).toContain('Jalan Tun Razak');
  });

  it('returns null if driver is near flood hotspot but it is not raining', () => {
    const detected = findNearbyFloodHotspot([101.719, 3.171], false, 2.0);
    expect(detected).toBeNull();
  });

  it('returns null if driver is far from any flood hotspot even if raining', () => {
    // Middle of rural corridor far from hotspots
    const detected = findNearbyFloodHotspot([101.300, 3.800], true, 2.0);
    expect(detected).toBeNull();
  });
});
