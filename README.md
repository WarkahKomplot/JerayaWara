# 🇲🇾 JerayaWara — Malaysia GPS Navigation PWA

> **JerayaWara** *(Sarawakian / Borneo Malay for "Roadway / Highway Voyager")* is a 100% zero-API-cost, offline-first Progressive Web App (PWA) navigation system engineered specifically for Malaysian driving conditions across Peninsular Malaysia, Sabah, and Sarawak.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://warkahkomplot.github.io/JerayaWara/)
[![Tests](https://img.shields.io/badge/Vitest-56%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/WarkahKomplot/JerayaWara)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

📱 **Live Web App**: [https://warkahkomplot.github.io/JerayaWara/](https://warkahkomplot.github.io/JerayaWara/)

---

## 🌟 Key Features

### 1. 🗺️ Turn-by-Turn GPS Navigation & Malaysian Road Snapper
* **Snapped to Real Malaysian Highway Corridors**: Routes cleanly through PLUS North-South Expressway (E1 & E2), Federal Highway (Route 1), Karak Expressway & LPT (E8), KESAS (E5), MEX (E20), LDP (E11), SMART Tunnel (E38), and both Penang Bridges.
* **Continuous Electric Cyan Route Polyline**: Starts right under your blue GPS location puck and stays crisp on top of all 2D and 3D map layers.
* **Hybrid Routing Engine**: Fast OSRM open routing when online, with instant offline fallback snapped to Malaysian arterial corridors.
* **Stationary Camera Damping**: Eliminates map jitter when idling at traffic lights or parked, re-easing camera only when movement exceeds ~2.5m or heading shifts $\ge 3^\circ$, saving mobile battery.

### 2. 🗣️ Bilingual Voice Navigation (Bahasa Melayu & English)
* **100% Offline Speech Synthesis**: Operates through the browser's native Web Speech API without any cloud API keys or mobile data usage.
* **Interactive BM / EN Language Toggle**: Instant 1-tap language switch directly on the top TurnBanner:
  * **Bahasa Melayu (BM)**: *"Memulakan navigasi menuju ke Seremban. Pandu dengan cermat."*, *"Di hadapan, belok kanan ke Jalan Bukit."*, *"Kekal di lorong kiri ke lebuh raya."*, *"Anda telah tiba di destinasi."*
  * **English (EN)**: *"Starting navigation to Seremban. Drive safely."*, *"In front, turn right onto Jalan Bukit."*, *"Keep left onto expressway."*, *"You have arrived at your destination."*
* **Audio Mute/Unmute**: Convenient 1-tap sound controls with persistent preference memory.

### 3. 🚦 Smart Peak-Hour Traffic Congestion Engine (100% Offline)
* **Malaysian Rush Hour Mathematical Modeling**:
  * **Morning Peak (7:00 AM – 9:30 AM)**: Klang Valley inbound commuter corridors (Federal Highway, PLUS Sungai Besi, Subang, MEX, LDP).
  * **Evening Peak (5:00 PM – 8:00 PM)**: Outbound bottlenecks and ring road congestion.
  * **Friday Afternoon Peak (12:30 PM – 2:30 PM)**: Friday prayers & interstate *balik kampung* travel.
  * **Midday & Night Cruising**: Smooth off-peak cruising.
* **Congestion Level Badges**: Displays *Lancar* (Green), *Sederhana* (Orange), or *Sesak Waktu Puncak* (Red) with accurate ETA delay factors (e.g. `+18m`).
* **Motorcycle Lane-Filtering Factor**: Automatically adjusts travel time for motorcyclists during peak hours, modeling ~65% faster corridor progression through highway traffic jams.

### 4. 🛣️ Malaysia Expressway Toll Estimation Engine
* **Closed-System Toll Matrices**: Distance-based entry/exit fare matrices for PLUS Northern (E1), PLUS Southern (E2), and LPT (E8).
* **Barrier Plazas**: Accurate rates for MEX (E20), KESAS (E5), LDP (E11), SPRINT (E23), SMART Tunnel (E38), and Penang Bridges (E28 & E36).
* **Detailed Breakdown Modal**: Inspect an itemized list of every toll plaza crossed with vehicle class rates (Class 1–5) and payment methods (**Touch 'n Go**, **RFID**, **SmartTAG**).

### 5. 🚗 🏍️ 🚶 Tailored Travel Profiles & Safety Warnings
* **🚗 Car (Class 1)**: Expressway routing with full toll calculations and multi-lane guidance.
* **🏍️ Motorcycle (Class 0)**:
  * Highlights dedicated motorcycle lanes (*Lorong Motosikal* on Federal Highway, PLUS, KESAS).
  * Automatically sets toll fares to RM 0.00 (Class 0 exemption).
  * **SMART Tunnel (E38) Warning**: Automatically flashes an alert advising motorcyclists to take surface alternatives, as motorcycles are strictly prohibited from the tunnel.
* **🚶 Walker**: Excludes expressways completely, prioritizing safe sidewalks and footpaths.

### 6. 📱 📖 Foldable & Multi-Resolution Ergonomics
* **Standard Phones (Portrait)**: High-visibility top turn banner with speed limit HUD and swipeable bottom drawer with one-thumb reachability.
* **Foldable Phones Unfolded (Dual-Pane Cockpit)**: Dynamically expands on unfolded displays (Galaxy Z Fold, Google Pixel Fold, OnePlus Open) into a side-by-side cockpit:
  * **Left Pane**: Step-by-step turn list, toll breakdown summary, and offline status.
  * **Right Pane**: Unobstructed 3D WebGL vector map.

### 7. ⚡ Offline-First Architecture & Proactive Boundary Downloads
* Partitioned into **6 modular regional packages**:
  1. **Klang Valley & Central** (Selangor, KL, Putrajaya)
  2. **Northern Region** (Perak, Penang, Kedah, Perlis)
  3. **Southern Region** (Negeri Sembilan, Melaka, Johor)
  4. **East Coast** (Pahang, Terengganu, Kelantan)
  5. **Sarawak Region** (Kuching, Sibu, Bintulu, Miri)
  6. **Sabah & Labuan Region** (Kota Kinabalu, Sandakan, Tawau, Labuan)
* **15 km Proximity Geofencing**: Proactively detects when a driver is approaching state/regional borders (e.g., crossing Tanjung Malim into Perak) and triggers background downloads of neighboring packages.
* **IndexedDB Vector Caching**: Powered by Dexie.js for persistent offline map storage within browser storage caps.

### 8. 🔍 Hybrid Offline/Online Search Directory
* **Embedded Offline Directory**: Instant search across Malaysian cities, mukims, highway exits (R&Rs, toll plazas), and major landmarks without internet.
* **Live Online Geocoding**: Augments queries with live street addresses via open geocoding when cellular data is available.

### 9. 🌙 ☀️ Malaysia Astronomical Solar View (Zero-API Day/Night)
* High-precision astronomical solar calculator based on UTC+8 geographical coordinates.
* Automatically transitions between Day and OLED Night based on exact Malaysian sunrise and sunset (~07:12 AM / ~19:15 PM in Peninsular, ~06:14 AM / ~18:15 PM in Sabah & Sarawak).
* Hardware WebGL dark shaders dim brightness and desaturate daytime colors to protect night vision without downloading dark tile sets.

### 10. 💡 Dual-Layer Screen Anti-Sleep Engine
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
| **Screen Lock** | W3C Screen Wake Lock API with NoSleep video fallback |
| **Testing** | Vitest, React Testing Library (**56 unit tests across 14 suites**) |

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

# Run unit test suite (56 tests)
npm test

# Build production bundle with optimized code splitting
npm run build
```

---

## 📄 License

Open-source licensed under the [MIT License](LICENSE).  
Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.  
Toll rates compiled from Malaysian Highway Authority (LLM) public rate schedules.
