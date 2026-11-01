# JerayaWara — Malaysia Navigation PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build **JerayaWara**, a high-performance, open-source, offline-first Progressive Web App (PWA) tailored exclusively for Malaysia navigation, supporting Android, iOS, and foldable phones with accurate expressway toll cost estimates, day/night themes, and dedicated modes for walkers, cars, and motorcycles.

**Architecture:** Client-side PWA built with React, TypeScript, Tailwind CSS, MapLibre GL JS, and Dexie (IndexedDB). Employs a modular 6-region map package architecture with a 12 MB shared Highway Spine and 15 km proximity geofencing for automated background boundary downloads. Adapts responsively between a one-thumb portrait drawer on standard phones and an unfolded dual-pane cockpit on foldables.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, MapLibre GL JS, Dexie.js (IndexedDB), Lucide React, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-01-malaysia-nav-pwa-design.md`](file:///Users/arief/.gemini/antigravity/scratch/malaysia-nav-pwa/docs/superpowers/specs/2026-11-01-malaysia-nav-pwa-design.md)

## Global Constraints

- Exclusive coverage of Malaysia (West Malaysia / Peninsular and East Malaysia / Sabah & Sarawak).
- 60 FPS performance on mid-range and flagship Android and iOS hardware.
- Responsive layout supporting all viewports and foldable unfolded postures (`min-width: 680px` and `min-aspect-ratio: 4/5` or `aspect-ratio < 1.15`).
- Exact Malaysian expressway toll calculation across open and closed systems for Car (Class 1) and Motorcycle (Class 0 free exemptions).
- Offline-ready with IndexedDB caching and GPS geolocation tracking without requiring active cellular data.
- Automatic day and OLED night theming synced with `prefers-color-scheme`.
- 100% open-source static client architecture deployable to GitHub Pages, Cloudflare Pages, or Vercel.

## Review Focus

1. **GPS Signal Loss / Degraded Accuracy**: When device GPS accuracy drops (> 50m) or enters tunnels (e.g., SMART Tunnel E38, Genting Sempah Tunnel), navigation HUD must display a degraded GPS indicator and extrapolate dead-reckoning along the active route rather than jumping wildly.
2. **Motorcycle Expressway Restriction Alert**: When motorcycle mode is active and a selected route approaches expressways where motorcycles are strictly banned or hazardous, the system must trigger a high-visibility warning banner.
3. **IndexedDB Quota Exceeded on iOS Safari**: When attempting to download a regional package on a storage-constrained iOS device, error handling must gracefully report the quota limit and offer to evict older regional caches.
4. **Boundary Auto-Download Failure**: If a background proximity download fails due to spotty interstate connectivity, the service worker must silently retry with exponential backoff and never interrupt active turn guidance.
5. **Closed Toll Plaza Missing Entry/Exit Pair**: If a driver enters a closed toll expressway (e.g., PLUS) from an unregistered junction or GPS glitch, the toll calculator must fall back to the maximum distance rate or nearest confirmed plaza with a clear warning notation.

---

### Task 1: Project Scaffolding & Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Working Vite + React + TypeScript + Tailwind CSS setup running Vitest.

- [ ] **Step 1: Write setup verification test**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Scaffold', () => {
  it('should initialize test environment cleanly', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (before files exist)**

Run: `npx vitest run tests/setup.test.ts`
Expected: FAIL (missing dependencies/config)

- [ ] **Step 3: Initialize `package.json`, install dependencies, and configure Vite, Tailwind, and Vitest**

Install: `react`, `react-dom`, `maplibre-gl`, `dexie`, `lucide-react`, `tailwindcss`, `vite`, `vitest`, `@testing-library/react`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts vitest.config.ts tailwind.config.js postcss.config.js index.html src/ tests/
git commit -m "chore: scaffold JerayaWara PWA project with Vite, Tailwind, and Vitest"
```

---

### Task 2: Malaysia Toll Engine

**Files:**
- Create: `src/services/toll/types.ts`
- Create: `src/services/toll/tollData.ts`
- Create: `src/services/toll/tollCalculator.ts`
- Test: `tests/toll/tollCalculator.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type VehicleClass = 'car' | 'motorcycle' | 'walker';
  export interface TollItem {
    plazaName: string;
    expressway: string;
    cost: number;
    paymentMethods: ('TnG' | 'RFID' | 'SmartTAG')[];
  }
  export interface TollBreakdown {
    totalCost: number;
    currency: 'MYR';
    items: TollItem[];
    vehicleClass: VehicleClass;
    note?: string;
  }
  export function calculateRouteTolls(plazaKeys: string[], vehicleClass: VehicleClass): TollBreakdown;
  ```

