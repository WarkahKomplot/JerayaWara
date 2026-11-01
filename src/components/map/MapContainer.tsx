import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapLibreStyle } from './mapStyles';
import { AppTheme } from '../../hooks/useDeviceTheme';
import { MapControls } from './MapControls';

export interface MapContainerProps {
  userLocation: [number, number]; // [lng, lat]
  heading: number;
  theme: AppTheme;
  routePolyline?: [number, number][];
  onMapClick?: (coords: [number, number]) => void;
  isNavigating?: boolean;
  focusStepCoord?: [number, number] | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  userLocation,
  heading,
  theme,
  routePolyline,
  onMapClick,
  isNavigating = false,
  focusStepCoord = null
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

    map.on('click', (e) => {
      if (onMapClickRef.current) {
        onMapClickRef.current([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    return () => {
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

    map.setStyle(getMapLibreStyle(theme));
    map.once('style.load', () => {
      renderRouteOnMap();
    });
  }, [theme]);

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

  // Update User Location
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat(userLocation);

    if (puckHeadingElRef.current) {
      puckHeadingElRef.current.style.transform = `rotate(${heading}deg)`;
    }

    // Follow camera while navigating if not showing overview
    if (isNavigating && (!routePolyline || routePolyline.length === 0)) {
      mapRef.current.easeTo({
        center: userLocation,
        bearing: heading,
        pitch: is3D ? 58 : 0,
        zoom: 16.5,
        duration: 800
      });
    }
  }, [userLocation, heading, isNavigating, is3D]);

  // Helper to draw or update route polyline and destination pin
  const renderRouteOnMap = () => {
    const map = mapRef.current;
    if (!map) return;

    if (!routePolyline || routePolyline.length < 2) {
      if (map.getSource('active-route')) {
        if (map.getLayer('active-route-casing')) map.removeLayer('active-route-casing');
        if (map.getLayer('active-route-line')) map.removeLayer('active-route-line');
        map.removeSource('active-route');
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

    if (map.getSource('active-route')) {
      (map.getSource('active-route') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('active-route', {
        type: 'geojson',
        data: geojson
      });

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
      padding: { top: 130, bottom: 250, left: 60, right: 60 },
      maxZoom: 15,
      duration: 1000
    });
  };

  // Draw Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      renderRouteOnMap();
    } else {
      map.once('style.load', renderRouteOnMap);
      map.once('load', renderRouteOnMap);
    }
  }, [routePolyline]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetBearing = () => mapRef.current?.resetNorth();
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: userLocation,
        zoom: 16,
        pitch: is3D ? 55 : 0
      });
    }
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
        onFitRouteOverview={fitRouteBounds}
        isNavigating={isNavigating}
      />
    </div>
  );
};
