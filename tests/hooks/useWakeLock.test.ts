import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from '../../src/hooks/useWakeLock';
import { wakeLockService } from '../../src/services/device/wakeLockService';

describe('useWakeLock (Dual-Layer Anti-Sleep Screen Lock Engine)', () => {
  let releaseMock: ReturnType<typeof vi.fn>;
  let requestMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    wakeLockService.disable();
    releaseMock = vi.fn().mockResolvedValue(undefined);
    requestMock = vi.fn().mockResolvedValue({
      release: releaseMock,
      addEventListener: vi.fn()
    });

    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: requestMock
      },
      configurable: true,
      writable: true
    });
  });

  afterEach(() => {
    wakeLockService.disable();
    vi.restoreAllMocks();
  });

  it('auto-enables screen wake lock on mount to ensure screen does not auto turn off', async () => {
    let result: any;
    await act(async () => {
      const rendered = renderHook(() => useWakeLock(true));
      result = rendered.result;
    });

    expect(requestMock).toHaveBeenCalledWith('screen');
    expect(result.current.isLocked).toBe(true);
    expect(result.current.isScreenAwakeEnabled).toBe(true);
    expect(result.current.lockType).toBe('native');
  });

  it('releases screen lock cleanly on releaseLock() or toggleWakeLock()', async () => {
    let result: any;
    await act(async () => {
      const rendered = renderHook(() => useWakeLock(true));
      result = rendered.result;
    });

    await act(async () => {
      result.current.toggleWakeLock();
    });

    expect(result.current.isScreenAwakeEnabled).toBe(false);
    expect(result.current.isLocked).toBe(false);

    // Toggle back on
    await act(async () => {
      result.current.toggleWakeLock();
    });

    expect(result.current.isScreenAwakeEnabled).toBe(true);
  });

  it('falls back to looping video element when native wakeLock is unavailable (e.g. iOS Safari over HTTP)', async () => {
    // Simulate iOS Safari over HTTP (no navigator.wakeLock)
    Object.defineProperty(navigator, 'wakeLock', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    window.HTMLMediaElement.prototype.play = playMock;
    window.HTMLMediaElement.prototype.pause = pauseMock;

    let result: any;
    await act(async () => {
      const rendered = renderHook(() => useWakeLock(false));
      result = rendered.result;
    });

    await act(async () => {
      await result.current.requestLock();
    });

    expect(playMock).toHaveBeenCalled();
    expect(result.current.isScreenAwakeEnabled).toBe(true);
  });
});
