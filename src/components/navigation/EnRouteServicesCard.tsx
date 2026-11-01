import React, { useState, useRef, useEffect } from 'react';
import { Fuel, Zap, ShieldAlert, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { EnRouteAmenityWithDistance } from '../../services/amenities/types';
import { MotorcycleShelter } from '../../services/amenities/motorcycleSheltersData';
import { Language, t } from '../../services/i18n/translations';
import { getPlugShareUrl, syncOsmEvStations } from '../../services/amenities/osmEvService';

export interface EnRouteServicesCardProps {
  amenities: EnRouteAmenityWithDistance[];
  activeCategory: 'all' | 'petrol' | 'ev';
  onSelectCategory: (category: 'all' | 'petrol' | 'ev') => void;
  shelter?: MotorcycleShelter | null;
  lang?: Language;
  onRefreshAmenities?: () => void;
}

export const EnRouteServicesCard: React.FC<EnRouteServicesCardProps> = React.memo(({
  amenities,
  activeCategory,
  onSelectCategory,
  shelter,
  lang = 'ms',
  onRefreshAmenities
}) => {
  const [isSyncingEv, setIsSyncingEv] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const handleSyncOsmEv = async () => {
    setIsSyncingEv(true);
    setSyncStatusMsg(lang === 'ms' ? 'Memuat turun stesen EV...' : 'Fetching live EV stations...');
    try {
      const result = await syncOsmEvStations();
      if (result.success) {
        setSyncStatusMsg(
          lang === 'ms'
            ? `${result.stations.length} ${t('evSyncedSuccess', lang)}`
            : `${result.stations.length} ${t('evSyncedSuccess', lang)}`
        );
        onRefreshAmenities?.();
      } else {
        setSyncStatusMsg(
          lang === 'ms'
            ? 'Stesen luar talian sedia ada'
            : 'Using cached offline stations'
        );
      }
    } catch {
      setSyncStatusMsg(
        lang === 'ms' ? 'Mod luar talian aktif' : 'Offline mode active'
      );
    } finally {
      setIsSyncingEv(false);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };
  const getBrandBadge = (type: string, brand: string) => {
    switch (type) {
      case 'petronas':
        return (
          <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-800/60">
            PETRONAS
          </span>
        );
      case 'shell':
        return (
          <span className="rounded-md bg-amber-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400 border border-amber-800/60">
            SHELL
          </span>
        );
      case 'caltex':
        return (
          <span className="rounded-md bg-rose-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-400 border border-rose-800/60">
            CALTEX
          </span>
        );
      case 'ev_fast_charger':
        return (
          <span className="rounded-md bg-cyan-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 border border-cyan-800/60">
            {brand || 'EV FAST'}
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
            {brand}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-3.5 shadow-xl backdrop-blur-md">
      {/* Header & Category Filter Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-blue-400" />
          <span>{t('alongRoute', lang)}</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/60">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('allCategory', lang)}
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('petrol')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeCategory === 'petrol'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="h-3 w-3" />
            <span>{t('petrolCategory', lang)}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory('ev')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              activeCategory === 'ev'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>{t('evCategory', lang)}</span>
          </button>
        </div>
      </div>

      {/* EV Sync Bar (OpenStreetMap Overpass Sync) */}
      {activeCategory === 'ev' && (
        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 text-cyan-200">
          <span className="text-[10px] text-cyan-300 font-medium truncate pr-2">
            {syncStatusMsg || (lang === 'ms' ? 'Data OpenStreetMap & PlugShare' : 'OpenStreetMap & PlugShare data')}
          </span>
          <button
            type="button"
            data-testid="sync-osm-ev-btn"
            onClick={handleSyncOsmEv}
            disabled={isSyncingEv}
            className="inline-flex items-center shrink-0 gap-1 rounded-lg bg-cyan-900/80 hover:bg-cyan-800 px-2 py-1 text-[10px] font-bold text-cyan-200 transition-colors disabled:opacity-50"
            title={lang === 'ms' ? 'Kemas kini stesen EV daripada Overpass OSM' : 'Sync EV stations from OSM Overpass'}
          >
            <RefreshCw className={`h-3 w-3 ${isSyncingEv ? 'animate-spin' : ''}`} />
            <span>{isSyncingEv ? t('syncingOsmEv', lang) : t('syncOsmEv', lang)}</span>
          </button>
        </div>
      )}

      {/* Motorcycle Rain Shelter Alert Banner */}
      {shelter && (
        <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-blue-950/70 border border-blue-800/70 p-2.5 text-blue-200">
          <ShieldAlert className="h-5 w-5 text-blue-400 flex-shrink-0 animate-bounce" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-white truncate">
              {shelter.name}
            </div>
            <div className="text-[10px] text-blue-300">
              {shelter.expressway} {shelter.kmMarker} · {lang === 'ms' ? 'Teluk Berteduh Motosikal' : 'Motorcycle Rain Shelter'}
            </div>
          </div>
        </div>
      )}

      {/* Amenities List */}
      <div className="mt-3 divide-y divide-slate-800/60">
        {amenities.length === 0 ? (
          <div className="py-3 text-center text-xs text-slate-500 font-medium">
            {t('noAmenitiesFound', lang)}
          </div>
        ) : (
          amenities.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/60">
                  {item.type === 'ev_fast_charger' ? (
                    <Zap className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Fuel className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white truncate">
                      {item.name}
                    </span>
                    {getBrandBadge(item.type, item.brand)}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.expressway} {item.kmMarker ? `· ${item.kmMarker}` : ''}{' '}
                    {item.evSpecs ? `· ${item.evSpecs.maxKw}kW DC` : ''}
                  </div>
                  {item.type === 'ev_fast_charger' && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {item.evSpecs?.plugs && item.evSpecs.plugs.length > 0 && (
                        <span className="text-[9px] font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                          {item.evSpecs.plugs.join(' · ')}
                        </span>
                      )}
                      <a
                        href={getPlugShareUrl(item.coordinates)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`plugshare-link-${item.id}`}
                        className="inline-flex items-center gap-1 rounded bg-sky-950 hover:bg-sky-900 border border-sky-700/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 transition-colors"
                        title={lang === 'ms' ? 'Buka ulasan & ketersediaan di PlugShare' : 'Open community check-in & photos on PlugShare'}
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="h-2.5 w-2.5 text-sky-400" />
                        <span>PlugShare ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm font-black font-mono text-cyan-400">
                  {item.distanceKm.toFixed(1)} km
                </span>
                <span className="text-[9px] font-semibold uppercase text-slate-500">
                  {t('cameraDistance', lang)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

