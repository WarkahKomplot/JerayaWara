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
        tiles: isNight
          ? [
              'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
            ]
          : [
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
        paint: {
          'raster-opacity': isNight ? 0.85 : 0.95
        }
      }
    ]
  };
}
