import { describe, it, expect } from 'vitest';
import { checkFoldableUnfolded, checkIsDesktop } from '../../src/hooks/useFoldableDetection';

describe('Foldable Screen & Desktop Detection', () => {
  it('identifies standard smartphone portrait as not unfolded and not desktop', () => {
    expect(checkFoldableUnfolded(390, 844)).toBe(false);
    expect(checkFoldableUnfolded(412, 915)).toBe(false);
    expect(checkIsDesktop(390, 844)).toBe(false);
    expect(checkIsDesktop(412, 915)).toBe(false);
  });

  it('identifies unfolded foldable screen (e.g. Galaxy Z Fold unfolded ~7.6" near square ~4:3)', () => {
    // Width > 600 and aspect ratio between 0.75 and 1.35
    expect(checkFoldableUnfolded(768, 880)).toBe(true);
    expect(checkFoldableUnfolded(800, 700)).toBe(true);
    expect(checkFoldableUnfolded(840, 840)).toBe(true);
    // Unfolded foldables are NOT classified as desktop
    expect(checkIsDesktop(768, 880)).toBe(false);
    expect(checkIsDesktop(840, 840)).toBe(false);
  });

  it('identifies desktop screens (1024px+ wide with landscape aspect ratio > 1.35)', () => {
    // Typical laptops & desktop monitors
    expect(checkIsDesktop(1280, 800)).toBe(true);
    expect(checkIsDesktop(1440, 900)).toBe(true);
    expect(checkIsDesktop(1920, 1080)).toBe(true);
    // Desktop is NOT classified as foldable
    expect(checkFoldableUnfolded(1280, 800)).toBe(false);
    expect(checkFoldableUnfolded(1920, 1080)).toBe(false);
  });
});


