import React, { useState } from 'react';
import { Clock, CreditCard, X, ChevronRight, ListOrdered, ChevronDown, ChevronUp, Milestone, Camera } from 'lucide-react';
import { RouteResult } from '../../services/routing/types';
import { TollBreakdown } from '../../services/toll/types';

export interface TripSummaryDrawerProps {
  route: RouteResult;
  tollBreakdown: TollBreakdown | null;
  onOpenTolls: () => void;
  onEndNavigation: () => void;
  isFoldable?: boolean;
  onSelectStep?: (index: number) => void;
  currentStepIndex?: number;
  onOpenCCTV?: () => void;
}

export const TripSummaryDrawer: React.FC<TripSummaryDrawerProps> = ({
  route,
  tollBreakdown,
  onOpenTolls,
  onEndNavigation,
  isFoldable = false,
  onSelectStep,
  currentStepIndex = 0,
  onOpenCCTV
}) => {
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);

  const calculateETA = (minutes: number) => {
    const d = new Date(Date.now() + minutes * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Find major highways or corridors mentioned in steps
  const corridorNames = route.steps
    .map(s => {
      const match = s.instruction.match(/(PLUS\s+E\d+|E\d+|Lebuhraya[^\s,)]+|Federal Highway|KESAS|MEX|LDP|SPRINT|DUKE|Penang Bridge)/i);
      return match ? match[0] : null;
    })
    .filter((name, idx, arr): name is string => !!name && arr.indexOf(name) === idx);

  const primaryCorridor = corridorNames.length > 0 ? corridorNames.slice(0, 2).join(' → ') : null;

  return (
    <div
      className={`rounded-3xl bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl border border-slate-700/60 transition-all ${
        isFoldable ? 'w-full' : 'w-full max-w-lg mx-auto'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>ETA {calculateETA(route.durationMinutes)}</span>
            </div>
            {route.destinationName && (
              <>
                <span>•</span>
                <span className="truncate max-w-[160px] font-semibold text-slate-300">
                  {route.destinationName}
                </span>
              </>
            )}
          </div>

          {/* Traffic Condition Badge */}
          {route.traffic && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border"
                style={{
                  backgroundColor: `${route.traffic.colorHex}25`,
                  borderColor: `${route.traffic.colorHex}60`,
                  color: route.traffic.colorHex
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: route.traffic.colorHex }}
                />
                {route.traffic.label}
                {route.traffic.delayMinutes > 0 && ` (+${route.traffic.delayMinutes}m)`}
              </span>
              {route.traffic.level === 'heavy' && (
                <span className="text-[10px] text-amber-300 font-medium truncate max-w-[200px]">
                  {route.traffic.reason}
                </span>
              )}
            </div>
          )}

          {/* Primary Highway Corridor Badge */}
          {primaryCorridor && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
              <Milestone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>via {primaryCorridor}</span>
            </div>
          )}
        </div>

        {/* Action Badges Row (Tolls & Live CCTV) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Live Highway CCTV Button */}
          {route.cameras && route.cameras.length > 0 && onOpenCCTV && (
            <button
              onClick={onOpenCCTV}
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-all active:scale-95 border bg-sky-500/15 border-sky-500/40 text-sky-400 hover:bg-sky-500/25"
              title="Lihat Suapan Kamera CCTV Lebuhraya"
            >
              <div className="relative">
                <Camera className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                  CCTV Live
                </div>
                <div className="text-xs font-black">
                  {route.cameras.length} Cams
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>
          )}

          {/* Toll Cost Badge Button */}
          {tollBreakdown && (
            <button
              onClick={onOpenTolls}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 transition-all active:scale-95 border ${
                tollBreakdown.totalCost > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <div className="text-left">
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">
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
      </div>

      {/* Expandable Step-by-Step Road Itinerary */}
      <div className="mt-3">
        <button
          onClick={() => setIsStepsExpanded(prev => !prev)}
          className="flex w-full items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-sky-400" />
            <span>Route Steps & Roads ({route.steps.length} turns)</span>
          </div>
          {isStepsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isStepsExpanded && (
          <div className="mt-2 max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/80">
            {route.steps.map((step, idx) => (
              <div
                key={step.id || idx}
                onClick={() => onSelectStep?.(idx)}
                className={`cursor-pointer rounded-lg p-2 text-xs transition-colors ${
                  idx === currentStepIndex
                    ? 'bg-blue-600/20 text-white font-bold border border-blue-500/40'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-bold text-sky-400">Step {idx + 1}</span>
                  <span>{step.distanceMeters > 0 ? `${step.distanceMeters >= 1000 ? `${(step.distanceMeters/1000).toFixed(1)} km` : `${step.distanceMeters} m`}` : ''}</span>
                </div>
                <div>{step.instruction}</div>
                {step.laneGuidance && (
                  <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                    {step.laneGuidance}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stop / Cancel Action */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
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
