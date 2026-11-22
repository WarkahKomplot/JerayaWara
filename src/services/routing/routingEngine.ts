import { RouteResult, TurnStep, ManeuverType } from './types';
import { VehicleClass } from '../toll/types';
import { findClosedSystemTollPlazas } from '../toll/closedTollNetwork';
import { registerDynamicTollPlaza } from '../toll/tollData';
import { analyzeRouteTraffic } from '../traffic/malaysiaTrafficEngine';
export { routeGapMeters, verifyRouteIntegrity } from './routeIntegrity';
export type { RouteIntegrityOptions, RouteIntegrityResult } from './routeIntegrity';

/** Thrown when no real road route can be calculated — the app is online-only by design. */
export class RouteUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteUnavailableError';
  }
}

/**
 * Extracts lane guidance from OSRM intersection data. OSRM returns `lanes` per
 * intersection — an array where each entry is a lane object; entries with
 * `valid: true` lead onto the next road. Produces "Use lane 2 of 3" style
 * hints, but only where it adds value (multi-lane turns with a subset of
 * valid lanes). Tolerates missing/malformed lane data on mirror servers.
 */
export function extractOsrmLaneGuidance(step: any, maneuver: ManeuverType): string | undefined {
  if (!step?.intersections || !Array.isArray(step.intersections)) return undefined;
  // Only meaningful for direction-changing maneuvers
  if (maneuver === 'straight' || maneuver === 'arrive' || maneuver === 'roundabout') return undefined;

  const lanes = step.intersections[0]?.lanes;
  if (!Array.isArray(lanes) || lanes.length < 2) return undefined;

  const validCount = lanes.filter((l: any) => l?.valid).length;
  const totalCount = lanes.length;

  // All or no lanes valid = no useful guidance
  if (validCount === 0 || validCount === totalCount) return undefined;

  // Human lane numbering: leftmost = lane 1
  const validPositions = lanes
    .map((l: any, i: number) => (l?.valid ? i + 1 : -1))
    .filter((i: number) => i > 0);

  const laneText =
    validCount === 1
      ? `Use lane ${validPositions[0]}`
      : validPositions.length === 2 && validPositions[1] - validPositions[0] === 1
      ? `Use lanes ${validPositions[0]} and ${validPositions[1]}`
      : `Keep to the ${validPositions[0] <= totalCount / 2 ? 'left' : 'right'} lanes`;

  return `${laneText} of ${totalCount} for the upcoming turn`;
}

function mapOsrmManeuver(type: string, modifier?: string): ManeuverType {
  if (type === 'depart') return 'straight';
  if (type === 'arrive') return 'arrive';
  if (type === 'roundabout' || type === 'rotary' || type === 'exit roundabout' || type === 'exit rotary') {
    return 'roundabout';
  }

  // Malaysian Grade-Separated Ingress / Egress (Flyover vs Ground Level Ramp)
  if (type === 'fork') {
    if (modifier?.includes('right') || modifier === 'straight') {
      return 'flyover';
    }
    if (modifier?.includes('left')) {
      return 'underpass';
    }
  }

  if (type === 'off ramp') {
    // Taking an exit off a major expressway or elevated highway to ground level
    return modifier?.includes('left') ? 'underpass' : 'exit_right';
  }

  if (type === 'on ramp') {
    return 'flyover';
  }

  if (modifier === 'sharp left' || modifier === 'left') return 'turn_left';
  if (modifier === 'slight left') return 'slight_left';
  if (modifier === 'sharp right' || modifier === 'right') return 'turn_right';
  if (modifier === 'slight right') return 'slight_right';
  if (modifier === 'uturn') return 'u_turn';
  return 'straight';
}

