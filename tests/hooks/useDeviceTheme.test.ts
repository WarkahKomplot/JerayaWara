import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeviceTheme } from '../../src/hooks/useDeviceTheme';

describe('useDeviceTheme (Malaysia Solar & Day/Night Management)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults to "auto" mode following Malaysia solar schedule', () => {
    // 12:00 PM (Midday in KL) -> Daytime
    vi.setSystemTime(new Date('2026-11-01T12:00:00+08:00'));

    const { result } = renderHook(() => useDeviceTheme([101.693, 3.141]));

    expect(result.current.themeMode).toBe('auto');
    expect(result.current.theme).toBe('day');
    expect(result.current.solarInfo.isDaytime).toBe(true);
    expect(result.current.solarInfo.sunsetFormatted).toBeTruthy();
  });

  it('automatically resolves to "night" mode after sunset in "auto" mode', () => {
    // 22:00 PM (Nighttime in KL) -> Nighttime
    vi.setSystemTime(new Date('2026-11-01T22:00:00+08:00'));

    const { result } = renderHook(() => useDeviceTheme([101.693, 3.141]));

    expect(result.current.themeMode).toBe('auto');
    expect(result.current.theme).toBe('night');
    expect(result.current.solarInfo.isDaytime).toBe(false);
  });

  it('cycles smoothly through auto -> day -> night -> auto', () => {
    vi.setSystemTime(new Date('2026-11-01T12:00:00+08:00'));
    const { result } = renderHook(() => useDeviceTheme([101.693, 3.141]));

    // 1. Initial: auto
    expect(result.current.themeMode).toBe('auto');

    // 2. Cycle to day
    act(() => {
      result.current.cycleThemeMode();
    });
    expect(result.current.themeMode).toBe('day');
    expect(result.current.theme).toBe('day');
    expect(localStorage.getItem('jerayawara_theme_mode')).toBe('day');

    // 3. Cycle to night
    act(() => {
      result.current.cycleThemeMode();
    });
    expect(result.current.themeMode).toBe('night');
    expect(result.current.theme).toBe('night');
    expect(localStorage.getItem('jerayawara_theme_mode')).toBe('night');

    // 4. Cycle back to auto
    act(() => {
      result.current.cycleThemeMode();
    });
    expect(result.current.themeMode).toBe('auto');
    expect(localStorage.getItem('jerayawara_theme_mode')).toBe('auto');
  });

  it('cleans up interval timer on unmount without memory leak', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useDeviceTheme());

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
