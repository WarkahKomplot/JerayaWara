import Dexie, { Table } from 'dexie';

export interface FavoriteDestination {
  id: string;
  category: 'home' | 'work' | 'balik_kampung' | 'custom';
  title: string;
  subtitle: string;
  coordinates: [number, number]; // [lng, lat]
  createdAt: number;
}

export class FavoritesDatabase extends Dexie {
  favorites!: Table<FavoriteDestination, string>;

  constructor() {
    super('JerayaWaraFavoritesDB');
    this.version(1).stores({
      favorites: 'id, category, title, createdAt'
    });
  }
}

export const favoritesDb = new FavoritesDatabase();

export async function getFavorites(): Promise<FavoriteDestination[]> {
  try {
    return await favoritesDb.favorites.toArray();
  } catch {
    return [];
  }
}

export async function saveFavorite(
  fav: Omit<FavoriteDestination, 'createdAt'>
): Promise<void> {
  await favoritesDb.favorites.put({
    ...fav,
    createdAt: Date.now()
  });
}

export async function deleteFavorite(id: string): Promise<void> {
  await favoritesDb.favorites.delete(id);
}

