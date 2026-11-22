import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapLibreStyle } from './mapStyles';
import { AppTheme } from '../../hooks/useDeviceTheme';
import { MapControls } from './MapControls';
import {
  navigationZoomForSpeed,
  clampUserZoomOffset
} from '../../services/map/navigationZoom';
import { Language } from '../../services/i18n/translations';

export interface MapContainerProps {
  userLocation: [number, number]; // [lng, lat]
  heading: number;
  speedKmH?: number;
  theme: AppTheme;
  routePolyline?: [number, number][];
  onMapClick?: (coords: [number, number]) => void;
  isNavigating?: boolean;
  focusStepCoord?: [number, number] | null;
  lang?: Language;
  aesAlert?: any;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  userLocation,
  heading,
  speedKmH = 0,
  theme,
  routePolyline,
  onMapClick,
  isNavigating = false,
  focusStepCoord = null,
  lang = 'ms'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const puckHeadingElRef = useRef<HTMLElement | null>(null);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const isFirstMountRef = useRef(true);
  const prevRouteKeyRef = useRef<string>('');
  const [is3D, setIs3D] = useState(true);
  const [isFollowMode, setIsFollowMode] = useState(false);
  const [currentBearing, setCurrentBearing] = useState(0);
  const rotateRafRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(isNavigating);
  isNavigatingRef.current = isNavigating;

  // Camera loop state. Target values come from props; display values are eased
  // toward them at 60 fps so the puck stays centred on real 1 Hz GPS fixes.
  const targetLocationRef = useRef<[number, number]>(userLocation);
  const targetHeadingRef = useRef(heading);
  const targetSpeedRef = useRef(speedKmH);
  const displayLocationRef = useRef<[number, number]>(userLocation);
  const displayHeadingRef = useRef(heading);
  const displayZoomRef = useRef(navigationZoomForSpeed(speedKmH));
  const userZoomOffsetRef = useRef(0);
  const followModeRef = useRef(false);
  const is3DRef = useRef(is3D);
  const isUserZoomingRef = useRef(false);
  const cameraRafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const navigationStartedRef = useRef(false);

  useEffect(() => {
    targetLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    targetHeadingRef.current = heading;
  }, [heading]);

  useEffect(() => {
    targetSpeedRef.current = speedKmH;
  }, [speedKmH]);

  useEffect(() => {
    is3DRef.current = is3D;
  }, [is3D]);

