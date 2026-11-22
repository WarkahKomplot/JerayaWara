# Handoff — JerayaWara PWA fixes (ready to push)

**Prepared:** 2026-11-22
**Branch:** `main`
**Baseline:** `a2b0ad7` (was in sync with `origin/main`)
**Status:** the fixes are **committed locally but not pushed**. The commit on top of
`a2b0ad7` is the only new commit; run `git log --oneline -3` to confirm before pushing.

This note exists so the agent/person uploading to GitHub knows exactly what changed,
why, and what was deliberately left out.

---

## Why these changes

1. **The PWA deleted its own offline app-shell cache on every page load.**
   `index.html` contained an inline bootstrap script that deleted every
   `jerayawara-v*` cache except `jerayawara-v10`, while `public/sw.js` stored the
   app shell in `jerayawara-v11`. Every load therefore wiped the active precache.
   The registration also carried a stale `?v=10`, a third independent version.

2. **The bundled POI index 404'd on GitHub Pages.**
   `bulkPOIDbService.ts` fetched `/data/overture-poi-index.json` from the domain
   root. The site is served from `/JerayaWara/`, where that path does not exist.
   The production `base` is `./`, so the URL now derives from `import.meta.env.BASE_URL`.

3. **The README overclaimed.** "Live traffic", "CCTV snapshots", "instant <1ms"
   search, "avoids prohibited routes", and "millisecond failover" did not match the
   implementation. A Known Limitations section now records the real behaviour.

---

## What changed

### 1. Service-worker cache lifecycle — app shell no longer self-destructs
- `index.html`: removed the inline `caches.delete(...)` bootstrap block; left a
  comment pointing to `public/sw.js` as the single owner of cache names.
- `public/sw.js`: `CACHE_NAME` bumped `jerayawara-v11` → `jerayawara-v12`, so the
  activate handler removes the old shell cache and repopulates the new one.
- `src/main.tsx`: registers `${BASE_URL}sw.js` with `{ updateViaCache: 'none' }`
  instead of `sw.js?v=10`, and still calls `reg.update()`.

### 2. POI index URL respects the deploy sub-path
- `src/services/search/bulkPOIDbService.ts`: added exported
  `buildPoiIndexUrl(baseUrl = import.meta.env.BASE_URL)`, which normalizes a
  trailing slash and returns `<base>data/overture-poi-index.json`.
  `syncBulkPOIsInStore()` now fetches through it.

### 3. README now matches the code
- "Live Traffic Adjustments / CCTV snapshots" → "Peak-Hour Traffic Modelling"
  (explicitly a deterministic local model).
- "Redundant Multi-Mirror Routing … millisecond failover" → automatic fallback
  to the `routing.openstreetmap.de` mirror.
- "Motorcycle: Avoids prohibited routes" → "Flags prohibited routes … with a
  surface-route warning" (the app warns, it does not reroute around them).
- Corridor pre-caching now states the ~350-tile cap; search states the 161-entry
  curated directory and the IndexedDB/Nominatim/Photon tiers.
- Added **Known Limitations**: online-only routing, simulated regional packs,
  estimated speed limits, shared car/motorcycle OSRM profile, modelled (not live)
  traffic, OSM tile policy.
- Test badge and setup comment updated: 198 tests / 40 files.

### 4. Regression tests added (written first, observed failing)
- `tests/pwa/serviceWorkerAssets.test.ts` — cache names stay owned by `sw.js`,
  no `?v=` registration query, `updateViaCache: 'none'` present.
- `tests/search/poiIndexUrl.test.ts` — root, sub-path, relative (`./`) and
  default `BASE_URL` resolution.

### 5. Build artifacts
- `dist/` is tracked in this repo, so it was rebuilt. The old
  `dist/assets/index-1X2N1Ji_.js` is deleted; the new bundle is
  `dist/assets/index-DdRX_kKP.js`. `dist/sw.js` carries `jerayawara-v12`.

**Files touched:** `README.md`, `HANDOFF.md`, `index.html`, `public/sw.js`,
`src/main.tsx`, `src/services/search/bulkPOIDbService.ts`,
`dist/index.html`, `dist/sw.js`, `dist/assets/*`, plus the two new test files.

---

## Verification already run (in this checkout)

```
npm ci        → 284 packages installed (Node v24.18.0, npm 11.16.0)
npm test      → 40 test files, 198 tests passed (all green)
npm run build → tsc + vite build OK; only the pre-existing >500 kB MapLibre
                chunk warning
```

The build confirms `dist/sw.js` declares `jerayawara-v12`, `dist/index.html` has
no cache-deletion bootstrap, and the shipped bundle contains
`updateViaCache:"none"` and the relative `data/overture-poi-index.json` path.

`node_modules/` is present locally and gitignored — do not commit it.

---

## Publishing

From `/Users/arief/projects/jerayawara pwa`:

```bash
git status                 # should be clean
git log --oneline -3       # the fix commit should be HEAD, parent a2b0ad7
git push origin main
```

The push triggers `.github/workflows/deploy.yml`, which runs
`npm ci` → `npm test` → `npm run build` and deploys `./dist` to GitHub Pages.
If the workflow fails, the tests above are the first thing to compare against.

> The commit was created with the machine's auto-detected identity
> (`Arief Zakaria <arief@Ariefs-MacBook.local>`). If the uploaded commit should
> carry a GitHub-linked address, set `user.email` and run
> `git commit --amend --reset-author` before pushing.

**Rollback:** `git reset --hard a2b0ad7` before pushing (discards the fix commit),
or `git revert <fix-sha>` if it is already published. Note that remote clients that
already loaded `jerayawara-v12` will keep it until the next SW update.

---

## Deliberately NOT changed (follow-ups)

These are known and documented in the README, but were out of scope for this fix:

- **Regional packs are still simulated.** `regionManager.downloadRegion()` fakes
  progress and stores metadata; `RegionDownloadModal` still advertises 40–65 MB
  packs and the app still announces "Auto-downloading … pack". Either implement
  real packed tiles/graphs or relabel the UI copy.
- **Car and motorcycle still share OSRM `driving`.** Motorcycle mode only affects
  tolls, restrictions, shelters and the ETA model.
- **Speed limits are always `'estimated'`**, so the red speeding state in
  `SpeedometerOverlay` never fires by design.
- **Bulk POI index is tiny** (`public/data/overture-poi-index.json`, 17 records)
  and only syncs lazily on first search; consider expanding it or removing the
  layer.
- **MapLibre CSS is loaded twice** (bundled via `MapContainer` import and the
  unpkg `<link>` in `index.html`); the unpkg link is an avoidable network
  dependency.
- **`dist/` is committed** even though CI rebuilds it; consider gitignoring it to
  keep future diffs small.
- **Unused routing data**: `src/services/routing/sampleCorridors.ts` is unused and
  `malaysiaRoadNetwork.ts` is now mainly a `distanceKm` helper despite ~580 lines
  of corridor geometry.
