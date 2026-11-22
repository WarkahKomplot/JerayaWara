/**
 * MapLibre tile-zoom math for the raster basemap.
 *
 * MapLibre's transform works in 512 px tiles, while the OpenStreetMap raster
 * source is 256 px, so the tile zoom it requests is one level deeper than the
 * camera zoom (`scaleZoom(512 / 256) = 1`). Raster sources also round rather
 * than floor (`roundZoom = true`). Getting this wrong is why the corridor
 * preloader used to cache z14–16 while the navigation camera requested z18.
 */

export const MAPLIBRE_TRANSFORM_TILE_SIZE = 512;
export const RASTER_SOURCE_TILE_SIZE = 256;

/** Camera zoom used while following the puck during active navigation. */
export const NAVIGATION_CAMERA_ZOOM = 16.8;

/** Converts a camera zoom to the raster tile zoom MapLibre will request. */
export function cameraZoomToTileZoom(
  cameraZoom: number,
  sourceTileSize: number = RASTER_SOURCE_TILE_SIZE
): number {
  const offset = Math.log2(MAPLIBRE_TRANSFORM_TILE_SIZE / sourceTileSize);
  return Math.max(0, Math.round(cameraZoom + offset));
}

/** z18 with the current 256 px OSM source at camera zoom 16.8. */
export const NAVIGATION_TILE_ZOOM = cameraZoomToTileZoom(NAVIGATION_CAMERA_ZOOM);

/**
 * z16 is the route-overview camera (~15), z18 is turn-by-turn follow (16.8).
 * Preloading the levels in between keeps the map rendered when the driver zooms
 * out one step or the camera eases during a reroute.
 */
export const DEFAULT_PRELOAD_ZOOM_LEVELS: number[] = [
  NAVIGATION_TILE_ZOOM - 2,
  NAVIGATION_TILE_ZOOM - 1,
  NAVIGATION_TILE_ZOOM
];