function formatStepInstruction(
  maneuver: ManeuverType,
  roadName: string,
  destTitle?: string,
  exitNumber?: number
): string {
  const road = roadName && roadName !== 'unnamed' && roadName.trim() !== '' ? roadName : 'primary road';

  switch (maneuver) {
    case 'arrive':
      return `Arrive at ${destTitle || 'destination'}`;
    case 'flyover':
      return `Take flyover (Naik jejambat) onto ${road}`;
    case 'underpass':
      return `Keep left for ground level / avoid flyover (Ikut susur bawah) onto ${road}`;
    case 'roundabout': {
      if (exitNumber && exitNumber > 0) {
        const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
        const ordinal = ordinals[exitNumber - 1] || `${exitNumber}th`;
        return `At the roundabout, take the ${ordinal} exit onto ${road}`;
      }
      return `Take roundabout exit onto ${road}`;
    }
    case 'exit_left':
      return `Take exit on left onto ${road}`;
    case 'exit_right':
      return `Take exit on right onto ${road}`;
    case 'turn_left':
      return `Turn left onto ${road}`;
    case 'turn_right':
      return `Turn right onto ${road}`;
    case 'slight_left':
      return `Keep left onto ${road}`;
    case 'slight_right':
      return `Keep right onto ${road}`;
    default:
      return `Continue on ${road}`;
  }
}

/**
 * Accurately determines Malaysian toll plaza keys based on:
 * - Specific entry and exit locations along closed expressway systems (PLUS E1, E2, LPT E8)
 * - Barrier toll plazas crossed (MEX E20, KESAS E5, LDP E11, SMART E38, Penang Bridges)
 * - Destination name and coordinates
 */
export function determineRouteTollPlazas(
  start: [number, number],
  dest: [number, number],
  destTitle: string,
  roadNames: string[],
  _distanceKmVal: number
): string[] {
  const keys: string[] = [];

  // 1. Closed Expressway Systems (Bidirectional PLUS E1, PLUS E2, and LPT E8)
  const closedPlazas = findClosedSystemTollPlazas(start, dest, roadNames, destTitle);
  for (const plaza of closedPlazas) {
    registerDynamicTollPlaza(plaza);
    keys.push(plaza.id);
  }

  // 2. Open / Barrier Plazas — matched against road names actually travelled, not the
  //    destination title (a destination in "Shah Alam" does not imply KESAS was used).
  const roadText = roadNames.join(' ').toLowerCase();

  // Penang Bridge (Westbound onto Penang Island)
  const isEnteringPenangIsland =
    (dest[0] < 100.35 && dest[1] > 5.25 && dest[1] < 5.55 && start[0] >= 100.35) ||
    roadText.includes('penang bridge') ||
    roadText.includes('jambatan pulau pinang');
  if (isEnteringPenangIsland) {
    keys.push('PENANG_BRIDGE_1');
  }

  // MEX E20 — explicit route-name hits only; bare "e20"/"mex" substrings in
  // arbitrary road names (e.g. "Jalan Mex..." is rare, but "e20" inside longer
  // names is not) are too risky without word boundaries.
  if (/\b(e20|mex|maju expressway)\b/i.test(roadText)) {
    if (/\b(putrajaya|cyberjaya)\b/i.test(roadText) || dest[1] < 2.95) {
      keys.push('MEX_PUTRAJAYA');
    } else if (roadText.includes('kembangan')) {
      keys.push('MEX_SERI_KEMBANGAN');
    } else {
      keys.push('MEX_SALAK_SELATAN');
    }
  }

  // DUKE E33 (Duta-Ulu Klang)
  if (/\b(e33|duke|duta.ulu klang|klang valley? (inner|northern) expressway)\b/i.test(roadText)) {
    keys.push('DUKE_SEGAMBUT');
  }

  // KESAS E5
  if (/\b(e5|kesas|shah alam expressway|lebuhraya shah alam|kem-shah|klang valley expressway)\b/i.test(roadText)) {
    keys.push('KESAS_SUNWAY');
  }

  // Grand Saga E7 (Cheras-Kajang)
  if (/\b(e7|grand saga|cheras.kajang expressway|lebuhraya cheras)\b/i.test(roadText)) {
    keys.push('GRAND_SAGA_BATU_9');
  }

  // SILK E18 (Kajang Dispersal Link) — ring road, up to 4 plazas on a full loop
  if (/\b(e18|silk|kajang dispersal|lingkaran kajang)\b/i.test(roadText)) {
    keys.push('SILK_SG_BALAK');
    if (roadText.includes('ramal') || roadText.includes('kajang')) keys.push('SILK_SG_RAMAL');
  }

  // BESRAYA E9 (Sungai Besi Expressway)
  if (/\b(e9|besraya|sungai besi expressway|lebuhraya sungai besi)\b/i.test(roadText)) {
    keys.push('BESRAYA_MINES');
    if (roadText.includes('loke yew') || roadText.includes('pudu')) keys.push('BESRAYA_LOKE_YEW');
  }

  // NPE E10 (New Pantai Expressway)
  if (/\b(e10|npe|new pantai|pantai expressway|lebuhraya baru pantai)\b/i.test(roadText)) {
    keys.push('NPE_PANTAI_DALAM');
  }

  // LEKAS E21 (Kajang-Seremban)
  if (/\b(e21|lekas|kajang.seremban expressway|lebuhraya kajang)\b/i.test(roadText)) {
    keys.push('LEKAS_KAJANG_SELATAN');
    if (roadText.includes('seremban') || roadText.includes('ampangan')) keys.push('LEKAS_AMPANGAN');
  }

  // LDP E11
  if (/\b(e11|ldp|damansara-puchong|damansara puchong|lebuhraya damansara)\b/i.test(roadText)) {
    keys.push('LDP_PENCHALA');
  }

  // Penang Bridge 2 (Second Bridge / Sultan Abdul Halim Muadzam Shah, E28)
  if (/\b(e28|second bridge|jambatan kedua|sultan abdul halim)\b/i.test(roadText)) {
    keys.push('PENANG_BRIDGE_2');
  }

  // LPT2 E8 (East Coast expressway past Kuantan)
  if (/\b(lpt2|lpt 2|jabor|temerloh)\b/i.test(roadText)) {
    keys.push('LPT_TEMERLOH', 'LPT_JABOR');
  }

  // SMART E38
  if (/\b(e38|smart tunnel|terowong smart)\b/i.test(roadText)) {
    keys.push('SMART_TUNNEL');
  }

  return keys;
}

