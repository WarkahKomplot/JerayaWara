# Design Document: JerayaWara Driving Utilities & Safety Suite

**Date**: 2026-11-01  
**Project**: JerayaWara (Malaysia GPS Navigation PWA)  
**Status**: Approved by Builder Review (Pending User Sign-off)  
**Author**: Antigravity  

---

## 1. Intent & Context

JerayaWara is a zero-API-cost, offline-first Progressive Web App (PWA) tailored specifically for Malaysian driving conditions across Peninsular Malaysia, Sabah, and Sarawak. 

While core turn-by-turn navigation, toll calculation, AES speed camera radar, and bilingual voice guidance are complete and verified, drivers and motorcyclists in Malaysia encounter specific local challenges:
1. **Night Driving Glare & Phone Mounting**: Drivers without car mounts often place phones on the dashboard; glare and small screens can be dangerous.
2. **Tropical Downpours & Monsoon Flash Floods (*Banjir Kilat*)**: Sudden tropical flash floods trap vehicles in underpasses and low-lying arterial corridors (e.g., Jalan Tun Razak, Batu Pahat, Shah Alam).
3. **Highway Range Anxiety (Fuel & EV)**: On long interstate expressways (PLUS E1/E2, LPT E8), drivers need to know the exact distance to the next petrol station or EV DC fast charger.
4. **Motorcyclist Safety in Heavy Rain**: In tropical downpours, motorcyclists need rapid awareness of designated expressway overhead bridge rain shelters (*Pondok Berteduh / Jejantas Motosikal*).
5. **Commute Efficiency & Data Ownership**: Quick 1-tap routing for everyday commutes (*Rumah*, *Kerja*, *Balik Kampung*) and open GPX trip exporting without cloud accounts or subscription paywalls.

All 5 features will be implemented with **100% open-source technologies, zero API costs, and full offline capability**.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
* **G1: Windshield HUD Mirror Mode**: A full-screen cockpit view with `scaleX(-1)` horizontal mirroring, high-contrast OLED black background (`#000000`), huge speed readout, and high-visibility turn instructions that reflect cleanly onto the car's windshield glass at night. Supports both active navigation and free cruising.
* **G2: Banjir Kilat Flash Flood Radar**: Embedded database of verified Malaysian flash flood blackspots. When rainy weather is detected (or toggled in offline rain mode) and the vehicle is within 2 km of a flood hotspot, display an alert banner and spoken voice caution in BM or EN.
* **G3: Expressway Petrol & EV Charger Route Planner**: Scan the active route corridor (within 500m of the highway polyline) and display upcoming petrol stations (**Petronas, Shell, Caltex, BHP**) and EV DC fast chargers (**Gentari, ChargEV, DC Handal**) with category tabs and real-time distance countdowns in an "En-Route Services" drawer card.
* **G4: Motorcycle Rain Shelter Radar**: When vehicle mode is set to **Motorcycle** and rain is active, detect and display the nearest designated expressway overhead bridges (*jejantas*) with safe pull-in bays.
* **G5: Saved Favorites & Client-Side GPX Export**: Quick-select pill chips (*Rumah*, *Kerja*, *Balik Kampung*, *+ Tambah*) on the home search interface stored in IndexedDB (Dexie.js), plus 1-click GPX track export generated locally in the browser from the Trip Summary drawer.

### Non-Goals
* **NG1**: No centralized cloud accounts, user registration, or external backend servers. Everything runs entirely client-side on the user's device.
* **NG2**: No paid third-party APIs (no Google Places API, no paid TomTom/Here APIs).

### Anti-Goals
* **AG1: Never Clutter Navigation View**: Floating controls and HUD elements must not block the center road polyline or the driver's forward view.
* **AG2: Never Drain Excessive Battery**: Mirror HUD must use pure black OLED styling (`#000000`) with disabled background map rendering while HUD is active to conserve mobile battery.
* **AG3: Never Interfere with Critical Maneuver Audio**: Flood and shelter warnings must yield priority to immediate turn-by-turn maneuver voice instructions.