- [ ] **Step 1: Write the failing tests for Malaysian toll calculation**

```typescript
// tests/toll/tollCalculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRouteTolls } from '../../src/services/toll/tollCalculator';

describe('Malaysia Toll Calculator', () => {
  it('calculates open system flat toll for car (e.g. MEX Salak Selatan)', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN'], 'car');
    expect(result.totalCost).toBe(2.00);
    expect(result.items[0].expressway).toBe('MEX E20');
  });

  it('exempts motorcycle tolls for standard expressways (RM 0.00)', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN', 'PLUS_SG_BESI'], 'motorcycle');
    expect(result.totalCost).toBe(0.00);
    expect(result.items.every(i => i.cost === 0)).toBe(true);
  });

  it('calculates closed-system PLUS toll correctly (e.g. Sungai Besi to Seremban)', () => {
    const result = calculateRouteTolls(['PLUS_E2_SG_BESI_SEREMBAN'], 'car');
    expect(result.totalCost).toBe(4.10);
  });

  it('returns zero and highway blocked notice for walker mode', () => {
    const result = calculateRouteTolls(['MEX_SALAK_SELATAN'], 'walker');
    expect(result.totalCost).toBe(0);
    expect(result.note).toContain('Pedestrian');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/toll/tollCalculator.test.ts`
Expected: FAIL with "calculateRouteTolls is not defined"

- [ ] **Step 3: Implement `types.ts`, `tollData.ts`, and `tollCalculator.ts`**

Include rates for PLUS (E1/E2), MEX (E20), DUKE (E33), KESAS (E5), LDP (E11), SMART (E38), SPRINT (E23), AKLEH (E12), NPE (E10), BKE (E15), and Penang Bridges with RFID/TnG payment methods.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/toll/tollCalculator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/toll/ tests/toll/
git commit -m "feat(toll): implement Malaysia expressway toll calculation engine"
```

---

### Task 3: Regional Map Partitioning & Offline Boundary Geofencing

**Files:**
- Create: `src/services/offline/regions.ts`
- Create: `src/services/offline/db.ts`
- Create: `src/services/offline/regionManager.ts`
- Test: `tests/offline/regionManager.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface RegionPack {
    id: 'klang-valley' | 'northern' | 'southern' | 'east-coast' | 'sarawak' | 'sabah' | 'highway-spine';
    name: string;
    sizeMB: number;
    bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
    states: string[];
  }
  export function detectProximityBoundary(currentCoord: [number, number], thresholdKm?: number): RegionPack[];
  export function isLocationCached(coord: [number, number], cachedRegionIds: string[]): boolean;
  ```

- [ ] **Step 1: Write failing tests for regional boundary detection**

```typescript
// tests/offline/regionManager.test.ts
import { describe, it, expect } from 'vitest';
import { detectProximityBoundary, isLocationCached, MALAYSIA_REGIONS } from '../../src/services/offline/regions';

