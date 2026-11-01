import { useState, useEffect } from 'react';
import { MapContainer } from './components/map/MapContainer';
import { TurnBanner } from './components/navigation/TurnBanner';
import { ModeSelector } from './components/navigation/ModeSelector';
import { TripSummaryDrawer } from './components/navigation/TripSummaryDrawer';
import { TollBreakdownModal } from './components/navigation/TollBreakdownModal';
import { RegionDownloadModal } from './components/offline/RegionDownloadModal';
import { SearchBar } from './components/search/SearchBar';
import { AppShell } from './components/layout/AppShell';

import { useGeolocation } from './hooks/useGeolocation';
import { useDeviceTheme } from './hooks/useDeviceTheme';
import { useWakeLock } from './hooks/useWakeLock';
import { useFoldableDetection } from './hooks/useFoldableDetection';

import { calculateRoute } from './services/routing/routingEngine';
import { calculateRouteTolls } from './services/toll/tollCalculator';
import { RouteResult } from './services/routing/types';
import { VehicleClass, TollBreakdown } from './services/toll/types';
import { SearchItem } from './services/search/types';
import { regionManager } from './services/offline/regionManager';
import { HardDrive, Moon, Sun, ShieldAlert, Radio } from 'lucide-react';

export function App() {
  const { coords, heading, speedKmH, isGpsLocked, isAccuracyDegraded } = useGeolocation();
  const { theme, toggleTheme } = useDeviceTheme();
  const { requestLock, releaseLock } = useWakeLock();
  const { isFoldableUnfolded } = useFoldableDetection();

  const [vehicleMode, setVehicleMode] = useState<VehicleClass>('car');
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [tollBreakdown, setTollBreakdown] = useState<TollBreakdown | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Modals
  const [isTollModalOpen, setIsTollModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [autoDownloadNotice, setAutoDownloadNotice] = useState<string | null>(null);

  // Proximity Geofencing: Check border crossing every time GPS updates
  useEffect(() => {
    if (!coords) return;
    regionManager.handleProximityGeofence(coords).then(triggered => {
      if (triggered.length > 0) {
        setAutoDownloadNotice(`Approaching boundary — Auto-downloading ${triggered.join(', ')} pack`);
        setTimeout(() => setAutoDownloadNotice(null), 5000);
      }
    });
  }, [coords]);

  // Handle destination selection from search
  const handleSelectDestination = (item: SearchItem) => {
    const route = calculateRoute(coords, item.coordinates, vehicleMode);
    setActiveRoute(route);
    const tolls = calculateRouteTolls(route.tollPlazaKeys, vehicleMode);
    setTollBreakdown(tolls);
    setCurrentStepIndex(0);
    setIsNavigating(true);
    requestLock();
  };

  // Recalculate if user changes mode mid-route
  const handleModeChange = (mode: VehicleClass) => {
    setVehicleMode(mode);
    if (activeRoute) {
      const dest = activeRoute.coordinates[activeRoute.coordinates.length - 1];
      const reRoute = calculateRoute(coords, dest, mode);
      setActiveRoute(reRoute);
      setTollBreakdown(calculateRouteTolls(reRoute.tollPlazaKeys, mode));
    }
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setActiveRoute(null);
    setTollBreakdown(null);
    releaseLock();
  };

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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md">
                <span className="text-base font-black text-white">JW</span>
              </div>
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

              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700/60 shadow hover:text-white"
                title="Toggle Theme"
              >
                {theme === 'night' ? (
                  <Moon className="h-4 w-4 text-sky-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        }
        topBanner={
          <div className="space-y-2">
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
            />
          ) : undefined
        }
        childrenMap={
          <MapContainer
            userLocation={coords}
            heading={heading}
            theme={theme}
            routePolyline={activeRoute?.coordinates}
            isNavigating={isNavigating}
          />
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
