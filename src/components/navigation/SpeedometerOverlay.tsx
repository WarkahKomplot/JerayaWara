import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { WeatherInfo } from '../../services/weather/weatherService';
import { NearbyAESAlert, getLocalizedCameraName } from '../../services/traffic/aesCameraData';
import { t } from '../../services/i18n/translations';

export interface SpeedometerOverlayProps {
  currentSpeedKmH: number;
  speedLimitKmH?: number;
  /**
   * Provenance of speedLimitKmH. Speeding color alerts fire only on 'verified'
   * limits — an estimated limit still displays its badge but never warns,
   * because a false alarm destroys trust faster than no alarm.
   */
  speedLimitSource?: 'verified' | 'estimated';
  weather: WeatherInfo | null;
  aesAlert: NearbyAESAlert | null;
  lang?: 'ms' | 'en';
  isNavigating?: boolean;
  onToggleRain?: () => void;
}

export const SpeedometerOverlay: React.FC<SpeedometerOverlayProps> = React.memo(({
  currentSpeedKmH,
  speedLimitKmH,
  speedLimitSource,
  weather,
  aesAlert,
  lang = 'ms',
  isNavigating = false,
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

  const isSpeeding =
    speedLimitKmH && speedLimitSource !== 'estimated'
      ? currentSpeedKmH > speedLimitKmH
      : false;

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
        <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-black text-white shadow-2xl transition-all duration-300 ${
          aesAlert.isOverSpeed
            ? 'bg-gradient-to-r from-red-700 via-rose-600 to-red-700 animate-pulse border-2 border-red-300 ring-2 ring-red-500/50'
            : 'bg-gradient-to-r from-amber-600 to-orange-600 border-2 border-amber-300'
        }`}>
          <Camera className={`h-4 w-4 flex-shrink-0 ${aesAlert.isOverSpeed ? 'animate-bounce text-yellow-200' : 'text-white'}`} />
          <div>
            <div className="uppercase tracking-wider text-[11px]">
              ⚠️ {lang === 'ms' ? (aesAlert.isOverSpeed ? 'KURANGKAN LAJU' : 'AWAS') : (aesAlert.isOverSpeed ? 'SLOW DOWN' : 'CAUTION')}: {getLocalizedCameraName(aesAlert.camera, lang)}
            </div>
            <div className={`text-[10px] font-medium ${aesAlert.isOverSpeed ? 'text-yellow-100 font-bold' : 'text-orange-100'}`}>
              {t('cameraDistance', lang)} {aesAlert.distanceMeters}m · {t('cameraLimit', lang)} {aesAlert.camera.speedLimitKmH} {t('speedUnit', lang)}
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

      {/* 4. Circular Round Speedometer Icon + Companion Malaysian Speed Limit Badge */}
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
});
