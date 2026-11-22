import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';

describe('useOnlineStatus', () => {
  it('follows browser online/offline events', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
