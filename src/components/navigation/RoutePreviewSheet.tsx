import React from 'react';
import { Navigation, Clock, Route as RouteIcon, Coins, X, Wifi, WifiOff } from 'lucide-react';
import { RouteResult } from '../../services/routing/types';
import { TollBreakdown } from '../../services/toll/types';
import { Language } from '../../services/i18n/translations';

export interface RoutePreviewSheetProps {
  route: RouteResult | null;
  tolls: TollBreakdown | null;
  isCalculating: boolean;
  /** Honest failure message (e.g. no connection) shown when route is null. */
  errorMessage?: string | null;
  lang?: Language;
  onStart: () => void;
  onCancel: () => void;
}

/**
 * Pre-departure route summary: distance, ETA (traffic-adjusted), toll total,
 * and the data source. Navigation starts only on explicit "Start" — the daily
 * pattern of preview-then-go instead of instant navigation on selection.
 */
export const RoutePreviewSheet: React.FC<RoutePreviewSheetProps> = ({
  route,
  tolls,
  isCalculating,
  errorMessage,
  lang = 'ms',
  onStart,
  onCancel
}) => {
  if (isCalculating) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2">
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900/95 border border-slate-700 px-4 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur">
          <Navigation className="h-4 w-4 animate-pulse text-sky-400" />
          {lang === 'ms' ? 'Mengira laluan...' : 'Calculating route...'}
        </div>
      </div>
    );
  }

  // Honest failure: routing is online-only, so no connection means no route.
  if (!route && errorMessage) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2">
        <div className="overflow-hidden rounded-2xl bg-slate-900/95 border border-amber-700 shadow-2xl backdrop-blur text-white">
          <div className="flex items-start gap-3 px-4 py-4">
            <WifiOff className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{errorMessage}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {lang === 'ms'
                  ? 'JerayaWara hanya menggunakan data jalan sebenar — tiada laluan karangan.'
                  : 'JerayaWara only uses real road data — no fabricated routes.'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white flex-shrink-0"
              aria-label={lang === 'ms' ? 'Batal' : 'Cancel'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!route) return null;

  const trafficDelay = route.traffic?.delayMinutes ?? 0;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,26rem)] -translate-x-1/2">
      <div className="overflow-hidden rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur text-white">
        {/* Header: destination + source badge */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-sky-400 flex-shrink-0">
              <Navigation className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{route.destinationName}</p>
              <p className="flex items-center gap-1 text-[10px] text-slate-400">
                <Wifi className="h-3 w-3" />
                {lang === 'ms' ? 'Laluan jalan sebenar' : 'Real road route'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white flex-shrink-0"
            aria-label={lang === 'ms' ? 'Batal' : 'Cancel'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <RouteIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold leading-tight">{route.distanceKm} km</p>
              <p className="text-[10px] text-slate-500">{lang === 'ms' ? 'Jarak' : 'Distance'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold leading-tight">
                {route.durationMinutes} min
                {trafficDelay > 0 && (
                  <span className="ml-1 text-[10px] font-semibold text-amber-400">+{trafficDelay}</span>
                )}
              </p>
              <p className="text-[10px] text-slate-500">{lang === 'ms' ? 'Masa' : 'ETA'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold leading-tight">
                RM {(tolls?.totalCost ?? 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">{lang === 'ms' ? 'Tol' : 'Tolls'}</p>
            </div>
          </div>
        </div>

        {/* Traffic note */}
        {route.traffic && route.traffic.delayMinutes >= 5 && (
          <div className="px-4 pb-2">
            <p className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-300">
              {route.traffic.labelEn} — {route.traffic.reason}
            </p>
          </div>
        )}

        {/* Start button */}
        <div className="p-3">
          <button
            onClick={onStart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all"
          >
            <Navigation className="h-4 w-4" />
            {lang === 'ms' ? 'Mula Navigasi' : 'Start Navigation'}
          </button>
        </div>
      </div>
    </div>
  );
};
