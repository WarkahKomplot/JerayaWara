import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Camera,
  Eye,
  EyeOff,
  MonitorUp
} from 'lucide-react';
import { WeatherInfo } from '../../services/weather/weatherService';
import { NearbyAESAlert } from '../../services/traffic/aesCameraData';

export interface SpeedometerOverlayProps {
  currentSpeedKmH: number;
  speedLimitKmH?: number;
  weather: WeatherInfo | null;
  aesAlert: NearbyAESAlert | null;
  lang?: 'ms' | 'en';
  isNavigating?: boolean;
  onOpenHud?: () => void;
  onToggleRain?: () => void;
}

export const SpeedometerOverlay: React.FC<SpeedometerOverlayProps> = ({
  currentSpeedKmH,
  speedLimitKmH,
  weather,
  aesAlert,
  lang = 'ms',
  isNavigating = false,
  onOpenHud,
  onToggleRain
}) => {
  const [showInfoPill, setShowInfoPill] = useState(true);
  const [dateStr, setDateStr] = useState('');

  // Update today's date & day string
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const locale = lang === 'ms' ? 'ms-MY' : 'en-US';
      const formatted = now.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      setDateStr(formatted);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, [lang]);

  const isSpeeding = speedLimitKmH ? currentSpeedKmH > speedLimitKmH : false;

  const renderWeatherIcon = () => {
    if (!weather) return <Sun className="h-3.5 w-3.5 text-amber-400" />;
    switch (weather.icon) {
      case 'rain':
        return <CloudRain className="h-3.5 w-3.5 text-sky-400 animate-pulse" />;
      case 'thunderstorm':
        return <Zap className="h-3.5 w-3.5 text-yellow-400 animate-bounce" />;
      case 'cloudy':
        return <Cloud className="h-3.5 w-3.5 text-slate-300" />;
      default:
        return <Sun className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <div
      className={`absolute left-3.5 z-20 flex flex-col items-start gap-1.5 transition-all duration-300 md:left-6 ${
        isNavigating ? 'bottom-28 md:bottom-24' : 'bottom-6 md:bottom-8'
      }`}
    >
      {/* 1. Proactive AES Speed Camera Proximity Warning */}
      {aesAlert && (
        <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-2xl animate-pulse border-2 border-red-400">
          <Camera className="h-4 w-4 flex-shrink-0 animate-bounce" />
          <div>
            <div className="uppercase tracking-wider text-[11px]">⚠️ AWAS: {aesAlert.camera.name}</div>
            <div className="text-[10px] font-medium text-red-100">
              Jarak {aesAlert.distanceMeters}m · Had {aesAlert.camera.speedLimitKmH} km/h
            </div>
          </div>
        </div>
      )}

      {/* 2. Rain Warning Banner */}
      {weather?.isRaining && (
        <div className="flex items-center gap-1.5 rounded-xl bg-sky-600/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur border border-sky-400/40">
          <CloudRain className="h-3.5 w-3.5" />
          <span>{lang === 'ms' ? 'Hujan · Jarakkan Kenderaan' : 'Raining · Keep distance'}</span>
        </div>
      )}

      {/* 3. Date & Weather Compact Pill (Collapsible) */}
      {showInfoPill && (
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900/90 text-white px-2.5 py-1 text-[11px] font-medium backdrop-blur-md border border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-1 text-slate-300">
            <Calendar className="h-3 w-3 text-blue-400" />
            <span className="font-semibold capitalize">{dateStr}</span>
          </div>

          <span className="text-slate-600">|</span>

          {weather && (
            <div className="flex items-center gap-1 text-slate-200">
              {renderWeatherIcon()}
              <span className="font-bold">{weather.tempC}°C</span>
              <span className="text-slate-400 text-[10px]">
                {lang === 'ms' ? weather.conditionBm : weather.condition}
              </span>
            </div>
          )}

          {onToggleRain && (
            <button
              type="button"
              onClick={onToggleRain}
              className={`p-0.5 rounded transition-colors ${
                weather?.isRaining ? 'text-sky-300 bg-sky-900/50' : 'text-slate-500 hover:text-sky-400'
              }`}
              title="Tukar status hujan"
            >
              <CloudRain className="h-3 w-3" />
            </button>
          )}

          <button
            onClick={() => setShowInfoPill(false)}
            className="p-0.5 text-slate-500 hover:text-slate-300"
            title="Tutup info cuaca"
          >
            <EyeOff className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 4. Circular Round Speedometer Icon + Companion Malaysian Speed Limit Badge + HUD button */}
      <div className="flex items-center gap-2">
        {/* Round Speedometer Gauge */}
        <div
          onClick={() => setShowInfoPill(prev => !prev)}
          className={`group relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl border-2 transition-transform active:scale-95 ${
            isSpeeding
              ? 'border-amber-500 shadow-amber-500/40 ring-4 ring-amber-500/20 animate-pulse'
              : 'border-slate-700/80 hover:border-slate-500'
          }`}
          title="Kelajuan Semasa (Tekan untuk buka/tutup tarikh & cuaca)"
        >
          <span
            className={`text-2xl font-black leading-none tracking-tight ${
              isSpeeding ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {currentSpeedKmH}
          </span>
          <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            km/h
          </span>
        </div>

        {/* Companion Malaysian Speed Limit Round Badge */}
        {speedLimitKmH && (
          <div
            className="flex h-10 w-10 flex-col items-center justify-center rounded-full border-[3px] border-red-600 bg-white shadow-xl"
            title={`Had Laju Kebangsaan: ${speedLimitKmH} km/h`}
          >
            <span className="text-xs font-black text-slate-900 leading-none">
              {speedLimitKmH}
            </span>
          </div>
        )}

        {/* Windshield HUD Trigger Button */}
        {onOpenHud && (
          <button
            type="button"
            onClick={onOpenHud}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-cyan-400 hover:text-white border border-cyan-500/50 shadow-xl active:scale-95 transition-all"
            title="Mod HUD Cermin Depan"
          >
            <MonitorUp className="h-4 w-4" />
          </button>
        )}

        {/* Re-expand Weather Pill if hidden */}
        {!showInfoPill && (
          <button
            onClick={() => setShowInfoPill(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60 shadow-lg active:scale-95"
            title="Papar Tarikh & Cuaca"
          >
            <Eye className="h-3.5 w-3.5 text-sky-400" />
          </button>
        )}
      </div>
    </div>
  );
};