---

## 3. Approaches Considered & Selected

### Approach A: Unified Driving Cockpit & En-Route Drawer (Selected by User)
* **Architecture**: 
  * HUD Mode accessible via a clean button in the Speedometer HUD or drawer. When active, opens a dedicated full-screen overlay component with mirrored rendering and 1-tap exit.
  * En-Route Services (Petrol, EV, Shelters) integrated cleanly as an expandable card in the bottom navigation drawer with filter tabs.
  * Flood alerts integrated directly into the top alert system alongside AES radar.
  * Favorites displayed as clean horizontal chip buttons above the search input.
* **Trade-offs**: Highest automotive polish, zero screen clutter, completely modular codebase.

### Approach B: Autonomous Floating Widgets
* **Architecture**: Floating buttons on the map viewport for HUD, Petrol, Flood, and Favorites.
* **Trade-offs**: Direct map clicks, but quickly crowds mobile screens and conflicts with map controls and speedometer gauge. *(Rejected)*

### Approach C: Two-Phase Staged Implementation
* **Architecture**: Roll out HUD and Flood in Phase 1; Petrol and GPX in Phase 2.
* **Trade-offs**: Delays full utility delivery. User explicitly requested all 5 features in a unified release. *(Rejected)*

---

## 4. Detailed Component & System Architecture (with Builder Decisions)

### 4.1 Windshield HUD Mirror Mode (`src/components/hud/WindshieldHudOverlay.tsx`)
* **Trigger**: A "HUD" icon button on the Speedometer gauge and inside the bottom drawer.
* **Visuals & Dual Modes** *(Builder Call)*:
  * Root container: `fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 select-none`.
  * Mirroring CSS: `style={{ transform: 'scaleX(-1)' }}`.
  * **Cruising Mode (No Active Route)**: Massive digital speed display (7rem font), road speed limit badge, compass cardinal heading, and current road name.
  * **Navigation Mode (Active Route)**: Large maneuver arrow icon, distance to turn (e.g., `850 m`), next road name, and ETA countdown.
  * 1-Tap Dismiss: Tapping anywhere on the screen cleanly closes HUD mode and returns to normal map view.
  * Device Screen Lock: Fully inherits the active `useWakeLock` screen sentinel.

### 4.2 Flash Flood (*Banjir Kilat*) Warning Engine (`src/services/safety/floodHotspotsData.ts`)
* **Dataset**: Verified historical monsoon flood blackspots:
  * SMART Tunnel catchment & Jalan Tun Razak underpass, KL
  * Jalan Pahang & Bulatan Pahang underpass, KL
  * Batu Pahat low-lying stretches (Federal Route 50)
  * Shah Alam Section 13 & Stadium roundabout
  * Klang Bukit Raja & Meru arterial junctions
  * Segamat & Kota Tinggi river basin crossings (Johor)
  * Kuantan Jalan Sungai Lembing corridor (Pahang)
* **Rain Condition Handling** *(Builder Call)*:
  * Online: Driven automatically by Open-Meteo live weather data.
  * Offline / On-demand: Drivers can tap the weather badge on `SpeedometerOverlay` to toggle "Rain Mode" on or off manually. This guarantees 100% offline flood alerts and shelter triggers without false alarms on clear days.
* **Detection Logic**:
  * Function `findNearbyFloodHotspot(currentCoord: [number, number], thresholdKm = 2.0): FloodHotspot | null`.
  * Spoken Voice Alert:
    * **BM**: *"Awas: Kawasan berisiko banjir kilat di hadapan. Berhati-hati memandu."*
    * **EN**: *"Caution: Flash flood risk area ahead. Drive with extra care."*

