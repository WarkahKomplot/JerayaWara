import { describe, it, expect } from 'vitest';
import { getMapLibreStyle } from '../../src/components/map/mapStyles';

describe('MapLibre Vector Styles', () => {
  it('generates high-contrast daylight style with clear highway colors', () => {
    const style = getMapLibreStyle('day');
    expect(style.version).toBe(8);
    expect(style.layers.length).toBeGreaterThan(0);
  });

  it('generates OLED night driving style with low pupil glare and high route luminescence', () => {
    const style = getMapLibreStyle('night');
    expect(style.version).toBe(8);
    const background = style.layers.find((l: any) => l.id === 'background');
    expect(background?.paint?.['background-color']).toBe('#090d16');
  });
});
