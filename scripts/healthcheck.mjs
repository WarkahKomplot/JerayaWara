#!/usr/bin/env node
/**
 * Free upstream health check for JerayaWara.
 *
 * Runs daily from GitHub Actions (no server, no paid monitoring). Verifies the
 * free services the app depends on for online navigation:
 *   - routing: OSRM primary, openstreetmap.de mirror, Valhalla (any one is enough)
 *   - map tiles: the OSM raster tile server
 *   - geocoding: Nominatim (warning only)
 *
 * Exit code 1 when routing is unavailable from every provider or tiles fail,
 * so the companion workflow fails and opens a GitHub issue.
 */

const TIMEOUT_MS = 10_000;
const VALHALLA_TIMEOUT_MS = 30_000;
const APP_UA =
  'JerayaWara-Healthcheck/1.0 (+https://github.com/WarkahKomplot/JerayaWara)';

const KL = { lng: 101.693, lat: 3.141 };
const SEREMBAN = { lng: 101.938, lat: 2.725 };
const KAJANG = { lng: 101.7888, lat: 2.9911 };
const OSRM_QUERY = `${KL.lng},${KL.lat};${SEREMBAN.lng},${SEREMBAN.lat}`;

function slippyTile(lng, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, z };
}

async function requestJson(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const res = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'application/json',
      'User-Agent': APP_UA,
      ...(options.headers ?? {})
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function attempt(name, fn) {
  const startedAt = Date.now();
  try {
    const detail = await fn();
    return { name, ok: true, detail, ms: Date.now() - startedAt };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
      ms: Date.now() - startedAt
    };
  }
}

function print(result) {
  const icon = result.ok ? '✓' : '✗';
  console.log(`${icon} ${result.name} — ${result.detail} [${result.ms}ms]`);
}

// --- Routing: each provider is reported, but the app only needs one of them.
const routing = [];

routing.push(
  await attempt('Routing: OSRM primary', async () => {
    const data = await requestJson(
      `https://router.project-osrm.org/route/v1/driving/${OSRM_QUERY}?overview=false&steps=false`
    );
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error(`code=${data.code}`);
    return `${(data.routes[0].distance / 1000).toFixed(1)} km`;
  })
);

routing.push(
  await attempt('Routing: openstreetmap.de mirror', async () => {
    const data = await requestJson(
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${OSRM_QUERY}?overview=false&steps=false`
    );
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error(`code=${data.code}`);
    return `${(data.routes[0].distance / 1000).toFixed(1)} km`;
  })
);

routing.push(
  await attempt('Routing: Valhalla fallback', async () => {
    const data = await requestJson(
      'https://valhalla1.openstreetmap.de/route',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: [
            { lat: KL.lat, lon: KL.lng },
            { lat: KAJANG.lat, lon: KAJANG.lng }
          ],
          costing: 'auto',
          directions_options: { units: 'kilometers' }
        })
      },
      VALHALLA_TIMEOUT_MS
    );
    const summary = data.trip?.summary;
    if (!summary?.length) throw new Error('no trip summary');
    return `${summary.length.toFixed(1)} km`;
  })
);

routing.forEach(print);

const routingOk = routing.some(result => result.ok);
const routingAvailable = routing.filter(result => result.ok).length;
const routingGroup = {
  name: `Routing availability (any provider)`,
  ok: routingOk,
  detail: routingOk
    ? `${routingAvailable}/${routing.length} providers up`
    : 'all routing providers failed',
  ms: 0
};
print(routingGroup);

// --- Tiles are required for the map to render.
const tileResult = await attempt('Map tiles: OSM raster z12', async () => {
  const tile = slippyTile(KL.lng, KL.lat, 12);
  const res = await fetch(
    `https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`,
    {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': APP_UA, Accept: 'image/png,image/*' }
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) throw new Error(`unexpected content-type ${type}`);
  return `${tile.z}/${tile.x}/${tile.y}`;
});
print(tileResult);

// --- Geocoding is degraded gracefully, so a failure here is a warning.
const geocodeResult = await attempt('Geocoding: Nominatim (warning)', async () => {
  const data = await requestJson(
    'https://nominatim.openstreetmap.org/search?q=KLCC&countrycodes=my&format=json&limit=1'
  );
  if (!Array.isArray(data) || data.length === 0) throw new Error('no results');
  return String(data[0].display_name ?? 'ok').slice(0, 60);
});
print(geocodeResult);

const failures = [];
if (!routingGroup.ok) failures.push('routing');
if (!tileResult.ok) failures.push('tiles');

if (failures.length > 0) {
  console.error(`\nCritical upstream failure: ${failures.join(', ')}.`);
  process.exitCode = 1;
} else {
  console.log('\nOnline navigation dependencies are reachable.');
}
