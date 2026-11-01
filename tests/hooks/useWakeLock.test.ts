import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from '../../src/hooks/useWakeLock';

describe('useWakeLock (Screen Lock & Memory Leak Prevention)', () => {
  let releaseMock: ReturnType<typeof vi.fn>;
  let requestMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
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
    vi.restoreAllMocks();
  });

  it('requests wake lock sentinel on requestLock() without premature release', async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.requestLock();
    });

    expect(requestMock).toHaveBeenCalledWith('screen');
    expect(result.current.isLocked).toBe(true);
    // Crucial: Must NOT prematurely call releaseMock right after acquiring
    expect(releaseMock).not.toHaveBeenCalled();
  });

  it('releases lock cleanly on explicit releaseLock()', async () => {
    const { result } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.requestLock();
    });

    act(() => {
      result.current.releaseLock();
    });

    expect(releaseMock).toHaveBeenCalled();
    expect(result.current.isLocked).toBe(false);
  });

  it('releases active sentinel cleanly on unmount to prevent background memory leaks', async () => {
    const { result, unmount } = renderHook(() => useWakeLock());

    await act(async () => {
      await result.current.requestLock();
    });

    unmount();
    expect(releaseMock).toHaveBeenCalled();
  });
});
