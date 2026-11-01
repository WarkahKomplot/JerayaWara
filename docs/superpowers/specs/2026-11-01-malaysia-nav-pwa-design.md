# JerayaWara — Malaysia Navigation PWA (Open-Source) Architectural Design Document

**Date:** 2026-11-01  
**Project:** JerayaWara (`jerayawara-pwa`)  
**Status:** In Review (Brainstorming Design Phase)  
**Author:** AI Pair Programmer & User  

---

## 1. Intent and the Why

Navigation applications like Waze and Google Maps are heavily cloud-reliant, proprietary, consume significant mobile data, and often struggle in rural or low-connectivity zones across Malaysia (e.g., East Coast Highway LPT2, mountainous stretches of Karak, interior Sabah and Sarawak). Furthermore, drivers and motorcyclists in Malaysia need accurate toll costs (Touch 'n Go, RFID) and distinct vehicle modes:
- **Cars** need upfront toll expense breakdowns across closed and open toll systems (PLUS, MEX, DUKE, KESAS, LDP, etc.).
- **Motorcycles** need routes that highlight dedicated motorcycle lanes (*lorong motosikal* on Federal Highway, KESAS, Guthrie) and reflect toll exemptions (RM 0.00 at most Malaysian toll plazas).
- **Pedestrians** need routes strictly avoiding expressways and highway interchanges.

This project delivers an **open-source, privacy-first, offline-ready Progressive Web App (PWA)** specifically tailored to Malaysia. It delivers 60 FPS performance on both mid-range and flagship Android and iOS devices, scales adaptively across all screen geometries—including foldable unfolded dual screens—and operates without internet connection using device GPS and smart background-cached regional map packages.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Malaysia-Centric Navigation**: Complete coverage of Peninsular Malaysia (West) and Sabah & Sarawak (East).
- **Offline-First with GPS**: Full turn-by-turn guidance, distance/ETA calculation, bearing tracking, and route recalculation using device GPS without requiring mobile data.
- **Smart Regional Packages & Proximity Auto-Download**: Partition Malaysia into 6 modular packs (Klang Valley, Northern, Southern, East Coast, Sabah, Sarawak). Proactively fetch neighboring regions when within 15 km of state borders.
- **Accurate Malaysia Toll Estimation**: Real-time calculation of toll fares across all active Malaysian highway concessionaires by vehicle class (Car Class 1 vs Motorcycle Class 0).
- **Dedicated Vehicle & Pedestrian Modes**:
  - `Car`: Full expressway routing with toll calculation.
  - `Motorcycle`: Highlights dedicated bike lanes, alerts on bike-prohibited expressways, zero-rated tolls.
  - `Walker`: Strictly non-highway pedestrian routing.
- **Foldable & Multi-Resolution Ergonomics**: Adaptive single-pane floating card on standard phones; automatic side-by-side cockpit (route ledger on left, map on right) on foldable unfolded displays.
- **Automatic Day/Night Theming**: Dynamic theme switching that adapts both UI components and map vector styling to device `prefers-color-scheme` and driving conditions.
- **High Performance on Mid-Range Chips**: WebGL-accelerated 60 FPS map rendering, lightweight bundle (< 3 MB initial app shell), and smooth panning/rotation.
- **100% Open Source**: Fully open codebase, OpenStreetMap (OSM) data integration, and open toll matrices under permissive licensing (MIT/Apache-2.0).

### Non-Goals
- Global mapping outside Malaysia (strict scope constraint to preserve storage and performance).
- Proprietary proprietary traffic cameras or live user reporting feeds in v1 (can be added later as open-source telemetry plugins).
- Native app store binary wrapping (it is a pure PWA installable from Safari/Chrome via "Add to Home Screen").

### Anti-Goals
- Heavy multi-gigabyte monolithic downloads that saturate mid-range phone storage and crash iOS Safari PWA cache limits.
- Background location tracking when the app is closed (respect user battery and privacy; location is active only during navigation sessions).
- Closed proprietary map APIs (no Google Maps JavaScript API or Mapbox paid token lock-in).

---

## 3. Constraints

1. **Browser PWA Storage Quotas**: Mobile Safari on iOS imposes storage limits per origin (typically 500 MB – 1 GB depending on available disk space) and can evict cache if storage pressure occurs. Regional bundles must remain lightweight (30 MB – 70 MB per region) using compressed vector tiles and optimized GeoJSON routing graphs.
2. **Device GPS & Sensor Permissions**: PWAs require explicit user permission for `navigator.geolocation.watchPosition` and `DeviceOrientationEvent` (compass heading). On iOS Safari, DeviceOrientation requires a user gesture trigger (`DeviceOrientationEvent.requestPermission()`).
3. **Mid-Range GPU Performance**: Vector tile rendering must utilize WebGL (via MapLibre GL JS) with efficient layer styling, level-of-detail (LOD) simplification, and symbol collision management to sustain 60 FPS on mid-range devices (e.g., Snapdragon 600/700 series, MediaTek Dimensity 700/800 series).
4. **Foldable Posture Detection**: Must support emerging CSS `@media (screen-spanning)` and viewport aspect ratio triggers (`aspect-ratio < 1.15` and width > 600px) to transition fluidly between folded cover screen and unfolded tablet state.
5. **Screen Wake Lock**: Navigation apps must prevent device sleep while en route using the Screen Wake Lock API (`navigator.wakeLock.request('screen')`).

---

## 4. Approaches Considered & Selected Architecture

### Approach A: Adaptive Dual-Pane + Smart Boundary Auto-Download (**SELECTED**)
- **Architecture**:
  - **Foldable UI**: Responsive CSS Grid / Flexbox layout that dynamically displays a dual-column cockpit when unfolded (left: turn-by-turn guidance and toll ledger; right: interactive 3D WebGL map). On standard phones, collapses into a gesture-friendly bottom sheet.
  - **Offline Storage**: IndexedDB storage storing 6 distinct regional tile/graph packages (Klang Valley, Northern, Southern, East Coast, Sabah, Sarawak).
  - **Boundary Geofencing**: Background service worker triggers an auto-download of adjacent state packages when the vehicle GPS position is within 15 km of a regional boundary.
- **Pros**: Optimal screen space on foldables; zero disruption when driving across state lines; respects browser storage caps.
- **Cons**: Requires proximity calculation logic in the background worker.

### Approach B: HUD-First Ultra-Lightweight
- **Architecture**: Single full-screen canvas everywhere with floating HUD pills. Manual download only for state packs.
- **Pros**: Minimal DOM nodes; slightly easier initial layout.
- **Cons**: Wastes screen real estate on foldables and tablets; requires manual user intervention when driving across borders.

### Approach C: Driver & Rider High-Visibility Cockpit
- **Architecture**: Oversized typography and high-contrast dashboard mode.
- **Pros**: Great for handlebar phone mounts.
- **Cons**: Cluttered on standard smaller phone screens; less detailed preview of upcoming turns.

**Decision:** **Approach A** was approved by the user for its optimal balance of foldable adaptivity, mid-range storage efficiency, and seamless interstate travel.

---

## 5. Detailed System Design & Components

### 5.1 Technology Stack
- **Application Framework**: React 18 / Vite with TypeScript (high speed, type safety, tree-shaking).
- **Styling**: Tailwind CSS with custom CSS variables for smooth day/night transitions and foldable media queries.
- **Map & WebGL Engine**: MapLibre GL JS (open source, hardware-accelerated, supports vector tile packages and offline tile caching via custom protocol `indexeddb://`).
- **Offline Storage Engine**: Dexie.js (IndexedDB wrapper) for storing vector tiles, routing topology, and saved places; Cache Storage API for PWA assets.
- **Routing Engine**: Client-side pathfinding engine (compact A* / contraction hierarchy on pre-processed Malaysia OpenStreetMap highway graph) supporting Car, Motorcycle, and Foot profiles.
- **PWA Service Worker**: Workbox-powered service worker managing offline caching, background synchronization, and network-first / cache-fallback strategies.
- **Icons**: Lucide React (featherweight SVG icons).

### 5.2 Regional Map Partitioning & Pre-Route Coverage Validation
Malaysia is partitioned into 6 geographic packages:
1. **Klang Valley & Central**: Selangor, WP Kuala Lumpur, WP Putrajaya (~65 MB).
2. **Northern Region**: Perak, Penang, Kedah, Perlis (~55 MB).
3. **Southern Region**: Negeri Sembilan, Melaka, Johor (~50 MB).
4. **East Coast**: Pahang, Terengganu, Kelantan (~45 MB).
5. **Sarawak**: Kuching, Sibu, Miri, Bintulu (~45 MB).
6. **Sabah & WP Labuan**: Kota Kinabalu, Sandakan, Tawau, Labuan (~40 MB).

**Nationwide Highway Spine**: A shared core network package (~12 MB) containing all expressways (PLUS E1/E2, E8 LPT, E22 SDE, Pan-Borneo Highway) bundled by default so cross-country routing always works even before regional city packs are downloaded.

**Inter-State Coverage Flow (Builder Call)**:
When a destination falls into an uncached region:
- The route planner displays an overall corridor preview using the Highway Spine.
- A polite, non-blocking modal informs the user: *"Route continues into Southern Region. Download Southern Pack (50 MB) for local street-level guidance?"* with an instant "Download Now" or "Continue on Highway Only" button.

### 5.3 Destination Search & Geocoding Strategy
- **Offline POI & Landmark Directory**: Each regional pack bundles a compact offline index of:
  - Major cities, mukims, and towns across West and East Malaysia.
  - All expressway interchanges, toll plazas, and R&R rest stops (e.g., Tapah R&R, Seremban R&R, Rawang RnR, Ayer Keroh Overhead Bridge Restaurant).
  - Prominent transit hubs, airports, hospitals, and national landmarks.
  - Fast client-side fuzzy searching using a lightweight search index (< 2 MB).
- **Online Full Geocoding**: When internet connectivity is active, the search bar seamlessly augments results with live street-level geocoding and address lookups (via free open Nominatim/Photon API), caching retrieved points locally for offline re-use.
- **Pin & Coordinate Search**: Users can also drop a pin directly on the map or paste GPS coordinates (WGS84 lat/long) in any connectivity state.

### 5.4 Hosting & Repository Architecture (Builder Call)
- The open-source project is architected as a standalone, zero-backend static PWA deployable to GitHub Pages, Cloudflare Pages, Vercel, or Netlify.
- Regional vector tile bundles and routing topologies are served from static CDN-friendly assets (or compatible open tile providers), with offline persistence handled via IndexedDB.

### 5.5 Malaysia Toll Estimation Engine
The toll calculator models both **open system** (flat rate per plaza) and **closed system** (distance-based ticket/entry-exit matrix):
- **Expressways Covered**:
  - `PLUS E1/E2` (North-South Expressway - Closed system entry/exit matrix).
  - `MEX E20` (Maju Expressway - Salak Selatan, Putrajaya, Seri Kembangan).
  - `DUKE E33` (Duta-Ulu Kelang Expressway - Batu, Sentul Pasar, Segambut).
  - `KESAS E5` (Kesas Highway - Sunway, Kemuning).
  - `LDP E11` (Damansara-Puchong Expressway - Penchala, Petaling Jaya, Puchong Barat, Puchong Selatan).
  - `SMART E38` (Stormwater Management and Road Tunnel).
  - `SPRINT E23` (Damansara, Pantai, Bukit Kiara plazas).
  - `AKLEH E12` (Ampang-Kuala Lumpur Elevated Highway).
  - `NPE E10` (New Pantai Expressway - Pantai Dalam, PJS2, PJS5).
  - `BKE E15` (Butterworth-Kulim Expressway).
  - `Penang Bridges` (First Penang Bridge & Sultan Abdul Halim Muadzam Shah Bridge).
- **Vehicle Classes**:
  - `Class 1`: Passenger cars, vans, 4WD (standard toll fare).
  - `Class 0`: Motorcycles (Free across almost all expressways; special nominal rates for Penang Bridges / Tg. Kupang where applicable).
  - `Walker`: Expressways blocked.

### 5.6 Foldable & Responsive Screen Layout Architecture
- **Breakpoint `foldable`**: Detects unfolded screens using `@media (min-width: 680px) and (min-aspect-ratio: 4/5)` or CSS Viewport Segments API:
  - **Left Pane (320px - 380px)**: Active turn banner, upcoming maneuver list, toll ledger summary, GPS signal status, speed limit HUD, audio mute toggle.
  - **Right Pane (1fr)**: Unobstructed 3D perspective WebGL map with floating re-center, zoom, and layer controls.
- **Mobile Standard (Portrait)**:
  - Full-screen map with top floating turn instruction card and bottom swipeable drawer containing ETA, distance, toll cost, and route overview.

### 5.7 Day & Night OLED Theming
- Syncs with `window.matchMedia('(prefers-color-scheme: dark)')` and time-of-day solar calculations for Malaysia (sunrise ~07:00, sunset ~19:15).
- In Night mode:
  - UI surfaces switch to deep slate/black (`#090d16`, `#1e293b`).
  - MapLibre style transitions to low-glare dark vector cartography (water `#0f172a`, roads `#334155`, active route `#38bdf8`, buildings `#1e293b`).
  - High contrast for night driving safety without pupil strain.

---

## 6. What's Left to the Builder

The builder can settle the following implementation details:
1. Specific compression algorithm for offline vector tile bundles (e.g., gzip/brotli pbf vs GeoJSON chunks).
2. Exact client-side Dijkstra/A* heuristic optimizations and indexing structures.
3. Audio voice prompt synthesis (Web Speech API `window.speechSynthesis` with Malay/English language voices).
4. Specific Touch 'n Go / RFID payment badge iconography.

---

## 7. Approval & Next Steps
Upon review and verification of this design document, we will invoke `superpowers:writing-plans` to formulate the step-by-step implementation tasks.

