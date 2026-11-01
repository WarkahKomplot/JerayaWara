import { describe, it, expect } from 'vitest';
import { checkFoldableUnfolded } from '../../src/hooks/useFoldableDetection';

describe('Foldable Screen Detection', () => {
  it('identifies standard smartphone portrait as not unfolded (9:19.5 aspect ratio)', () => {
    expect(checkFoldableUnfolded(390, 844)).toBe(false);
    expect(checkFoldableUnfolded(412, 915)).toBe(false);
  });

  it('identifies unfolded foldable screen (e.g. Galaxy Z Fold unfolded ~7.6" near square ~4:3)', () => {
    // Width > 600 and aspect ratio between 0.75 and 1.33
    expect(checkFoldableUnfolded(768, 880)).toBe(true);
    expect(checkFoldableUnfolded(800, 700)).toBe(true);
    expect(checkFoldableUnfolded(840, 840)).toBe(true);
  });
});

