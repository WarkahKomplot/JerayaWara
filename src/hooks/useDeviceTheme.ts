import { useState, useEffect } from 'react';

export type AppTheme = 'day' | 'night';

export function useDeviceTheme() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    }
    return 'day';
  });

  const [isManualOverride, setIsManualOverride] = useState(false);

  useEffect(() => {
    if (isManualOverride) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'night' : 'day');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isManualOverride]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'night') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setIsManualOverride(true);
    setTheme(prev => (prev === 'day' ? 'night' : 'day'));
  };

  return {
    theme,
    isManualOverride,
    toggleTheme,
    resetToSystem: () => {
      setIsManualOverride(false);
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    }
  };
}
