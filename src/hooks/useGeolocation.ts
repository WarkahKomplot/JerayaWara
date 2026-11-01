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

export function useGeolocation(enableHighAccuracy: boolean = true) {
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

        setLocation({
          coords: currentCoord,
          heading: Math.round(heading),
          speedKmH: speed,
          accuracy: Math.round(accuracy),
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
        enableHighAccuracy,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enableHighAccuracy]);

  return location;
}

