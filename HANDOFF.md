# Handoff — one pending commit (toll disclaimer, audits, crash/offline UX)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `6e2f402`
**Local HEAD:** UX/audit hardening — **1 commit ahead, not pushed**
**Session baseline:** `a2b0ad7`

The camera, AES and toll fallback fixes are already on GitHub. Only this commit
remains:

```bash
git log --oneline -3   # UX/audit, 6e2f402, e5d6122
git push origin main
```

The push triggers `.github/workflows/deploy.yml` (`npm ci` → `npm test` → build →
Pages).

---

## Pending commit — dated toll disclaimer, audits, crash/offline UX

`feat(ux): date toll estimates, add data audits and crash/offline safety nets`

- **Dated toll disclaimer:** `TOLL_RATES_SNAPSHOT = '2026-11'` is attached to every
  `TollBreakdown`; the toll modal now reads "Estimate only · rates as of 2026-11".
- **Repeatable audits:** `npm run audit:tolls` prints live OSRM fares, charged items
  and expected-gate distances for seven corridors. `npm run audit:aes` checks camera
  table integrity and distance to three common corridors. Both are informational,
  not CI gates.
- **Data-integrity tests:** unique toll/AES IDs, Malaysia bounding boxes, plausible
  rates/limits and registry key alignment.
- **Dead cleanup:** Dexie `version(4)` drops the never-used `savedPlaces` table;
  removed the stale Overture scripts (`prepare-poi-directory.py`,
  `compact-poi.py`, `ingest-pois.ts`) and the `prepare:poi` npm script.
- **Crash/offline UX:** root `AppErrorBoundary` in `main.tsx` shows a reloadable
  fallback instead of a white screen; `useOnlineStatus` drives an "Offline — using
  cached maps and data" banner and feeds the search bar.

### What the audits now show

- Toll canopies are often far from OSRM geometry (Sg Besi 187 m, Jalan Duta 184 m,
  Ipoh Selatan 3,507 m, Grand Saga Batu 11 334 m). Closed-system fallback keeps those
  trips tolled, but canopy-based open plazas remain fragile.
- None of the 19 AES cameras sit within 250 m of three common test corridors, which
  explains why navigation-mode (65 m corridor) alerts rarely fire and free-cruising
  (500 m) alerts can feel early. Camera coordinates need field verification.

---

## Verification

```
npx tsc --noEmit → exit 0
npm test         → 52 files, 221 tests passed
npm run build    → OK; bundle ~232.3 kB (gzip 66.5 kB)
```

The audits are informational and used live OSRM geometry; nothing here is a
billing-grade guarantee.

---

## Already published (origin/main `6e2f402`)

- `80f82b6` cache ownership / subpath POI / README truth pass
- `aa5fe1a` empty CI trigger
- `e7822f4` car-only mode
- `41d5d13` z16–18 corridor preloading with streaming
- `c46de40` simulated region-pack downloader removed
- `7c2cd19` Valhalla fallback, circuit breaker, attribution, health check
- `5186709` cache caps, SW update prompt, geocoding throttle/cache, route cache,
  icons, 21,684-record GeoNames index
- `fb36f00` dead modules removed, region/tile tables dropped, `dist/` untracked
- `daa83ee` speed-adaptive 60 fps follow camera
- `e5d6122` precise AES distances and heading fallback
- `6e2f402` toll closed-system fallback when geometry misses canopies

---

## Remaining follow-ups

- **Toll data audit:** verify gate coordinates and fares against official
  concessionaire tables (Grand Saga gate selection, LPT closed fare, Penang Bridge);
  `npm run audit:tolls` is the starting point.
- **AES camera coordinates:** field verification; `npm run audit:aes` shows offsets.
- **Real-device test** of camera loop, pinch/zoom and alert timing.
- **3D buildings** need the optional OpenFreeMap vector migration.
- **Speed limits** are always `'estimated'`, so speeding alerts never fire.
- **POI index refresh is manual** (script + `POI_INDEX_VERSION` bump).
- **Offline map is corridor-only**; route planning needs connectivity.
- **Valhalla demo** is slow and has no SLA.
