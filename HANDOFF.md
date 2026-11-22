# Handoff — four pending commits (car-only, offline tiles, fake pack UI, routing failover)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `aa5fe1a`
**Local HEAD:** routing failover + health checks — **4 commits ahead, not pushed**
**Session baseline:** `a2b0ad7`

Push all four pending commits:

```bash
git log --oneline -6   # expect: routing failover, pack-UI removal, offline fix, car-only, aa5fe1a, 80f82b6
git push origin main
```

---

## Already published (do not re-do)

- **`80f82b6`** — cache ownership moved into `sw.js` (v12), registration without the
  stale `?v=10`, POI index URL derives from `import.meta.env.BASE_URL`, README truth
  pass, regression tests.
- **`aa5fe1a`** — empty `ci: trigger GitHub Pages deployment` commit, not from this session.

---

## Pending commit 1 — `e7822f4` car-only

`feat!: remove motorcycle mode and make the PWA car-only`

- `ModeSelector` deleted; both render sites removed; `vehicleMode` is a `'car'`
  constant; mid-route mode switching removed; sessions resume as car.
- Removed bike-only features: rain-shelter radar/voice/card
  (`motorcycleSheltersData.ts` + test), SMART Tunnel restriction banner, motorcycle
  lane instructions/badge (`TurnStep.isMotorcycleLane`), motorcycle ETA discount.
- Removed i18n keys `modeCar`, `modeMotorcycle`, `motorcycleShelterAlert`,
  `motorcycleLaneAlert`, `tollClassMotorcycle`; toll modal always shows Class 1.
- Deleted unused `sampleCorridors.ts`.
- Retained deliberately: toll engine Class 0 fare tables and `VehicleClass` union
  (inert domain data, not product UI).

---

## Pending commit 2 — `41d5d13` offline corridor preload

`fix(offline): preload the tiles the navigation camera actually requests`

The preloader cached z14–16 while MapLibre requests z18 for the 256 px OSM raster
source (512 px transform + `roundZoom`), and its flat 350-tile slice was applied
zoom-major, starving long routes. Changes:

- New `src/services/offline/tileMath.ts`: `cameraZoomToTileZoom()`,
  `NAVIGATION_CAMERA_ZOOM = 16.8`, `NAVIGATION_TILE_ZOOM = 18`,
  `DEFAULT_PRELOAD_ZOOM_LEVELS = [16, 17, 18]`; `mapStyles`/`MapContainer` consume
  the constants.
- `planCorridorTiles()` orders tiles by route distance (deepest zoom first), applies
  a ~12 MB byte budget and optional `startFromCoord`/`aheadMeters` window.
- `App` streams 4 MB top-ups from the current position every ~3 km while navigating.
- Coverage after fix: 10.5 km demo 100% at z18; KL→Seremban first 18.1 km, then
  streamed; KL→Penang first 17.7 km, then streamed.
- Tests: `tests/offline/tileMath.test.ts` (3) plus ordering/budget/window tests.

---

## Pending commit 3 — remove the simulated offline-map download UI (HEAD)

`refactor(offline)!: remove the simulated region-pack downloader`

The "Offline Maps" header button opened `RegionDownloadModal`, which advertised
40–65 MB regional packs but only stored metadata with fake progress, and the app
announced "Auto-downloading … pack" on geofence boundaries. It is removed because
real offline coverage now comes from corridor tile pre-caching.

- Deleted `src/components/offline/RegionDownloadModal.tsx`,
  `src/services/offline/regionManager.ts`, `src/services/offline/regions.ts` and
  `tests/offline/regionManager.test.ts`.
- `App.tsx`: removed the header Offline Maps button, the proximity-geofence effect,
  the "Auto-downloading" banner, the modal render and the `HardDrive` icon import.
- Removed i18n keys `offlineMap`, `offlineModalTitle`, `offlineModalSubtitle`,
  `readyToUse`, `downloading`, `download`, `delete`.
- Removed the "regional packs are placeholders" README limitation and updated counts.
- `src/services/offline/db.ts` still declares the `regions`/`tiles` Dexie tables so
  existing databases keep working; they are now unused (cleanup follow-up, needs a
  Dexie version bump).