/**
 * navigator.onLine only reports that a network interface is up — captive portals
 * and Wi-Fi-with-no-internet still return true. This cheap probe verifies actual
 * reachability in 2s so dead zones fail fast with RouteUnavailableError instead
 * of hanging on a doomed OSRM request for 6s. Cached for 15s to avoid probing on
 * every route calculation.
 */
let lastLivenessCheck = { at: 0, alive: false };

/** Test-only: clears the 15s liveness cache between tests. */
export function resetLivenessCacheForTest(): void {
  lastLivenessCheck = { at: 0, alive: false };
}

const OSRM_PRIMARY_BASE = 'https://router.project-osrm.org';
const OSRM_MIRROR_BASE = 'https://routing.openstreetmap.de/routed-car';
const VALHALLA_ROUTE_URL = 'https://valhalla1.openstreetmap.de/route';
const VALHALLA_STATUS_URL = 'https://valhalla1.openstreetmap.de/status';

const ROUTE_TIMEOUT_MS = 6000;
const VALHALLA_TIMEOUT_MS = 12000;
const PROBE_TIMEOUT_MS = 2000;
const FAILURE_THRESHOLD = 3;
const PROVIDER_COOLDOWN_MS = 10 * 60 * 1000;

type ProviderName = 'osrm' | 'osmde' | 'valhalla';
const providerHealth = new Map<ProviderName, { failures: number; blockedUntil: number }>();

/** Test-only: clears the failover circuit-breaker state. */
export function resetProviderHealthForTest(): void {
  providerHealth.clear();
}

function isProviderBlocked(name: ProviderName, now = Date.now()): boolean {
  const health = providerHealth.get(name);
  return !!health && health.blockedUntil > now;
}

function recordProviderFailure(name: ProviderName): void {
  const health = providerHealth.get(name) ?? { failures: 0, blockedUntil: 0 };
  health.failures += 1;
  if (health.failures >= FAILURE_THRESHOLD) {
    health.blockedUntil = Date.now() + PROVIDER_COOLDOWN_MS;
    health.failures = 0;
  }
  providerHealth.set(name, health);
}

