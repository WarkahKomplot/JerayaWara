# 🇲🇾 JerayaWara — Malaysia GPS Navigation PWA

> **JerayaWara** *(Sarawakian / Borneo Malay for "Roadway Voyager")* is a zero-cost, high-reliability Progressive Web App (PWA) built specifically for Malaysian roads across Peninsular Malaysia, Sabah, and Sarawak.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://warkahkomplot.github.io/JerayaWara/)
[![Tests](https://img.shields.io/badge/Vitest-216%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/WarkahKomplot/JerayaWara)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

📱 **Live Web App**: [https://warkahkomplot.github.io/JerayaWara/](https://warkahkomplot.github.io/JerayaWara/)

---

> [!NOTE]
> **Online-First with Offline Resilience**  
> JerayaWara is primarily an **online turn-by-turn navigation engine** powered by dual-mirror routing servers. To guarantee reliability when driving across Malaysian cellular dead zones (Karak Highway, Genting Sempah, East-West Highway, rural trunk roads), it runs an aggressive **offline resilience shield** that pre-caches route map tiles, dead-reckons inside tunnels, and auto-recovers active trips across browser tab reloads or memory pressure.  
> *Built as a focused personal tool for small groups (~10 users) with zero ads, tracking, or API subscription fees.*

---

## 🌟 Key Features

### 🌐 1. Online Navigation (Main Function)
* **Triple-Provider Routing Failover**: Turn-by-turn routing tries OSRM's public server, then the `routing.openstreetmap.de` mirror, then the Valhalla demo server. Providers that fail repeatedly are skipped for 10 minutes so a dead endpoint does not slow every calculation.
* **Turn-by-Turn Audio & Lane Guidance**: Bilingual (Bahasa Melayu & English) voice directions, highway exit numbers, and OSRM-derived lane hints.
* **Peak-Hour Traffic Modelling**: ETA adjustment from a local Malaysian time-of-day model (weekday rush, Friday *balik kampung*, Sunday return). This is a deterministic model, not a live traffic feed.
* **Follow Camera**: a 60 fps loop eases the puck and camera together, with speed-adaptive zoom (close in traffic, wider on the highway). Manual zoom is preserved instead of reset on each GPS fix, pinch keeps following, and dragging hands control back to the user until recenter.

### 🛡️ 2. Offline Resilience Shield (Safety Net)
* **Corridor Tile Pre-caching**: On *Start Navigation*, raster tiles at the zooms the navigation camera actually requests (z16–18 for the 256 px OSM source) are pre-fetched into a dedicated Service Worker cache (`jerayawara-tiles-v1`). Planning is distance-prioritised within a ~12 MB byte budget and topped up every ~3 km while driving, instead of a flat tile cap that starved long routes.
* **Tunnel Dead-Reckoning Engine**: Smoothly projects vehicle position forward along the route line when GPS signal drops inside tunnels (SMART Tunnel E38, Genting Sempah) or deep underpasses.
* **Crash & Tab-Reload Session Recovery**: Persists active trip state into `localStorage` (valid 2.5 hours); accidental browser closures, memory evictions, or incoming phone calls restore your navigation instantly.
* **Graceful Detour Handling**: Retains current route line during signal dropouts and triggers an auto-reroute the exact second internet connectivity returns.

### 🚗 3. Car Travel Profile
* **Car**: Full expressway guidance, Class 1 toll calculation, en-route petrol/EV stops, and AES speed camera alerts.

### 🔍 4. Search & Highway Intelligence
* **Tiered Search**: Instant in-memory lookup across 161 curated highway exits, R&Rs, hospitals and landmarks (*KLCC*, *Menara 1 Sentrum*, *Arjuna JB*), then a bundled IndexedDB index of ~21,700 Malaysian cities, towns and villages, and finally rate-limited Nominatim/Photon geocoding.
* **Malaysian Toll Breakdown**: Physical crossing detection with chainage rate tables (PLUS E1/E2 closed network, MEX, KESAS, LDP, Penang Bridges).
* **AES / AwAS Radar**: Directional camera warnings with national speed limits (110 / 90 / 80 km/h), precise along-route distance and heading filtering so cameras on parallel roads or behind you do not fire.
* **Banjir Kilat (Flood) Radar**: Historical flash-flood blackspots alert when heavy rain is detected.

---

## 📲 Quick Installation (PWA)

* **iOS (Safari)**: Open site $\rightarrow$ Share button $\rightarrow$ **"Add to Home Screen"**.
* **Android (Chrome / Brave / Edge)**: Open site $\rightarrow$ Menu $\rightarrow$ **"Install App"**.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript (Strict), Vite, Tailwind CSS, Lucide React.
* **Mapping**: MapLibre GL JS (WebGL raster basemap with day/night solar calculations and compact OSM attribution).
* **Storage & Offline**: Dexie.js (IndexedDB), Service Worker CacheStorage (`Cache-Control: public`).
* **Audio**: Native Web Speech API with bilingual Malay/English synthesizers.

---

## 🩺 Reliability & Monitoring

* **Automatic failover** across three keyless routing providers, with a per-provider circuit breaker and a last-good route cache for short outages.
* **No paid uptime service or server:** a scheduled GitHub Action runs `scripts/healthcheck.mjs` daily (07:00 MYT), checks routing, tiles and geocoding, and opens/closes a GitHub issue as the dependency health changes.
* **Polite online search:** Nominatim is limited to roughly one request per second, Photon is throttled, results are cached for 7 days, and superseded keystrokes are aborted.
* **Bounded offline storage:** the service-worker tile cache is capped at 3,000 entries, and a new app version prompts for reload instead of silently going stale.
* **Installable everywhere:** PNG + maskable icons and an iOS `apple-touch-icon` are bundled alongside the SVGs.
* **Graceful degradation:** search falls back to the bundled POI directory, tiles come from the service-worker cache once viewed, and an active trip resumes from `localStorage` after a reload.

---

## ⚠️ Known Limitations

* **Routing is online-only and best-effort.** A route is calculated through three free public providers (OSRM, the `routing.openstreetmap.de` mirror, Valhalla). There is no on-device routing graph and no SLA: without connectivity the app keeps the active route, pre-cached corridor tiles and tunnel dead-reckoning alive, but cannot plan a new route.
* **Speed limits are estimated.** Limits are derived from road class/name and marked `speedLimitSource: 'estimated'`; the speeding alert is intentionally suppressed rather than risk a false alarm.
* **Toll estimates are best-effort, not billing-grade.** Gate coordinates, fare tables and concessionaire rates are approximate and undated; some plazas can be missed or mispriced. Verify against official rates before relying on the total.
* **Car-only.** The vehicle mode selector and motorcycle-specific features (lane callouts, rain-shelter radar, SMART Tunnel restriction banner, bike ETA discount) have been removed. The toll engine still carries Class 0 fare tables for future use.
* **Traffic is modelled, not live.** No live feeds, incident reporting, or CCTV snapshots.
* **Offline map coverage is corridor-only.** Only the pre-cached route corridor is available offline; panning away from it or zooming outside the budgeted window shows grey tiles. Route planning itself still requires connectivity.
* **Map tiles come from the public OSM tile server.** Corridor pre-caching fetches roughly 10–12 MB per route, but bulk redistribution or continuous nationwide prefetching is still subject to the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

---

## 🚀 Development Setup

```bash
# Clone repository
git clone https://github.com/WarkahKomplot/JerayaWara.git
cd JerayaWara

# Install dependencies
npm install

# Start local dev server
npm run dev

# Run automated tests (216 tests across 48 suites)
npm test

# Production build
npm run build
```

---

## 📄 License

Open-source under the [MIT License](LICENSE).  
Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL). Place names from [GeoNames](https://www.geonames.org/) (CC BY 4.0).
