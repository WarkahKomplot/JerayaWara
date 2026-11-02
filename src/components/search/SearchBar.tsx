import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  X,
  Building2,
  Coffee,
  CornerUpRight,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Train,
  Navigation
} from 'lucide-react';
import { SearchItem } from '../../services/search/types';
import { searchDestinations } from '../../services/search/searchEngine';
import { Language, t } from '../../services/i18n/translations';

export interface SearchBarProps {
  onSelectDestination: (item: SearchItem) => void;
  isOnline: boolean;
  lang?: Language;
  userLocation?: [number, number];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectDestination,
  isOnline,
  lang = 'en',
  userLocation
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);

    const timer = setTimeout(() => {
      // Fall back to navigator.onLine if isOnline is undefined or false but browser has active internet connection
      const effectiveOnline = typeof isOnline === 'boolean' ? (isOnline || (typeof navigator !== 'undefined' && navigator.onLine)) : true;
      searchDestinations(query, effectiveOnline, userLocation).then(res => {
        if (isCurrent) {
          setResults(res);
          setIsOpen(true);
          setIsLoading(false);
        }
      }).catch(() => {
        if (isCurrent) setIsLoading(false);
      });
    }, 200);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query, isOnline]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rnr':
        return <Coffee className="h-4 w-4 text-amber-400" />;
      case 'toll_plaza':
        return <CornerUpRight className="h-4 w-4 text-emerald-400" />;
      case 'city':
        return <Building2 className="h-4 w-4 text-blue-400" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4 text-pink-400" />;
      case 'hospital':
        return <HeartPulse className="h-4 w-4 text-rose-400" />;
      case 'university':
        return <GraduationCap className="h-4 w-4 text-purple-400" />;
      case 'transit':
        return <Train className="h-4 w-4 text-amber-500" />;
      case 'pinned':
        return <Navigation className="h-4 w-4 text-cyan-400" />;
      default:
        return <MapPin className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto z-30">
      {/* Input Box */}
      <div className="relative flex items-center overflow-hidden rounded-2xl bg-slate-900/90 shadow-2xl backdrop-blur-xl border border-slate-700/60 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <div className="pl-4 text-slate-400">
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-blue-400" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(results.length > 0)}
          placeholder={t('searchPlaceholder', lang)}
          className="w-full bg-transparent px-3 py-3.5 text-sm font-medium text-white placeholder-slate-400 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="pr-4 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl py-2 divide-y divide-slate-800">
          {results.map(item => (
            <button
              key={item.id}
              type="button"
              onPointerDown={e => {
                // Prevent input blur before click registers on mobile/touch screens
                e.preventDefault();
              }}
              onClick={() => {
                onSelectDestination(item);
                setQuery(item.title);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-slate-800/80 active:bg-blue-600/20"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/50">
                {getCategoryIcon(item.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-white truncate">
                    {item.title}
                  </div>
                  {item.distanceKm !== undefined && (
                    <span className="flex-shrink-0 text-[11px] font-semibold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.5 rounded-md">
                      {item.distanceKm < 1
                        ? `${Math.round(item.distanceKm * 1000)} m`
                        : `${item.distanceKm} km`}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