### 4.3 Expressway En-Route Petrol & EV Charger Planner (`src/services/amenities/`)
* **Files**:
  * `src/services/amenities/types.ts`: `EnRouteAmenity` interface (`id`, `name`, `type`: `'petronas' | 'shell' | 'caltex' | 'bhp' | 'ev_fast_charger'`, `expressway`, `kmMarker`, `coordinates`, `evSpecs?`).
  * `src/services/amenities/expresswayAmenitiesData.ts`: Dataset of major expressway R&Rs and laybys along PLUS E1, PLUS E2, Karak & LPT E8 with brand tags and EV fast charger operators (Gentari, ChargEV, DC Handal with wattage tags e.g. `150 kW DC`).
  * Proximity along polyline function: `getUpcomingAmenities(routeCoordinates: [number, number][], currentCoord: [number, number], category?: 'all' | 'petrol' | 'ev', limit = 3): EnRouteAmenityWithDistance[]`.
* **UI & Category Separation** *(Builder Call)*:
  * `src/components/navigation/EnRouteServicesCard.tsx`: Rendered in the bottom drawer during active navigation with filter tabs `[Semua] [⛽ Petrol] [⚡ EV Charger]`. EV drivers see the next upcoming chargers and petrol drivers see their preferred stations without crowding.

### 4.4 Motorcycle Rain Shelter Radar (`src/services/amenities/motorcycleSheltersData.ts`)
* **Dataset**: Designated motorcycle rain shelters (*Pondok Berteduh / Jejantas Motosikal*) along:
  * PLUS E1 & E2 (Expressway overhead bridges with widened safety shoulder)
  * Federal Highway (Route 2) motorcycle lane shelters
  * KESAS (E5) overhead bridge shelters
* **Logic**:
  * Function `findNearbyMotorcycleShelter(coord: [number, number], thresholdKm = 3.0): MotorcycleShelter | null`.
  * Active only when `travelMode === 'motorcycle'` and rain is active.
  * Announced with voice caution:
    * **BM**: *"Pondok teduhan hujan motosikal 1.5 kilometer di hadapan."*
    * **EN**: *"Motorcycle rain shelter 1.5 kilometers ahead."*

### 4.5 Saved Favorites & GPX Route History (`src/services/favorites/`)
* **IndexedDB Storage** (`src/services/favorites/favoritesStore.ts`):
  * Dexie schema: `db.version(2).stores({ favorites: 'id, category, title, coordinates, createdAt', tripHistory: 'id, destinationTitle, date, distanceKm, coordinates' })`.
  * Pre-populated defaults: `Rumah` (Home), `Kerja` (Office), `Balik Kampung` (Hometown) which the user can easily assign from any search destination or pin.
* **GPX Route Exporter** (`src/services/favorites/gpxExporter.ts`) *(Builder Call)*:
  * Placed as an "Export GPX Track" button inside `TripSummaryDrawer` and in trip history.
  * Formats valid GPX 1.1 XML string and triggers browser file download (e.g. `jerayawara-trip-2026-11-01.gpx`).
* **UI**:
  * `src/components/favorites/FavoritesQuickChips.tsx`: Rendered above the SearchBar with icons: 🏠 *Rumah*, 💼 *Kerja*, 🌴 *Balik Kampung*, ➕ *Tambah*.

---

## 5. Verification Plan
* **Unit Tests**:
  * `tests/hud/windshieldHud.test.tsx`: Verify HUD mirror transform, large speed display, cruising vs navigating layouts, tap-to-exit.
  * `tests/safety/floodRadar.test.ts`: Verify proximity detection and rain condition trigger.
  * `tests/amenities/expresswayAmenities.test.ts`: Verify en-route petrol & EV stop calculation along polyline and category filtering.
  * `tests/amenities/motorcycleShelters.test.ts`: Verify shelter proximity detection for motorcyclists.
  * `tests/favorites/favoritesAndGpx.test.ts`: Verify IndexedDB favorites CRUD and valid GPX 1.1 XML generation.
* **Build Verification**:
  * `npm test` passing with 100% success rate across all test files.
  * `npm run build` passing with zero TypeScript errors.
* **Live Deployment**:
  * Push to GitHub repository `main` branch.
  * Verify GitHub Pages deployment success.
