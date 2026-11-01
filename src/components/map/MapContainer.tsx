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
}

export const MapContainer: React.FC<MapContainerProps> = ({
  userLocation,
  heading,
  theme,
  routePolyline,
  onMapClick,
  isNavigating = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [currentBearing, setCurrentBearing] = useState(0);

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

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map);

    markerRef.current = marker;

    map.on('rotate', () => {
      setCurrentBearing(Math.round(map.getBearing()));
    });

    map.on('click', (e) => {
      if (onMapClick) {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Theme
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(getMapLibreStyle(theme));
    }
  }, [theme]);

  // Update User Location & Camera Follow
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat(userLocation);

    const headingElement = document.getElementById('puck-heading');
    if (headingElement) {
      headingElement.style.transform = `rotate(${heading}deg)`;
    }

    if (isNavigating) {
      mapRef.current.easeTo({
        center: userLocation,
        bearing: heading,
        pitch: is3D ? 58 : 0,
        zoom: 16.5,
        duration: 800
      });
    }
  }, [userLocation, heading, isNavigating, is3D]);

  // Draw Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoute = () => {
      if (!routePolyline || routePolyline.length < 2) {
        if (map.getSource('active-route')) {
          if (map.getLayer('active-route-casing')) map.removeLayer('active-route-casing');
          if (map.getLayer('active-route-line')) map.removeLayer('active-route-line');
          map.removeSource('active-route');
        }
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
            'line-color': '#1d4ed8',
            'line-width': 10,
            'line-opacity': 0.8
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
            'line-color': '#38bdf8',
            'line-width': 6
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      map.once('style.load', updateRoute);
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
      />
    </div>
  );
};

