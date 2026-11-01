# JerayaWara Driving Utilities & Safety Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 5 driving utilities and safety features for JerayaWara: Windshield HUD mirror mode, Banjir Kilat flood radar, expressway petrol & EV charger stop planner, motorcycle rain shelter radar, and saved favorites with client-side GPX route export.

**Architecture:** Unified automotive cockpit design keeping the map unobstructed: HUD overlay operates full-screen with CSS `scaleX(-1)` mirror transform; flood alerts and motorcycle rain shelters correlate with weather and trigger bilingual voice warnings; upcoming amenities are computed geometrically along the active highway polyline into an expandable drawer card; favorites and GPX exports are handled locally in IndexedDB (Dexie.js).

**Tech Stack:** React 18, TypeScript, Dexie.js (IndexedDB), Tailwind CSS, Lucide React, Web Speech API, Vitest, React Testing Library.

**Spec:** [`docs/superpowers/specs/2026-11-01-malaysia-driving-utilities-design.md`](file:///Users/arief/.gemini/antigravity/scratch/malaysia-nav-pwa/docs/superpowers/specs/2026-11-01-malaysia-driving-utilities-design.md)

## Global Constraints

* 100% Zero-API-cost: no paid third-party APIs (no Google Places API, no Mapbox/TomTom token requirements).
* 100% Offline-capable: all safety radars, datasets, HUD modes, favorites, and GPX generation function without cellular connection.
* True-black OLED styling (`#000000`) for Windshield HUD to minimize phone battery consumption.
* Maintain 100% unit test pass rate with Vitest (`npm test`) and clean TypeScript build (`npm run build`).

## Review Focus

1. **Windshield Mirror Inversion**: Ensure text, icons, and speed readouts flip horizontally via `transform: scaleX(-1)` without breaking flex layout or tap targets.
2. **Rain Correlation**: When offline, manual rain mode toggle must reliably activate flood warnings and motorcycle shelter radar without requiring network.
3. **EV vs Petrol Distinction**: Upcoming amenities query must not starve EV drivers of fast chargers on expressways dense with petrol stations.
4. **GPX XML Specification**: Exported GPX file must be strictly valid GPX 1.1 XML parseable by Strava, Garmin, Google Earth, and OsmAnd.
5. **Screen Wake Lock Inheritance**: Opening and closing HUD mode must preserve the dual-layer screen wake lock sentinel without releasing it prematurely.

---

### Task 1: Windshield HUD Mirror Mode Component

**Files:**
- Create: `src/components/hud/WindshieldHudOverlay.tsx`
- Test: `tests/hud/windshieldHud.test.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface WindshieldHudOverlayProps {
    speed: number;
    speedLimit: number;
    isNavigating: boolean;
    currentInstruction?: {
      maneuver: string;
      distanceMeters: number;
      instruction: string;
    };
    roadName?: string;
    heading?: number;
    onClose: () => void;
  }
  export const WindshieldHudOverlay: React.FC<WindshieldHudOverlayProps>;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/hud/windshieldHud.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WindshieldHudOverlay } from '../../src/components/hud/WindshieldHudOverlay';

describe('Windshield HUD Mirror Mode', () => {
  it('renders with scaleX(-1) mirror styling and OLED black background', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <WindshieldHudOverlay
        speed={95}
        speedLimit={110}
        isNavigating={false}
        onClose={handleClose}
      />
    );

    const hudRoot = container.firstChild as HTMLElement;
    expect(hudRoot).not.toBeNull();
    expect(hudRoot.getAttribute('style')).toContain('scaleX(-1)');
    expect(screen.getByText('95')).toBeDefined();
    expect(screen.getByText(/KM\/H/i)).toBeDefined();
    expect(screen.getByText('110')).toBeDefined();
  });

  it('renders maneuver instruction and distance in active navigation mode', () => {
    const handleClose = vi.fn();
    render(
      <WindshieldHudOverlay
        speed={80}
        speedLimit={90}
        isNavigating={true}
        currentInstruction={{
          maneuver: 'turn-right',
          distanceMeters: 650,
          instruction: 'Belok Kanan ke Jalan Bukit'
        }}
        roadName="JALAN BUKIT"
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/650 m/i)).toBeDefined();
    expect(screen.getByText(/Belok Kanan ke Jalan Bukit/i)).toBeDefined();
  });

  it('invokes onClose when tapped anywhere on screen', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <WindshieldHudOverlay
        speed={60}
        speedLimit={60}
        isNavigating={false}
        onClose={handleClose}
      />
    );

    fireEvent.click(container.firstChild as HTMLElement);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/hud/windshieldHud.test.tsx`  
Expected: FAIL with "Cannot find module ... WindshieldHudOverlay"

- [ ] **Step 3: Implement `WindshieldHudOverlay` in `src/components/hud/WindshieldHudOverlay.tsx`**

Implement fullscreen portal with `fixed inset-0 z-50 bg-black`, `transform: scaleX(-1)`, prominent digital speed number, speed limit badge, cardinal compass indicator for cruising mode, maneuver cards for active navigation, and tap-to-exit handler.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/hud/windshieldHud.test.tsx`  
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/components/hud/WindshieldHudOverlay.tsx tests/hud/windshieldHud.test.tsx
git commit -m "feat(hud): implement windshield mirror hud overlay component"
```

---

### Task 2: Flash Flood (*Banjir Kilat*) Blackspot Data & Proximity Service

**Files:**
- Create: `src/services/safety/floodHotspotsData.ts`
- Test: `tests/safety/floodRadar.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface FloodHotspot {
    id: string;
    name: string;
    state: string;
    description: string;
    coordinates: [number, number]; // [lng, lat]
    radiusKm: number;
  }
  export function findNearbyFloodHotspot(
    coord: [number, number],
    isRaining: boolean,
    thresholdKm?: number
  ): FloodHotspot | null;
  export function getAllFloodHotspots(): FloodHotspot[];
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/safety/floodRadar.test.ts
import { describe, it, expect } from 'vitest';
import { findNearbyFloodHotspot, getAllFloodHotspots } from '../../src/services/safety/floodHotspotsData';

describe('Banjir Kilat (Flash Flood) Safety Radar', () => {
  it('loads verified Malaysian flood blackspots', () => {
    const spots = getAllFloodHotspots();
    expect(spots.length).toBeGreaterThanOrEqual(7);
    expect(spots.some(s => s.name.includes('Jalan Tun Razak'))).toBe(true);
    expect(spots.some(s => s.name.includes('Shah Alam'))).toBe(true);
  });

  it('detects Jalan Tun Razak underpass flood hotspot when raining within threshold', () => {
    // Near Jalan Tun Razak KL: [101.719, 3.171]
    const detected = findNearbyFloodHotspot([101.719, 3.171], true, 2.0);
    expect(detected).not.toBeNull();
    expect(detected?.name).toContain('Jalan Tun Razak');
  });

  it('returns null if driver is near flood hotspot but it is not raining', () => {
    const detected = findNearbyFloodHotspot([101.719, 3.171], false, 2.0);
    expect(detected).toBeNull();
  });

  it('returns null if driver is far from any flood hotspot even if raining', () => {
    // Middle of rural corridor far from hotspots
    const detected = findNearbyFloodHotspot([101.300, 3.800], true, 2.0);
    expect(detected).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/safety/floodRadar.test.ts`  
Expected: FAIL with "Cannot find module ... floodHotspotsData"

- [ ] **Step 3: Implement `floodHotspotsData.ts`**

Define Malaysian flood blackspots: Jalan Tun Razak underpass, Bulatan Pahang, Batu Pahat FT50, Shah Alam Sec 13, Klang Meru/Bukit Raja, Segamat/Kota Tinggi river basins, Kuantan Sg Lembing corridor. Calculate haversine distance in `findNearbyFloodHotspot`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/safety/floodRadar.test.ts`  
Expected: PASS (4 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/services/safety/floodHotspotsData.ts tests/safety/floodRadar.test.ts
git commit -m "feat(safety): add flash flood blackspots database and proximity detector"
```

---

### Task 3: Expressway En-Route Petrol & EV Charger Planner

**Files:**
- Create: `src/services/amenities/types.ts`
- Create: `src/services/amenities/expresswayAmenitiesData.ts`
- Create: `src/services/amenities/amenitiesService.ts`
- Test: `tests/amenities/expresswayAmenities.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type AmenityType = 'petronas' | 'shell' | 'caltex' | 'bhp' | 'ev_fast_charger';
  export interface EnRouteAmenity {
    id: string;
    name: string;
    type: AmenityType;
    brand: string;
    expressway: string;
    kmMarker?: string;
    coordinates: [number, number]; // [lng, lat]
    evSpecs?: { operator: string; maxKw: number; plugs: string[] };
  }
  export interface EnRouteAmenityWithDistance extends EnRouteAmenity {
    distanceKm: number;
  }
  export function getUpcomingAmenities(
    routeCoordinates: [number, number][],
    currentCoord: [number, number],
    category?: 'all' | 'petrol' | 'ev',
    limit?: number
  ): EnRouteAmenityWithDistance[];
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/amenities/expresswayAmenities.test.ts
import { describe, it, expect } from 'vitest';
import { getUpcomingAmenities } from '../../src/services/amenities/amenitiesService';
import { MALAYSIA_EXPRESSWAY_AMENITIES } from '../../src/services/amenities/expresswayAmenitiesData';

describe('Expressway En-Route Amenities Service', () => {
  it('contains verified PLUS and LPT petrol and EV charger stations', () => {
    expect(MALAYSIA_EXPRESSWAY_AMENITIES.length).toBeGreaterThanOrEqual(15);
    expect(MALAYSIA_EXPRESSWAY_AMENITIES.some(a => a.type === 'petronas')).toBe(true);
    expect(MALAYSIA_EXPRESSWAY_AMENITIES.some(a => a.type === 'ev_fast_charger')).toBe(true);
  });

  it('calculates upcoming amenities along route polyline ordered by distance', () => {
    // Route along PLUS E1 near Rawang heading north towards Tapah
    const routeCoords: [number, number][] = [
      [101.579, 3.321],
      [101.401, 3.650],
      [101.296, 4.020],
      [101.189, 4.200]
    ];
    const currentCoord: [number, number] = [101.579, 3.321];

    const upcoming = getUpcomingAmenities(routeCoords, currentCoord, 'all', 3);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming[0].distanceKm).toBeGreaterThan(0);
    if (upcoming.length > 1) {
      expect(upcoming[1].distanceKm).toBeGreaterThanOrEqual(upcoming[0].distanceKm);
    }
  });

  it('filters specifically for EV fast chargers when ev category requested', () => {
    const routeCoords: [number, number][] = [
      [101.579, 3.321],
      [101.401, 3.650],
      [101.296, 4.020],
      [101.189, 4.200]
    ];
    const currentCoord: [number, number] = [101.579, 3.321];

    const evOnly = getUpcomingAmenities(routeCoords, currentCoord, 'ev', 3);
    expect(evOnly.every(a => a.type === 'ev_fast_charger')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/amenities/expresswayAmenities.test.ts`  
Expected: FAIL with "Cannot find module ... amenitiesService"

- [ ] **Step 3: Implement `types.ts`, `expresswayAmenitiesData.ts`, and `amenitiesService.ts`**

Define dataset of key PLUS E1, PLUS E2, Karak E8 R&Rs and laybys (Rawang, Ulu Bernam, Tapah, Seremban, Ayer Keroh, Machap, Genting Sempah, Temerloh) with fuel brands and EV operators (Gentari, ChargEV, DC Handal). In `getUpcomingAmenities`, match amenities within 500m of the polyline and return sorted by progressive distance.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/amenities/expresswayAmenities.test.ts`  
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/services/amenities/ tests/amenities/expresswayAmenities.test.ts
git commit -m "feat(amenities): implement expressway petrol and EV charger route planner"
```

---

### Task 4: Motorcycle Rain Shelter Radar (*Pondok Berteduh Motosikal*)

**Files:**
- Create: `src/services/amenities/motorcycleSheltersData.ts`
- Test: `tests/amenities/motorcycleShelters.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface MotorcycleShelter {
    id: string;
    name: string;
    expressway: string;
    kmMarker: string;
    coordinates: [number, number]; // [lng, lat]
    hasDedicatedBay: boolean;
  }
  export function findNearbyMotorcycleShelter(
    coord: [number, number],
    isRaining: boolean,
    travelMode: string,
    thresholdKm?: number
  ): MotorcycleShelter | null;
  export function getAllMotorcycleShelters(): MotorcycleShelter[];
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/amenities/motorcycleShelters.test.ts
import { describe, it, expect } from 'vitest';
import {
  findNearbyMotorcycleShelter,
  getAllMotorcycleShelters
} from '../../src/services/amenities/motorcycleSheltersData';

describe('Motorcycle Rain Shelter Radar', () => {
  it('loads verified expressway motorcycle overhead bridge shelters', () => {
    const shelters = getAllMotorcycleShelters();
    expect(shelters.length).toBeGreaterThanOrEqual(8);
    expect(shelters.some(s => s.expressway.includes('PLUS') || s.expressway.includes('E1'))).toBe(true);
    expect(shelters.some(s => s.expressway.includes('Federal') || s.expressway.includes('Route 2'))).toBe(true);
  });

  it('detects nearest rain shelter when motorcycle mode is active and raining', () => {
    // Near PLUS KM 445 Rawang overhead bridge
    const detected = findNearbyMotorcycleShelter([101.579, 3.321], true, 'motorcycle', 3.0);
    expect(detected).not.toBeNull();
    expect(detected?.name).toContain('Pondok Teduhan');
  });

  it('does not trigger shelter alert when car mode is active even if raining', () => {
    const detected = findNearbyMotorcycleShelter([101.579, 3.321], true, 'car', 3.0);
    expect(detected).toBeNull();
  });

  it('does not trigger shelter alert when sunny even in motorcycle mode', () => {
    const detected = findNearbyMotorcycleShelter([101.579, 3.321], false, 'motorcycle', 3.0);
    expect(detected).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/amenities/motorcycleShelters.test.ts`  
Expected: FAIL with "Cannot find module ... motorcycleSheltersData"

- [ ] **Step 3: Implement `motorcycleSheltersData.ts`**

Define overhead bridge motorcycle rain shelters on PLUS E1/E2, Federal Highway Route 2, and KESAS E5. Implement `findNearbyMotorcycleShelter` checking mode `'motorcycle'`, `isRaining`, and proximity threshold.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/amenities/motorcycleShelters.test.ts`  
Expected: PASS (4 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/services/amenities/motorcycleSheltersData.ts tests/amenities/motorcycleShelters.test.ts
git commit -m "feat(amenities): add motorcycle expressway rain shelter radar"
```

---

### Task 5: En-Route Services Drawer UI Component

**Files:**
- Create: `src/components/navigation/EnRouteServicesCard.tsx`
- Test: `tests/components/EnRouteServicesCard.test.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface EnRouteServicesCardProps {
    amenities: EnRouteAmenityWithDistance[];
    activeCategory: 'all' | 'petrol' | 'ev';
    onSelectCategory: (category: 'all' | 'petrol' | 'ev') => void;
    shelter?: MotorcycleShelter | null;
  }
  export const EnRouteServicesCard: React.FC<EnRouteServicesCardProps>;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/components/EnRouteServicesCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EnRouteServicesCard } from '../../src/components/navigation/EnRouteServicesCard';
import { EnRouteAmenityWithDistance } from '../../src/services/amenities/types';

describe('EnRouteServicesCard Component', () => {
  const mockAmenities: EnRouteAmenityWithDistance[] = [
    {
      id: 'pet-1',
      name: 'Petronas R&R Tapah (Arah Utara)',
      type: 'petronas',
      brand: 'Petronas',
      expressway: 'PLUS E1',
      coordinates: [101.296, 4.020],
      distanceKm: 18.4
    },
    {
      id: 'ev-1',
      name: 'Gentari 150kW DC Fast Charger R&R Tapah',
      type: 'ev_fast_charger',
      brand: 'Gentari',
      expressway: 'PLUS E1',
      coordinates: [101.296, 4.020],
      evSpecs: { operator: 'Gentari', maxKw: 150, plugs: ['CCS2'] },
      distanceKm: 18.5
    }
  ];

  it('renders filter tabs and displays upcoming amenities with distance', () => {
    const handleCategory = vi.fn();
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="all"
        onSelectCategory={handleCategory}
      />
    );

    expect(screen.getByText(/Semua/i)).toBeDefined();
    expect(screen.getByText(/Petrol/i)).toBeDefined();
    expect(screen.getByText(/EV Charger/i)).toBeDefined();
    expect(screen.getByText(/Petronas R&R Tapah/i)).toBeDefined();
    expect(screen.getByText(/18.4 km/i)).toBeDefined();
  });

  it('invokes onSelectCategory when user taps EV Charger tab', () => {
    const handleCategory = vi.fn();
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="all"
        onSelectCategory={handleCategory}
      />
    );

    const evTab = screen.getByText(/EV Charger/i);
    fireEvent.click(evTab);
    expect(handleCategory).toHaveBeenCalledWith('ev');
  });

  it('displays motorcycle rain shelter badge when shelter prop is present', () => {
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="all"
        onSelectCategory={vi.fn()}
        shelter={{
          id: 'ms-1',
          name: 'Pondok Teduhan Jejantas KM 312',
          expressway: 'PLUS E1',
          kmMarker: 'KM 312',
          coordinates: [101.350, 3.850],
          hasDedicatedBay: true
        }}
      />
    );

    expect(screen.getByText(/Pondok Teduhan Jejantas KM 312/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/EnRouteServicesCard.test.tsx`  
Expected: FAIL with "Cannot find module ... EnRouteServicesCard"

- [ ] **Step 3: Implement `EnRouteServicesCard.tsx`**

Build compact expandable card with category pills `[Semua] [⛽ Petrol] [⚡ EV Charger]`, item list with brand badges, kilometer countdowns, and optional motorcycle rain shelter banner.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/EnRouteServicesCard.test.tsx`  
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/components/navigation/EnRouteServicesCard.tsx tests/components/EnRouteServicesCard.test.tsx
git commit -m "feat(ui): implement en-route services card with petrol and ev charger tabs"
```

---

### Task 6: Saved Favorites & GPX Route Export Engine

**Files:**
- Create: `src/services/favorites/favoritesStore.ts`
- Create: `src/services/favorites/gpxExporter.ts`
- Create: `src/components/favorites/FavoritesQuickChips.tsx`
- Test: `tests/favorites/favoritesAndGpx.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface FavoriteDestination {
    id: string;
    category: 'home' | 'work' | 'balik_kampung' | 'custom';
    title: string;
    subtitle: string;
    coordinates: [number, number]; // [lng, lat]
    createdAt: number;
  }
  export function getFavorites(): Promise<FavoriteDestination[]>;
  export function saveFavorite(fav: Omit<FavoriteDestination, 'createdAt'>): Promise<void>;
  export function deleteFavorite(id: string): Promise<void>;
  export function exportRouteToGPX(
    destinationTitle: string,
    coordinates: [number, number][],
    timestamps?: number[]
  ): string;
  export function downloadGPXFile(filename: string, gpxContent: string): void;
  export const FavoritesQuickChips: React.FC<{
    onSelectFavorite: (fav: FavoriteDestination) => void;
    onAddFavorite?: (category: 'home' | 'work' | 'balik_kampung') => void;
  }>;
  ```

- [ ] **Step 1: Write the failing test**

```typescript
// tests/favorites/favoritesAndGpx.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { exportRouteToGPX } from '../../src/services/favorites/gpxExporter';
import {
  getFavorites,
  saveFavorite,
  deleteFavorite
} from '../../src/services/favorites/favoritesStore';

describe('Favorites & GPX Route Export Engine', () => {
  it('generates valid GPX 1.1 XML string from route coordinates', () => {
    const coords: [number, number][] = [
      [101.6869, 3.1390],
      [101.7116, 3.1579]
    ];
    const gpx = exportRouteToGPX('KLCC Trip', coords);
    expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(gpx).toContain('<gpx version="1.1" creator="JerayaWara Malaysia Nav"');
    expect(gpx).toContain('<trkpt lat="3.139" lon="101.6869">');
    expect(gpx).toContain('<trkpt lat="3.1579" lon="101.7116">');
    expect(gpx).toContain('<name>KLCC Trip</name>');
  });

  it('saves, retrieves, and deletes favorites in IndexedDB', async () => {
    await saveFavorite({
      id: 'fav-home',
      category: 'home',
      title: 'Rumah (Bandar Baru Bangi)',
      subtitle: 'Seksyen 4, Bandar Baru Bangi',
      coordinates: [101.775, 2.955]
    });

    const favs = await getFavorites();
    expect(favs.some(f => f.category === 'home')).toBe(true);

    await deleteFavorite('fav-home');
    const afterDelete = await getFavorites();
    expect(afterDelete.some(f => f.id === 'fav-home')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/favorites/favoritesAndGpx.test.ts`  
Expected: FAIL with "Cannot find module ... gpxExporter"

- [ ] **Step 3: Implement `favoritesStore.ts`, `gpxExporter.ts`, and `FavoritesQuickChips.tsx`**

Implement Dexie storage for favorites, standard GPX 1.1 XML generator, file blob downloader, and quick chip bar (`🏠 Rumah`, `💼 Kerja`, `🌴 Balik Kampung`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/favorites/favoritesAndGpx.test.ts`  
Expected: PASS (2 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/services/favorites/ src/components/favorites/ tests/favorites/favoritesAndGpx.test.ts
git commit -m "feat(favorites): add indexeddb favorites storage and gpx track export"
```

---

### Task 7: Full System Integration in Navigation UI & App

**Files:**
- Modify: `src/components/navigation/SpeedometerOverlay.tsx`
- Modify: `src/components/navigation/TripSummaryDrawer.tsx`
- Modify: `src/App.tsx`
- Test: `tests/components/NavigationUI.test.tsx`

**Interfaces:**
- Consumes:
  - `WindshieldHudOverlay` from Task 1
  - `findNearbyFloodHotspot` from Task 2
  - `getUpcomingAmenities` from Task 3
  - `findNearbyMotorcycleShelter` from Task 4
  - `EnRouteServicesCard` from Task 5
  - `FavoritesQuickChips`, `exportRouteToGPX`, `downloadGPXFile` from Task 6

- [ ] **Step 1: Write integration tests in `NavigationUI.test.tsx`**

Add tests verifying:
1. Speedometer HUD renders HUD mirror button and manual rain toggle.
2. Tapping HUD button opens `WindshieldHudOverlay`.
3. `TripSummaryDrawer` displays "Export GPX Track" button.
4. Active navigation renders `EnRouteServicesCard` with upcoming amenities.
5. Flood hotspot warning appears when flood condition is met.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/NavigationUI.test.tsx`  
Expected: FAIL on new assertions.

- [ ] **Step 3: Wire components into `SpeedometerOverlay.tsx`, `TripSummaryDrawer.tsx`, and `App.tsx`**

1. In `SpeedometerOverlay.tsx`: Add HUD button icon (`MonitorUp` / `Glasses`) and make the weather pill interactive for manual rain mode toggle.
2. In `TripSummaryDrawer.tsx`: Add "Export GPX Track" button calling `exportRouteToGPX` and `downloadGPXFile`, plus embed `EnRouteServicesCard`.
3. In `App.tsx`: Manage `isHudOpen` state, wire flood hotspot detection effect, motorcycle shelter radar effect, and `FavoritesQuickChips` above `SearchBar`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/NavigationUI.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/navigation/ tests/components/NavigationUI.test.tsx
git commit -m "feat: integrate windshield hud, flood radar, en-route services, and gpx export"
```

---

### Task 8: Verification, Production Build & Documentation Update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run complete unit test suite across all 21 test files**

Run: `npm test`  
Expected: All test suites PASS (approx 80+ tests passing, 0 failures).

- [ ] **Step 2: Run production TypeScript build**

Run: `npm run build`  
Expected: Exit code 0, zero TypeScript errors, successful code-split bundle generation.

- [ ] **Step 3: Update README.md**

Document all 5 newly added capabilities:
1. Windshield HUD mirror mode
2. Banjir Kilat flood radar
3. Expressway petrol & EV charger stop planner
4. Motorcycle rain shelter radar
5. Favorites & GPX track export

- [ ] **Step 4: Commit and push to origin main**

```bash
git add -A
git commit -m "docs: update readme with driving utilities and safety suite features"
git push origin main
```

---

## Plan Self-Review Checklist

1. **Spec coverage**:
   - G1 (Windshield HUD Mirror Mode) ➔ Task 1 & Task 7
   - G2 (Banjir Kilat Flash Flood Radar) ➔ Task 2 & Task 7
   - G3 (Expressway Petrol & EV Planner) ➔ Task 3, Task 5 & Task 7
   - G4 (Motorcycle Rain Shelter Radar) ➔ Task 4, Task 5 & Task 7
   - G5 (Saved Favorites & GPX Route Export) ➔ Task 6 & Task 7
2. **Step scan**: Every step carries explicit code, commands, files, and expected outputs.
3. **Type consistency**: `EnRouteAmenityWithDistance`, `FloodHotspot`, `MotorcycleShelter`, `FavoriteDestination` types are aligned across services, components, and tests.
4. **Review Focus**: Windshield mirror transform, rain mode toggling, EV charger category filtering, and GPX 1.1 XML generation are all backed by dedicated unit tests in Tasks 1, 2, 3, and 6.
5. **Proportion**: Balanced and focused on actionable implementation steps without bloat.

