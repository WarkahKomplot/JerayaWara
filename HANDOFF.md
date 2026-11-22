# Handoff — one pending commit (speed-adaptive follow camera)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `fb36f00`
**Local HEAD:** camera commit — **1 commit ahead, not pushed**
**Session baseline:** `a2b0ad7`

Everything from the earlier reliability work is already on GitHub. Only the follow
camera remains to push:

```bash
git log --oneline -3   # camera commit, fb36f00, 5186709
git push origin main
```

The push triggers `.github/workflows/deploy.yml` (`npm ci` → `npm test` → build →
Pages). The daily health-check workflow also starts running from the published
`fb36f00`.

---

## Pending commit — speed-adaptive 60 fps follow camera

`feat(map): speed-adaptive 60fps follow camera with user zoom ownership`

- `MapContainer` no longer issues a `jumpTo`/`easeTo` per GPS fix. A single
  `requestAnimationFrame` loop eases the puck and camera together (exponential
  smoothing), keeping the marker centred between 1 Hz fixes.
- **Speed-adaptive zoom:** ~17.2 at ≤20 km/h, 16.9 at 40, 16.2 at ≥90. `App`
  passes `speedKmH` into the map.
- **User zoom is preserved:** zoom buttons and pinch store a clamped offset
  (−3…+4) instead of being overwritten on the next fix. Pinch keeps following;
  dragging, north-reset, step selection or route-overview detach the camera until
  recenter.
- Pure helpers moved to `src/services/map/navigationZoom.ts` with
  `tests/components/navigationZoom.test.ts` (3 tests).
- README feature list updated; 207 tests across 46 files.

### Verification

```
npx tsc --noEmit → exit 0
npm test         → 46 files, 207 tests passed
npm run build    → OK; bundle ~229.6 kB (gzip 65.7 kB)
```

**Not browser-tested:** the camera loop and gesture handling were verified by
type-check, unit tests of the zoom math, and the production build only. A short
real-device drive (including pinch/zoom during navigation) is the recommended
check before relying on it.

---

## Already published (origin/main `fb36f00`)

- `80f82b6` — PWA cache ownership, subpath POI URL, README truth pass.
- `aa5fe1a` — empty CI-trigger commit (not from this session).
- `e7822f4` — motorcycle mode removed; PWA is car-only.
- `41d5d13` — corridor preload z16–18 with distance/byte-budgeted streaming.
- `c46de40` — simulated region-pack downloader removed.
- `7c2cd19` — Valhalla routing fallback, circuit breaker, attribution, daily health check.
- `5186709` — tile-cache cap, SW update prompt, geocoding throttle/cache, last-good
  route cache, PNG/maskable/iOS icons, 21,684-record GeoNames index.
- `fb36f00` — dead modules removed, Dexie region/tile tables dropped, `dist/` untracked.

---

## Remaining follow-ups (not in this commit)

- **Camera needs a real-device pass:** pinch/zoom during navigation, dragging, recenter,
  and low-speed heading (GPS course can be `null` when stationary).
- **3D buildings** require the optional OpenFreeMap vector migration.
- **Speed limits are always `'estimated'`**, so the speeding alert never fires.
- **POI index refresh is manual:** rerun `scripts/build-geonames-poi-index.py` and
  bump `POI_INDEX_VERSION` in `bulkPOIDbService.ts`.
- **Offline map is corridor-only**; route planning still requires connectivity.
- **Dexie `savedPlaces`** remains declared but unused.
- **Valhalla demo** is slow and has no SLA; it is a fallback only (12 s timeout).