describe('Regional Offline Management', () => {
  it('detects proximity when within 15km of Northern region boundary (near Tg Malim border)', () => {
    // Tanjung Malim (approx [101.518, 3.684]) near Selangor-Perak border
    const nearby = detectProximityBoundary([101.518, 3.684], 15);
    const regionIds = nearby.map(r => r.id);
    expect(regionIds).toContain('northern');
    expect(regionIds).toContain('klang-valley');
  });

  it('correctly verifies if coordinate is within cached regions', () => {
    // KL Tower [101.703, 3.152] in klang-valley
    expect(isLocationCached([101.703, 3.152], ['klang-valley'])).toBe(true);
    expect(isLocationCached([101.703, 3.152], ['northern'])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/offline/regionManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `regions.ts`, `db.ts` (using Dexie.js for IndexedDB), and `regionManager.ts`**

Define bounding boxes for 6 regions + Highway Spine. Implement haversine bounding box proximity checks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/offline/regionManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/offline/ tests/offline/
git commit -m "feat(offline): implement 6-region packaging and boundary geofencing engine"
```

---

### Task 4: Offline Search Directory & POI Engine

**Files:**
- Create: `src/services/search/types.ts`
- Create: `src/services/search/malaysiaPOIData.ts`
- Create: `src/services/search/searchEngine.ts`
- Test: `tests/search/searchEngine.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface SearchItem {
    id: string;
    title: string;
    subtitle: string;
    category: 'city' | 'toll_plaza' | 'rnr' | 'landmark' | 'junction';
    coordinates: [number, number]; // [lng, lat]
    expressway?: string;
    regionId: string;
  }
  export function searchDestinations(query: string, isOnline: boolean): Promise<SearchItem[]>;
  ```

- [ ] **Step 1: Write failing tests for offline destination search**

```typescript
// tests/search/searchEngine.test.ts
import { describe, it, expect } from 'vitest';
import { searchDestinations } from '../../src/services/search/searchEngine';

describe('Search & Geocoding Engine', () => {
  it('finds Malaysian highway exits and R&Rs offline', async () => {
    const results = await searchDestinations('Tapah', false);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Tapah');
    expect(results[0].coordinates).toBeDefined();
  });

  it('finds major toll plazas offline', async () => {
    const results = await searchDestinations('Sungai Besi', false);
    expect(results.some(r => r.category === 'toll_plaza')).toBe(true);
  });

  it('finds major Borneo locations offline (Sarawak & Sabah)', async () => {
    const results = await searchDestinations('Kuching', false);
    expect(results.some(r => r.title.includes('Kuching'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/search/searchEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `malaysiaPOIData.ts` and `searchEngine.ts`**

Include comprehensive data for Malaysian cities, PLUS R&Rs, toll plazas, and key landmarks with fuzzy title/subtitle matching and graceful online fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/search/searchEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/search/ tests/search/
git commit -m "feat(search): implement offline Malaysian POI directory and search engine"
```

---

### Task 5: Routing & Turn-by-Turn Navigation Engine

**Files:**
- Create: `src/services/routing/types.ts`
- Create: `src/services/routing/sampleCorridors.ts`
- Create: `src/services/routing/routingEngine.ts`
- Test: `tests/routing/routingEngine.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface TurnStep {
    maneuver: 'straight' | 'turn_left' | 'turn_right' | 'exit_left' | 'exit_right' | 'roundabout' | 'arrive';
    instruction: string;
    distanceMeters: number;
    durationSeconds: number;
    coordinates: [number, number];
    speedLimitKmH?: number;
    isMotorcycleLane?: boolean;
    tollPlazaKey?: string;
  }
  export interface RouteResult {
    coordinates: [number, number][];
    distanceKm: number;
    durationMinutes: number;
    steps: TurnStep[];
    tollPlazaKeys: string[];
    profile: VehicleClass;
  }
  export function calculateRoute(start: [number, number], destination: [number, number], profile: VehicleClass): RouteResult;
  ```

- [ ] **Step 1: Write failing tests for routing and turn guidance**

```typescript
// tests/routing/routingEngine.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRoute } from '../../src/services/routing/routingEngine';

describe('Routing Engine', () => {
  const klCoords: [number, number] = [101.693, 3.141];
  const serembanCoords: [number, number] = [101.938, 2.725];

  it('generates car route via PLUS expressway with toll plazas', () => {
    const route = calculateRoute(klCoords, serembanCoords, 'car');
    expect(route.distanceKm).toBeGreaterThan(40);
    expect(route.steps.length).toBeGreaterThan(1);
    expect(route.tollPlazaKeys.length).toBeGreaterThan(0);
  });

  it('motorcycle route flags dedicated motorcycle lanes when available', () => {
    const route = calculateRoute(klCoords, serembanCoords, 'motorcycle');
    expect(route.profile).toBe('motorcycle');
    expect(route.steps.some(s => s.instruction.toLowerCase().includes('motosikal') || s.isMotorcycleLane)).toBe(true);
  });

  it('walker route avoids expressways and generates pedestrian instructions', () => {
    const route = calculateRoute([101.693, 3.141], [101.710, 3.150], 'walker');
    expect(route.profile).toBe('walker');
    expect(route.tollPlazaKeys.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/routing/routingEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `sampleCorridors.ts` and `routingEngine.ts`**

Implement path computation, maneuver generation, bearing calculation, and vehicle-specific profile filtering (car vs bike vs foot).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/routing/routingEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/routing/ tests/routing/
git commit -m "feat(routing): implement turn-by-turn guidance and profile-aware routing engine"
```

---

### Task 6: Device Sensors, Geolocation & Foldable Posture Hooks

**Files:**
- Create: `src/hooks/useGeolocation.ts`
- Create: `src/hooks/useWakeLock.ts`
- Create: `src/hooks/useDeviceTheme.ts`
- Create: `src/hooks/useFoldableDetection.ts`
- Test: `tests/hooks/useFoldableDetection.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export function useFoldableDetection(): { isFoldableUnfolded: boolean; orientation: 'portrait' | 'landscape'; screenWidth: number };
  export function useDeviceTheme(): { theme: 'day' | 'night'; isAuto: boolean; toggleTheme: () => void };
  export function useWakeLock(): { isLocked: boolean; requestLock: () => Promise<void>; releaseLock: () => void };
  export function useGeolocation(): { position: [number, number] | null; heading: number; speed: number | null; accuracy: number; error: string | null };
  ```

- [ ] **Step 1: Write test for foldable detection logic**

```typescript
// tests/hooks/useFoldableDetection.test.ts
import { describe, it, expect } from 'vitest';
import { checkFoldableUnfolded } from '../../src/hooks/useFoldableDetection';

describe('Foldable Screen Detection', () => {
  it('identifies standard smartphone portrait as not unfolded (9:19.5 aspect ratio)', () => {
    expect(checkFoldableUnfolded(390, 844)).toBe(false);
  });

  it('identifies unfolded foldable screen (e.g. Galaxy Z Fold unfolded ~7.6" near square ~4:3)', () => {
    expect(checkFoldableUnfolded(768, 880)).toBe(true);
    expect(checkFoldableUnfolded(800, 700)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/hooks/useFoldableDetection.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement hooks in `src/hooks/`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/hooks/useFoldableDetection.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ tests/hooks/
git commit -m "feat(hooks): implement geolocation, wake lock, day/night, and foldable posture detection"
```

---

### Task 7: MapLibre GL 3D Map Component with Day/Night Vector Styles

**Files:**
- Create: `src/components/map/mapStyles.ts`
- Create: `src/components/map/MapContainer.tsx`
- Create: `src/components/map/MapControls.tsx`
- Test: `tests/components/mapStyles.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface MapProps {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
    theme: 'day' | 'night';
    userLocation: [number, number] | null;
    routePolyline?: [number, number][];
    onMapClick?: (coords: [number, number]) => void;
  }
  ```

- [ ] **Step 1: Write test for Day/Night vector map style generators**

```typescript
// tests/components/mapStyles.test.ts
import { describe, it, expect } from 'vitest';
import { getMapLibreStyle } from '../../src/components/map/mapStyles';

describe('MapLibre Vector Styles', () => {
  it('generates high-contrast daylight style with clear highway colors', () => {
    const style = getMapLibreStyle('day');
    expect(style.version).toBe(8);
    expect(style.layers.length).toBeGreaterThan(0);
  });

  it('generates OLED night driving style with low pupil glare and high route luminescence', () => {
    const style = getMapLibreStyle('night');
    expect(style.version).toBe(8);
    const background = style.layers.find(l => l.id === 'background');
    expect(background?.paint?.['background-color']).toBe('#090d16');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/mapStyles.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `mapStyles.ts`, `MapContainer.tsx`, and `MapControls.tsx`**

Configure open vector tiles, hardware-accelerated 3D pitch/rotation, user position pulse puck with direction cone, and polyline layer.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/mapStyles.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/map/ tests/components/mapStyles.test.ts
git commit -m "feat(map): implement 60 FPS MapLibre GL 3D map with day and OLED night vector styles"
```

---

### Task 8: Navigation HUD, Foldable Cockpit & Toll Breakdown UI

**Files:**
- Create: `src/components/navigation/TurnBanner.tsx`
- Create: `src/components/navigation/TripSummaryDrawer.tsx`
- Create: `src/components/navigation/TollBreakdownModal.tsx`
- Create: `src/components/navigation/ModeSelector.tsx`
- Create: `src/components/offline/RegionDownloadModal.tsx`
- Create: `src/components/search/SearchBar.tsx`
- Create: `src/components/layout/AppShell.tsx`
- Modify: `src/App.tsx`
- Test: `tests/components/NavigationUI.test.tsx`

**Interfaces:**
- Produces: Complete responsive UI supporting:
  - Phone: Fullscreen map with floating top banner and swipeable bottom drawer.
  - Foldable unfolded: Side-by-side cockpit with turn/toll list on left and 3D map on right.

- [ ] **Step 1: Write UI tests for navigation components**

```typescript
// tests/components/NavigationUI.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TurnBanner } from '../../src/components/navigation/TurnBanner';
import { ModeSelector } from '../../src/components/navigation/ModeSelector';

describe('Navigation UI Components', () => {
  it('renders turn instruction and lane guidance accurately', () => {
    render(
      <TurnBanner
        instruction="Exit 215 onto PLUS Hwy E2"
        distanceMeters={450}
        maneuver="exit_right"
        speedLimit={110}
        currentSpeed={94}
      />
    );
    expect(screen.getByText('Exit 215 onto PLUS Hwy E2')).toBeDefined();
    expect(screen.getByText('450 m')).toBeDefined();
    expect(screen.getByText('110')).toBeDefined();
  });

  it('renders mode switchers for Car, Motorcycle, and Walker', () => {
    render(<ModeSelector selectedMode="car" onSelectMode={() => {}} />);
    expect(screen.getByText(/Car/i)).toBeDefined();
    expect(screen.getByText(/Motorcycle/i)).toBeDefined();
    expect(screen.getByText(/Walker/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/NavigationUI.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement all navigation UI components and `AppShell.tsx`**

Integrate foldable dual-pane split layout, toll breakdown modal, search bar with autocomplete, and offline region pack manager modal.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/NavigationUI.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/App.tsx tests/components/
git commit -m "feat(ui): implement responsive navigation HUD, foldable dual-pane cockpit, and toll modal"
```

---

### Task 9: PWA Service Worker, Web Manifest & Offline Installation

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Create: `public/icons/icon-192.svg`
- Create: `public/icons/icon-512.svg`
- Modify: `index.html`
- Modify: `src/main.tsx`
- Test: `tests/pwa/manifest.test.ts`

**Interfaces:**
- Produces: Installable PWA with offline caching of app shell, icons, and routing graphs.

- [ ] **Step 1: Write test verifying PWA manifest integrity**

```typescript
// tests/pwa/manifest.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Icons', () => {
  it('has valid manifest with name JerayaWara, standalone display, and theme colors', () => {
    const raw = fs.readFileSync(path.resolve(__dirname, '../../public/manifest.json'), 'utf-8');
    const manifest = JSON.parse(raw);
    expect(manifest.name).toBe('JerayaWara — Malaysia Navigation');
    expect(manifest.short_name).toBe('JerayaWara');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pwa/manifest.test.ts`
Expected: FAIL

- [ ] **Step 3: Create `manifest.json`, `sw.js`, and SVG icons in `public/`**

Configure offline CacheStorage strategies, service worker registration in `main.tsx`, and meta tags in `index.html`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/pwa/manifest.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/ index.html src/main.tsx tests/pwa/
git commit -m "feat(pwa): configure PWA manifest, service worker offline shell, and icons"
```

---

### Task 10: Production Build & End-to-End Verification

**Files:**
- Modify: `README.md`
- Test: Full Vitest test suite (`npm test`)
- Verification: Production build (`npm run build`)

**Interfaces:**
- Produces: Production-ready distribution bundle in `dist/` ready for static deployment.

- [ ] **Step 1: Run full test suite across all subsystems**

Run: `npm test`
Expected: ALL test suites PASS (toll calculation, regional boundary geofencing, offline search, routing engine, foldable posture hooks, UI components, PWA manifest)

- [ ] **Step 2: Run production TypeScript build**

Run: `npm run build`
Expected: Clean build without any type errors, producing `dist/` bundle

- [ ] **Step 3: Write comprehensive open-source `README.md` documentation**

Document:
- Feature highlights (Malaysia toll calculator, foldable dual-pane, offline regional caching, day/night themes).
- How to install as PWA on iOS Safari ("Share -> Add to Home Screen") and Android Chrome ("Install App").
- Architecture overview and contributing guide.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add open-source README and verify full production build"
```

