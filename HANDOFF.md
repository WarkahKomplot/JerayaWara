# Handoff — two pending commits (car-only + offline map fix)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `aa5fe1a`
**Local HEAD:** offline corridor-preload fix — **2 commits ahead, not pushed**
**Session baseline:** `a2b0ad7`

Push both pending commits:

```bash
git log --oneline -4     # expect: offline fix, car-only, aa5fe1a, 80f82b6
git push origin main
```

---

## Already published (do not re-do)

- **`80f82b6`** — `fix(pwa): stop wiping the app-shell cache and fix subpath POI fetch`
  (cache ownership moved fully into `sw.js`, bumped to `jerayawara-v12`; registration
  without the stale `?v=10`; POI index URL derives from `import.meta.env.BASE_URL`;
  README truth pass; regression tests).
- **`aa5fe1a`** — empty `ci: trigger GitHub Pages deployment` commit, not created in
  this session.

---

## Pending commit 1 — `e7822f4` car-only

`feat!: remove motorcycle mode and make the PWA car-only`

- Deleted `ModeSelector` and both render sites; `vehicleMode` is a constant `'car'`;
  mid-route `handleModeChange` removed; saved sessions resume as car.
- Removed bike-only product features: rain-shelter radar/voice/card
  (`motorcycleSheltersData.ts` + test deleted), SMART Tunnel restriction banner,
  motorcycle lane instructions/badge (`TurnStep.isMotorcycleLane` removed), and the
  motorcycle ETA discount in `analyzeRouteTraffic` (its `vehicleMode` arg is gone).
- i18n keys removed: `modeCar`, `modeMotorcycle`, `motorcycleShelterAlert`,
  `motorcycleLaneAlert`, `tollClassMotorcycle`; toll modal always shows Class 1.
- Deleted the unused `sampleCorridors.ts` (it referenced the removed field).
- Retained deliberately: toll engine Class 0 fare tables, `motorcycleProhibited` gate
  flags, `VehicleClass` union and their unit tests — inert domain data, not product UI.

---

## Pending commit 2 — offline corridor preload fix (HEAD)

`fix(offline): preload the tiles the navigation camera actually requests`

### Why
The preloader cached **z14–16** while MapLibre requested **z18** during navigation:
the OSM source is 256 px, MapLibre's transform is 512 px (`scaleZoom(512/256) = 1`),
and raster sources round (`roundZoom = true`), so camera 16.8 → tile z18. On top of
that, `preloadCorridorTiles` applied a flat `slice(0, 350)` before any priority, and
tiles were generated zoom-major (all z14, then z15…). Measured on real OSRM geometry:

| Route | Old: z16 points preloaded under the 350 cap | Old: z18 tiles preloaded |
|---|---|---|
| Kajang → Cheras (10.5 km) | 100% | 0 |
| KL → Seremban (63.9 km) | 27.8% (stopped at km 8.1) | 0 |
| KL → Penang (353 km) | 0% (cap consumed by z14) | 0 |

So the "no grey tiles" feature could not work at driving zoom.

### What changed
- **New `src/services/offline/tileMath.ts`** — `cameraZoomToTileZoom()`,
  `NAVIGATION_CAMERA_ZOOM = 16.8`, `NAVIGATION_TILE_ZOOM = 18`,
  `DEFAULT_PRELOAD_ZOOM_LEVELS = [16, 17, 18]` (z16 = overview, z18 = follow).
  `mapStyles.ts` now uses `RASTER_SOURCE_TILE_SIZE`; `MapContainer` uses
  `NAVIGATION_CAMERA_ZOOM` instead of the 16.8/17/16.5 literals.
- **`corridorTilePreloader.ts`** — new `planCorridorTiles()`:
  - records each tile's route offset and sorts by distance, then deeper zoom first;
  - enforces an estimated **byte budget** (`DEFAULT_MAX_BYTES = 12 MB`) and
    `DEFAULT_MAX_TILES = 6000` instead of slicing by count;
  - supports `startFromCoord` + `aheadMeters` (default 25 km) for streaming;
  - `getTilesAlongRoute()` remains as the raw-tile helper.
- **`App.tsx`** — while navigating, re-runs the preloader from the current position
  every ~3 km (`maxBytes: 4 MB`) so long routes stay covered ahead of the vehicle.
- **README** — corridor bullet now describes z16–18, the ~12 MB budget and the
  streaming top-ups; added a limitation that offline coverage is corridor-only.
- **Tests** — `tests/offline/tileMath.test.ts` (3) and
  `tests/offline/corridorTilePreloader.test.ts` (+4: default z18, distance/zoom
  ordering, byte-budget stop, streaming window skips tiles behind).

### Coverage after the fix (initial 12 MB pass)

| Route | z18 coverage per pass | Tiles / size |
|---|---|---|
| Kajang → Cheras (10.5 km) | full route | 390 / ~7.3 MB |
| KL → Seremban (63.9 km) | first 18.1 km, then ~3 km top-ups | 642 / ~12 MB |
| KL → Penang (353 km) | first 17.7 km, then ~3 km top-ups | 640 / ~12 MB |

Coverage is now at the zoom the map actually renders. Route overview for the
un-budgeted remainder (beyond ~25 km) is still grey offline, and offline route
planning remains impossible by design.

---

## Verification (fresh, after the final edit)

```
npx tsc --noEmit → exit 0
npm test         → 40 test files, 197 tests passed
npm run build    → tsc + vite build OK; pre-existing >500 kB MapLibre chunk warning
```

Bundle: `dist/assets/index-Djp8E5Xy.js` ≈ 236.6 kB (gzip 67.0 kB); `dist/` is rebuilt
in the commit and still ships `jerayawara-v12`. `node_modules/` is gitignored.

---

## Publishing

```bash
git status                 # clean
git push origin main       # pushes the car-only + offline commits
```

CI (`.github/workflows/deploy.yml`) runs `npm ci` → `npm test` → `npm run build` and
deploys `./dist` to Pages.

> Commits use the machine identity `Arief Zakaria <arief@Ariefs-MacBook.local>`.
> To attach a GitHub-linked address, set `user.email` and
> `git commit --amend --reset-author` before pushing.

**Rollback:** before pushing, `git reset --hard aa5fe1a` discards both pending commits.
After pushing, revert the two SHAs.

---

## Remaining follow-ups (not in these commits)

- **Regional packs are still simulated.** `regionManager.downloadRegion()` fakes
  progress and stores metadata; the modal advertises 40–65 MB packs and the app says
  "Auto-downloading … pack". Implement real packs or relabel the UI.
- **Offline map is corridor-only** and OSM raster tiles cap how far this can scale;
  a vector-tile/offline-style migration is the long-term fix.
- **Speed limits are always `'estimated'`**, so the red speeding state never fires.
- **Bulk POI index is tiny** (17 records) and syncs lazily on first search.
- **MapLibre CSS is loaded twice** (bundled import plus the unpkg `<link>`).
- **`dist/` is tracked** even though CI rebuilds it.
- **`malaysiaRoadNetwork.ts`** is mostly a `distanceKm` helper plus unused corridor data.
