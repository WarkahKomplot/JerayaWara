import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateMalaysiaSolarTimes, SolarTimes } from '../services/solar/malaysiaSolar';

export type AppTheme = 'day' | 'night';
export type ThemeMode = 'auto' | 'day' | 'night';

const STORAGE_KEY = 'jerayawara_theme_mode';

export function useDeviceTheme(userCoords?: [number, number]) {
  // 1. Initial theme mode from localStorage, defaulting to 'auto' (Malaysia Sunrise & Sunset)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode;
        if (saved === 'auto' || saved === 'day' || saved === 'night') {
          return saved;
        }
      } catch {
        // Fallback for sandboxed iframes or private browsing
      }
    }
    return 'auto';
  });

  // 2. Solar times calculation based on current time and user GPS coordinates
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Quantize coordinates to 2 decimal places (~1.1 km) so sub-meter GPS ticks
  // do not trigger astronomical recalculation or cascading re-renders
  const lngKey = userCoords ? userCoords[0].toFixed(2) : '101.69';
  const latKey = userCoords ? userCoords[1].toFixed(2) : '3.14';

  const solarInfo: SolarTimes = useMemo(() => {
    return calculateMalaysiaSolarTimes(currentTime, userCoords || [101.693, 3.141]);
  }, [currentTime, lngKey, latKey]);

  // Periodic timer to keep solar daytime/nighttime in sync without manual reload
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // 3. Resolve effective visual theme ('day' | 'night')
  const theme: AppTheme = useMemo(() => {
    if (themeMode === 'day') return 'day';
    if (themeMode === 'night') return 'night';
    // In 'auto' mode, follow Malaysia solar times
    return solarInfo.isDaytime ? 'day' : 'night';
  }, [themeMode, solarInfo.isDaytime]);

  // 4. Synchronize HTML class for Tailwind dark styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'night') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // 5. Update and persist theme mode
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Ignore storage exceptions
      }
    }
  }, []);

  // Cycle: auto -> day -> night -> auto
  const cycleThemeMode = useCallback(() => {
    setThemeModeState(prev => {
      let next: ThemeMode = 'auto';
      if (prev === 'auto') next = 'day';
      else if (prev === 'day') next = 'night';
      else next = 'auto';

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Ignore storage exceptions
        }
      }
      return next;
    });
  }, []);

  // Backward-compatible toggleTheme
  const toggleTheme = useCallback(() => {
    cycleThemeMode();
  }, [cycleThemeMode]);

  return {
    theme,
    themeMode,
    setThemeMode,
    cycleThemeMode,
    toggleTheme,
    solarInfo,
    isManualOverride: themeMode !== 'auto',
    resetToAuto: () => setThemeMode('auto')
  };
}
