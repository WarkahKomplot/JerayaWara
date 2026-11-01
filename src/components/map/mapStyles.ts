import { AppTheme } from '../../hooks/useDeviceTheme';

export function getMapLibreStyle(theme: AppTheme): any {
  const isNight = theme === 'night';
  const backgroundColor = isNight ? '#090d16' : '#f8fafc';

  return {
    version: 8,
    name: `JerayaWara-${theme}`,
    sources: {
      'osm-tiles': {
        type: 'raster',
        // 100% Zero-API, open-source tiles that can be cached completely offline in IndexedDB
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': backgroundColor
        }
      },
      {
        id: 'raster-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19,
        // Night mode uses hardware WebGL shader filters directly on the canvas:
        // - Desaturates daytime colors into cool midnight highway tones
        // - Boosts contrast for road edge sharpness
        // - Dims brightness to prevent pupil glare during night driving
        // Zero external API calls or third-party tile keys required!
        paint: isNight
          ? {
              'raster-opacity': 0.75,
              'raster-saturation': -0.9,
              'raster-contrast': 0.35,
              'raster-brightness-max': 0.65,
              'raster-brightness-min': 0.05
            }
          : {
              'raster-opacity': 0.95,
              'raster-saturation': 0.05,
              'raster-contrast': 0.0
            }
      }
    ]
  };
}