  useEffect(() => {
    followModeRef.current = isFollowMode;
  }, [isFollowMode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapLibreStyle(theme),
        center: userLocation,
        zoom: 15.5,
        pitch: is3D ? 55 : 0,
        bearing: heading,
        attributionControl: { compact: true }
      });
    } catch (err) {
      console.error('Failed to initialize MapLibre GL map in browser:', err);
      return;
    }

    mapRef.current = map;

    // Custom Location Marker Element (Pulse puck with heading arrow)
    const el = document.createElement('div');
    el.className = 'flex items-center justify-center';
    el.innerHTML = `
      <div class="absolute w-10 h-10 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
      <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
        <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white transform -translate-y-0.5" id="puck-heading"></div>
      </div>
    `;

    puckHeadingElRef.current = el.querySelector('#puck-heading');

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(userLocation)
      .addTo(map);

    markerRef.current = marker;

    map.on('rotate', () => {
      if (rotateRafRef.current) cancelAnimationFrame(rotateRafRef.current);
      rotateRafRef.current = requestAnimationFrame(() => {
        const newBearing = Math.round(map.getBearing());
        setCurrentBearing(prev => (prev !== newBearing ? newBearing : prev));
      });
    });

    map.on('dragstart', () => {
      setIsFollowMode(false);
      followModeRef.current = false;
    });

    // Pinch/wheel zoom keeps following the puck, but the user's zoom level is
    // remembered as an offset instead of being reset on the next GPS fix.
    map.on('zoomstart', (event) => {
      if (event.originalEvent) isUserZoomingRef.current = true;
    });

    map.on('zoomend', () => {
      if (!isUserZoomingRef.current) return;
      isUserZoomingRef.current = false;
      if (!isNavigatingRef.current || !followModeRef.current) return;
      const base = navigationZoomForSpeed(targetSpeedRef.current);
      userZoomOffsetRef.current = clampUserZoomOffset(map.getZoom() - base);
      displayZoomRef.current = map.getZoom();
    });

    map.on('click', (e) => {
      if (onMapClickRef.current) {
        onMapClickRef.current([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    map.once('load', () => {
      renderRouteOnMap();
    });

    return () => {
      try {
        if (rotateRafRef.current) cancelAnimationFrame(rotateRafRef.current);
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.remove();
          destinationMarkerRef.current = null;
        }
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        puckHeadingElRef.current = null;
        map.remove();
        mapRef.current = null;
      } catch (err) {
        console.warn('MapLibre cleanup error suppressed:', err);
      }
    };
  }, []);

  // Update Theme (re-apply route after style reloads)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;

    let isCancelled = false;
    map.setStyle(getMapLibreStyle(theme));
    const handleStyleData = () => {
      if (isCancelled || !mapRef.current) return;
      renderRouteOnMap();
    };
    map.once('styledata', handleStyleData);

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.off('styledata', handleStyleData);
      }
    };
  }, [theme]);

  // Reset follow mode when navigation ends
  useEffect(() => {
    if (!isNavigating) {
      setIsFollowMode(false);
      followModeRef.current = false;
      navigationStartedRef.current = false;
    }
  }, [isNavigating]);

  // Entering navigation snaps into follow mode at the speed-appropriate zoom.
  useEffect(() => {
    if (!isNavigating || !mapRef.current) return;
    if (navigationStartedRef.current) return;

    navigationStartedRef.current = true;
    setIsFollowMode(true);
    followModeRef.current = true;
    userZoomOffsetRef.current = 0;
    displayLocationRef.current = userLocation;
    displayHeadingRef.current = heading;
    displayZoomRef.current = navigationZoomForSpeed(speedKmH);

    if (markerRef.current) markerRef.current.setLngLat(userLocation);
    if (puckHeadingElRef.current) {
      puckHeadingElRef.current.style.transform = `rotate(${heading}deg)`;
    }

    mapRef.current.jumpTo({
      center: userLocation,
      zoom: displayZoomRef.current,
      bearing: heading,
      pitch: is3DRef.current ? 58 : 0
    });
    // Intentionally only runs when navigation starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating]);

  // Selecting a step in the itinerary should move the camera, so leave follow
  // mode; the recenter button brings the puck back.
  useEffect(() => {
    if (!focusStepCoord || !mapRef.current) return;
    setIsFollowMode(false);
    followModeRef.current = false;
    mapRef.current.flyTo({
      center: focusStepCoord,
      zoom: 16.5,
      pitch: is3D ? 55 : 0,
      duration: 800
    });
  }, [focusStepCoord, is3D]);

  // Marker updates outside active navigation.
  useEffect(() => {
    if (isNavigating || !markerRef.current) return;
    const diff = ((heading - (displayHeadingRef.current % 360) + 540) % 360) - 180;
    displayHeadingRef.current += diff;
    markerRef.current.setLngLat(userLocation);
    if (puckHeadingElRef.current) {
      puckHeadingElRef.current.style.transform = `rotate(${displayHeadingRef.current}deg)`;
    }
  }, [userLocation, heading, isNavigating]);

  // 60 fps follow loop: ease the puck and camera together between GPS fixes.
  useEffect(() => {
    if (!isNavigating) return;

    lastFrameRef.current = performance.now();

    const frame = (now: number) => {
      const map = mapRef.current;
      const marker = markerRef.current;
      if (!map || !marker) {
        cameraRafRef.current = requestAnimationFrame(frame);
        return;
      }

      const dt = Math.min(0.1, Math.max(0.001, (now - lastFrameRef.current) / 1000));
      lastFrameRef.current = now;
      const alpha = 1 - Math.exp(-dt * 10);

      const target = targetLocationRef.current;
      const current = displayLocationRef.current;
      displayLocationRef.current = [
        current[0] + (target[0] - current[0]) * alpha,
        current[1] + (target[1] - current[1]) * alpha
      ];

      const headingDelta =
        ((targetHeadingRef.current - (displayHeadingRef.current % 360) + 540) % 360) - 180;
      displayHeadingRef.current += headingDelta * alpha;

      marker.setLngLat(displayLocationRef.current);
      if (puckHeadingElRef.current) {
        puckHeadingElRef.current.style.transform = `rotate(${displayHeadingRef.current}deg)`;
      }

      if (followModeRef.current && !isUserZoomingRef.current) {
        const targetZoom =
          navigationZoomForSpeed(targetSpeedRef.current) + userZoomOffsetRef.current;
        displayZoomRef.current += (targetZoom - displayZoomRef.current) * alpha;

        map.jumpTo({
          center: displayLocationRef.current,
          bearing: displayHeadingRef.current,
          pitch: is3DRef.current ? 58 : 0,
          zoom: displayZoomRef.current
        });
      }

      cameraRafRef.current = requestAnimationFrame(frame);
    };

    cameraRafRef.current = requestAnimationFrame(frame);

    return () => {
      if (cameraRafRef.current) cancelAnimationFrame(cameraRafRef.current);
      cameraRafRef.current = null;
    };
  }, [isNavigating]);

  // Helper to draw or update route polyline and destination pin
  const renderRouteOnMap = () => {
    const map = mapRef.current;
    if (!map) return;

    // Must have a valid style before adding sources/layers
    if (!map.getStyle()) return;

    if (!routePolyline || routePolyline.length < 2) {
      try {
        if (map.getLayer('active-route-line')) map.removeLayer('active-route-line');
        if (map.getLayer('active-route-casing')) map.removeLayer('active-route-casing');
        if (map.getSource('active-route')) map.removeSource('active-route');
      } catch {
        // Ignored during cleanup
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
        destinationMarkerRef.current = null;
      }
      prevRouteKeyRef.current = '';
      return;
    }

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routePolyline
      }
    };

    const existingSource = map.getSource('active-route') as maplibregl.GeoJSONSource | undefined;
    if (existingSource && typeof existingSource.setData === 'function') {
      existingSource.setData(geojson);
    } else {
      if (map.getSource('active-route')) {
        try {
          if (map.getLayer('active-route-line')) map.removeLayer('active-route-line');
          if (map.getLayer('active-route-casing')) map.removeLayer('active-route-casing');
          map.removeSource('active-route');
        } catch {}
      }
      map.addSource('active-route', {
        type: 'geojson',
        data: geojson
      });
    }

    if (!map.getLayer('active-route-casing')) {
      map.addLayer({
        id: 'active-route-casing',
        type: 'line',
        source: 'active-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#0369a1',
          'line-width': 13,
          'line-opacity': 0.95
        }
      });
    }

    if (!map.getLayer('active-route-line')) {
      map.addLayer({
        id: 'active-route-line',
        type: 'line',
        source: 'active-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 7.5,
          'line-opacity': 1
        }
      });
    }

    // Ensure the route layers are rendered on the very top of the stack (above raster layer)
    try {
      map.moveLayer('active-route-casing');
      map.moveLayer('active-route-line');
    } catch {}

    // Update or create Destination Pin Marker
    const destCoord = routePolyline[routePolyline.length - 1];
    if (!destinationMarkerRef.current) {
      const destEl = document.createElement('div');
      destEl.className = 'relative flex flex-col items-center cursor-pointer';
      destEl.innerHTML = `
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-2xl shadow-red-500/50 border-2 border-white transform hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="w-4 h-1.5 bg-black/50 rounded-full blur-[1px] mt-1"></div>
      `;
      destinationMarkerRef.current = new maplibregl.Marker({ element: destEl })
        .setLngLat(destCoord)
        .addTo(map);
    } else {
      destinationMarkerRef.current.setLngLat(destCoord);
    }

    // Auto-fit bounds when a new route is activated — but NOT during active
    // navigation, where the camera must stay in follow mode on the puck
    // (zooming out to the whole-route overview feels broken mid-drive).
    const currentRouteKey = `${routePolyline[0][0]},${routePolyline[0][1]}->${destCoord[0]},${destCoord[1]}`;
    if (currentRouteKey !== prevRouteKeyRef.current) {
      prevRouteKeyRef.current = currentRouteKey;
      if (!isNavigatingRef.current) {
        fitRouteBounds();
      }
    }
  };

  const fitRouteBounds = () => {
    const map = mapRef.current;
    if (!map || !routePolyline || routePolyline.length < 2) return;
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(userLocation);
    routePolyline.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, {
      padding: { top: 150, bottom: 250, left: 50, right: 50 },
      maxZoom: 15,
      duration: 1000
    });
  };

  // Draw Route Polyline immediately when routePolyline changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let isDisposed = false;

    const tryRender = () => {
      if (isDisposed || !mapRef.current) return;
      try {
        renderRouteOnMap();
      } catch (err) {
        console.warn('Map style not fully ready yet, retrying on styledata:', err);
        if (!isDisposed && mapRef.current) {
          mapRef.current.once('styledata', tryRender);
        }
      }
    };

    if (map.getStyle() || map.loaded()) {
      tryRender();
    } else {
      map.once('load', tryRender);
      map.once('styledata', tryRender);
    }

    return () => {
      isDisposed = true;
      if (mapRef.current) {
        mapRef.current.off('load', tryRender);
        mapRef.current.off('styledata', tryRender);
      }
    };
  }, [routePolyline]);

  const applyUserZoom = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;

    if (!isNavigating || !followModeRef.current) {
      if (delta > 0) map.zoomIn();
      else map.zoomOut();
      return;
    }

    const base = navigationZoomForSpeed(targetSpeedRef.current);
    const current = displayZoomRef.current;
    userZoomOffsetRef.current = clampUserZoomOffset(current + delta - base);
    displayZoomRef.current = current + delta;
  };
  const handleZoomIn = () => applyUserZoom(0.5);
  const handleZoomOut = () => applyUserZoom(-0.5);
  const handleResetBearing = () => {
    if (isNavigating) {
      setIsFollowMode(false);
      followModeRef.current = false;
    }
    mapRef.current?.resetNorth();
  };
  const handleRecenter = () => {
    setIsFollowMode(true);
    followModeRef.current = true;
    displayLocationRef.current = targetLocationRef.current;
    displayHeadingRef.current = targetHeadingRef.current;

    if (mapRef.current) {
      const zoom = isNavigating
        ? navigationZoomForSpeed(targetSpeedRef.current) + userZoomOffsetRef.current
        : mapRef.current.getZoom();
      displayZoomRef.current = zoom;
      mapRef.current.jumpTo({
        center: targetLocationRef.current,
        zoom,
        bearing: targetHeadingRef.current,
        pitch: is3D ? 58 : 0
      });
    }
  };
  const handleFitRouteOverview = () => {
    setIsFollowMode(false);
    followModeRef.current = false;
    fitRouteBounds();
  };
  const handleToggle3D = () => {
    const next3D = !is3D;
    setIs3D(next3D);
    mapRef.current?.easeTo({ pitch: next3D ? 55 : 0, duration: 400 });
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <div ref={mapContainerRef} className="h-full w-full" />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetBearing={handleResetBearing}
        onRecenter={handleRecenter}
        onToggle3D={handleToggle3D}
        is3D={is3D}
        bearing={currentBearing}
        hasActiveRoute={!!routePolyline && routePolyline.length >= 2}
        onFitRouteOverview={handleFitRouteOverview}
        isNavigating={isNavigating}
        lang={lang}
      />
    </div>
  );
};
