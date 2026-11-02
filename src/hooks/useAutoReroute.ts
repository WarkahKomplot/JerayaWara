import { useState, useRef, useEffect, useCallback } from 'react';
import { routeGapMeters } from '../services/routing/routeIntegrity';
import { calculateRoute } from '../services/routing/routingEngine';
import { estimateRouteTolls } from '../services/toll/tollCalculator';
import { RouteResult } from '../services/routing/types';
import { VehicleClass, TollBreakdown } from '../services/toll/types';
import { speakNavigationVoice, VoiceLanguage } from '../services/voice/voiceService';

export interface UseAutoRerouteOptions {
  isNavigating: boolean;
  activeRoute: RouteResult | null;
  coords: [number, number];
  vehicleMode: VehicleClass;
  voiceLanguage: VoiceLanguage;
  isVoiceEnabled: boolean;
  maxDriftMeters?: number; // Default 75 meters deviation from polyline
  consecutiveOffRouteThreshold?: number; // Default 3 consecutive ticks
  cooldownMs?: number; // Default 15 seconds between reroutes
  /** Original POI/destination title, so rerouted trips arrive at the named place, not just its snapped coordinate. */
  destinationTitle?: string;
  onRouteUpdated: (newRoute: RouteResult, newTolls: TollBreakdown) => void;
}

export interface UseAutoRerouteResult {
  isRerouting: boolean;
  isOffRoute: boolean;
  currentDriftMeters: number;
}

export function useAutoReroute({
  isNavigating,
  activeRoute,
  coords,
  vehicleMode,
  voiceLanguage,
  isVoiceEnabled,
  maxDriftMeters = 75,
  consecutiveOffRouteThreshold = 3,
  cooldownMs = 15000,
  destinationTitle,
  onRouteUpdated
}: UseAutoRerouteOptions): UseAutoRerouteResult {
  const [isRerouting, setIsRerouting] = useState(false);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [currentDriftMeters, setCurrentDriftMeters] = useState(0);

  const offRouteCountRef = useRef(0);
  const lastRerouteTimeRef = useRef(0);
  const isCalculatingRef = useRef(false);

  // Store latest props in refs to avoid callback recreation
  const optionsRef = useRef({
    isNavigating,
    activeRoute,
    coords,
    vehicleMode,
    voiceLanguage,
    isVoiceEnabled,
    cooldownMs,
    destinationTitle,
    onRouteUpdated
  });

  useEffect(() => {
    optionsRef.current = {
      isNavigating,
      activeRoute,
      coords,
      vehicleMode,
      voiceLanguage,
      isVoiceEnabled,
      cooldownMs,
      destinationTitle,
      onRouteUpdated
    };
  });

  const triggerReroute = useCallback(async () => {
    const {
      isNavigating: nav,
      activeRoute: route,
      coords: currentCoords,
      vehicleMode: mode,
      voiceLanguage: lang,
      isVoiceEnabled: voice,
      cooldownMs: cooldown,
      destinationTitle: destTitle,
      onRouteUpdated: updateCallback
    } = optionsRef.current;

    if (!nav || !route || !route.coordinates || route.coordinates.length < 2 || isCalculatingRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastRerouteTimeRef.current < cooldown) {
      return;
    }

    const destCoord = route.coordinates[route.coordinates.length - 1];
    if (!destCoord) return;

    isCalculatingRef.current = true;
    setIsRerouting(true);
    lastRerouteTimeRef.current = now;

    // Voice announcement
    const voiceMsg =
      lang === 'ms'
        ? 'Laluan terpesong. Mengira semula laluan...'
        : 'Off route. Recalculating route...';
    speakNavigationVoice(voiceMsg, voice, lang);

    try {
      // Prefer the caller-provided original destination title; fall back to the
      // route's own name so the rerouted trip still targets the named POI.
      const newRoute = await calculateRoute(
        currentCoords,
        destCoord,
        mode,
        destTitle || route.destinationName
      );

      const newTolls = estimateRouteTolls(newRoute.tollPlazaKeys, mode, newRoute.coordinates, newRoute.isApproximate);
      updateCallback(newRoute, newTolls);
      offRouteCountRef.current = 0;
      setIsOffRoute(false);
    } catch (err) {
      console.warn('[AutoReroute] Failed to recalculate route:', err);
    } finally {
      setIsRerouting(false);
      isCalculatingRef.current = false;
      // One-shot upgrade: re-arm after any completed recalculation so a later
      // connectivity regain can trigger a fresh upgrade
      upgradingRef.current = false;
    }
  }, []);

  // Connectivity upgrade: when signal returns mid-navigation and the active route
  // came from the offline tier (no OSRM source flag exists, so approximate and
  // corridor-snapped routes are inferred by absence of fine-grained steps), fire
  // one recalculation — the liveness check inside calculateRoute does the rest.
  const wasOfflineRef = useRef(false);
  const upgradingRef = useRef(false);
  useEffect(() => {
    if (!isNavigating) {
      wasOfflineRef.current = false;
      upgradingRef.current = false;
      return;
    }
    const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : false;
    if (!onlineNow) {
      wasOfflineRef.current = true;
      return;
    }
    if (
      wasOfflineRef.current &&
      !upgradingRef.current &&
      activeRoute &&
      activeRoute.coordinates &&
      activeRoute.coordinates.length >= 2
    ) {
      wasOfflineRef.current = false;
      upgradingRef.current = true;
      triggerReroute();
    }
  }, [isNavigating, activeRoute, triggerReroute]);

  useEffect(() => {
    if (!isNavigating || !activeRoute || !activeRoute.coordinates || activeRoute.coordinates.length < 2) {
      offRouteCountRef.current = 0;
      setIsOffRoute(false);
      setCurrentDriftMeters(0);
      return;
    }

    const gap = routeGapMeters(coords, activeRoute.coordinates);
    setCurrentDriftMeters(Math.round(gap));

    if (gap > maxDriftMeters) {
      offRouteCountRef.current += 1;
      setIsOffRoute(true);

      if (offRouteCountRef.current >= consecutiveOffRouteThreshold) {
        triggerReroute();
      }
    } else {
      offRouteCountRef.current = 0;
      setIsOffRoute(false);
    }
  }, [
    coords[0],
    coords[1],
    isNavigating,
    activeRoute,
    maxDriftMeters,
    consecutiveOffRouteThreshold,
    triggerReroute
  ]);

  return {
    isRerouting,
    isOffRoute,
    currentDriftMeters
  };
}
