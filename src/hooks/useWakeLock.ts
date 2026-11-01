import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  const requestLock = useCallback(async () => {
    if ('wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      try {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        setWakeLockSentinel(sentinel);
        setIsLocked(true);

        sentinel.addEventListener('release', () => {
          setIsLocked(false);
          setWakeLockSentinel(null);
        });
      } catch {
        setIsLocked(false);
      }
    }
  }, []);

  const releaseLock = useCallback(() => {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(() => {});
      setWakeLockSentinel(null);
      setIsLocked(false);
    }
  }, [wakeLockSentinel]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLocked) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [isLocked, requestLock, releaseLock]);

  return {
    isLocked,
    requestLock,
    releaseLock
  };
}

