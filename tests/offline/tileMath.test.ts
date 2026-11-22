import { describe, it, expect } from 'vitest';
import {
  cameraZoomToTileZoom,
  DEFAULT_PRELOAD_ZOOM_LEVELS,
  NAVIGATION_TILE_ZOOM
} from '../../src/services/offline/tileMath';

describe('Raster tile zoom math', () => {
  it('maps the follow camera to the z18 tiles MapLibre requests for 256px raster tiles', () => {
    expect(cameraZoomToTileZoom(16.8)).toBe(18);
    expect(NAVIGATION_TILE_ZOOM).toBe(18);
  });

  it('derives preload zooms covering route overview through driving', () => {
    expect(DEFAULT_PRELOAD_ZOOM_LEVELS).toEqual([16, 17, 18]);
  });

  it('does not apply the raster offset to 512px sources', () => {
    expect(cameraZoomToTileZoom(16.8, 512)).toBe(17);
  });
});
