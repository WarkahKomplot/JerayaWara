import React from 'react';
import { Clock, CreditCard, X, ChevronRight } from 'lucide-react';
import { RouteResult } from '../../services/routing/types';
import { TollBreakdown } from '../../services/toll/types';

export interface TripSummaryDrawerProps {
  route: RouteResult;
  tollBreakdown: TollBreakdown | null;
  onOpenTolls: () => void;
  onEndNavigation: () => void;
  isFoldable?: boolean;
}

export const TripSummaryDrawer: React.FC<TripSummaryDrawerProps> = ({
  route,
  tollBreakdown,
  onOpenTolls,
  onEndNavigation,
  isFoldable = false
}) => {
  const calculateETA = (minutes: number) => {
    const d = new Date(Date.now() + minutes * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div
      className={`rounded-3xl bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl border border-slate-700/60 transition-all ${
        isFoldable ? 'w-full' : 'w-full max-w-lg mx-auto'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {route.durationMinutes}
            </span>
            <span className="text-sm font-semibold text-slate-400">min</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-base font-bold text-slate-300">
              {route.distanceKm} km
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>ETA {calculateETA(route.durationMinutes)}</span>
            {route.destinationName && (
              <>
                <span>•</span>
                <span className="truncate max-w-[180px]">{route.destinationName}</span>
              </>
            )}
          </div>
        </div>

        {/* Toll Cost Badge Button */}
        {tollBreakdown && (
          <button
            onClick={onOpenTolls}
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 transition-all active:scale-95 border ${
              tollBreakdown.totalCost > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Toll Fares
              </div>
              <div className="text-xs font-black">
                {tollBreakdown.totalCost > 0
                  ? `RM ${tollBreakdown.totalCost.toFixed(2)}`
                  : 'Free'}
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </button>
        )}
      </div>

      {/* Stop / Cancel Action */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
        <button
          onClick={onEndNavigation}
          className="flex items-center gap-2 rounded-xl bg-red-600/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-600/30 transition-all border border-red-500/30"
        >
          <X className="h-4 w-4" />
          <span>Exit Navigation</span>
        </button>

        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live GPS Route
        </span>
      </div>
    </div>
  );
};
