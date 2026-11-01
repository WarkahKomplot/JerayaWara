import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const sentinelRef = useRef<any>(null);
  const isRequestedRef = useRef(false);

  const requestLock = useCallback(async () => {
    isRequestedRef.current = true;
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      try {
        if (!sentinelRef.current) {
          const sentinel = await (navigator as any).wakeLock.request('screen');
          sentinelRef.current = sentinel;
          setIsLocked(true);

          sentinel.addEventListener('release', () => {
            sentinelRef.current = null;
            setIsLocked(false);
          });
        }
      } catch {
        setIsLocked(false);
      }
    }
  }, []);

  const releaseLock = useCallback(() => {
    isRequestedRef.current = false;
    if (sentinelRef.current) {
      try {
        const p = sentinelRef.current.release?.();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch {
        // Ignore
      }
      sentinelRef.current = null;
      setIsLocked(false);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRequestedRef.current) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clean up lock when hook unmounts
      if (sentinelRef.current) {
        try {
          const p = sentinelRef.current.release?.();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {});
          }
        } catch {
          // Ignore
        }
        sentinelRef.current = null;
      }
    };
  }, [requestLock]);

  return {
    isLocked,
    requestLock,
    releaseLock
  };
}
