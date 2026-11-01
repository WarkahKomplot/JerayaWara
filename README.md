# 🇲🇾 JerayaWara — Malaysia GPS Navigation PWA

> **JerayaWara** *(Sarawakian / Borneo Malay for "Roadway / Highway Voyager")* is a 100% zero-API-cost, offline-first Progressive Web App (PWA) navigation system engineered specifically for Malaysian driving conditions across Peninsular Malaysia, Sabah, and Sarawak.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://warkahkomplot.github.io/JerayaWara/)
[![Tests](https://img.shields.io/badge/Vitest-100%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/WarkahKomplot/JerayaWara)
[![PWA](https://img.shields.io/badge/PWA-v6%20Offline-blueviolet?style=for-the-badge)](https://warkahkomplot.github.io/JerayaWara/)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

📱 **Live Web App**: [https://warkahkomplot.github.io/JerayaWara/](https://warkahkomplot.github.io/JerayaWara/)

---

## 🌟 Key Features

### 1. 🗺️ Turn-by-Turn GPS Navigation & Malaysian Road Snapper
* **Snapped to Real Malaysian Highway Corridors**: Routes cleanly through PLUS North-South Expressway (E1 & E2), Federal Highway (Route 1), Karak Expressway & LPT (E8), KESAS (E5), MEX (E20), LDP (E11), SMART Tunnel (E38), and both Penang Bridges.
* **Continuous Electric Cyan Route Polyline**: Starts right under your blue GPS location puck and stays crisp on top of all 2D and 3D map layers.
* **Hybrid Routing Engine**: Fast OSRM open routing when online, with instant offline fallback snapped to Malaysian arterial corridors.
* **Stationary Camera Damping**: Eliminates map jitter when idling at traffic lights or parked, re-easing camera only when movement exceeds ~2.5m or heading shifts $\ge 3^\circ$, saving mobile battery.

### 2. 🪞 Windshield HUD Mirror Mode (Night Driving)
* **Zero Extra Hardware**: Tap the HUD icon button on the Speedometer gauge to flip the entire screen horizontally (`transform: scaleX(-1)`).
* **Windshield Reflection**: Place your phone flat on the dashboard below the windshield; turn instructions, distance countdowns, and speed reflect cleanly onto the glass like a luxury car's built-in Head-Up Display.
* **Dual Cockpit Layouts**:
  * **Free Cruising**: Oversized digital speed number (7rem font), road speed limit badge, cardinal compass heading, and current road name.
  * **Active Navigation**: Prominent turn maneuver arrows, distance countdown to next junction, and destination name.
* **OLED Black `#000000` Power Saver**: Minimizes battery drain with pure black pixels and 1-tap exit anywhere on screen.

### 3. 🌊 Banjir Kilat (Flash Flood) Caution Hotspot Radar
* **Malaysian Flood Blackspot Database**: Maps verified historical flash flood locations across Malaysia:
  * **Klang Valley**: Jalan Tun Razak underpass, Bulatan Pahang (HKL underpass), Shah Alam Seksyen 13 (Stadium), Klang Meru & Bukit Raja.
  * **Johor**: Batu Pahat low-lying stretches (FT50), Segamat river basin, Kota Tinggi bridge.
  * **Pahang**: Kuantan Jalan Sungai Lembing corridor.
* **Weather & Manual Rain Correlation**: Automatically triggers when rain is detected (or when manually toggled in offline rain mode).
* **Bilingual Voice Caution**: Announces: *"Awas: Kawasan berisiko banjir kilat di hadapan. Berhati-hati memandu."* or *"Caution: Flash flood risk area ahead. Drive with extra care."*

### 4. ⛽ Expressway En-Route Petrol & EV Charger Planner
* **Dynamic Highway Corridor Scanning**: Calculates upcoming services along the active expressway polyline with real-time distance countdowns (e.g., *Petronas R&R Tapah · 18 km*).
* **Filter Tabs**: Toggle between `[Semua / All]`, `[⛽ Petrol]`, and `[⚡ EV Charger]`.
* **Verified Malaysian Brands**: Covers **Petronas**, **Shell**, **Caltex**, and **BHP**, alongside high-power DC fast chargers from **Gentari**, **ChargEV**, and **DC Handal** (with wattage tags, e.g. `150 kW DC`).
* **Non-Intrusive Collapsible Design**: Collapsed by default into an ultra-slim status pill inside the Trip Summary drawer, ensuring 100% unobstructed full-screen map visibility during active navigation. Tapping expands station cards only when needed.

### 5. 🏍️ Motorcycle Rain Shelter Radar (*Pondok Berteduh Motosikal*)
* **Rider Rain Protection**: Detects designated expressway overhead bridges (*jejantas*) with widened safety pull-in bays on PLUS E1, PLUS E2, Federal Highway Route 2, and KESAS E5.
* **Automated Audio Alert**: When in **Motorcycle Mode** and rain is active, announces: *"Pondok teduhan hujan motosikal di hadapan pada KM 445."*

### 6. 📍 Saved Favorites & Client-Side GPX Route Export
* **Quick Access Chips**: 1-tap quick buttons directly above the search bar: 🏠 *Rumah* (*Home*), 💼 *Kerja* (*Work*), 🌴 *Balik Kampung* (*Hometown*).
* **Reset & Delete Favorite Locations**: Each saved favorite chip includes an intuitive `(X)` reset button with a safety confirmation prompt, allowing drivers to clear or re-pin saved GPS coordinates anytime.
* **100% Private Offline Storage**: Stored locally in your phone's browser IndexedDB (Dexie.js).
* **Standard GPX 1.1 Export**: Export any active route as a valid `.gpx` file with one tap inside the Trip Summary drawer—compatible with Strava, Garmin, Google Earth, and OsmAnd.

### 7. 📸 Malaysian AES / AwAS Speed Camera Radar & Voice Alerts
* **Verified Expressway Radar Database**: Embedded geolocations of Malaysian Automated Enforcement System (AES / AwAS) cameras across PLUS E1, PLUS E2, Federal Highway, SKVE, SILK, Karak, and LPT.
* **Early Proximity Detection (1.2 km)**: Detects approaching speed cameras with real-time distance countdown banner.
* **Automated Voice Caution**: Alerts drivers in BM or English: *"Awas, kamera AES di hadapan. Had laju 110 kilometer sejam."* or *"Caution, AES speed camera ahead. Speed limit 110 kilometers per hour."*

### 8. ⏱️ Circular Speedometer HUD & Overspeed Alert
* **Ergonomic Bottom-Left Circular Gauge**: Sleek circular speedometer positioned non-intrusively in the bottom-left corner (`bottom-28 left-4`), keeping the central road view 100% unobstructed.
* **Road Speed Limit Badge**: Real-time statutory expressway / federal road speed limit (e.g. 110 km/h, 90 km/h, 60 km/h).
* **Overspeed Warning Glow**: Pulses crimson red when vehicle speed exceeds the legal limit.
* **Interactive Weather & Rain Toggle**: Tapping the weather pill allows manual toggling of "Rain Mode" for offline safety radar testing.

### 9. 🔍 Google Maps-Parity POI Search, Coordinates & Link Parsing
* **Raw GPS Coordinate Input**: Paste decimal coordinates directly (e.g. `2.9904, 101.7925` or `101.7925, 2.9904`) with smart latitude/longitude swapping.
* **Google Maps Share Links**: Paste shared links directly from Google Maps, Apple Maps, or Waze; coordinates are instantly parsed and pinned.
* **Colloquial Malaysian Abbreviation Expansion**: Recognizes colloquial terms like `hosp` ➔ *hospital*, `bdr` ➔ *bandar*, `tmn` ➔ *taman*, `jln` ➔ *jalan*, `stn` ➔ *stesen*, `klia` ➔ *KLIA*, `klcc` ➔ *KLCC*, `hkl` ➔ *Hospital Kuala Lumpur*.
* **Expanded Offline Landmark Directory (60+ Major Destinations)**: Malls (Mid Valley, Pavilion, 1 Utama, Sunway Pyramid, IOI City Mall), Airports (KLIA T1/T2, Subang), Hospitals (HKL, Hospital Kajang, Serdang), Universities (UM, UKM, UTM, USM, UiTM), and tourist hubs (Batu Caves, Genting, Cameron Highlands).

### 10. 🌐 🗣️ Comprehensive Bilingual UI & Voice System (Bahasa Melayu & English)
* **Centralized Reactive i18n Dictionary (`translations.ts`)**: 1-tap global language toggle directly in the header (`BM / EN`) or TurnBanner that synchronously updates every single component across the entire app without page refreshes.
* **100% Unified Interface Translation**:
  * **Header**: Status indicators (`GPS Aktif` ⇄ `GPS Active`), (`Peta Luar Talian` ⇄ `Offline Maps`), and solar badges (`SIANG`/`MALAM` ⇄ `DAY`/`NIGHT`).
  * **Turn-by-Turn Guidance**: Dynamic maneuver localization engine (`getLocalizedStepInstruction`) translates directions into natural Bahasa Melayu (*"Belok kiri ke..."*, *"Susur keluar kanan ke..."*, *"Kekal di lorong kanan ke..."*, *"Tiba di destinasi"*) or English (*"Turn left onto..."*, *"Take exit on right onto..."*, *"Arrive at destination"*) while preserving exact Malaysian highway numbers and road names.
  * **Trip Summary & Drawer**: Traffic congestion badges, toll fare notes (`KADAR TOL` ⇄ `TOLL FARES`), turn counts, and action buttons (`Keluar Navigasi`, `Eksport GPX`, `Laluan GPS Langsung` ⇄ `Exit Navigation`, `Export GPX`, `Live GPS Route`).
  * **Amenities & Modals**: Category filters, distance indicators, Toll Plaza Breakdown modal, and Offline Region Pack download modal are completely bilingual.
* **100% Offline Speech Synthesis**: Native browser Web Speech API voice guidance that switches dynamically between natural Bahasa Melayu and English pronunciation.

### 11. 🚦 Smart Peak-Hour Traffic Congestion Engine (100% Offline)
* **Malaysian Rush Hour Mathematical Modeling**:
  * **Morning Peak (7:00 AM – 9:30 AM)**: Klang Valley inbound commuter corridors (Federal Highway, PLUS Sungai Besi, Subang, MEX, LDP).
  * **Evening Peak (5:00 PM – 8:00 PM)**: Outbound bottlenecks and ring road congestion.
  * **Friday Afternoon Peak (12:30 PM – 2:30 PM)**: Friday prayers & interstate *balik kampung* travel.
  * **Midday & Night Cruising**: Smooth off-peak cruising.
* **Congestion Level Badges**: Displays *Lancar* (Green), *Sederhana* (Orange), or *Sesak Waktu Puncak* (Red) with accurate ETA delay factors (e.g. `+18m`).
* **Motorcycle Lane-Filtering Factor**: Automatically adjusts travel time for motorcyclists during peak hours, modeling ~65% faster corridor progression through highway traffic jams.

### 12. 🛣️ Malaysia Expressway Toll Estimation Engine
* **Closed-System Toll Matrices**: Distance-based entry/exit fare matrices for PLUS Northern (E1), PLUS Southern (E2), and LPT (E8).
* **Barrier Plazas**: Accurate rates for MEX (E20), KESAS (E5), LDP (E11), SPRINT (E23), SMART Tunnel (E38), and Penang Bridges (E28 & E36).
* **Detailed Breakdown Modal**: Inspect an itemized list of every toll plaza crossed with vehicle class rates (Class 1–5) and payment methods (**Touch 'n Go**, **RFID**, **SmartTAG**).

### 13. 🚗 🏍️ 🚶 Tailored Travel Profiles & Safety Warnings
* **🚗 Car (Class 1)**: Expressway routing with full toll calculations and multi-lane guidance.
* **🏍️ Motorcycle (Class 0)**:
  * Highlights dedicated motorcycle lanes (*Lorong Motosikal* on Federal Highway, PLUS, KESAS).
  * Automatically sets toll fares to RM 0.00 (Class 0 exemption).
  * **SMART Tunnel (E38) Warning**: Automatically flashes an alert advising motorcyclists to take surface alternatives, as motorcycles are strictly prohibited from the tunnel.
* **🚶 Walker**: Excludes expressways completely, prioritizing safe sidewalks and footpaths.

### 14. 📱 📖 Foldable & Multi-Resolution Ergonomics
* **Standard Phones (Portrait)**: High-visibility top turn banner with speed limit HUD and swipeable bottom drawer with one-thumb reachability.
* **Foldable Phones Unfolded (Dual-Pane Cockpit)**: Dynamically expands on unfolded displays (Galaxy Z Fold, Google Pixel Fold, OnePlus Open) into a side-by-side cockpit:
  * **Left Pane**: Step-by-step turn list, toll breakdown summary, and offline status.
  * **Right Pane**: Unobstructed 3D WebGL vector map.

### 15. ⚡ Offline-First Architecture & Proactive Boundary Downloads
* Partitioned into **6 modular regional packages**:
  1. **Klang Valley & Central** (Selangor, KL, Putrajaya)
  2. **Northern Region** (Perak, Penang, Kedah, Perlis)
  3. **Southern Region** (Negeri Sembilan, Melaka, Johor)
  4. **East Coast** (Pahang, Terengganu, Kelantan)
  5. **Sarawak Region** (Kuching, Sibu, Bintulu, Miri)
  6. **Sabah & Labuan Region** (Kota Kinabalu, Sandakan, Tawau, Labuan)
* **15 km Proximity Geofencing**: Proactively detects when a driver is approaching state/regional borders (e.g., crossing Tanjung Malim into Perak) and triggers background downloads of neighboring packages.
* **IndexedDB Vector Caching**: Powered by Dexie.js for persistent offline map storage within browser storage caps.

### 16. 🌙 ☀️ Malaysia Astronomical Solar View (Zero-API Day/Night)
* High-precision astronomical solar calculator based on UTC+8 geographical coordinates.
* Automatically transitions between Day and OLED Night based on exact Malaysian sunrise and sunset (~07:12 AM / ~19:15 PM in Peninsular, ~06:14 AM / ~18:15 PM in Sabah & Sarawak).
* Hardware WebGL dark shaders dim brightness and desaturate daytime colors to protect night vision without downloading dark tile sets.

### 17. 💡 Dual-Layer Screen Anti-Sleep Engine
* Keeps mobile navigation screens permanently active without accidental display sleep during drives.
* **Hardware Layer**: W3C Screen Wake Lock API (`navigator.wakeLock.request('screen')`).
* **Media Fallback Layer**: Silent, looping 1x1 video sentinel for iOS Safari or non-HTTPS local network testing.
* Automatic reacquisition upon app switching (`visibilitychange`) and 15-second heartbeat monitor.

---

## 📲 How to Install as a PWA

### iOS (Safari)
1. Open [https://warkahkomplot.github.io/JerayaWara/](https://warkahkomplot.github.io/JerayaWara/) in **Safari**.
2. Tap the **Share** button (square with an upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner. JerayaWara will open in standalone fullscreen mode like a native app.

### Android (Chrome / Brave / Edge)
1. Open [https://warkahkomplot.github.io/JerayaWara/](https://warkahkomplot.github.io/JerayaWara/) in your browser.
2. Tap the three dots menu or look for the **"Install App"** prompt in the address bar.
3. Tap **"Install"** to add JerayaWara directly to your app launcher.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript (Strict Mode), Vite |
| **Styling & Theme** | Tailwind CSS, Lucide React, Hardware WebGL Night Shaders |
| **Map Rendering** | MapLibre GL JS (60 FPS Vector & Raster rendering, 3D tilt) |
| **Offline Storage** | Dexie.js (IndexedDB wrapper) & CacheStorage Service Worker |
| **Voice Navigation** | Web Speech API (`SpeechSynthesisUtterance`), Bilingual (BM / EN) |
| **Bilingual Localization** | Centralized reactive i18n system (`translations.ts`) for all UI |
| **Weather & Radar** | Open-Meteo API (Free/Zero-API-key) & Malaysian AwAS/AES DB |
| **Screen Lock** | W3C Screen Wake Lock API with NoSleep video fallback |
| **Testing** | Vitest, React Testing Library (**100 unit tests across 25 suites**) |

---

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/WarkahKomplot/JerayaWara.git
cd JerayaWara

# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit test suite (100 tests across 25 suites)
npm test

# Build production bundle with optimized code splitting
npm run build
```

---

## 📄 License

Open-source licensed under the [MIT License](LICENSE).  
Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.  
Toll rates compiled from Malaysian Highway Authority (LLM) public rate schedules.
