# 🇲🇾 JerayaWara — Malaysia Navigation PWA

An open-source, privacy-first, offline-ready Progressive Web App (PWA) tailored exclusively for **Malaysia**, engineered for high-performance 60 FPS navigation on mid-range and flagship Android, iOS, and foldable devices.

---

## 🌟 Key Features

### 1. 🛣️ Malaysia Expressway Toll Estimation Engine
- Accurate toll calculation across Malaysian open and closed toll highways:
  - **PLUS Expressway (E1 & E2)**: Distance-based closed entry/exit matrices (e.g., Sg. Besi, Seremban, Ayer Keroh, Skudai, Juru).
  - **Klang Valley Expressways**: MEX (E20), DUKE (E33), KESAS (E5), LDP (E11), SPRINT (E23), SMART Tunnel (E38), AKLEH (E12), NPE (E10).
  - **Penang Bridges**: Sultan Abdul Halim Muadzam Shah Bridge (E28) and Penang Bridge (E36).
- Itemized breakdowns showing each toll plaza along the route and supported payment methods (**Touch 'n Go**, **RFID**, and **SmartTAG**).

### 2. 🚗 🏍️ 🚶 Tailored Travel Profiles
- **🚗 Car (Class 1)**: Expressway routing with full toll ledger and multi-lane guidance.
- **🏍️ Motorcycle (Class 0)**: Highlights dedicated motorcycle lanes (*lorong motosikal* on Federal Highway, KESAS, etc.) and accounts for **toll exemptions** (RM 0.00 at standard toll barriers).
- **🚶 Walker**: Excludes expressways completely, prioritizing safe sidewalks and footpaths.

### 3. 📱 📖 Foldable & Multi-Resolution Ergonomics
- **Standard Phones (Portrait)**: High-visibility top turn banner with speed limit HUD and swipeable bottom drawer with one-thumb reachability.
- **Foldable Phones Unfolded (Dual-Pane Cockpit)**: Dynamically expands on unfolded displays (Galaxy Z Fold, Google Pixel Fold, OnePlus Open) into a side-by-side cockpit:
  - **Left Pane**: Step-by-step turn list, toll breakdown summary, and offline status.
  - **Right Pane**: Unobstructed 3D WebGL vector map.

### 4. ⚡ Offline-First Architecture & Proactive Boundary Downloads
- Partitioned into **6 modular regional packages**:
  1. **Klang Valley & Central** (Selangor, KL, Putrajaya)
  2. **Northern Region** (Perak, Penang, Kedah, Perlis)
  3. **Southern Region** (Negeri Sembilan, Melaka, Johor)
  4. **East Coast** (Pahang, Terengganu, Kelantan)
  5. **Sarawak Region** (Kuching, Sibu, Bintulu, Miri)
  6. **Sabah & Labuan Region** (Kota Kinabalu, Sandakan, Tawau, Labuan)
- **Nationwide Highway Spine (12 MB)**: Core expressway network bundled so cross-country routing always works.
- **15 km Proximity Geofencing**: Proactively detects when a driver is approaching state/regional borders (e.g., crossing Tanjung Malim into Perak) and triggers background downloads of neighboring packages.
- **IndexedDB Vector Caching**: Powered by Dexie.js for persistent offline map storage within browser storage caps.

### 5. 🔍 Hybrid Offline/Online Search Directory
- **Embedded Offline Directory**: Instant search across Malaysian cities, mukims, highway exits (R&Rs, toll plazas), and major landmarks without internet.
- **Live Online Geocoding**: Augments queries with live street addresses via open geocoding when cellular data is available.

### 6. 🌙 ☀️ Adaptive Day & OLED Night Cartography
- Synchronizes with system `prefers-color-scheme` and solar times across Malaysia.
- Night mode features low-glare slate and OLED blacks (`#090d16`) with high-contrast road illumination to prevent night driving pupil fatigue.

---

## 📲 How to Install as a PWA

### iOS (Safari)
1. Open the app URL in **Safari**.
2. Tap the **Share** button (box with an upward arrow).
3. Tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner. JerayaWara will open in standalone fullscreen mode like a native app.

### Android (Chrome / Brave / Edge)
1. Open the app URL in your browser.
2. Tap the three dots menu or look for the **"Install App"** prompt in the address bar.
3. Tap **"Install"** to add JerayaWara directly to your app launcher.

---

## 🛠️ Technology Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (dark mode & foldable media queries)
- **Map & 3D WebGL**: MapLibre GL JS
- **Offline Storage**: Dexie.js (IndexedDB wrapper) & CacheStorage API
- **Icons**: Lucide React
- **Test Runner**: Vitest

---

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/your-username/jerayawara.git
cd jerayawara

# Install dependencies
npm install

# Start local development server
npm run dev

# Run Vitest test suite
npm test

# Build production bundle
npm run build
```

---

## 📄 License

Open-source licensed under the [MIT License](LICENSE).
Map data provided by &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
Toll structure compiled from Malaysian Highway Authority (LLM) public rate schedules.

