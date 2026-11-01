import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapLibreStyle } from './mapStyles';
import { AppTheme } from '../../hooks/useDeviceTheme';
import { MapControls } from './MapControls';
import { HighwayCamera } from '../../services/traffic/types';

export interface MapContainerProps {
  userLocation: [number, number]; // [lng, lat]
  heading: number;
  theme: AppTheme;
  routePolyline?: [number, number][];
  onMapClick?: (coords: [number, number]) => void;
  isNavigating?: boolean;
  focusStepCoord?: [number, number] | null;
  cameras?: HighwayCamera[];
  onOpenCCTV?: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  userLocation,
  heading,
  theme,
  routePolyline,
  onMapClick,
  isNavigating = false,
  focusStepCoord = null,
  cameras = [],
  onOpenCCTV
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const cameraMarkersRef = useRef<maplibregl.Marker[]>([]);
  const puckHeadingElRef = useRef<HTMLElement | null>(null);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const isFirstMountRef = useRef(true);
  const prevRouteKeyRef = useRef<string>('');
  const [is3D, setIs3D] = useState(true);
  const [isFollowMode, setIsFollowMode] = useState(false);
  const [currentBearing, setCurrentBearing] = useState(0);
  const rotateRafRef = useRef<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(theme),
      center: userLocation,
      zoom: 15.5,
      pitch: is3D ? 55 : 0,
      bearing: heading,
      attributionControl: false
    });

    mapRef.current = map;

    // Custom Location Marker Element (Pulse puck with heading arrow)
    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center';
    el.innerHTML = `
      <div class="absolute w-10 h-10 rounded-full bg-blue-500/25 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
        <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-white transform -translate-y-0.5" id="puck-heading"></div>
      </div>
    `;

    puckHeadingElRef.current = el.querySelector('#puck-heading');

    const marker = new maplibregl.Marker({ element: el })
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
      if (rotateRafRef.current) cancelAnimationFrame(rotateRafRef.current);
      cameraMarkersRef.current.forEach(m => m.remove());
      cameraMarkersRef.current = [];
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
    };
  }, []);

  // Render highway CCTV markers along route on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing camera markers
    cameraMarkersRef.current.forEach(m => m.remove());
    cameraMarkersRef.current = [];

    if (!cameras || cameras.length === 0 || !routePolyline || routePolyline.length < 2) {
      return;
    }

    cameras.forEach(cam => {
      const el = document.createElement('div');
      el.className = 'group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125';
      el.innerHTML = `
        <div class="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-500/40 border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </div>
        <div class="absolute -bottom-5 scale-0 group-hover:scale-100 transition-all rounded bg-slate-900/90 text-white px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap border border-slate-700 pointer-events-none">
          ${cam.highway} · ${cam.km || 'CCTV'}
        </div>
      `;
      el.onclick = (e) => {
        e.stopPropagation();
        onOpenCCTV?.();
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(cam.coordinates)
        .addTo(map);

      cameraMarkersRef.current.push(marker);
    });

    return () => {
      cameraMarkersRef.current.forEach(m => m.remove());
      cameraMarkersRef.current = [];
    };
  }, [cameras, routePolyline, onOpenCCTV]);

  // Update Theme (re-apply route after style reloads)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(getMapLibreStyle(theme));
    map.once('styledata', () => {
      renderRouteOnMap();
    });
  }, [theme]);

  // Reset follow mode when navigation ends
  useEffect(() => {
    if (!isNavigating) {
      setIsFollowMode(false);
    }
  }, [isNavigating]);

  // Focus specific step when selected from turn list
  useEffect(() => {
    if (!focusStepCoord || !mapRef.current) return;
    mapRef.current.flyTo({
      center: focusStepCoord,
      zoom: 16.5,
      pitch: is3D ? 55 : 0,
      duration: 800
    });
  }, [focusStepCoord]);

  // Update User Location & Follow Camera
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat(userLocation);

    if (puckHeadingElRef.current) {
      puckHeadingElRef.current.style.transform = `rotate(${heading}deg)`;
    }

    // Follow camera while navigating when follow mode is active
    if (isNavigating && isFollowMode) {
      mapRef.current.easeTo({
        center: userLocation,
        bearing: heading,
        pitch: is3D ? 58 : 0,
        zoom: 16.5,
        duration: 800
      });
    }
  }, [userLocation, heading, isNavigating, isFollowMode, is3D]);

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
          'line-color': '#1e3a8a',
          'line-width': 12,
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
          'line-color': '#0ea5e9',
          'line-width': 7
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

    // Auto-fit bounds when a new route is activated
    const currentRouteKey = `${routePolyline[0][0]},${routePolyline[0][1]}->${destCoord[0]},${destCoord[1]}`;
    if (currentRouteKey !== prevRouteKeyRef.current) {
      prevRouteKeyRef.current = currentRouteKey;
      fitRouteBounds();
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

    const tryRender = () => {
      try {
        renderRouteOnMap();
      } catch (err) {
        console.warn('Map style not fully ready yet, retrying on styledata:', err);
        map.once('styledata', tryRender);
      }
    };

    if (map.getStyle() || map.loaded()) {
      tryRender();
    } else {
      map.once('load', tryRender);
      map.once('styledata', tryRender);
    }
  }, [routePolyline]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetBearing = () => mapRef.current?.resetNorth();
  const handleRecenter = () => {
    setIsFollowMode(true);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: userLocation,
        zoom: 16.5,
        bearing: heading,
        pitch: is3D ? 58 : 0,
        duration: 800
      });
    }
  };
  const handleFitRouteOverview = () => {
    setIsFollowMode(false);
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
        cameraCount={cameras?.length ?? 0}
        onOpenCCTV={onOpenCCTV}
      />
    </div>
  );
};
