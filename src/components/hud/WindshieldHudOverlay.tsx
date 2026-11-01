import React from 'react';
import { ArrowUp, ArrowRight, ArrowLeft, CornerUpRight, Compass } from 'lucide-react';

export interface WindshieldHudOverlayProps {
  speed: number;
  speedLimit: number;
  isNavigating: boolean;
  currentInstruction?: {
    maneuver: string;
    distanceMeters: number;
    instruction: string;
  };
  roadName?: string;
  heading?: number;
  onClose: () => void;
}

export const WindshieldHudOverlay: React.FC<WindshieldHudOverlayProps> = React.memo(({
  speed,
  speedLimit,
  isNavigating,
  currentInstruction,
  roadName,
  heading = 0,
  onClose
}) => {
  const isOverSpeed = speed > speedLimit && speedLimit > 0;

  // Cardinal direction from heading degrees with negative/modulo safety
  const getCardinal = (deg: number) => {
    if (deg < 0 || isNaN(deg)) return 'U';
    const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
    const idx = ((Math.round(deg / 45) % 8) + 8) % 8;
    return directions[idx];
  };

  const getManeuverIcon = (maneuver?: string) => {
    const norm = (maneuver || '').toLowerCase().replace(/-/g, '_');
    switch (norm) {
      case 'turn_right':
      case 'slight_right':
      case 'exit_right':
      case 'fork_right':
        return <ArrowRight className="h-16 w-16 text-cyan-400 stroke-[3]" />;
      case 'turn_left':
      case 'slight_left':
      case 'exit_left':
      case 'fork_left':
        return <ArrowLeft className="h-16 w-16 text-cyan-400 stroke-[3]" />;
      case 'u_turn':
      case 'uturn':
      case 'uturn_right':
      case 'uturn_left':
        return <CornerUpRight className="h-16 w-16 text-cyan-400 stroke-[3]" />;
      default:
        return <ArrowUp className="h-16 w-16 text-cyan-400 stroke-[3]" />;
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ transform: 'scaleX(-1)' }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black p-8 text-white select-none cursor-pointer overflow-hidden font-sans"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-cyan-400 animate-pulse" />
          <span className="text-xl font-bold tracking-wider text-cyan-400">
            {getCardinal(heading)} ({Math.round(heading)}°)
          </span>
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          HUD MIRROR MODE · TAP TO EXIT
        </div>
        {roadName && (
          <div className="text-base font-bold tracking-wide text-zinc-300 uppercase truncate max-w-xs">
            {roadName}
          </div>
        )}
      </div>

      {/* Main Center Body */}
      {isNavigating && currentInstruction ? (
        <div className="flex flex-col items-center justify-center my-auto gap-4">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-950 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
              {getManeuverIcon(currentInstruction.maneuver)}
            </div>
            <div className="flex flex-col">
              <span className="text-6xl font-black tracking-tight text-white font-mono">
                {currentInstruction.distanceMeters < 1000
                  ? `${Math.round(currentInstruction.distanceMeters)} m`
                  : `${(currentInstruction.distanceMeters / 1000).toFixed(1)} km`}
              </span>
              <span className="text-xl font-semibold text-zinc-300 max-w-md">
                {currentInstruction.instruction}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="text-center">
            <div
              className={`text-9xl font-black font-mono tracking-tighter leading-none ${
                isOverSpeed ? 'text-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.8)]' : 'text-white'
              }`}
            >
              {Math.round(speed)}
            </div>
            <div className="text-2xl font-black tracking-widest text-zinc-400 mt-2 uppercase">
              KM/H
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Speed & Speed Limit */}
      <div className="flex items-end justify-between border-t border-zinc-900 pt-6">
        {isNavigating ? (
          <div className="flex items-baseline gap-3">
            <span
              className={`text-6xl font-black font-mono leading-none ${
                isOverSpeed ? 'text-rose-500' : 'text-white'
              }`}
            >
              {Math.round(speed)}
            </span>
            <span className="text-lg font-bold text-zinc-500">KM/H</span>
          </div>
        ) : (
          <div className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            JALAN RAYA MALAYSIA
          </div>
        )}

        {speedLimit > 0 && (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border-4 bg-white text-black font-black text-2xl shadow-lg ${
                isOverSpeed ? 'border-rose-600 animate-bounce' : 'border-red-600'
              }`}
            >
              {speedLimit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
