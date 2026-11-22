import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useServiceWorkerUpdate,
  SW_UPDATE_EVENT
} from '../../src/hooks/useServiceWorkerUpdate';

describe('useServiceWorkerUpdate', () => {
  it('flags an update when the service worker announces one', () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());

    expect(result.current.isUpdateReady).toBe(false);

    act(() => {
      window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT));
    });

    expect(result.current.isUpdateReady).toBe(true);
  });

  it('ignores unrelated window events', () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());

    act(() => {
      window.dispatchEvent(new CustomEvent('jerayawara:unrelated'));
    });

    expect(result.current.isUpdateReady).toBe(false);
  });
});
