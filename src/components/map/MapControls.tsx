import React from 'react';
import { Plus, Minus, Compass, Navigation2, Route } from 'lucide-react';

export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetBearing: () => void;
  onRecenter: () => void;
  onToggle3D: () => void;
  is3D: boolean;
  bearing: number;
  hasActiveRoute?: boolean;
  onFitRouteOverview?: () => void;
  isNavigating?: boolean;
}

export const MapControls: React.FC<MapControlsProps> = React.memo(({
  onZoomIn,
  onZoomOut,
  onResetBearing,
  onRecenter,
  onToggle3D,
  is3D,
  bearing,
  hasActiveRoute = false,
  onFitRouteOverview,
  isNavigating = false
}) => {
  return (
    <div
      className={`absolute right-3.5 z-20 flex flex-col gap-2 transition-all duration-300 md:top-6 md:right-6 ${
        isNavigating ? 'top-44' : 'top-[218px]'
      }`}
    >
      {/* Route Overview Button (When navigating) */}
      {hasActiveRoute && onFitRouteOverview && (
        <button
          onClick={onFitRouteOverview}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all active:scale-95 animate-pulse"
          title="Route Overview: View full road path (Lihat Semua Laluan)"
        >
          <Route className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}

      {/* Compass Button */}
      <button
        onClick={onResetBearing}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/90 text-white shadow-lg backdrop-blur-md transition-all active:scale-95 dark:bg-slate-800/90"
        title="Reset North"
      >
        <Compass
          className="h-5 w-5 text-red-500 transition-transform duration-200"
          style={{ transform: `rotate(${-bearing}deg)` }}
        />
      </button>

      {/* Recenter GPS */}
      <button
        onClick={onRecenter}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
        title="Re-center My Location (Ikut Lokasi Saya)"
      >
        <Navigation2 className="h-5 w-5 fill-white" />
      </button>

      {/* 3D Perspective Toggle */}
      <button
        onClick={onToggle3D}
        className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-lg backdrop-blur-md transition-all active:scale-95 ${
          is3D
            ? 'bg-amber-500 text-slate-900 font-extrabold'
            : 'bg-slate-900/90 text-white dark:bg-slate-800/90'
        }`}
        title="Toggle 3D View"
      >
        <span className="text-xs font-bold tracking-tight">3D</span>
      </button>

      {/* Zoom In & Out */}
      <div className="flex flex-col overflow-hidden rounded-xl bg-slate-900/90 shadow-lg backdrop-blur-md dark:bg-slate-800/90">
        <button
          onClick={onZoomIn}
          className="flex h-11 w-11 items-center justify-center border-b border-slate-700/50 text-white active:bg-slate-700/50"
          title="Zoom In"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="flex h-11 w-11 items-center justify-center text-white active:bg-slate-700/50"
          title="Zoom Out"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
});
