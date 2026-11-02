import React from 'react';
import {
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  RotateCw,
  MapPin,
  ShieldAlert,
  Volume2,
  VolumeX,
  TrendingUp,
  GitFork
} from 'lucide-react';
import { ManeuverType } from '../../services/routing/types';
import { getLocalizedStepInstruction } from '../../services/i18n/translations';

export interface TurnBannerProps {
  instruction: string;
  distanceMeters: number;
  maneuver: ManeuverType;
  laneGuidance?: string;
  speedLimit?: number;
  currentSpeed?: number;
  isMotorcycleLane?: boolean;
  isVoiceEnabled?: boolean;
  onToggleVoice?: () => void;
  voiceLanguage?: 'ms' | 'en';
  onToggleVoiceLanguage?: () => void;
  exitNumber?: number;
}

export const TurnBanner: React.FC<TurnBannerProps> = React.memo(({
  instruction,
  distanceMeters,
  maneuver,
  laneGuidance,
  speedLimit,
  currentSpeed = 0,
  isMotorcycleLane,
  isVoiceEnabled = true,
  onToggleVoice,
  voiceLanguage = 'en',
  onToggleVoiceLanguage,
  exitNumber
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
      case 'flyover':
        return (
          <div className="flex flex-col items-center">
            <TrendingUp className="h-7 w-7 text-white animate-pulse" strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-wider text-sky-200">NAIK</span>
          </div>
        );
      case 'underpass':
        return (
          <div className="flex flex-col items-center">
            <GitFork className="h-7 w-7 text-amber-300" strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-wider text-amber-200">BAWAH</span>
          </div>
        );
      case 'roundabout':
        return (
          <div className="relative flex items-center justify-center">
            <RotateCw className="h-8 w-8 text-white" strokeWidth={2.5} />
            {exitNumber && exitNumber > 0 && (
              <span className="absolute text-xs font-black text-amber-300 font-mono">
                {exitNumber}
              </span>
            )}
          </div>
        );
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

  const displayedInstruction = voiceLanguage === 'ms'
    ? getLocalizedStepInstruction({ instruction, maneuver }, 'ms')
    : instruction;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl border border-slate-700/60 p-4 transition-all">
      {isMotorcycleLane && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
          <span>{voiceLanguage === 'ms' ? 'Lorong Motosikal Khas' : 'Dedicated Motorcycle Lane'}</span>
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
            {voiceLanguage === 'ms' ? 'Dalam' : 'In'} {formatDistance(distanceMeters)}
          </div>
          <div className="text-lg font-bold leading-tight text-white truncate">
            {displayedInstruction || instruction}
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

        {/* Voice Controls: Language Toggle & Mute/Unmute */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onToggleVoiceLanguage && (
            <button
              onClick={onToggleVoiceLanguage}
              className="flex h-11 px-2.5 items-center justify-center rounded-2xl border bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95 shadow-md text-xs font-black"
              title={`Tukar bahasa suara (Terkini: ${voiceLanguage === 'ms' ? 'Bahasa Melayu' : 'English'})`}
            >
              <span className={voiceLanguage === 'ms' ? 'text-sky-400 font-extrabold' : 'text-slate-500'}>BM</span>
              <span className="mx-0.5 text-slate-600">/</span>
              <span className={voiceLanguage === 'en' ? 'text-sky-400 font-extrabold' : 'text-slate-500'}>EN</span>
            </button>
          )}

          {onToggleVoice && (
            <button
              onClick={onToggleVoice}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all active:scale-95 shadow-md ${
                isVoiceEnabled
                  ? 'bg-blue-600/25 border-blue-500/50 text-sky-300 hover:bg-blue-600/35'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-500 hover:text-slate-300'
              }`}
              title={isVoiceEnabled ? 'Matikan Suara (Mute Voice)' : 'Aktifkan Suara (Unmute Voice)'}
            >
              {isVoiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
