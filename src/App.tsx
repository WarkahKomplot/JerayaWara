import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { TurnBanner } from './components/navigation/TurnBanner';
import { SpeedometerOverlay } from './components/navigation/SpeedometerOverlay';
import { ModeSelector } from './components/navigation/ModeSelector';
import { TripSummaryDrawer } from './components/navigation/TripSummaryDrawer';
import { TollBreakdownModal } from './components/navigation/TollBreakdownModal';
import { RegionDownloadModal } from './components/offline/RegionDownloadModal';
import { SearchBar } from './components/search/SearchBar';
import { AppShell } from './components/layout/AppShell';
import { JerayaWaraLogo } from './components/brand/JerayaWaraLogo';

import { useGeolocation } from './hooks/useGeolocation';
import { useDeviceTheme } from './hooks/useDeviceTheme';
import { useWakeLock } from './hooks/useWakeLock';
import { useFoldableDetection } from './hooks/useFoldableDetection';
import { useVoiceNavigation } from './hooks/useVoiceNavigation';

import { calculateRoute } from './services/routing/routingEngine';
import { calculateRouteTolls } from './services/toll/tollCalculator';
import { RouteResult } from './services/routing/types';
import { VehicleClass, TollBreakdown } from './services/toll/types';
import { SearchItem } from './services/search/types';
import { regionManager } from './services/offline/regionManager';
import { WeatherInfo, fetchLiveWeather } from './services/weather/weatherService';
import { findNearbyAESCamera } from './services/traffic/aesCameraData';
import { speakNavigationVoice } from './services/voice/voiceService';
import { HardDrive, Moon, Sun, ShieldAlert, Radio, AlertOctagon, Satellite, Zap } from 'lucide-react';

