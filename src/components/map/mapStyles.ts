import { AppTheme } from '../../hooks/useDeviceTheme';

export function getMapLibreStyle(theme: AppTheme): any {
  const isNight = theme === 'night';

  const backgroundColor = isNight ? '#090d16' : '#f8fafc';
  const waterColor = isNight ? '#0f172a' : '#bfdbfe';
  const landuseColor = isNight ? '#111827' : '#e2e8f0';
  const roadColor = isNight ? '#1e293b' : '#ffffff';
  const highwayColor = isNight ? '#334155' : '#fde047';
  const textColor = isNight ? '#94a3b8' : '#334155';

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
