import { describe, it, expect } from 'vitest';
import { getMapLibreStyle } from '../../src/components/map/mapStyles';

describe('MapLibre Vector Styles', () => {
  it('generates high-contrast daylight style with clear highway colors', () => {
    const style = getMapLibreStyle('day');
    expect(style.version).toBe(8);
    expect(style.layers.length).toBeGreaterThan(0);
    const tileUrl = style.sources['osm-tiles'].tiles[0];
    expect(tileUrl).toContain('tile.openstreetmap.org');
    expect(tileUrl).not.toContain('cartocdn');
  });

  it('generates zero-API night driving style with local WebGL dark shader filters', () => {
    const style = getMapLibreStyle('night');
    expect(style.version).toBe(8);
    const background = style.layers.find((l: any) => l.id === 'background');
    expect(background?.paint?.['background-color']).toBe('#090d16');

    // Must NOT require external Carto or proprietary API keys
    const tileUrl = style.sources['osm-tiles'].tiles[0];
    expect(tileUrl).toContain('tile.openstreetmap.org');
    expect(tileUrl).not.toContain('cartocdn');

    // Must contain WebGL night shader paint properties for contrast and low glare
    const rasterLayer = style.layers.find((l: any) => l.id === 'raster-layer');
    expect(rasterLayer?.paint?.['raster-saturation']).toBeLessThan(0);
    expect(rasterLayer?.paint?.['raster-contrast']).toBeGreaterThan(0);
    expect(rasterLayer?.paint?.['raster-brightness-max']).toBeLessThan(1);
  });
});
