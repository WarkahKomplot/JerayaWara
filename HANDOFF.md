# Handoff — two pending commits (follow camera, AES alert fix)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `fb36f00`
**Local HEAD:** AES alert precision fix — **2 commits ahead, not pushed**
**Session baseline:** `a2b0ad7`

Everything before these two commits is already on GitHub.

```bash
git log --oneline -4   # AES fix, camera, fb36f00, 5186709
git push origin main
```

The push triggers `.github/workflows/deploy.yml` (`npm ci` → `npm test` → build →
Pages).

---

## Pending commit 2 — AES alert precision (HEAD)

`fix(alerts): use precise along-route distances and real headings`

### Why alerts fired for cameras kilometres away

`findNearbyAESCamera` summed along-route distance using `distanceKm()`, which rounds
**every segment to 0.1 km before summing**. On dense OSRM geometry (20–50 m
segments) most segments round to 0.0 km, so a camera 2.5 km ahead computed as
~0 m and alerted with the displayed minimum of **"50 m"**. The lookahead was also
capped at 35 segments, which is only ~700 m on dense geometry.

### Fix

- Added `distanceMeters()` (unrounded) to `src/services/geo/distance.ts`.
- In navigation mode, project the user and camera onto their route segments and
  compute the exact along-route distance from those `t` values, summing unrounded
  segment lengths.
- Lookahead is now a 2 km **meter** window, not a segment count.
- Free cruising (no active route) uses a **500 m** radius instead of 1 km; navigation
  keeps 1 km because the camera must also sit within 65 m of the route corridor.

### Heading bug (same fix)

`useGeolocation` did `pos.coords.heading ?? 0` *before* checking for null, so the
fallback bearing was never computed. Devices reporting `null` course were treated as
driving **north**, which skewed the AES forward cone and rotated the follow camera
north. New `resolveHeading()` falls back to the bearing between consecutive fixes;
it is covered by `tests/hooks/geolocationHeading.test.ts`.

### Tests

- `tests/traffic/aesDistancePrecision.test.ts` — 2.5 km ahead: no alert; 800 m: alert
  at ~800 m; 400 m: alert at ~400 m (previously 50 m in all cases).
- `tests/hooks/geolocationHeading.test.ts` — reported heading, derived south/east
  bearings, `undefined`/`NaN`, and no-previous-fix cases.

### Caveat

The 19 AES camera coordinates are approximate. Navigation mode intentionally
requires a camera within 65 m of the route, so a camera with a rough coordinate may
not alert on a route that passes it. That is a data-accuracy follow-up, not this fix.

---

## Pending commit 1 — speed-adaptive 60 fps follow camera

`feat(map): speed-adaptive 60fps follow camera with user zoom ownership`

- One `requestAnimationFrame` loop eases puck and camera together, keeping the
  marker centred between 1 Hz GPS fixes.
- Speed-adaptive zoom: ~17.2 at ≤20 km/h → 16.2 at ≥90.
- Manual zoom/pinch is stored as a clamped offset instead of reset on every fix;
  pinch keeps following, drag/north/step selection detach until recenter.

---

## Verification (fresh)

```
npx tsc --noEmit → exit 0
npm test         → 48 files, 214 tests passed
npm run build    → OK; bundle ~229.6 kB (gzip 65.8 kB)
```

**Not browser-tested:** the camera loop, gesture handling and on-road alert timing
were verified by type-check, unit tests and the production build. A real-device
drive remains the recommended check.

---

## Already published (origin/main `fb36f00`)

- `80f82b6` cache ownership / subpath POI / README truth pass
- `aa5fe1a` empty CI trigger (not from this session)
- `e7822f4` car-only mode
- `41d5d13` z16–18 corridor tile preloading with streaming
- `c46de40` simulated region-pack downloader removed
- `7c2cd19` Valhalla fallback, circuit breaker, attribution, health check
- `5186709` cache caps, SW update prompt, geocoding throttle/cache, route cache,
  icons, 21,684-record GeoNames index
- `fb36f00` dead modules removed, Dexie region/tile tables dropped, `dist/` untracked

---

## Remaining follow-ups

- **AES camera coordinates** need field verification; the nav corridor is 65 m.
- **Real-device test** of camera loop, pinch/zoom and alert timing.
- **3D buildings** need the optional OpenFreeMap vector migration.
- **Speed limits** are always `'estimated'`, so speeding alerts never fire.
- **POI index refresh is manual** (script + `POI_INDEX_VERSION` bump).
- **Offline map is corridor-only**; route planning still needs connectivity.
- **Valhalla demo** is slow and has no SLA.
