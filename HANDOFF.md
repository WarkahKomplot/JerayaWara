# Handoff — one pending commit (toll geometry-miss fallback)

**Prepared:** 2026-11-22
**Branch:** `main`
**Remote `origin/main`:** `e5d6122`
**Local HEAD:** toll fallback fix — **1 commit ahead, not pushed**
**Session baseline:** `a2b0ad7`

The camera and AES fixes are already on GitHub. Only the toll fallback remains:

```bash
git log --oneline -3   # toll fix, e5d6122, daa83ee
git push origin main
```

The push triggers `.github/workflows/deploy.yml` (`npm ci` → `npm test` → build →
Pages).

---

## Pending commit — toll geometry-miss fallback

`fix(toll): keep closed-system fares when geometry misses all canopies`

### Why a real PLUS trip could cost RM 0.00

Toll estimation first looks for physical gate canopies within 45 m of the route,
then falls back to keyword evidence. On KL→Ipoh, the Jalan Duta canopy is **184 m**
off the OSRM alignment and Ipoh Selatan is **3.5 km** off, so geometry found no
tolls. The merge then skipped the closed-system keyword key because it was
"geometry's responsibility", producing RM 0.00 for a ~200 km PLUS trip.

### Fix

When geometry finds no items, keyword evidence is now filtered by trust:

- **Closed-system trip keys** (`PLUS_…`, `LPT_E8_…`) are kept — they depend on the
  entry/exit pair, not on hitting a canopy coordinate.
- **Open-plaza keys** are kept only when the canopy is within **800 m** of the
  route, so an NPE/DUKE keyword kilometres away is not charged.
- KL→Ipoh now returns **RM 26.50**; two regression tests cover the closed and
  far-open cases.

### Audit results (live OSRM routes, car Class 1)

| Trip | Engine | Notes |
|---|---|---|
| Sg Besi → Seremban | RM 4.10 | Closed E2 pair, plausible |
| KL → Putrajaya (MEX) | RM 3.50 | MEX canopy detected |
| KL → Penang (Juru) | RM 43.30 | Closed E1 pair |
| KL → Johor Bahru (Skudai) | RM 43.10 | Closed E2 pair |
| KL → Ipoh | RM 26.50 | Was RM 0.00 before this fix |
| KL → Kuantan (LPT) | RM 32.10 | Published guides cite ~RM 29.10 (LPT closed fare 21.00 vs 19.60; DUKE 1.60 included) |
| Kajang → Cheras | RM 0.00 | Route uses Lebuhraya Cheras–Kajang, but keyword picks Batu 9 (2.9 km off); route passes Batu 11 at 334 m |
| Subang → Sunway | RM 0.00 | Route uses NPE, but no canopy within tolerance; may be a genuine toll-free segment |
| Penang Bridge | RM 5.74 | Table value; recent sources cite RM 8.50 — needs verification |

### Verification

```
npx tsc --noEmit → exit 0
npm test         → 48 files, 216 tests passed
npm run build    → OK
```

This fix is unit-tested; the audit used live OSRM geometry. It is not a
billing-grade guarantee.

---

## Already published (origin/main `e5d6122`)

- `80f82b6` cache ownership / subpath POI / README truth pass
- `aa5fe1a` empty CI trigger
- `e7822f4` car-only mode
- `41d5d13` z16–18 corridor preloading with streaming
- `c46de40` simulated region-pack downloader removed
- `7c2cd19` Valhalla fallback, circuit breaker, attribution, health check
- `5186709` cache caps, SW update prompt, geocoding throttle/cache, route cache,
  icons, 21,684-record GeoNames index
- `fb36f00` dead modules removed, Dexie region/tile tables dropped, `dist/` untracked
- `daa83ee` speed-adaptive 60 fps follow camera
- `e5d6122` precise AES distances and heading fallback

---

## Remaining follow-ups

- **Toll data audit:** verify gate coordinates and fares against official
  concessionaire tables (Grand Saga gate selection, LPT closed fare, Penang Bridge),
  add effective dates and known-trip integration tests.
- **AES camera coordinates** need field verification; nav corridor is 65 m.
- **Real-device test** of camera loop, pinch/zoom and alert timing.
- **3D buildings** need the optional OpenFreeMap vector migration.
- **Speed limits** are always `'estimated'`, so speeding alerts never fire.
- **POI index refresh is manual** (script + `POI_INDEX_VERSION` bump).
- **Offline map is corridor-only**; route planning needs connectivity.
- **Valhalla demo** is slow and has no SLA.
