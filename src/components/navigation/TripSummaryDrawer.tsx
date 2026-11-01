import React, { useState } from 'react';
import { Clock, CreditCard, X, ChevronRight, ListOrdered, ChevronDown, ChevronUp, Milestone, Download, Fuel } from 'lucide-react';
import { RouteResult } from '../../services/routing/types';
import { TollBreakdown } from '../../services/toll/types';
import { EnRouteAmenityWithDistance } from '../../services/amenities/types';
import { MotorcycleShelter } from '../../services/amenities/motorcycleSheltersData';
import { EnRouteServicesCard } from './EnRouteServicesCard';

export interface TripSummaryDrawerProps {
  route: RouteResult;
  tollBreakdown: TollBreakdown | null;
  onOpenTolls: () => void;
  onEndNavigation: () => void;
  isFoldable?: boolean;
  onSelectStep?: (index: number) => void;
  currentStepIndex?: number;
  onExportGpx?: () => void;
  amenities?: EnRouteAmenityWithDistance[];
  amenityCategory?: 'all' | 'petrol' | 'ev';
  onSelectAmenityCategory?: (cat: 'all' | 'petrol' | 'ev') => void;
  shelter?: MotorcycleShelter | null;
  trafficCongestion?: {
    level: string;
    label: string;
    color: string;
    speedKmh: number;
    delayMinutes: number;
    corridorName: string;
  };
  initialExpanded?: boolean;
}

export const TripSummaryDrawer: React.FC<TripSummaryDrawerProps> = ({
  route,
  tollBreakdown,
  onOpenTolls,
  onEndNavigation,
  isFoldable = false,
  onSelectStep,
  currentStepIndex = 0,
  onExportGpx,
  amenities,
  amenityCategory = 'all',
  onSelectAmenityCategory,
  shelter,
  trafficCongestion,
  initialExpanded = false
}) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(initialExpanded);
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [activeCat, setActiveCat] = useState<'all' | 'petrol' | 'ev'>(amenityCategory);

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

  // Ultra-compact bottom strip during active navigation
  if (!isDrawerExpanded && !isFoldable) {
    return (
      <div className="rounded-2xl bg-slate-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl border border-slate-700/60 w-full max-w-lg mx-auto flex items-center justify-between gap-3 animate-fadeIn">
        {/* Left: Quick ETA, Duration, Distance */}
        <div
          onClick={() => setIsDrawerExpanded(true)}
          className="flex-1 cursor-pointer select-none"
          title="Ketik untuk maklumat lanjut laluan"
        >
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              {route.durationMinutes}
            </span>
            <span className="text-xs font-semibold text-slate-400">min</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-sm font-bold text-slate-200">
              {route.distanceKm} km
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-semibold text-sky-400">
              ETA {calculateETA(route.durationMinutes)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
            {route.destinationName || 'Destinasi'}
          </div>
        </div>

        {/* Right: Expand Button & Exit Navigation Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsDrawerExpanded(true)}
            data-testid="expand-trip-drawer"
            className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-2 text-xs font-bold text-slate-300 border border-slate-700 transition-all active:scale-95"
            title="Papar butiran penuh laluan"
          >
            <ChevronUp className="h-4 w-4 text-slate-400" />
            <span className="hidden xs:inline">Info</span>
          </button>

          <button
            type="button"
            onClick={onEndNavigation}
            data-testid="exit-navigation-btn"
            className="flex items-center gap-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 px-3 py-2 text-xs font-bold text-rose-400 border border-rose-500/30 transition-all active:scale-95"
            title="Tamat Pandu Arah"
          >
            <X className="h-4 w-4" />
            <span>Tamat</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl border border-slate-700/60 transition-all ${
        isFoldable ? 'w-full' : 'w-full max-w-lg mx-auto'
      }`}
    >
      {/* Top Collapse Button for Expanded Sheet */}
      {!isFoldable && (
        <div className="flex justify-between items-center pb-2.5 mb-2 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Butiran Pandu Arah
          </span>
          <button
            type="button"
            onClick={() => setIsDrawerExpanded(false)}
            data-testid="collapse-trip-drawer"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
            title="Kecilkan butiran laluan"
          >
            <span>Kecilkan</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
          {(trafficCongestion || route.traffic) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400">LALULINTAS:</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border"
                style={{
                  backgroundColor: `${(trafficCongestion?.color || route.traffic?.colorHex || '#10b981')}25`,
                  borderColor: `${(trafficCongestion?.color || route.traffic?.colorHex || '#10b981')}60`,
                  color: trafficCongestion?.color || route.traffic?.colorHex || '#10b981'
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: trafficCongestion?.color || route.traffic?.colorHex || '#10b981' }}
                />
                {trafficCongestion?.label || route.traffic?.label}
                {((trafficCongestion?.delayMinutes || 0) > 0 || (route.traffic?.delayMinutes || 0) > 0) &&
                  ` (+${trafficCongestion?.delayMinutes || route.traffic?.delayMinutes}m)`}
              </span>
              {route.traffic?.level === 'heavy' && (
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

        {/* Toll Cost Badge Button */}
        {tollBreakdown && (
          <button
            onClick={onOpenTolls}
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 transition-all active:scale-95 border self-start sm:self-auto ${
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

      {/* En-Route Services Bar & Collapsible Card (Petrol, EV, Shelters) */}
      {((amenities && amenities.length > 0) || shelter) && (
        <div className="mt-3">
          <button
            type="button"
            data-testid="toggle-en-route-services"
            onClick={() => setIsServicesExpanded(prev => !prev)}
            aria-expanded={isServicesExpanded}
            className="flex w-full items-center justify-between rounded-2xl bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-300 border border-slate-700/60 transition-all active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Fuel className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-bold text-slate-200">
                {isServicesExpanded ? 'Stesen Minyak & EV Berdekatan' : 'Stesen Minyak & EV'}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                {amenities?.length || 0} berdekatan
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
              <span>{isServicesExpanded ? 'Sembunyi' : 'Papar'}</span>
              {isServicesExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </button>

          {isServicesExpanded && (
            <div className="mt-2.5">
              <EnRouteServicesCard
                amenities={amenities || []}
                activeCategory={activeCat}
                onSelectCategory={cat => {
                  setActiveCat(cat);
                  onSelectAmenityCategory?.(cat);
                }}
                shelter={shelter}
              />
            </div>
          )}
        </div>
      )}

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

      {/* Stop / Cancel & Export Actions */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onEndNavigation}
            className="flex items-center gap-2 rounded-xl bg-red-600/20 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-600/30 transition-all border border-red-500/30 active:scale-95"
          >
            <X className="h-4 w-4" />
            <span>Exit Navigation</span>
          </button>

          {onExportGpx && (
            <button
              onClick={onExportGpx}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-bold text-cyan-400 hover:bg-slate-700/80 transition-all border border-slate-700/60 active:scale-95"
              title="Muat turun laluan sebagai fail GPX"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Eksport GPX</span>
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live GPS Route
        </span>
      </div>
    </div>
  );
};
