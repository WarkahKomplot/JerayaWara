import { useState, useEffect, useRef } from 'react';

export interface LocationState {
  coords: [number, number]; // [lng, lat]
  heading: number; // degrees 0-360
  speedKmH: number;
  accuracy: number; // meters
  isGpsLocked: boolean;
  isAccuracyDegraded: boolean;
  error: string | null;
}

/**
 * GPS watch with battery-aware accuracy modes:
 * - Navigating: high accuracy (GNSS chip active, ~1s updates) — needed for
 *   40m junction detection and lane-level timing.
 * - Idle (browsing/searching): network-assisted low power — sub-meter accuracy
 *   is wasted on a map view, and the GNSS chip is the single biggest battery
 *   consumer in a PWA.
 *
 * The watch is restarted when the mode flips; the deadband filter prevents
 * redundant state churn within either mode.
 */
export function useGeolocation(options?: {
  /** High-accuracy GNSS while true; battery-saver watch while false. Default false. */
  highAccuracy?: boolean;
}) {
  const highAccuracy = options?.highAccuracy ?? false;
  const [location, setLocation] = useState<LocationState>({
    coords: [101.693, 3.141], // Default KL City Centre
    heading: 0,
    speedKmH: 0,
    accuracy: 10,
    isGpsLocked: false,
    isAccuracyDegraded: false,
    error: null
  });

  const lastPositionRef = useRef<[number, number] | null>(null);
  const lastEmittedRef = useRef<{
    coord: [number, number];
    heading: number;
    speedKmH: number;
    accuracy: number;
  } | null>(null);

  // Background resume: iOS/Android pause geolocation watches while hidden, and
  // the deadband filter would swallow the first stale-vs-fresh comparison on
  // return. Clear the filter and force one immediate getCurrentPosition so the
  // step engine re-syncs the moment the app is visible again.
  useEffect(() => {
    const handleResume = () => {
      if (document.visibilityState !== 'visible' || !navigator.geolocation) return;
      lastEmittedRef.current = null;
      lastPositionRef.current = null;
      navigator.geolocation.getCurrentPosition(pos => {
        lastEmittedRef.current = {
          coord: [pos.coords.longitude, pos.coords.latitude],
          heading: Math.round(pos.coords.heading ?? 0),
          speedKmH: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
          accuracy: Math.round(pos.coords.accuracy)
        };
        setLocation(prev => ({
          ...prev,
          coords: [pos.coords.longitude, pos.coords.latitude],
          heading: Math.round(pos.coords.heading ?? 0),
          speedKmH: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
          accuracy: Math.round(pos.coords.accuracy),
          isGpsLocked: true,
          isAccuracyDegraded: pos.coords.accuracy > 50,
          error: null
        }));
      }, undefined, {
        enableHighAccuracy: highAccuracy,
        maximumAge: 0,
        timeout: 8000
      });
    };
    document.addEventListener('visibilitychange', handleResume);
    return () => document.removeEventListener('visibilitychange', handleResume);
  }, [highAccuracy]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.'
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        const currentCoord: [number, number] = [lng, lat];
        const accuracy = pos.coords.accuracy;
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;

        let heading = pos.coords.heading ?? 0;
        // If device heading is unavailable, approximate from previous position
        if (heading === null || isNaN(heading)) {
          if (lastPositionRef.current) {
            const [prevLng, prevLat] = lastPositionRef.current;
            const y = Math.sin((lng - prevLng) * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180));
            const x =
              Math.cos(prevLat * (Math.PI / 180)) * Math.sin(lat * (Math.PI / 180)) -
              Math.sin(prevLat * (Math.PI / 180)) *
                Math.cos(lat * (Math.PI / 180)) *
                Math.cos((lng - prevLng) * (Math.PI / 180));
            heading = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
          } else {
            heading = 0;
          }
        }
        lastPositionRef.current = currentCoord;

        const roundedHeading = Math.round(heading);
        const roundedAccuracy = Math.round(accuracy);
        const prev = lastEmittedRef.current;

        // Deadband filter: Suppress sub-meter jitter updates (<1.6m) when speed/heading are unchanged
        if (
          prev &&
          Math.abs(lng - prev.coord[0]) < 0.000015 &&
          Math.abs(lat - prev.coord[1]) < 0.000015 &&
          speed === prev.speedKmH &&
          Math.abs(roundedHeading - prev.heading) < 2 &&
          Math.abs(roundedAccuracy - prev.accuracy) < 5
        ) {
          return;
        }

        lastEmittedRef.current = {
          coord: currentCoord,
          heading: roundedHeading,
          speedKmH: speed,
          accuracy: roundedAccuracy
        };

        setLocation({
          coords: currentCoord,
          heading: roundedHeading,
          speedKmH: speed,
          accuracy: roundedAccuracy,
          isGpsLocked: true,
          isAccuracyDegraded: accuracy > 50,
          error: null
        });
      },
      err => {
        setLocation(prev => ({
          ...prev,
          isGpsLocked: false,
          error: err.message
        }));
      },
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: highAccuracy ? 1000 : 15000,
        timeout: highAccuracy ? 10000 : 30000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [highAccuracy]);

  return location;
}