---

## Pending commit 4 — routing failover, monitoring & attribution (HEAD)

`feat(routing): add Valhalla fallback, circuit breaker and free health checks`

- `src/services/routing/routingEngine.ts`:
  - Adds **Valhalla** (`valhalla1.openstreetmap.de`) as a third keyless provider
    behind OSRM primary and the openstreetmap.de mirror. Valhalla responses are
    normalised into `RouteResult` (polyline6 decoding, maneuver mapping,
    destination side, exit numbers, toll keys, traffic ETA).
  - Per-provider circuit breaker: 3 failures → skipped for 10 minutes; if every
    provider is blocked, one attempt each is still made.
  - Liveness probes now run **in parallel against all three providers** instead of
    sequentially against OSRM only, cached for 15 s.
  - Valhalla gets a **12 s timeout** (the demo server is intermittently slow);
    OSRM stays at 6 s.
- `MapContainer`: re-enables MapLibre's attribution control (`compact`). OSM's
  policy and OpenFreeMap's terms require attribution; it was previously disabled.
- `index.html`: removed the duplicate unpkg MapLibre CSS link (the CSS is already
  bundled via `MapContainer`).
- `scripts/healthcheck.mjs` + `.github/workflows/healthcheck.yml`: free daily
  health check (07:00 MYT) of all three routing providers, OSM tiles and
  Nominatim. It fails and opens/updates a GitHub issue only when **every routing
  provider** or the tile server is down; Valhalla slowness alone is reported but
  not fatal. No server or paid monitoring service.
- Tests: `tests/routing/providerFailover.test.ts` (Valhalla fallback, liveness via
  Valhalla only, all-providers-down, polyline6 decoding); the existing liveness
  test now expects three parallel probes.

---

## Verification (fresh, after the final edit)

```
npx tsc --noEmit → exit 0
npm test         → 40 test files, 198 tests passed
npm run build    → tsc + vite build OK; pre-existing >500 kB MapLibre chunk warning
```

Bundle: `dist/assets/index-DrfloBYa.js` ≈ 228.0 kB (gzip 65.0 kB).
Local `node scripts/healthcheck.mjs` passes: OSRM primary + mirror up, Valhalla
intermittently slow (reported but non-fatal), tiles and Nominatim reachable. `dist/` is rebuilt in the commit and still ships
`jerayawara-v12`. `node_modules/` is gitignored.

---

## Publishing

```bash
git status                 # clean
git push origin main       # pushes all four commits
```

CI runs `npm ci` → `npm test` → `npm run build` → Pages.

> Commits use `Arief Zakaria <arief@Ariefs-MacBook.local>`. To attach a GitHub-linked
> address, set `user.email` and `git commit --amend --reset-author` on each commit
> before pushing.

**Rollback:** before pushing, `git reset --hard aa5fe1a` discards all four. After
pushing, revert the four SHAs.

---

## Remaining follow-ups (not in these commits)

- **Offline map is corridor-only.** Corridor pre-caching covers the route ahead;
  panning away shows grey tiles, and route planning still requires connectivity.
  Vector tiles with real regional offline packs would be the long-term fix.
- **Dead Dexie schema:** `offlineDb.regions` / `offlineDb.tiles` are unused after the
  pack-UI removal; drop them with a `version(3)` migration when convenient.
- **Speed limits are always `'estimated'`**, so the red speeding state never fires.
- **Bulk POI index is tiny** (17 records) and syncs lazily on first search.
- **`dist/` is tracked** even though CI rebuilds it.
- **`malaysiaRoadNetwork.ts`** is mostly a `distanceKm` helper plus unused corridor data.
- **Valhalla's demo server is slow and has no SLA**; it is a fallback only, with a
  12 s timeout. Watch the daily health-check issue if it degrades.
- **Basemap is still OSM raster.** Switching to OpenFreeMap vector tiles remains an
  option, but needs new styles, glyph/sprite caching, a revised corridor preloader
  (z14 max) and offline tests.
