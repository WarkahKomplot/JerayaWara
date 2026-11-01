import { describe, it, expect } from 'vitest';
import { calculateMalaysiaSolarTimes } from '../../src/services/solar/malaysiaSolar';

describe('Malaysia Astronomical Solar Calculation', () => {
  it('correctly calculates daylight vs night for Peninsular Malaysia (Kuala Lumpur)', () => {
    // Test at 12:30 PM (Midday)
    const midday = new Date('2026-11-01T12:30:00+08:00');
    const middayResult = calculateMalaysiaSolarTimes(midday, [101.693, 3.141]);

    expect(middayResult.isDaytime).toBe(true);
    expect(middayResult.locationDescription).toBe('Peninsular Malaysia');

    // Test at 23:30 PM (Late Night)
    const midnight = new Date('2026-11-01T23:30:00+08:00');
    const nightResult = calculateMalaysiaSolarTimes(midnight, [101.693, 3.141]);
    expect(nightResult.isDaytime).toBe(false);
  });

  it('calculates realistic Malaysian sunrise (~06:55 to 07:25 AM) and sunset (~19:00 to 19:35 PM)', () => {
    const testDate = new Date('2026-11-01T08:00:00+08:00');
    const klResult = calculateMalaysiaSolarTimes(testDate, [101.693, 3.141]);

    const sunriseHour = klResult.sunrise.getHours();
    const sunsetHour = klResult.sunset.getHours();

    expect(sunriseHour).toBeGreaterThanOrEqual(6);
    expect(sunriseHour).toBeLessThanOrEqual(7);

    expect(sunsetHour).toBeGreaterThanOrEqual(18);
    expect(sunsetHour).toBeLessThanOrEqual(19);

    expect(klResult.sunriseFormatted).toBeTruthy();
    expect(klResult.sunsetFormatted).toBeTruthy();
  });

  it('adjusts for East Malaysia longitude (Sabah / Sarawak earlier sunrise & sunset)', () => {
    const testDate = new Date('2026-11-01T12:00:00+08:00');
    // Kota Kinabalu, Sabah [116.073, 5.980]
    const sabahResult = calculateMalaysiaSolarTimes(testDate, [116.073, 5.980]);

    expect(sabahResult.locationDescription).toBe('Sabah / Sarawak (East MY)');
    // Sabah sunrise is typically ~55 minutes earlier than KL
    const klResult = calculateMalaysiaSolarTimes(testDate, [101.693, 3.141]);
    expect(sabahResult.sunrise.getTime()).toBeLessThan(klResult.sunrise.getTime());
    expect(sabahResult.sunset.getTime()).toBeLessThan(klResult.sunset.getTime());
  });
});
