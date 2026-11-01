import { describe, it, expect } from 'vitest';
import { exportRouteToGPX } from '../../src/services/favorites/gpxExporter';
import {
  getFavorites,
  saveFavorite,
  deleteFavorite
} from '../../src/services/favorites/favoritesStore';

describe('Favorites & GPX Route Export Engine', () => {
  it('generates valid GPX 1.1 XML string from route coordinates', () => {
    const coords: [number, number][] = [
      [101.6869, 3.1390],
      [101.7116, 3.1579]
    ];
    const gpx = exportRouteToGPX('KLCC Trip', coords);
    expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(gpx).toContain('<gpx version="1.1" creator="JerayaWara Malaysia Nav"');
    expect(gpx).toContain('<trkpt lat="3.139" lon="101.6869">');
    expect(gpx).toContain('<trkpt lat="3.1579" lon="101.7116">');
    expect(gpx).toContain('<name>KLCC Trip</name>');
  });

  it('saves, retrieves, and deletes favorites in IndexedDB', async () => {
    await saveFavorite({
      id: 'fav-home',
      category: 'home',
      title: 'Rumah (Bandar Baru Bangi)',
      subtitle: 'Seksyen 4, Bandar Baru Bangi',
      coordinates: [101.775, 2.955]
    });

    const favs = await getFavorites();
    expect(favs.some(f => f.category === 'home')).toBe(true);

    await deleteFavorite('fav-home');
    const afterDelete = await getFavorites();
    expect(afterDelete.some(f => f.id === 'fav-home')).toBe(false);
  });
});
