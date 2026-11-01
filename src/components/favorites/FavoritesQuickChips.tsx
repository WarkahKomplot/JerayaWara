import React, { useEffect, useState } from 'react';
import { Home, Briefcase, Palmtree, X } from 'lucide-react';
import { FavoriteDestination, getFavorites, deleteFavorite } from '../../services/favorites/favoritesStore';

export interface FavoritesQuickChipsProps {
  onSelectFavorite: (fav: FavoriteDestination) => void;
  onAddFavorite?: (category: 'home' | 'work' | 'balik_kampung') => void;
  onRemoveFavorite?: (id: string, category: 'home' | 'work' | 'balik_kampung') => void;
  refreshTrigger?: number;
}

export const FavoritesQuickChips: React.FC<FavoritesQuickChipsProps> = ({
  onSelectFavorite,
  onAddFavorite,
  onRemoveFavorite,
  refreshTrigger = 0
}) => {
  const [favorites, setFavorites] = useState<FavoriteDestination[]>([]);

  useEffect(() => {
    getFavorites().then(setFavorites);
  }, [refreshTrigger]);

  const getFavByCategory = (category: 'home' | 'work' | 'balik_kampung') => {
    return favorites.find(f => f.category === category);
  };

  const handleRemove = async (e: React.MouseEvent, existing: FavoriteDestination, category: 'home' | 'work' | 'balik_kampung') => {
    e.stopPropagation();
    await deleteFavorite(existing.id);
    setFavorites(prev => prev.filter(f => f.id !== existing.id));
    onRemoveFavorite?.(existing.id, category);
  };

  const chips: {
    category: 'home' | 'work' | 'balik_kampung';
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      category: 'home',
      label: 'Rumah',
      icon: <Home className="h-3.5 w-3.5 text-blue-400" />
    },
    {
      category: 'work',
      label: 'Kerja',
      icon: <Briefcase className="h-3.5 w-3.5 text-amber-400" />
    },
    {
      category: 'balik_kampung',
      label: 'Balik Kampung',
      icon: <Palmtree className="h-3.5 w-3.5 text-emerald-400" />
    }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
      {chips.map(({ category, label, icon }) => {
        const existing = getFavByCategory(category);

        if (existing) {
          return (
            <div
              key={category}
              className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/70 shadow-md group transition-all"
            >
              <button
                type="button"
                onClick={() => onSelectFavorite(existing)}
                className="flex items-center gap-1.5 whitespace-nowrap pl-3 pr-1.5 py-1.5 text-xs font-bold text-white hover:text-sky-300 transition-all active:scale-95"
              >
                {icon}
                <span>{label}</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleRemove(e, existing, category)}
                data-testid={`remove-fav-${category}`}
                aria-label={`Reset ${label}`}
                title={`Reset ${label}`}
                className="p-1.5 mr-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors active:scale-90"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        }

        return (
          <button
            key={category}
            type="button"
            onClick={() => onAddFavorite?.(category)}
            className="flex items-center gap-1 whitespace-nowrap rounded-xl bg-slate-900/50 border border-dashed border-slate-700/60 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          >
            {icon}
            <span>+ {label}</span>
          </button>
        );
      })}
    </div>
  );
};
