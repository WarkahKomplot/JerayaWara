import { describe, it, expect } from 'vitest';
import {
  analyzeRouteTraffic,
  isMalaysianPeakHour,
  getMalaysiaDateTime
} from '../../src/services/traffic/malaysiaTrafficEngine';

describe('Malaysian Peak-Hour Traffic Congestion Engine', () => {
  // Coordinates for a route between Kajang and Seremban via PLUS E2
  const kajangToSerembanRoute: [number, number][] = [
    [101.789, 2.993], // Kajang
    [101.765, 2.955], // Bangi
    [101.792, 2.812], // Nilai E2
    [101.890, 2.740], // Ainsdale
    [101.938, 2.725]  // Seremban
  ];

  it('accurately detects Malaysian Morning Rush Hour (07:30 - 09:30)', () => {
    // 2026-11-02 is a Monday. 08:15 AM Malaysia Time (UTC 00:15)
    const mondayMorningRush = new Date('2026-11-02T00:15:00Z');
    const myTime = getMalaysiaDateTime(mondayMorningRush);
    expect(myTime.hours).toBe(8);
    expect(myTime.minutes).toBe(15);
    expect(myTime.dayOfWeek).toBe(1); // Monday

    const peakCheck = isMalaysianPeakHour(mondayMorningRush);
    expect(peakCheck.isPeak).toBe(true);
    expect(peakCheck.peakType).toBe('morning_rush');
  });

  it('accurately detects Malaysian Evening Rush Hour (17:00 - 20:00)', () => {
    // 2026-11-03 is a Tuesday. 18:30 PM Malaysia Time (UTC 10:30)
    const tuesdayEveningRush = new Date('2026-11-03T10:30:00Z');
    const peakCheck = isMalaysianPeakHour(tuesdayEveningRush);
    expect(peakCheck.isPeak).toBe(true);
    expect(peakCheck.peakType).toBe('evening_rush');
  });

  it('accurately detects Friday Outbound Balik Kampung rush (16:30 - 21:00)', () => {
    // 2026-11-06 is a Friday. 17:45 PM Malaysia Time (UTC 09:45)
    const fridayEvening = new Date('2026-11-06T09:45:00Z');
    const peakCheck = isMalaysianPeakHour(fridayEvening);
    expect(peakCheck.isPeak).toBe(true);
    expect(peakCheck.peakType).toBe('friday_rush');
  });

  it('identifies smooth off-peak conditions at midnight or Sunday morning', () => {
    // 2026-11-04 Wednesday 02:00 AM Malaysia Time (UTC 18:00 on previous day)
    const midnight = new Date('2026-11-03T18:00:00Z');
    const peakCheck = isMalaysianPeakHour(midnight);
    expect(peakCheck.isPeak).toBe(false);
  });

  it('calculates significant congestion delay on PLUS E2 during evening peak', () => {
    const tuesdayEveningRush = new Date('2026-11-03T10:30:00Z'); // 18:30 MYT
    const freeFlowMinutes = 35; // Normal Kajang -> Seremban

    const analysis = analyzeRouteTraffic(
      kajangToSerembanRoute,
      freeFlowMinutes,
      'car',
      tuesdayEveningRush
    );

    expect(analysis.level).toBe('heavy');
    expect(analysis.delayMinutes).toBeGreaterThanOrEqual(12); // At least +12 mins delay
    expect(analysis.totalMinutes).toBe(freeFlowMinutes + analysis.delayMinutes);
    expect(analysis.label).toContain('Sesak');
    expect(analysis.corridorsDetected.length).toBeGreaterThan(0);
    expect(analysis.corridorsDetected.some(c => c.includes('E2') || c.includes('PLUS'))).toBe(true);
  });

  it('gives motorcycle mode a 75% congestion bypass discount in traffic', () => {
    const tuesdayEveningRush = new Date('2026-11-03T10:30:00Z');
    const freeFlowMinutes = 35;

    const carAnalysis = analyzeRouteTraffic(
      kajangToSerembanRoute,
      freeFlowMinutes,
      'car',
      tuesdayEveningRush
    );

    const motoAnalysis = analyzeRouteTraffic(
      kajangToSerembanRoute,
      freeFlowMinutes,
      'motorcycle',
      tuesdayEveningRush
    );

    expect(motoAnalysis.delayMinutes).toBeLessThan(carAnalysis.delayMinutes);
    // Motorcycles weave or use dedicated lanes, saving substantial time
    expect(motoAnalysis.delayMinutes).toBeLessThanOrEqual(Math.round(carAnalysis.delayMinutes * 0.35));
  });

  it('reports smooth travel during off-peak hours with zero or negligible delay', () => {
    const wednesdayMidnight = new Date('2026-11-04T15:00:00Z'); // 23:00 MYT
    const analysis = analyzeRouteTraffic(
      kajangToSerembanRoute,
      35,
      'car',
      wednesdayMidnight
    );

    expect(analysis.level).toBe('smooth');
    expect(analysis.delayMinutes).toBe(0);
    expect(analysis.label).toContain('Lancar');
  });
});
