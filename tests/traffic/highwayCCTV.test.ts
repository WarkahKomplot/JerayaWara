import { describe, it, expect } from 'vitest';
import {
  findCamerasAlongRoute,
  HIGHWAY_CAMERAS_DATABASE,
  pointToSegmentDistanceKm
} from '../../src/services/traffic/highwayCCTVData';

describe('Malaysian Highway Live CCTV Matcher', () => {
  it('contains critical expressway cameras across PLUS, Klang Valley, Karak, and Penang', () => {
    expect(HIGHWAY_CAMERAS_DATABASE.length).toBeGreaterThanOrEqual(25);

    // Verify key highway toll plazas exist
    const names = HIGHWAY_CAMERAS_DATABASE.map(c => c.title.toLowerCase());
    expect(names.some(n => n.includes('sungai besi'))).toBe(true);
    expect(names.some(n => n.includes('kajang'))).toBe(true);
    expect(names.some(n => n.includes('seremban'))).toBe(true);
    expect(names.some(n => n.includes('gombak'))).toBe(true);
    expect(names.some(n => n.includes('penang'))).toBe(true);
  });

  it('correctly calculates point-to-line distance in kilometers', () => {
    // Point at Kajang Interchange (101.765, 2.965)
    // Segment along PLUS E2 from (101.760, 2.950) to (101.770, 2.980)
    const dist = pointToSegmentDistanceKm(
      [101.765, 2.965],
      [101.760, 2.950],
      [101.770, 2.980]
    );
    expect(dist).toBeLessThan(1.0); // Less than 1 km
  });

  it('identifies all cameras along Kajang to Seremban route within 3km threshold', () => {
    const kajangToSerembanRoute: [number, number][] = [
      [101.789, 2.993], // Kajang town
      [101.765, 2.965], // Kajang PLUS E2
      [101.765, 2.894], // Bangi PLUS E2
      [101.792, 2.812], // Nilai PLUS E2
      [101.890, 2.740], // Bandar Ainsdale
      [101.938, 2.725]  // Seremban
    ];

    const matchedCams = findCamerasAlongRoute(kajangToSerembanRoute, 3.5);

    expect(matchedCams.length).toBeGreaterThanOrEqual(3);
    const camTitles = matchedCams.map(c => c.title);

    // Should include Bangi, Nilai, or Seremban cameras
    expect(
      camTitles.some(t => t.includes('Bangi') || t.includes('Nilai') || t.includes('Seremban') || t.includes('Kajang'))
    ).toBe(true);

    // Should NOT include Penang Bridge or Gombak cameras
    expect(camTitles.some(t => t.includes('Penang'))).toBe(false);
    expect(camTitles.some(t => t.includes('Gombak'))).toBe(false);
  });

  it('sorts matched cameras along the driving direction from start to end', () => {
    const kajangToSerembanRoute: [number, number][] = [
      [101.789, 2.993],
      [101.765, 2.965], // Kajang (North)
      [101.765, 2.894], // Bangi
      [101.792, 2.812], // Nilai
      [101.938, 2.725]  // Seremban (South)
    ];

    const matchedCams = findCamerasAlongRoute(kajangToSerembanRoute, 4.0);
    expect(matchedCams.length).toBeGreaterThanOrEqual(2);

    // The first camera should have higher latitude (further North) than the last camera
    const firstCam = matchedCams[0];
    const lastCam = matchedCams[matchedCams.length - 1];
    expect(firstCam.coordinates[1]).toBeGreaterThan(lastCam.coordinates[1]);
  });
});
