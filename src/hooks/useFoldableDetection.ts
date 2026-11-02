import { useState, useEffect } from 'react';

export function checkFoldableUnfolded(width: number, height: number): boolean {
  if (width < 600) return false;
  const aspectRatio = width / height;
  // Foldable unfolded displays (Galaxy Z Fold, Pixel Fold, OnePlus Open) typically have aspect ratio between 0.75 and 1.35
  return aspectRatio >= 0.75 && aspectRatio <= 1.35;
}

export function checkIsDesktop(width: number, height: number): boolean {
  // Desktop screens are at least 1024px wide and standard landscape (aspect ratio > 1.35)
  if (width < 1024) return false;
  const aspectRatio = width / height;
  return aspectRatio > 1.35;
}

export function useFoldableDetection() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844
  });

  useEffect(() => {
    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isFoldableUnfolded = checkFoldableUnfolded(
    windowDimensions.width,
    windowDimensions.height
  );

  const isDesktop = checkIsDesktop(
    windowDimensions.width,
    windowDimensions.height
  );

  return {
    isFoldableUnfolded,
    isDesktop,
    width: windowDimensions.width,
    height: windowDimensions.height,
    isLandscape: windowDimensions.width > windowDimensions.height
  };
}