function recordProviderSuccess(name: ProviderName): void {
  providerHealth.set(name, { failures: 0, blockedUntil: 0 });
}

export async function isActuallyOnline(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.onLine) return false;

  const now = Date.now();
  if (now - lastLivenessCheck.at < 15000) {
    return lastLivenessCheck.alive;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  // Probe every routing provider in parallel. Checking sequentially meant a
  // dead primary burned 2s before the mirror was even tried, and a live
  // Valhalla instance could not rescue the app at all.
  const probes = [
    fetch(`${OSRM_PRIMARY_BASE}/route/v1/driving/101.6869,3.1390;101.7471,3.0732?overview=false&steps=false&alternatives=false`, { signal: controller.signal, cache: 'no-store' }),
    fetch(`${OSRM_MIRROR_BASE}/route/v1/driving/101.6869,3.1390;101.7471,3.0732?overview=false&steps=false&alternatives=false`, { signal: controller.signal, cache: 'no-store' }),
    fetch(VALHALLA_STATUS_URL, { signal: controller.signal, cache: 'no-store' })
  ];

  try {
    const results = await Promise.all(probes.map(probe => probe.then(res => res.ok).catch(() => false)));
    lastLivenessCheck = { at: now, alive: results.some(Boolean) };
    return lastLivenessCheck.alive;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Decodes Valhalla's encoded polyline (precision 6) into [lng, lat] pairs. */
export function decodePolyline(encoded: string, precision: number = 6): [number, number][] {
  const factor = Math.pow(10, precision);
  const coordinates: [number, number][] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    latitude += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push([longitude / factor, latitude / factor]);
  }

  return coordinates;
}

/** Valhalla maneuver type numbers → the app's maneuver vocabulary. */
function mapValhallaManeuver(type: number, isLast: boolean): ManeuverType {
  if (isLast || type === 4 || type === 5 || type === 6) return 'arrive';
  if (type === 9 || type === 10 || type === 11) return type === 9 ? 'slight_right' : 'turn_right';
  if (type === 14 || type === 15 || type === 16) return type === 16 ? 'slight_left' : 'turn_left';
  if (type === 12 || type === 13) return 'u_turn';
  if (type === 18 || type === 20) return 'exit_right';
  if (type === 19 || type === 21) return 'exit_left';
  if (type === 26 || type === 27) return 'roundabout';
  if (type === 23) return 'flyover';
  if (type === 24) return 'underpass';
  return 'straight';
}

function buildOsrmRoute(
  routeData: any,
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass,
  destinationTitle?: string
): RouteResult {
  const rawCoordinates: [number, number][] = routeData.geometry.coordinates;
  const distanceKmVal = Math.round((routeData.distance / 1000) * 10) / 10;
  const durationMinutesVal = Math.max(1, Math.round(routeData.duration / 60));

  const legSteps = routeData.legs?.[0]?.steps || [];
  const roadNames: string[] = [];
  const turnSteps: TurnStep[] = [];

  legSteps.forEach((s: any, idx: number) => {
    if (s.name) roadNames.push(s.name);
    const maneuver = mapOsrmManeuver(s.maneuver?.type, s.maneuver?.modifier);
    const isLast = idx === legSteps.length - 1;
    const exitNum = typeof s.maneuver?.exit === 'number' ? s.maneuver.exit : undefined;

    const osrmLaneHint = extractOsrmLaneGuidance(s, maneuver);

    turnSteps.push({
      id: `osrm-step-${idx}`,
      maneuver: isLast ? 'arrive' : maneuver,
      destinationSide: isLast && (s.maneuver?.modifier === 'left' || s.maneuver?.modifier === 'right')
        ? s.maneuver.modifier
        : undefined,
      instruction: formatStepInstruction(isLast ? 'arrive' : maneuver, s.name, destinationTitle, exitNum),
      distanceMeters: Math.round(s.distance),
      durationSeconds: Math.round(s.duration),
      coordinates: s.maneuver?.location || rawCoordinates[0],
      speedLimitKmH: /\be\d+\b/i.test(s.name || '') ? 110 : 80,
      speedLimitSource: 'estimated',
      laneGuidance: osrmLaneHint
        ? osrmLaneHint
        : maneuver === 'flyover'
        ? 'Use middle or right lanes for flyover'
        : maneuver === 'underpass'
        ? 'Keep left to avoid flyover'
        : undefined,
      exitNumber: exitNum
    });
  });

  // Ensure at least arrival step
  if (turnSteps.length === 0) {
    turnSteps.push({
      id: 'osrm-step-0',
      maneuver: 'arrive',
      instruction: `Arrive at ${destinationTitle || 'destination'}`,
      distanceMeters: 0,
      durationSeconds: 0,
      coordinates: destination
    });
  }

  const tollPlazaKeys = determineRouteTollPlazas(
    start,
    destination,
    destinationTitle || '',
    roadNames,
    distanceKmVal
  );

  const traffic = analyzeRouteTraffic(rawCoordinates, durationMinutesVal);

  // Connect user's current GPS location directly to route so navigation line starts right at user puck
  const fullRouteCoordinates: [number, number][] = [start, ...rawCoordinates];

  return {
    coordinates: fullRouteCoordinates,
    distanceKm: distanceKmVal,
    durationMinutes: traffic.totalMinutes,
    steps: turnSteps,
    tollPlazaKeys,
    profile,
    destinationName: destinationTitle || 'Destination',
    traffic
  };
}

async function fetchOsrmRoute(
  baseUrl: string,
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass,
  destinationTitle: string | undefined,
  geometryDetail: 'full' | 'simplified'
): Promise<RouteResult | null> {
  const url = `${baseUrl}/${start[0]},${start[1]};${destination[0]},${destination[1]}?overview=${geometryDetail}&geometries=geojson&steps=true`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ROUTE_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;
    return buildOsrmRoute(data.routes[0], start, destination, profile, destinationTitle);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchValhallaRoute(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass,
  destinationTitle?: string
): Promise<RouteResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VALHALLA_TIMEOUT_MS);

  try {
    const res = await fetch(VALHALLA_ROUTE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [
          { lat: start[1], lon: start[0] },
          { lat: destination[1], lon: destination[0] }
        ],
        costing: 'auto',
        shape_format: 'polyline6',
        directions_options: { units: 'kilometers' }
      }),
      signal: controller.signal
    });
    if (!res.ok) return null;

    const data = await res.json();
    const leg = data?.trip?.legs?.[0];
    if (!leg?.shape) return null;

    const shape = decodePolyline(leg.shape, 6);
    if (shape.length < 2) return null;

    const summary = data.trip.summary ?? {};
    const distanceKmVal = Math.round((summary.length ?? 0) * 10) / 10;
    const durationMinutesVal = Math.max(1, Math.round((summary.time ?? 0) / 60));

    const roadNames: string[] = [];
    const maneuvers: any[] = leg.maneuvers ?? [];

    const turnSteps: TurnStep[] = maneuvers.map((m: any, idx: number) => {
      const streetName = Array.isArray(m.street_names) ? m.street_names[0] : undefined;
      if (streetName) roadNames.push(streetName);

      const isLast = idx === maneuvers.length - 1;
      const maneuver = mapValhallaManeuver(m.type, isLast);
      const clampedIndex = Math.max(0, Math.min(shape.length - 1, m.begin_shape_index ?? 0));
      const instruction = String(m.instruction || '');
      const signExit = m.sign?.exit_number_elements?.[0]?.text;
      const parsedSignExit = typeof signExit === 'string' ? parseInt(signExit, 10) : NaN;
      const exitNumber = Number.isFinite(parsedSignExit)
        ? parsedSignExit
        : typeof m.roundabout_exit_count === 'number'
        ? m.roundabout_exit_count
        : undefined;
      const destinationSide = isLast && /on the right/i.test(instruction)
        ? 'right'
        : isLast && /on the left/i.test(instruction)
        ? 'left'
        : undefined;

      return {
        id: `valhalla-step-${idx}`,
        maneuver: isLast ? 'arrive' : maneuver,
        destinationSide,
        instruction: isLast
          ? `Arrive at ${destinationTitle || 'destination'}`
          : instruction || formatStepInstruction(maneuver, streetName || '', destinationTitle, exitNumber),
        distanceMeters: Math.round((m.length ?? 0) * 1000),
        durationSeconds: Math.round(m.time ?? 0),
        coordinates: shape[clampedIndex],
        speedLimitKmH: /\be\d+\b/i.test(streetName || '') ? 110 : 80,
        speedLimitSource: 'estimated',
        laneGuidance:
          maneuver === 'flyover'
            ? 'Use middle or right lanes for flyover'
            : maneuver === 'underpass'
            ? 'Keep left to avoid flyover'
            : undefined,
        exitNumber
      };
    });

    if (turnSteps.length === 0) {
      turnSteps.push({
        id: 'valhalla-step-0',
        maneuver: 'arrive',
        instruction: `Arrive at ${destinationTitle || 'destination'}`,
        distanceMeters: 0,
        durationSeconds: 0,
        coordinates: destination
      });
    }

    const fullRouteCoordinates: [number, number][] = [start, ...shape];
    const tollPlazaKeys = determineRouteTollPlazas(
      start,
      destination,
      destinationTitle || '',
      roadNames,
      distanceKmVal
    );
    const traffic = analyzeRouteTraffic(fullRouteCoordinates, durationMinutesVal);

    return {
      coordinates: fullRouteCoordinates,
      distanceKm: distanceKmVal,
      durationMinutes: traffic.totalMinutes,
      steps: turnSteps,
      tollPlazaKeys,
      profile,
      destinationName: destinationTitle || 'Destination',
      traffic
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Calculates a route using real road network vectors via redundant free routing
 * servers (OSRM primary, openstreetmap.de OSRM mirror, then Valhalla).
 * Routing is online-only by design: when no provider is reachable this throws
 * RouteUnavailableError rather than drawing a synthetic line that does not
 * follow real roads.
 *
 * Providers that fail repeatedly are skipped for 10 minutes (circuit breaker)
 * so a dead endpoint does not add a 6s timeout to every route calculation.
 *
 * geometryDetail: 'simplified' (route preview — small polyline) or 'full'
 * (active navigation — complete geometry for turn-by-turn).
 */
export async function calculateRoute(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass,
  destinationTitle?: string,
  geometryDetail: 'full' | 'simplified' = 'full'
): Promise<RouteResult> {
  if (!(await isActuallyOnline())) {
    throw new RouteUnavailableError(
      'No connection to routing service. Navigation requires internet.'
    );
  }

  const providers: Array<{ name: ProviderName; run: () => Promise<RouteResult | null> }> = [
    {
      name: 'osrm',
      run: () => fetchOsrmRoute(`${OSRM_PRIMARY_BASE}/route/v1/driving`, start, destination, profile, destinationTitle, geometryDetail)
    },
    {
      name: 'osmde',
      run: () => fetchOsrmRoute(`${OSRM_MIRROR_BASE}/route/v1/driving`, start, destination, profile, destinationTitle, geometryDetail)
    },
    {
      name: 'valhalla',
      run: () => fetchValhallaRoute(start, destination, profile, destinationTitle)
    }
  ];

  const unblocked = providers.filter(provider => !isProviderBlocked(provider.name));
  // If every provider is in cooldown, still try them once rather than refusing
  // to calculate a route for 10 minutes after a transient outage.
  const attempts = unblocked.length > 0 ? unblocked : providers;

  for (let i = 0; i < attempts.length; i++) {
    const provider = attempts[i];
    if (i > 0) {
      // Brief backoff before the next provider so a rate-limited server does
      // not immediately burn the fallback on the same burst.
      await new Promise(resolve => setTimeout(resolve, 750));
    }

    try {
      const route = await provider.run();
      if (route) {
        recordProviderSuccess(provider.name);
        return route;
      }
    } catch {
      // Try the next provider.
    }

    recordProviderFailure(provider.name);
  }

  throw new RouteUnavailableError(
    'All routing services unreachable. Please check your internet connection.'
  );
}
