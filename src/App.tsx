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
import { WindshieldHudOverlay } from './components/hud/WindshieldHudOverlay';
import { FavoritesQuickChips } from './components/favorites/FavoritesQuickChips';

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
import { findNearbyFloodHotspot } from './services/safety/floodHotspotsData';
import { getUpcomingAmenities } from './services/amenities/amenitiesService';
import { findNearbyMotorcycleShelter } from './services/amenities/motorcycleSheltersData';
import { exportRouteToGPX, downloadGPXFile } from './services/favorites/gpxExporter';
import { saveFavorite, deleteFavorite } from './services/favorites/favoritesStore';
import { speakNavigationVoice } from './services/voice/voiceService';
import { t, getLocalizedStepInstruction } from './services/i18n/translations';
import { HardDrive, Moon, Sun, ShieldAlert, Radio, AlertOctagon, Satellite, Zap, Waves } from 'lucide-react';

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

  // Windshield HUD Mode state
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [favRefreshKey, setFavRefreshKey] = useState(0);

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

  // Live Weather & Rain condition (Supports manual offline override)
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [manualRainMode, setManualRainMode] = useState<boolean | null>(null);
  const lastWarnedAESRef = useRef<string>('');
  const lastWarnedFloodRef = useRef<string>('');
  const lastWarnedShelterRef = useRef<string>('');
  const lastWarnedAESTimeRef = useRef<number>(0);
  const lastWarnedFloodTimeRef = useRef<number>(0);
  const lastWarnedShelterTimeRef = useRef<number>(0);

  // Live Weather effect (updates with coordinate movement)
  const coordKey = `${coords[0].toFixed(2)},${coords[1].toFixed(2)}`;
  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(coords).then(w => {
      if (isMounted) setWeather(w);
    });
    return () => { isMounted = false; };
  }, [coordKey]);

  // Effective rain status (manual toggle overrides automatic weather if set)
  const isRaining = manualRainMode !== null ? manualRainMode : (weather?.isRaining ?? false);
  const effectiveWeather: WeatherInfo | null = weather
    ? {
        ...weather,
        isRaining,
        condition: isRaining ? 'Rain' : weather.condition,
        conditionBm: isRaining ? 'Hujan' : weather.conditionBm,
        icon: isRaining ? 'rain' : weather.icon
      }
    : null;

  // Quantize coordinates (~11m resolution) for safety radar scans so sub-meter GPS noise
  // does not recompute distance arrays every single second
  const radarCoordKey = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;

  // AES Speed Camera Alert (corridor-aware when navigating, directional when free cruising)
  const nearbyAESAlert = useMemo(() => {
    return findNearbyAESCamera({
      userCoord: coords,
      routePolyline: isNavigating && activeRoute ? activeRoute.coordinates : undefined,
      heading,
      speedKmH,
      thresholdKm: 1.0
    });
  }, [radarCoordKey, isNavigating, activeRoute, heading, speedKmH]);

  // Banjir Kilat (Flash Flood) Blackspot Radar
  const nearbyFloodHotspot = useMemo(() => {
    return findNearbyFloodHotspot(coords, isRaining, 2.5);
  }, [radarCoordKey, isRaining]);

  // Motorcycle Expressway Rain Shelter Radar
  const nearbyMotorcycleShelter = useMemo(() => {
    return findNearbyMotorcycleShelter(coords, isRaining, vehicleMode, 3.0);
  }, [radarCoordKey, isRaining, vehicleMode]);

  // Expressway En-Route Petrol & EV Fast Charger Stop Planner
  const [amenityCategory, setAmenityCategory] = useState<'all' | 'petrol' | 'ev'>('all');
  const [amenityRefreshTrigger, setAmenityRefreshTrigger] = useState(0);
  const upcomingAmenities = useMemo(() => {
    if (!activeRoute) return [];
    return getUpcomingAmenities(activeRoute.coordinates, coords, amenityCategory, 3);
  }, [activeRoute, radarCoordKey, amenityCategory, amenityRefreshTrigger]);

  // Voice alert when approaching AES camera (with 3-minute hysteresis to prevent boundary flutter)
  useEffect(() => {
    const now = Date.now();
    if (nearbyAESAlert && isVoiceEnabled) {
      const alertKey = `${nearbyAESAlert.camera.id}-${nearbyAESAlert.camera.speedLimitKmH}-${voiceLanguage}`;
      const isNewTarget = lastWarnedAESRef.current !== alertKey;
      const isCooldownElapsed = now - lastWarnedAESTimeRef.current > 180000;

      if (isNewTarget || isCooldownElapsed) {
        lastWarnedAESRef.current = alertKey;
        lastWarnedAESTimeRef.current = now;
        const cameraName = voiceLanguage === 'ms'
          ? nearbyAESAlert.camera.name
          : (nearbyAESAlert.camera.nameEn || nearbyAESAlert.camera.name);
        const msg = voiceLanguage === 'ms'
          ? `Perhatian: Kamera AES di hadapan. ${cameraName}. Had laju ${nearbyAESAlert.camera.speedLimitKmH} kilometer sejam.`
          : `Caution: Speed camera ahead. ${cameraName}. Speed limit ${nearbyAESAlert.camera.speedLimitKmH} kilometers per hour.`;
        speakNavigationVoice(msg, isVoiceEnabled, voiceLanguage);
      }
    }
  }, [nearbyAESAlert, isVoiceEnabled, voiceLanguage]);

  // Voice alert when approaching Flash Flood hotspot during rain
  useEffect(() => {
    const now = Date.now();
    if (nearbyFloodHotspot && isVoiceEnabled) {
      const isNewTarget = lastWarnedFloodRef.current !== nearbyFloodHotspot.id;
      const isCooldownElapsed = now - lastWarnedFloodTimeRef.current > 180000;

      if (isNewTarget || isCooldownElapsed) {
        lastWarnedFloodRef.current = nearbyFloodHotspot.id;
        lastWarnedFloodTimeRef.current = now;
        const msg = voiceLanguage === 'ms'
          ? `Awas: Kawasan berisiko banjir kilat ${nearbyFloodHotspot.name} di hadapan. Berhati-hati memandu.`
          : `Caution: Flash flood risk area ${nearbyFloodHotspot.name} ahead. Drive with extra care.`;
        speakNavigationVoice(msg, isVoiceEnabled, voiceLanguage);
      }
    }
  }, [nearbyFloodHotspot, isVoiceEnabled, voiceLanguage]);

  // Voice alert when approaching Motorcycle Rain Shelter during rain
  useEffect(() => {
    const now = Date.now();
    if (nearbyMotorcycleShelter && isVoiceEnabled) {
      const isNewTarget = lastWarnedShelterRef.current !== nearbyMotorcycleShelter.id;
      const isCooldownElapsed = now - lastWarnedShelterTimeRef.current > 180000;

      if (isNewTarget || isCooldownElapsed) {
        lastWarnedShelterRef.current = nearbyMotorcycleShelter.id;
        lastWarnedShelterTimeRef.current = now;
        const msg = voiceLanguage === 'ms'
          ? `Pondok teduhan hujan motosikal di hadapan pada ${nearbyMotorcycleShelter.kmMarker}.`
          : `Motorcycle rain shelter ahead at ${nearbyMotorcycleShelter.kmMarker}.`;
        speakNavigationVoice(msg, isVoiceEnabled, voiceLanguage);
      }
    }
  }, [nearbyMotorcycleShelter, isVoiceEnabled, voiceLanguage]);

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

  // Handle destination selection from search, favorites, or map click
  const handleSelectDestination = async (item: SearchItem) => {
    setTollBreakdown(null);
    setCurrentStepIndex(0);
    setIsNavigating(true);
    requestLock();

    const route = await calculateRoute(coords, item.coordinates, vehicleMode, item.title);
    setActiveRoute(route);

    const tolls = calculateRouteTolls(route.tollPlazaKeys, vehicleMode);
    setTollBreakdown(tolls);

    announceStart(item.title);
  };

  // Direct map click to start navigation to any point in Malaysia
  const handleMapClick = (clickCoords: [number, number]) => {
    const destinationItem: SearchItem = {
      id: `pinned-${clickCoords[0].toFixed(4)}-${clickCoords[1].toFixed(4)}`,
      title: `Selected Location (${clickCoords[1].toFixed(3)}°N, ${clickCoords[0].toFixed(3)}°E)`,
      subtitle: 'Tapped point on Malaysia map',
      category: 'pinned',
      coordinates: clickCoords,
      regionId: 'pinned'
    };
    handleSelectDestination(destinationItem);
  };

  // Recalculate if user changes mode mid-route
  const handleModeChange = async (mode: VehicleClass) => {
    setVehicleMode(mode);
    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      setTollBreakdown(null);
      const dest = activeRoute.coordinates[activeRoute.coordinates.length - 1];
      if (dest) {
        const reRoute = await calculateRoute(coords, dest, mode, activeRoute.destinationName);
        setActiveRoute(reRoute);
        setTollBreakdown(calculateRouteTolls(reRoute.tollPlazaKeys, mode));
      }
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

  const handleExportGpx = () => {
    if (!activeRoute) return;
    const gpxContent = exportRouteToGPX(
      activeRoute.destinationName || 'JerayaWara Route',
      activeRoute.coordinates
    );
    const filename = `jerayawara-${(activeRoute.destinationName || 'route')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}`;
    downloadGPXFile(filename, gpxContent);
  };

  const handleAddFavorite = async (category: 'home' | 'work' | 'balik_kampung') => {
    const labels = {
      home: { title: 'Rumah', subtitle: 'Lokasi Rumah Ditanda GPS' },
      work: { title: 'Tempat Kerja', subtitle: 'Lokasi Pejabat Ditanda GPS' },
      balik_kampung: { title: 'Balik Kampung', subtitle: 'Lokasi Kampung Ditanda GPS' }
    };
    await saveFavorite({
      id: `fav-${category}`,
      category,
      title: labels[category].title,
      subtitle: `${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E`,
      coordinates: coords
    });
    setFavRefreshKey(k => k + 1);
  };

  const handleRemoveFavorite = async (id: string) => {
    await deleteFavorite(id);
    setFavRefreshKey(k => k + 1);
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
                  <button
                    type="button"
                    onClick={toggleVoiceLanguage}
                    data-testid="header-language-toggle"
                    aria-label={`Tukar Bahasa / Switch Language (${voiceLanguage.toUpperCase()})`}
                    className="ml-1 flex items-center gap-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-600/70 px-2 py-0.5 text-[9px] font-black text-amber-300 transition-all active:scale-95 shadow-sm"
                    title={voiceLanguage === 'ms' ? 'Tukar ke English (EN)' : 'Tukar ke Bahasa Melayu (BM)'}
                  >
                    <span>{voiceLanguage === 'ms' ? 'BM' : 'EN'}</span>
                  </button>
                </h1>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${isGpsLocked ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{isGpsLocked ? t('gpsActive', voiceLanguage) : t('gpsSearching', voiceLanguage)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Offline Region Manager & Theme Toggle) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsRegionModalOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-slate-800/90 px-2.5 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700/60 shadow hover:text-white"
                title={t('offlineMap', voiceLanguage)}
              >
                <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t('offlineMap', voiceLanguage)}</span>
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
                    <span className="text-[10px] font-black tracking-wider text-slate-200">{t('nightMode', voiceLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] font-black tracking-wider text-slate-200">{t('dayMode', voiceLanguage)}</span>
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
            {/* Banjir Kilat (Flash Flood) Caution Alert Banner */}
            {nearbyFloodHotspot && (
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-900 to-blue-900 border-2 border-cyan-400 px-3.5 py-2 text-xs font-black text-white shadow-2xl animate-pulse">
                <Waves className="h-5 w-5 text-cyan-300 flex-shrink-0 animate-bounce" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-cyan-200">
                    {voiceLanguage === 'ms' ? 'AWAS:' : 'CAUTION:'} {nearbyFloodHotspot.name}
                  </div>
                  <div className="text-[10px] font-medium text-cyan-100">
                    {voiceLanguage === 'ms'
                      ? 'Kawasan berisiko banjir kilat semasa hujan lebat. Pandu cermat.'
                      : 'Flash flood risk area during heavy rain. Drive carefully.'}
                  </div>
                </div>
              </div>
            )}

            {/* Motorcycle Tunnel / Expressway Restriction Alert */}
            {vehicleMode === 'motorcycle' && tollBreakdown?.hasMotorcycleRestriction && (
              <div className="flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-black text-white shadow-xl animate-pulse border border-red-400/50">
                <AlertOctagon className="h-5 w-5 flex-shrink-0" />
                <span>
                  {voiceLanguage === 'ms'
                    ? 'SEKATAN: Motosikal dilarang di Terowong SMART E38. Ikut laluan atas.'
                    : 'RESTRICTION: Motorcycles prohibited on SMART Tunnel E38. Follow surface route.'}
                </span>
              </div>
            )}

            {/* Complete GPS Signal Loss Alert */}
            {isNavigating && !isGpsLocked && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-700/95 px-3.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur border border-rose-500/40">
                <Satellite className="h-4 w-4 animate-spin flex-shrink-0" />
                <span>
                  {voiceLanguage === 'ms'
                    ? 'Isyarat GPS Terputus. Mencari satelit (Terowong atau kanopi tebal).'
                    : 'GPS Signal Lost. Searching for satellites (Tunnel or dense canopy).'}
                </span>
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
                <span>
                  {voiceLanguage === 'ms'
                    ? 'Ketepatan GPS menurun. Anggaran kedudukan laluan digunakan.'
                    : 'GPS accuracy degraded. Simulating corridor dead-reckoning.'}
                </span>
              </div>
            )}

            {/* Active Turn Guidance Banner or Search Bar with Favorites */}
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
                <FavoritesQuickChips
                  refreshTrigger={favRefreshKey}
                  onAddFavorite={handleAddFavorite}
                  onRemoveFavorite={handleRemoveFavorite}
                  lang={voiceLanguage}
                  onSelectFavorite={fav =>
                    handleSelectDestination({
                      id: fav.id,
                      title: fav.title,
                      subtitle: fav.subtitle,
                      category: 'pinned',
                      coordinates: fav.coordinates,
                      regionId: 'pinned'
                    })
                  }
                />
                <SearchBar
                  onSelectDestination={handleSelectDestination}
                  isOnline={navigator.onLine}
                  lang={voiceLanguage}
                />
                <div className="flex justify-center">
                  <ModeSelector
                    selectedMode={vehicleMode}
                    onSelectMode={handleModeChange}
                    lang={voiceLanguage}
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
                  {voiceLanguage === 'ms' ? 'Langkah Laluan Berperingkat' : 'Route Step By Step'}
                </span>
                <ModeSelector
                  selectedMode={vehicleMode}
                  onSelectMode={handleModeChange}
                  lang={voiceLanguage}
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
                      <span>{voiceLanguage === 'ms' ? `Langkah ${idx + 1}` : `Step ${idx + 1}`}</span>
                      <span>{s.distanceMeters > 0 ? `${s.distanceMeters}m` : ''}</span>
                    </div>
                    <div>{getLocalizedStepInstruction(s, voiceLanguage, activeRoute.destinationName)}</div>
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
              onExportGpx={handleExportGpx}
              amenities={upcomingAmenities}
              amenityCategory={amenityCategory}
              onSelectAmenityCategory={setAmenityCategory}
              shelter={nearbyMotorcycleShelter}
              lang={voiceLanguage}
              onRefreshAmenities={() => setAmenityRefreshTrigger(c => c + 1)}
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
              lang={voiceLanguage}
              aesAlert={nearbyAESAlert}
            />

            {/* Circular Speedometer Gauge, Weather, Date, AES Camera & HUD Button in Lower-Left Corner */}
            <SpeedometerOverlay
              currentSpeedKmH={speedKmH}
              speedLimitKmH={currentStep?.speedLimitKmH}
              weather={effectiveWeather}
              aesAlert={nearbyAESAlert}
              lang={voiceLanguage}
              isNavigating={isNavigating}
              onOpenHud={() => {
                requestLock();
                setIsHudOpen(true);
              }}
              onToggleRain={() =>
                setManualRainMode(prev => (prev === null ? !(weather?.isRaining ?? false) : !prev))
              }
            />
          </div>
        }
      />

      {/* Windshield HUD Full-Screen Mirror Overlay */}
      {isHudOpen && (
        <WindshieldHudOverlay
          speed={speedKmH}
          speedLimit={currentStep?.speedLimitKmH || 0}
          isNavigating={isNavigating}
          currentInstruction={
            currentStep
              ? {
                  maneuver: currentStep.maneuver,
                  distanceMeters: currentStep.distanceMeters,
                  instruction: currentStep.instruction
                }
              : undefined
          }
          roadName={activeRoute?.destinationName}
          heading={heading}
          onClose={() => setIsHudOpen(false)}
          lang={voiceLanguage}
        />
      )}

      {/* Toll Breakdown Modal */}
      <TollBreakdownModal
        isOpen={isTollModalOpen}
        onClose={() => setIsTollModalOpen(false)}
        tollBreakdown={tollBreakdown}
        lang={voiceLanguage}
      />

      {/* Offline Region Pack Manager Modal */}
      <RegionDownloadModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        lang={voiceLanguage}
      />
    </>
  );
}

export default App;
