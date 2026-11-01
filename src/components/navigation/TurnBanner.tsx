import React from 'react';
import {
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  RotateCw,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { ManeuverType } from '../../services/routing/types';

export interface TurnBannerProps {
  instruction: string;
  distanceMeters: number;
  maneuver: ManeuverType;
  laneGuidance?: string;
  speedLimit?: number;
  currentSpeed?: number;
  isMotorcycleLane?: boolean;
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  instruction,
  distanceMeters,
  maneuver,
  laneGuidance,
  speedLimit,
  currentSpeed = 0,
  isMotorcycleLane
}) => {
  const renderManeuverIcon = () => {
    switch (maneuver) {
      case 'exit_right':
      case 'turn_right':
      case 'slight_right':
        return <CornerUpRight className="h-8 w-8 text-white" strokeWidth={2.5} />;
      case 'exit_left':
      case 'turn_left':
      case 'slight_left':
        return <CornerUpLeft className="h-8 w-8 text-white" strokeWidth={2.5} />;
      case 'roundabout':
        return <RotateCw className="h-8 w-8 text-white" strokeWidth={2.5} />;
      case 'arrive':
        return <MapPin className="h-8 w-8 text-emerald-400" strokeWidth={2.5} />;
      default:
        return <ArrowUp className="h-8 w-8 text-white" strokeWidth={2.5} />;
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl border border-slate-700/60 p-4 transition-all">
      {isMotorcycleLane && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
          <span>Dedicated Motorcycle Lane (Lorong Motosikal)</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Maneuver Icon Tile */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
          {renderManeuverIcon()}
        </div>

        {/* Turn Guidance Text */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            In {formatDistance(distanceMeters)}
          </div>
          <div className="text-lg font-bold leading-tight text-white truncate">
            {instruction}
          </div>
          {laneGuidance && (
            <div className="mt-1 text-xs font-medium text-sky-400">
              {laneGuidance}
            </div>
          )}
        </div>

        {/* Speed Limit Badge */}
        {speedLimit && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-red-600 bg-white font-black text-slate-900 shadow-md">
              <span className="text-sm font-black">{speedLimit}</span>
            </div>
            <div className="mt-1 text-[10px] font-bold text-slate-400">
              <span className="text-sky-400 font-extrabold">{currentSpeed}</span> km/h
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