export function App() {
  const { coords, heading, speedKmH, isGpsLocked, isAccuracyDegraded } = useGeolocation();
  const { theme, themeMode, cycleThemeMode, solarInfo } = useDeviceTheme(coords);
  const { isLocked, isScreenAwakeEnabled, toggleWakeLock, requestLock, releaseLock } = useWakeLock(true);
  const { isFoldableUnfolded } = useFoldableDetection();

  const [vehicleMode, setVehicleMode] = useState<VehicleClass>('car');
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [tollBreakdown, setTollBreakdown] = useState<TollBreakdown | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [focusStepCoord, setFocusStepCoord] = useState<[number, number] | null>(null);

  // Turn-by-Turn Voice Navigation Engine
  const {
    isVoiceEnabled,
    voiceLanguage,
    toggleVoice,
    toggleVoiceLanguage,
    announceStart,
    announceStep,
    announceArrive,
    resetVoiceAnnouncements
  } = useVoiceNavigation();

  // Live Weather & AES Speed Camera Alerts
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const lastWarnedAESRef = useRef<string>('');

  // Live Weather effect (updates with coordinate movement)
  const coordKey = `${coords[0].toFixed(2)},${coords[1].toFixed(2)}`;
  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(coords).then(w => {
      if (isMounted) setWeather(w);
    });
    return () => { isMounted = false; };
  }, [coordKey]);

  // AES Speed Camera Alert (within 1.2 km threshold)
  const nearbyAESAlert = useMemo(() => {
    return findNearbyAESCamera(coords, 1.2);
  }, [coords]);

  // Voice alert when approaching AES camera
  useEffect(() => {
    if (nearbyAESAlert && isVoiceEnabled) {
      const alertKey = `${nearbyAESAlert.camera.id}-${nearbyAESAlert.camera.speedLimitKmH}`;
      if (lastWarnedAESRef.current !== alertKey) {
        lastWarnedAESRef.current = alertKey;
        const msg = voiceLanguage === 'ms'
          ? `Perhatian: Kamera AES di hadapan. Had laju ${nearbyAESAlert.camera.speedLimitKmH} kilometer sejam.`
          : `Caution: Speed camera ahead. Speed limit ${nearbyAESAlert.camera.speedLimitKmH} kilometers per hour.`;
        speakNavigationVoice(msg, isVoiceEnabled, voiceLanguage);
      }
    } else if (!nearbyAESAlert) {
      lastWarnedAESRef.current = '';
    }
  }, [nearbyAESAlert, isVoiceEnabled, voiceLanguage]);

  // Modals
  const [isTollModalOpen, setIsTollModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [autoDownloadNotice, setAutoDownloadNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedCoordRef = useRef<[number, number] | null>(null);
  const lastCheckedTimeRef = useRef<number>(0);

  // Proximity Geofencing: Throttled check to avoid excessive DB queries and memory churn
  useEffect(() => {
    let isMounted = true;
    if (!coords) return;

    const now = Date.now();
    // Only check if at least 15 seconds have passed or user has moved significantly (> 500m)
    if (lastCheckedCoordRef.current && now - lastCheckedTimeRef.current < 15000) {
      const [prevLng, prevLat] = lastCheckedCoordRef.current;
      const dLng = Math.abs(coords[0] - prevLng);
      const dLat = Math.abs(coords[1] - prevLat);
      if (dLng < 0.005 && dLat < 0.005) {
        return;
      }
    }

    lastCheckedCoordRef.current = coords;
    lastCheckedTimeRef.current = now;

    regionManager.handleProximityGeofence(coords).then(triggered => {
      if (isMounted && triggered.length > 0) {
        setAutoDownloadNotice(`Approaching boundary — Auto-downloading ${triggered.join(', ')} pack`);
        if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = setTimeout(() => {
          if (isMounted) {
            setAutoDownloadNotice(null);
            noticeTimerRef.current = null;
          }
        }, 5000);
      }
    });

    return () => {
      isMounted = false;
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }
    };
  }, [coords]);

  // Handle destination selection from search or map click
  const handleSelectDestination = async (item: SearchItem) => {
    // 1. Immediately reset toll breakdown so previous search estimate never persists
    setTollBreakdown(null);
    setCurrentStepIndex(0);
    setIsNavigating(true);
    requestLock();

    // 2. Calculate route for the new destination
    const route = await calculateRoute(coords, item.coordinates, vehicleMode, item.title);
    setActiveRoute(route);

    // 3. Set destination-specific tolls
    const tolls = calculateRouteTolls(route.tollPlazaKeys, vehicleMode);
    setTollBreakdown(tolls);

    // 4. Voice announcement: navigation start
    announceStart(item.title);
  };

  // Direct map click to start navigation to any point in Malaysia
  const handleMapClick = (clickCoords: [number, number]) => {
    const destinationItem: SearchItem = {
      id: `pinned-${clickCoords[0].toFixed(4)}-${clickCoords[1].toFixed(4)}`,
      title: `Selected Location (${clickCoords[1].toFixed(3)}°N, ${clickCoords[0].toFixed(3)}°E)`,
      subtitle: 'Tapped point on Malaysia map',
      category: 'landmark',
      coordinates: clickCoords,
      regionId: 'pinned'
    };
    handleSelectDestination(destinationItem);
  };

  // Recalculate if user changes mode mid-route
  const handleModeChange = async (mode: VehicleClass) => {
    setVehicleMode(mode);
    if (activeRoute) {
      setTollBreakdown(null);
      const dest = activeRoute.coordinates[activeRoute.coordinates.length - 1];
      const reRoute = await calculateRoute(coords, dest, mode, activeRoute.destinationName);
      setActiveRoute(reRoute);
      setTollBreakdown(calculateRouteTolls(reRoute.tollPlazaKeys, mode));
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setActiveRoute(null);
    setTollBreakdown(null);
    setFocusStepCoord(null);
    releaseLock();
    resetVoiceAnnouncements();
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    if (activeRoute?.steps[idx]?.coordinates) {
      setFocusStepCoord(activeRoute.steps[idx].coordinates);
    }
  };

  // Turn-by-Turn Voice Guidance Trigger: Speaks upcoming turn when step updates
  useEffect(() => {
    if (isNavigating && activeRoute && activeRoute.steps[currentStepIndex]) {
      const step = activeRoute.steps[currentStepIndex];
      if (step.maneuver === 'arrive') {
        announceArrive(activeRoute.destinationName);
      } else {
        announceStep(step, currentStepIndex);
      }
    }
  }, [isNavigating, activeRoute, currentStepIndex, announceStep, announceArrive]);

  // Current turn instruction
  const currentStep = activeRoute?.steps[currentStepIndex] || (activeRoute ? activeRoute.steps[0] : null);

  return (
    <>
      <AppShell
        isNavigating={isNavigating}
        headerBar={
          <div className="flex items-center justify-between gap-2">
            {/* Logo & App Title */}
            <div className="flex items-center gap-2">
              <JerayaWaraLogo size={36} />
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  JerayaWara
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold text-sky-400 border border-blue-500/30">
                    MY
                  </span>
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${isGpsLocked ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{isGpsLocked ? 'GPS Active' : 'Acquiring GPS...'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Offline Region Manager & Theme Toggle) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsRegionModalOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-slate-800/90 px-2.5 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700/60 shadow hover:text-white"
                title="Manage Offline Maps"
              >
                <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Offline Maps</span>
              </button>

              {/* Malaysia Sunrise/Sunset Day-Night Toggle */}
              <button
                onClick={cycleThemeMode}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 px-2.5 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700/60 shadow hover:text-white transition-all active:scale-95"
                title={
                  themeMode === 'auto'
                    ? `Theme: AUTO (Following Malaysia Solar: ${solarInfo.isDaytime ? `Sunset at ${solarInfo.sunsetFormatted}` : `Sunrise at ${solarInfo.sunriseFormatted}`})`
                    : `Theme: ${themeMode.toUpperCase()} (Manual)`
                }
              >
                {themeMode === 'auto' ? (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-wider text-sky-400">AUTO</span>
                    {theme === 'night' ? (
                      <Moon className="h-3.5 w-3.5 text-sky-300" />
                    ) : (
                      <Sun className="h-3.5 w-3.5 text-amber-300" />
                    )}
                  </>
                ) : themeMode === 'night' ? (
                  <>
                    <Moon className="h-3.5 w-3.5 text-sky-400" />
                    <span className="text-[10px] font-black tracking-wider text-slate-200">NIGHT</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] font-black tracking-wider text-slate-200">DAY</span>
                  </>
                )}
              </button>

              {/* Anti-Sleep Screen Lock Button */}
              <button
                onClick={toggleWakeLock}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold border shadow transition-all active:scale-95 ${
                  isScreenAwakeEnabled
                    ? 'bg-slate-800/90 text-amber-300 border-amber-500/50 shadow-amber-500/10'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                }`}
                title={
                  isScreenAwakeEnabled
                    ? `Screen Awake Active: Display will NOT sleep (Engine: ${isLocked ? 'Hardware Locked' : 'Standby'})`
                    : 'Screen Awake Off: Using default system screen timeout'
                }
              >
                <Zap
                  className={`h-3.5 w-3.5 ${
                    isScreenAwakeEnabled ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                  }`}
                />
                <span className="hidden md:inline text-[10px] font-black tracking-wider">
                  {isScreenAwakeEnabled ? 'SCREEN ON' : 'TIMEOUT'}
                </span>
              </button>
            </div>
          </div>
        }
        topBanner={
          <div className="space-y-2">
            {/* Motorcycle Tunnel / Expressway Restriction Alert */}
            {vehicleMode === 'motorcycle' && tollBreakdown?.hasMotorcycleRestriction && (
              <div className="flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-black text-white shadow-xl animate-pulse border border-red-400/50">
                <AlertOctagon className="h-5 w-5 flex-shrink-0" />
                <span>RESTRICTION: Motorcycles prohibited on SMART Tunnel E38. Follow surface route.</span>
              </div>
            )}

            {/* Complete GPS Signal Loss Alert */}
            {isNavigating && !isGpsLocked && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-700/95 px-3.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur border border-rose-500/40">
                <Satellite className="h-4 w-4 animate-spin flex-shrink-0" />
                <span>GPS Signal Lost. Searching for satellites (Tunnel or dense canopy).</span>
              </div>
            )}

            {/* Auto Boundary Download Banner */}
            {autoDownloadNotice && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-600/90 px-3.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur animate-bounce">
                <Radio className="h-4 w-4 animate-spin" />
                <span>{autoDownloadNotice}</span>
              </div>
            )}

            {/* Degraded Accuracy Alert */}
            {isAccuracyDegraded && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>GPS accuracy degraded. Simulating corridor dead-reckoning.</span>
              </div>
            )}

            {/* Active Turn Guidance Banner or Search Bar */}
            {isNavigating && currentStep ? (
              <TurnBanner
                instruction={currentStep.instruction}
                distanceMeters={currentStep.distanceMeters}
                maneuver={currentStep.maneuver}
                laneGuidance={currentStep.laneGuidance}
                speedLimit={currentStep.speedLimitKmH}
                currentSpeed={speedKmH}
                isMotorcycleLane={currentStep.isMotorcycleLane}
                isVoiceEnabled={isVoiceEnabled}
                onToggleVoice={toggleVoice}
                voiceLanguage={voiceLanguage}
                onToggleVoiceLanguage={toggleVoiceLanguage}
              />
            ) : (
              <div className="space-y-2">
                <SearchBar
                  onSelectDestination={handleSelectDestination}
                  isOnline={navigator.onLine}
                />
                <div className="flex justify-center">
                  <ModeSelector
                    selectedMode={vehicleMode}
                    onSelectMode={handleModeChange}
                  />
                </div>
              </div>
            )}
          </div>
        }
        sidePanelContent={
          isFoldableUnfolded && isNavigating && activeRoute ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Route Step By Step
                </span>
                <ModeSelector
                  selectedMode={vehicleMode}
                  onSelectMode={handleModeChange}
                />
              </div>

              {/* Steps List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {activeRoute.steps.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`cursor-pointer rounded-xl p-3 text-xs transition-all border ${
                      idx === currentStepIndex
                        ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold'
                        : 'bg-slate-800/40 border-slate-700/30 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Step {idx + 1}</span>
                      <span>{s.distanceMeters > 0 ? `${s.distanceMeters}m` : ''}</span>
                    </div>
                    <div>{s.instruction}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : undefined
        }
        bottomDrawer={
          isNavigating && activeRoute ? (
            <TripSummaryDrawer
              route={activeRoute}
              tollBreakdown={tollBreakdown}
              onOpenTolls={() => setIsTollModalOpen(true)}
              onEndNavigation={handleEndNavigation}
              isFoldable={isFoldableUnfolded}
              onSelectStep={handleSelectStep}
              currentStepIndex={currentStepIndex}
            />
          ) : undefined
        }
        childrenMap={
          <div className="relative h-full w-full">
            <MapContainer
              userLocation={coords}
              heading={heading}
              theme={theme}
              routePolyline={activeRoute?.coordinates}
              onMapClick={handleMapClick}
              isNavigating={isNavigating}
              focusStepCoord={focusStepCoord}
            />

            {/* Circular Speedometer Gauge, Weather, Date & AES Camera Overlay in Lower-Left Corner */}
            <SpeedometerOverlay
              currentSpeedKmH={speedKmH}
              speedLimitKmH={currentStep?.speedLimitKmH}
              weather={weather}
              aesAlert={nearbyAESAlert}
              lang={voiceLanguage}
              isNavigating={isNavigating}
            />
          </div>
        }
      />

      {/* Toll Breakdown Modal */}
      <TollBreakdownModal
        isOpen={isTollModalOpen}
        onClose={() => setIsTollModalOpen(false)}
        tollBreakdown={tollBreakdown}
      />

      {/* Offline Region Pack Manager Modal */}
      <RegionDownloadModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
      />
    </>
  );
}

export default App;
