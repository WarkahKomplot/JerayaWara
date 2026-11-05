# 🇲🇾 JerayaWara — Malaysia GPS Navigation PWA

> **JerayaWara** *(Sarawakian / Borneo Malay for "Roadway Voyager")* is a zero-cost, high-reliability Progressive Web App (PWA) built specifically for Malaysian roads across Peninsular Malaysia, Sabah, and Sarawak.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://warkahkomplot.github.io/JerayaWara/)
[![Tests](https://img.shields.io/badge/Vitest-191%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/WarkahKomplot/JerayaWara)
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
* **Redundant Multi-Mirror Routing**: Live turn-by-turn routing with automatic millisecond failover between OSRM primary and `routing.openstreetmap.de` mirrors, preventing dropouts.
* **Turn-by-Turn Audio & Lane Guidance**: Bilingual (Bahasa Melayu & English) voice directions, highway exit numbers, and Malaysian dedicated motorcycle lane (*Lorong Motosikal*) callouts.
* **Live Traffic Adjustments**: Corridor congestion monitoring with motorcycle lane-filtering ETA adjustments and expressway CCTV snapshots.

### 🛡️ 2. Offline Resilience Shield (Safety Net)
* **Corridor Tile Pre-caching**: Upon pressing *Start Navigation*, map tiles along the route corridor (zoom 14–16) are pre-fetched into a dedicated Service Worker cache (`jerayawara-tiles-v1`), eliminating blank grey grids in dead zones.
* **Tunnel Dead-Reckoning Engine**: Smoothly projects vehicle position forward along the route line when GPS signal drops inside tunnels (SMART Tunnel E38, Genting Sempah) or deep underpasses.
* **Crash & Tab-Reload Session Recovery**: Persists active trip state into `localStorage` (valid 2.5 hours); accidental browser closures, memory evictions, or incoming phone calls restore your navigation instantly.
* **Graceful Detour Handling**: Retains current route line during signal dropouts and triggers an auto-reroute the exact second internet connectivity returns.

### 🚗 3. Dedicated Travel Profiles
* **Car**: Full expressway guidance, toll calculation, and AES speed camera alerts.
* **Motorcycle**: Avoids prohibited routes (SMART Tunnel), highlights sheltered rain bays under flyovers, factors in zero-toll exemptions, and computes lane-filtering peak ETAs.

### 🔍 4. Search & Highway Intelligence
* **Tiered Search (<1ms)**: Instant RAM lookup for major Malaysian highway exits, R&Rs, hospitals, and national landmarks (*KLCC*, *Menara 1 Sentrum*, *Arjuna JB*), with offline IndexedDB backup.
* **Malaysian Toll Breakdown**: Physical crossing detection with chainage rate tables (PLUS E1/E2 closed network, MEX, KESAS, LDP, Penang Bridges).
* **AES / AwAS Radar**: Directional camera warnings with national speed limits (110 / 90 / 80 km/h).
* **Banjir Kilat (Flood) Radar**: Historical flash-flood blackspots alert when heavy rain is detected.

---

## 📲 Quick Installation (PWA)

* **iOS (Safari)**: Open site $\rightarrow$ Share button $\rightarrow$ **"Add to Home Screen"**.
* **Android (Chrome / Brave / Edge)**: Open site $\rightarrow$ Menu $\rightarrow$ **"Install App"**.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript (Strict), Vite, Tailwind CSS, Lucide React.
* **Mapping**: MapLibre GL JS (WebGL vector/raster with day/night solar calculations).
* **Storage & Offline**: Dexie.js (IndexedDB), Service Worker CacheStorage (`Cache-Control: public`).
* **Audio**: Native Web Speech API with bilingual Malay/English synthesizers.

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

# Run automated tests (191 tests across 38 suites)
npm test

# Production build
npm run build
```

---

## 📄 License

Open-source under the [MIT License](LICENSE).  
Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors and [Overture Maps Foundation](https://overturemaps.org/).
