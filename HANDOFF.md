# Handoff — car-only mode removal (one commit to push)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `aa5fe1a` (`ci: trigger GitHub Pages deployment`)
**Local HEAD:** the car-only commit — **1 commit ahead of origin, not pushed**
**Session baseline:** `a2b0ad7`

This note tells the uploader exactly what is pending and what is already live.

---

## Already published (do not re-do)

- **`80f82b6` — `fix(pwa): stop wiping the app-shell cache and fix subpath POI fetch`**
  - `index.html` no longer deletes `jerayawara-v*` caches (it was wiping the live v11 shell on every load).
  - `public/sw.js` cache bumped to `jerayawara-v12`; `sw.js` registered without the stale `?v=10`, with `updateViaCache: 'none'`.
  - POI index URL derives from `import.meta.env.BASE_URL`, so it works under `/JerayaWara/`.
  - README claims tightened + Known Limitations added; two regression test files added.
- **`aa5fe1a` — empty CI-trigger commit.** Not created in this session; it is already on `origin/main`.

Both are on GitHub. The push to make now only carries the car-only commit.

---

## Pending commit — remove motorcycle mode, car-only

**Message:** `feat!: remove motorcycle mode and make the PWA car-only`

### Product surface removed
- `src/components/navigation/ModeSelector.tsx` deleted; both render sites removed from
  `src/App.tsx` (pre-navigation search area and the desktop/foldable step-list header).
- `vehicleMode` is no longer state: `App` uses a constant `'car'`, and the saved-session
  restore no longer applies a stored `vehicleMode` (old sessions resume as car).
- `handleModeChange` (mid-route mode switch) deleted.

### Bike-only features removed
- **Rain-shelter radar:** `src/services/amenities/motorcycleSheltersData.ts` and its test
  deleted; App radar/voice alert, `TripSummaryDrawer` prop and
  `EnRouteServicesCard` shelter banner removed.
- **SMART Tunnel restriction banner** (was gated on `vehicleMode === 'motorcycle'`) removed.
- **Motorcycle lane callouts:** `formatStepInstruction` no longer emits
  "Lorong Motosikal" text; `TurnBanner` no longer renders the green lane badge.
  `TurnStep.isMotorcycleLane` removed from `src/services/routing/types.ts`.
- **Bike ETA discount:** `analyzeRouteTraffic` no longer takes a `vehicleMode` argument
  and no longer applies the 25% lane-filtering discount.

### Knock-on cleanup
- `src/services/routing/sampleCorridors.ts` deleted — it was unused and referenced the
  removed `isMotorcycleLane` field.
- i18n keys removed from both dictionaries: `modeCar`, `modeMotorcycle`,
  `motorcycleShelterAlert`, `motorcycleLaneAlert`, `tollClassMotorcycle`.
  The toll modal now always labels the vehicle as Class 1.
- Tests updated: deleted the motorcycle-shelter suite and the ModeSelector tests;
  removed the motorcycle cases from the traffic and routing suites. Added
  `tests/AppHeader.test.tsx` assertion that the PWA renders no Car/Motorcycle picker
  (written first, observed failing, then made green).
- README rewritten for car-only: Car profile only, no bike-lane claims, limitations and
  test counts updated (190 tests / 39 files).

### Deliberately retained (domain, not UI)
- `VehicleClass = 'car' | 'motorcycle'`, the toll engine's Class 0 rates and
  `motorcycleProhibited` gate flags, and their unit tests. The app always requests
  Class 1, so these are inert fare data. A future full purge can remove them, but that
  is a separate, larger change.

**Files in this commit:** `README.md`, `HANDOFF.md`, `dist/*`, `src/App.tsx`,
`src/components/navigation/{EnRouteServicesCard,TollBreakdownModal,TripSummaryDrawer,TurnBanner}.tsx`,
deleted `ModeSelector.tsx`, `src/services/amenities/motorcycleSheltersData.ts`,
`src/services/i18n/translations.ts`, `src/services/routing/{routingEngine,types}.ts`,
deleted `src/services/routing/sampleCorridors.ts`,
`src/services/traffic/malaysiaTrafficEngine.ts`, plus the test files listed above.

---

## Verification (fresh, after the final edit)

```
npx tsc --noEmit → exit 0
npm test         → 39 test files, 190 tests passed
npm run build    → tsc + vite build OK; pre-existing >500 kB MapLibre chunk warning
```

Bundle size dropped from ~242.5 kB to ~235.1 kB (gzip ~68.2 → ~66.4 kB) because the
selector, shelter data and bike instruction branches are gone. `dist/` is rebuilt in the
commit and still ships `jerayawara-v12`.

The suite prints `act(...)` warnings from pre-existing component tests; they are not
failures and were present before this change.

`node_modules/` is installed locally and gitignored — do not commit it.

---

## Publishing

From `/Users/arief/projects/jerayawara pwa`:

```bash
git status                 # clean
git log --oneline -3       # car-only commit at HEAD, parent aa5fe1a
git push origin main
```

This pushes only the car-only commit. The push triggers `.github/workflows/deploy.yml`
(`npm ci` → `npm test` → `npm run build` → Pages).

> The commit uses the machine's auto-detected identity
> (`Arief Zakaria <arief@Ariefs-MacBook.local>`). If it should carry a GitHub-linked
> address, set `user.email` and run `git commit --amend --reset-author` before pushing.

**Rollback:** before pushing, `git reset --hard aa5fe1a` discards the car-only commit.
After pushing, `git revert <sha>`.

---

## Remaining follow-ups (not in this commit)

- **Regional packs are still simulated.** `regionManager.downloadRegion()` fakes progress
  and stores metadata; `RegionDownloadModal` still advertises 40–65 MB packs and the app
  announces "Auto-downloading … pack". Implement real packs or relabel the UI copy.
- **Speed limits are always `'estimated'`**, so the red speeding state in
  `SpeedometerOverlay` never fires by design.
- **Bulk POI index is tiny** (`public/data/overture-poi-index.json`, 17 records) and only
  syncs lazily on first search.
- **MapLibre CSS is loaded twice** (bundled import plus the unpkg `<link>` in `index.html`).
- **`dist/` is tracked** even though CI rebuilds it.
- **`malaysiaRoadNetwork.ts`** is now mainly a `distanceKm` helper despite ~580 lines of
  corridor geometry.
