import { describe, it, expect } from 'vitest';
import { calculateRouteTolls } from '../../src/services/toll/tollCalculator';

describe('Malaysia Toll Calculator', () => {
  it('calculates open system flat toll for car (e.g. MEX Salak Selatan)', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN'], 'car');
    expect(result.totalCost).toBe(2.00);
    expect(result.items[0].expressway).toBe('MEX E20');
  });

  it('exempts motorcycle tolls for standard expressways (RM 0.00)', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN', 'PLUS_SG_BESI'], 'motorcycle');
    expect(result.totalCost).toBe(0.00);
    expect(result.items.every(i => i.cost === 0)).toBe(true);
  });

  it('calculates closed-system PLUS toll correctly (e.g. Sungai Besi to Seremban)', () => {
    const result = calculateRouteTolls(['PLUS_E2_SG_BESI_SEREMBAN'], 'car');
    expect(result.totalCost).toBe(4.10);
  });

  it('returns zero and highway blocked notice for walker mode', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN'], 'walker');
    expect(result.totalCost).toBe(0);
    expect(result.note).toContain('Pedestrian');
  });
});
