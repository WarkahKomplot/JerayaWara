import { useState, useEffect, useCallback } from 'react';
import { wakeLockService, WakeLockType } from '../services/device/wakeLockService';

export function useWakeLock(autoEnableOnMount: boolean = true) {
  const [isLocked, setIsLocked] = useState(() => wakeLockService.isActive());
  const [lockType, setLockType] = useState<WakeLockType>(() => wakeLockService.getLockType());
  const [isScreenAwakeEnabled, setIsScreenAwakeEnabled] = useState(autoEnableOnMount);

  useEffect(() => {
    const unsubscribe = wakeLockService.subscribe((active, type) => {
      setIsLocked(active);
      setLockType(type);
    });

    if (autoEnableOnMount) {
      wakeLockService.enable();
    }

    return () => {
      unsubscribe();
    };
  }, [autoEnableOnMount]);

  const requestLock = useCallback(async () => {
    setIsScreenAwakeEnabled(true);
    return await wakeLockService.enable();
  }, []);

  const releaseLock = useCallback(() => {
    setIsScreenAwakeEnabled(false);
    wakeLockService.disable();
  }, []);

  const toggleWakeLock = useCallback(() => {
    setIsScreenAwakeEnabled(prev => {
      const next = !prev;
      if (next) {
        wakeLockService.enable();
      } else {
        wakeLockService.disable();
      }
      return next;
    });
  }, []);

  return {
    isLocked,
    lockType,
    isScreenAwakeEnabled,
    requestLock,
    releaseLock,
    toggleWakeLock
  };
}
