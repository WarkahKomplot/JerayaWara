# 🇲🇾 JerayaWara — Malaysia GPS Navigation PWA

> **JerayaWara** *(Sarawakian / Borneo Malay for "Roadway Voyager")* is a 100% zero-API-cost, offline-first Progressive Web App (PWA) navigation system tailored for Malaysian road networks across Peninsular Malaysia, Sabah, and Sarawak.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://warkahkomplot.github.io/JerayaWara/)
[![Tests](https://img.shields.io/badge/Vitest-196%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/WarkahKomplot/JerayaWara)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

📱 **Live Web App**: [https://warkahkomplot.github.io/JerayaWara/](https://warkahkomplot.github.io/JerayaWara/)

---

> [!NOTE]
> **Personal Hobby Project / Disclaimer**  
> JerayaWara is a personal hobby project built for personal use, experimentation, and research into offline web navigation. You are welcome to use, explore, and fork it freely! However, **please do not depend on it as your sole or mission-critical navigation system**. Always stay alert, follow official road signs, adhere to local traffic laws, and prioritize road safety.

---

## 🌟 Core Highlights

* **🗺️ Malaysian Arterial Snapping & Multi-Mirror Routing**: High-fidelity online route generation with automatic failover across OSRM and OpenStreetMap.de mirrors, ensuring zero route calculation dropouts.
* **🛡️ High-Reliability Offline Caching & Tunnel Dead-Reckoning**:
  * **Corridor Tile Pre-caching**: Automatically downloads and stores map tiles along your active route corridor (zoom 13–16) into Service Worker CacheStorage (`jerayawara-tiles-v1`), eliminating grey tiles in cellular dead-zones (e.g. Karak, Genting Sempah, trunk roads).
  * **Tunnel Dead-Reckoning**: Smoothly extrapolates vehicle position along the route line during satellite dropouts in the SMART Tunnel (E38), Genting Sempah, and multi-level underpasses.
  * **Crash & Tab-Reload Session Recovery**: Persists active trip state (route, step, tolls, destination) so unexpected browser reloads or mobile memory pressure instantly restore active navigation.
  * **Graceful Dead-Zone Reroute**: Retains existing path during cellular loss with offline detour guidance, auto-recalculating the moment signal returns.
* **🔍 Tiered Hybrid Search (<1ms)**: 
  * **Tier 1 (Instant RAM)**: Highway exits, toll plazas, R&Rs, hospitals, and national landmarks (*Arjuna JB*, *Menara 1 Sentrum*, *KLCC*).
  * **Tier 2 (IndexedDB Disk)**: Bulk open-data venues (Overture Maps / OSM) queried in 2–10ms with zero UI stutter.
  * **Tier 3 (Online)**: Nominatim & Photon fallback with coordinate parsing and Google Maps URL extraction.
* **🌊 Banjir Kilat (Flash Flood) Radar**: Early caution warnings for historical flood blackspots across Klang Valley, Johor, and Pahang, correlated with rain detection.
* **⛽ Highway Corridor Planner**: Real-time en-route distance countdowns to verified **Petronas / Shell / Caltex / BHP** stations and **EV Fast Chargers** (Gentari, TNB Electron, DC Handal, Tesla Supercharger) with 1-tap PlugShare deep links.
* **📸 AES / AwAS Speed Camera Radar**: Corridor-aware perpendicular proximity tracking with directional cones, speed limit badges, and zero false alarms from parallel municipal roads.
* **🛣️ Offline Toll Estimation**: Distance-based matrices and barrier plaza rates (PLUS, MEX, KESAS, LDP, SMART, Penang Bridges) with Class 1–5 breakdown.
* **🚗 🏍️ Travel Profiles**: Dedicated motorcycle lane awareness (*Lorong Motosikal*), Class 0 toll exemptions, SMART Tunnel prohibitions, and peak-hour motorcycle lane-filtering ETA adjustments.
* **🗣️ 100% Bilingual (BM & EN)**: Full reactive language toggle across voice guidance, banners, badges, and drawers without page reloads.
* **📱 Foldable & PWA Ready**: Adaptive dual-pane cockpit on unfolded foldables (Galaxy Z Fold, Pixel Fold) and full offline home-screen installation.

---

## 📲 Quick Installation (PWA)

* **iOS (Safari)**: Open site $\rightarrow$ Share button $\rightarrow$ **"Add to Home Screen"**.
* **Android (Chrome / Brave / Edge)**: Open site $\rightarrow$ Menu $\rightarrow$ **"Install App"**.

---

## 🛠️ Tech Stack & Open Source

* **Framework & UI**: React 18, TypeScript (Strict), Vite, Tailwind CSS, Lucide React.
* **Maps & Shaders**: MapLibre GL JS (WebGL vector/raster, 3D tilt, astronomical solar day/night shaders).
* **Storage & Audio**: Dexie.js (IndexedDB v2), CacheStorage Service Worker, Web Speech API.
* **Data Ethics**: 100% Open-Source & Open-Data compliant (MIT, ODbL, CDLA-Permissive-2.0 via OpenStreetMap and Overture Maps Foundation). Zero proprietary API lock-in.

---

## 🚀 Development Setup

```bash
# Clone repository
git clone https://github.com/WarkahKomplot/JerayaWara.git
cd JerayaWara

# Install packages
npm install

# Run Vite dev server
npm run dev

# Run automated test suite (196 tests across 39 suites)
npm test

# Build production bundle
npm run build
```

---

## 📄 License

Open-source under the [MIT License](LICENSE).  
Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors and [Overture Maps Foundation](https://overturemaps.org/).
