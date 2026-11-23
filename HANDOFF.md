# Handoff — toll/AES ground-truth audit + repo hygiene

**Prepared:** 2026-11-23
**Branch:** `main` (synced with `origin/main` at `93dd84d`)
**Working tree:** one uncommitted change set — the data audit below

> The previous handoff ("one pending commit") is obsolete: `bcf51bb` was pushed,
> then `776324d` (README clarity) and `93dd84d` (CI deploy job split) landed on
> `origin/main`. Nothing is behind.

---

## Uncommitted — OSM ground-truth correction of toll gates and AES cameras

Toll gate and AES camera coordinates were compared against OpenStreetMap
`barrier=toll_booth` / `highway=speed_camera` nodes (the same road network OSRM
routes over). 24 coordinates were wrong — some by 4–8 km.

### Fixes

- **18 of 33 physical toll gates** repositioned onto their real OSM canopies
  (midpoint of the directional pair where one exists). Worst offenders:
  `PLUS_E1_GATE_IPOH_SELATAN` (6.5 km off), `LDP_PUCHONG_SELATAN` (8.6 km),
  `MEX_PUTRAJAYA` (1.9 km), `PLUS_E2_GATE_AYER_KEROH` (4.3 km),
  `GRAND_SAGA_BATU_11` (1.2 km).
- **6 of 19 AES cameras** repositioned where OSM names the same site or cites the
  same KM marker (`KM 214.4 Alor Gajah`, `KM 184.2 Jasin`, `AES Slim River`,
  `AWAS ELITE`, `AES Kajang`).
- **`SMART_TUNNEL` removed from `PHYSICAL_TOLL_GATES`.** Its Sungai Besi canopy
  sits 0–20 m from the parallel E37 "Lebuhraya Kuala Lumpur–Seremban" for the
  whole corridor (the E38 bore is mapped directly beneath the surface
  expressway), so proximity detection fired on untolled E37 traffic. The
  road-name keyword path charges it instead, and only when the route really uses
  "Terowong Smart"/E38.

### What the audits now show

```
Kajang -> Cheras     RM 0.00 -> RM 1.30   (GRAND_SAGA_BATU_11 now at 0 m)
Sg Besi -> Seremban  gate 187 m -> 26 m
KL -> Ipoh           Jalan Duta 184 m -> 29 m
AES Sg Besi->Seremban  none < 250 m -> aes-e2-kajang-sb at 18 m
AES KL -> Penang       none < 250 m -> slimriver-sb/nb at 0 m
0 route(s) returned RM 0 despite toll keywords
```

The Kajang→Cheras **RM 0.00 was a real billing bug**: the route genuinely uses
the tolled `Lebuhraya Cheras–Kajang` (E7) and crosses the Batu 11 canopy, but
the gate coordinate sat 1.2 km south of it.

### Verification

```
npx tsc --noEmit  -> exit 0
npm test          -> 52 files, 221 tests passed
npm run build     -> OK (app bundle 237.7 kB / gzip 68.2 kB)
npm run audit:tolls -> see above
npm run audit:aes   -> see above
```

Test fixtures in `tests/toll/tollCalculator.test.ts` and
`tests/traffic/aesCamera.test.ts` were rebuilt around the corrected coordinates,
preserving each case's intent (bearing match, 80 m continuation, touch-and-reverse
rejection, past-camera clearing).

### Repo hygiene (same change set)

- `.superpowers/` (brainstorm server logs, PIDs, `.last-token`) untracked and
  gitignored. **Note:** `.last-token` is a 64-hex string still present in git
  history — if it was ever a real credential, rotate it and consider a history
  purge; removing it from the tree does not scrub old commits.
- `HANDOFF.md` rewritten (this file).

---

## Remaining follow-ups

- **13 AES cameras have no OSM counterpart** and keep approximate coordinates:
  `kualamuda`, `sungaidua`, `bktgantang-nb/sb`, `gopeng-sb`, `bangi-nb`, `pagoh`,
  `fed-subang`, `fed-pj`, `skve`, `silk-kajang`, `karak-gombak`, `lpt-lanchang`.
  They need field verification. `npm run audit:aes` reports offsets.
- **Toll rates** are still a 2026-11 snapshot; verify against official
  concessionaire tables (`npm run audit:tolls` prints live OSRM fares).
- **Speed limits** are always `'estimated'`, so speeding alerts never fire. A
  curated public expressway limit table would let high-confidence alerts fire.
- **Real-device test** of camera loop, pinch/zoom and alert timing.
- **3D buildings** need the optional OpenFreeMap vector migration.
- **POI index refresh is manual** (script + `POI_INDEX_VERSION` bump).
- **Offline map is corridor-only**; route planning needs connectivity.
- **Valhalla demo** is slow and has no SLA.
