import { describe, it, expect } from 'vitest';
import { resolveHeading } from '../../src/hooks/useGeolocation';

describe('resolveHeading', () => {
  it('uses the device-reported heading when available', () => {
    expect(resolveHeading([101.7, 3.1], [101.7, 3.2], 123)).toBe(123);
  });

  it('derives the bearing from consecutive fixes when heading is null', () => {
    // Moving due south
    expect(resolveHeading([101.7, 3.2], [101.7, 3.1], null)).toBeCloseTo(180, 0);
    // Moving due east
    expect(resolveHeading([101.7, 3.1], [101.8, 3.1], null)).toBeCloseTo(90, 0);
  });

  it('treats undefined/NaN headings as missing', () => {
    expect(resolveHeading([101.7, 3.2], [101.7, 3.1], undefined)).toBeCloseTo(180, 0);
    expect(resolveHeading([101.7, 3.2], [101.7, 3.1], NaN)).toBeCloseTo(180, 0);
  });

  it('returns 0 when there is no previous fix', () => {
    expect(resolveHeading(null, [101.7, 3.1], null)).toBe(0);
  });
});
