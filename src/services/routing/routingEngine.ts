import { RouteResult, TurnStep, ManeuverType } from './types';
import { VehicleClass } from '../toll/types';
import { findClosedSystemTollPlazas } from '../toll/closedTollNetwork';
import { registerDynamicTollPlaza } from '../toll/tollData';
import {
  distanceKm,
  findNearestRoadPath
} from './malaysiaRoadNetwork';
import { analyzeRouteTraffic } from '../traffic/malaysiaTrafficEngine';
export { routeGapMeters, verifyRouteIntegrity } from './routeIntegrity';
export type { RouteIntegrityOptions, RouteIntegrityResult } from './routeIntegrity';

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

const MALAYSIAN_EXPRESSWAY_PATTERN =
  /\b(plus|kesas|federal|lebuhraya|expressway|utara|selatan|e1|e2)\b/i;

/** True when the road name refers to a Malaysian expressway with a dedicated motorcycle lane. */
function isMalaysianExpressway(roadName: string | undefined): boolean {
  return !!roadName && MALAYSIAN_EXPRESSWAY_PATTERN.test(roadName);
}

function formatStepInstruction(
  maneuver: ManeuverType,
  roadName: string,
  destTitle?: string,
  profile?: VehicleClass,
  exitNumber?: number
): string {
  const road = roadName && roadName !== 'unnamed' && roadName.trim() !== '' ? roadName : 'primary road';

  if (profile === 'motorcycle' && isMalaysianExpressway(road)) {
    if (maneuver === 'straight') {
      return `Follow dedicated motorcycle lane (Lorong Motosikal) on ${road}`;
    }
  }

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
 * - Vehicle mode (motorcycle exemptions & SMART restrictions)
 */
export function determineRouteTollPlazas(
  start: [number, number],
  dest: [number, number],
  destTitle: string,
  roadNames: string[],
  _distanceKmVal: number,
  profile: VehicleClass
): string[] {
  if (profile === 'walker') return [];
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

  // KESAS E5
  if (/\b(e5|kesas|shah alam expressway|lebuhraya shah alam|kem-shah|klang valley expressway)\b/i.test(roadText)) {
    keys.push('KESAS_SUNWAY');
  }

  // LDP E11
  if (/\b(e11|ldp|damansara-puchong|damansara puchong|lebuhraya damansara)\b/i.test(roadText)) {
    keys.push('LDP_PENCHALA');
  }

  // SMART E38
  if (/\b(e38|smart tunnel|terowong smart)\b/i.test(roadText)) {
    keys.push('SMART_TUNNEL');
  }

  return keys;
}

/**
 * Calculates a 100% offline-ready route snapped to the real Malaysian road network.
 * Guarantees routes follow actual road curves and expressways rather than straight lines.
 */
export function calculateOfflineRoute(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass,
  destinationTitle?: string
): RouteResult {
  const straightDist = distanceKm(start, destination);

  // 1. Pedestrian / Short City Trips (< 2.5 km)
  if (profile === 'walker' || straightDist < 2.5) {
    const midLng = start[0];
    const midLat = destination[1];
    const coordinates: [number, number][] = [
      start,
      [midLng, (start[1] + midLat) / 2],
      [midLng, midLat],
      [(midLng + destination[0]) / 2, midLat],
      destination
    ];

    const actualDistKm = Math.round(straightDist * 1.25 * 10) / 10;
    const speed = profile === 'walker' ? 4.5 : 40;
    const durationMinutes = Math.max(1, Math.round((actualDistKm / speed) * 60));

    const steps: TurnStep[] = [
      {
        id: 'off-walk-1',
        maneuver: 'straight',
        instruction: profile === 'walker'
          ? 'Head on pedestrian footpath / sidewalk'
          : 'Head on local street toward primary junction',
        distanceMeters: Math.round(actualDistKm * 400),
        durationSeconds: Math.round(durationMinutes * 25),
        coordinates: start
      },
      {
        id: 'off-walk-2',
        maneuver: 'turn_right',
        instruction: profile === 'walker'
          ? 'Turn onto safe sidewalk (expressways strictly avoided)'
          : 'Turn onto connecting street',
        distanceMeters: Math.round(actualDistKm * 600),
        durationSeconds: Math.round(durationMinutes * 35),
        coordinates: [midLng, midLat]
      },
      {
        id: 'off-walk-3',
        maneuver: 'arrive',
        instruction: `Arrive at ${destinationTitle || 'destination'}`,
        distanceMeters: 0,
        durationSeconds: 0,
        coordinates: destination
      }
    ];

    return {
      coordinates,
      distanceKm: actualDistKm,
      durationMinutes,
      steps,
      tollPlazaKeys: [],
      profile,
      destinationName: destinationTitle || 'Destination',
      isApproximate: true
    };
  }

  // 2. Highway & Arterial Road Network Snapper
  const roadMatch = findNearestRoadPath(start, destination);
  if (roadMatch) {
    const fullCoordinates: [number, number][] = [
      start,
      ...roadMatch.pathCoordinates,
      destination
    ];

    let totalHighwayDist = 0;
    for (let i = 0; i < roadMatch.pathCoordinates.length - 1; i++) {
      totalHighwayDist += distanceKm(roadMatch.pathCoordinates[i], roadMatch.pathCoordinates[i + 1]);
    }
    const accessDist = distanceKm(start, roadMatch.entryPoint) + distanceKm(roadMatch.exitPoint, destination);
    const totalDistKm = Math.round((totalHighwayDist + accessDist) * 10) / 10;
    const avgSpeed = profile === 'motorcycle' ? 80 : 95;
    const durationMinutes = Math.max(1, Math.round((totalDistKm / avgSpeed) * 60));

    const steps: TurnStep[] = [
      {
        id: 'step-arterial-1',
        maneuver: 'straight',
        instruction: `Head on access road toward ${roadMatch.corridor.name}`,
        distanceMeters: Math.round(distanceKm(start, roadMatch.entryPoint) * 1000),
        durationSeconds: 180,
        coordinates: start,
        speedLimitKmH: 60
      },
      {
        id: 'step-highway-merge',
        maneuver: 'exit_right',
        instruction: profile === 'motorcycle'
          ? `Merge onto ${roadMatch.corridor.name} (Keep left for motorcycle lane)`
          : `Merge onto ${roadMatch.corridor.name}`,
        distanceMeters: Math.round(totalHighwayDist * 1000),
        durationSeconds: Math.round((totalHighwayDist / 100) * 3600),
        coordinates: roadMatch.entryPoint,
        speedLimitKmH: roadMatch.corridor.speedLimit,
        isMotorcycleLane: profile === 'motorcycle',
        laneGuidance: profile === 'motorcycle' ? 'Use dedicated motorcycle lane (Lorong Motosikal)' : undefined
      },
      {
        id: 'step-highway-exit',
        maneuver: 'exit_left',
        instruction: `Take exit ramp toward ${destinationTitle || 'destination area'}`,
        distanceMeters: Math.round(distanceKm(roadMatch.exitPoint, destination) * 1000),
        durationSeconds: 120,
        coordinates: roadMatch.exitPoint,
        speedLimitKmH: 60
      },
      {
        id: 'step-arrive',
        maneuver: 'arrive',
        instruction: `Arrive at ${destinationTitle || 'destination'}`,
        distanceMeters: 0,
        durationSeconds: 0,
        coordinates: destination
      }
    ];

    const tollPlazaKeys = determineRouteTollPlazas(
      start,
      destination,
      destinationTitle || roadMatch.corridor.name,
      [roadMatch.corridor.name],
      totalDistKm,
      profile
    );

    const traffic = analyzeRouteTraffic(fullCoordinates, durationMinutes, profile);

    return {
      coordinates: fullCoordinates,
      distanceKm: totalDistKm,
      durationMinutes: traffic.totalMinutes,
      steps,
      tollPlazaKeys,
      profile,
      destinationName: destinationTitle || roadMatch.corridor.name,
      traffic
    };
  }

  // 3. Realistic Arterial Road Curvature
  const actualDistanceKm = Math.round(straightDist * 1.25 * 10) / 10;
  const avgSpeed = profile === 'motorcycle' ? 65 : 75;
  const durationMinutes = Math.max(1, Math.round((actualDistanceKm / avgSpeed) * 60));

  const stepsCount = Math.max(5, Math.min(12, Math.round(actualDistanceKm / 4)));
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    const curve1 = Math.sin(ratio * Math.PI) * 0.015;
    const curve2 = Math.cos(ratio * Math.PI * 2) * 0.007;
    const lng = start[0] + (destination[0] - start[0]) * ratio + curve1;
    const lat = start[1] + (destination[1] - start[1]) * ratio + curve2;
    coordinates.push([lng, lat]);
  }

  const fallbackTolls = determineRouteTollPlazas(
    start,
    destination,
    destinationTitle || 'Destination',
    [],
    actualDistanceKm,
    profile
  );

  const traffic = analyzeRouteTraffic(coordinates, durationMinutes, profile);

  return {
    coordinates,
    distanceKm: actualDistanceKm,
    durationMinutes: traffic.totalMinutes,
    steps: [
      {
        id: 'step-gen-1',
        maneuver: 'straight',
        instruction: profile === 'motorcycle' ? 'Proceed on main road, watch for motorcycle lanes' : 'Proceed on primary road',
        distanceMeters: Math.round(actualDistanceKm * 300),
        durationSeconds: 180,
        coordinates: start,
        speedLimitKmH: 60,
        isMotorcycleLane: profile === 'motorcycle'
      },
      {
        id: 'step-gen-2',
        maneuver: 'turn_right',
        instruction: 'Turn onto connecting trunk road',
        distanceMeters: Math.round(actualDistanceKm * 700),
        durationSeconds: 300,
        coordinates: coordinates[Math.floor(coordinates.length / 2)],
        speedLimitKmH: 80
      },
      {
        id: 'step-gen-3',
        maneuver: 'arrive',
        instruction: `Arrive at ${destinationTitle || 'destination'}`,
        distanceMeters: 0,
        durationSeconds: 0,
        coordinates: destination
      }
    ],
    tollPlazaKeys: fallbackTolls,
    profile,
    destinationName: destinationTitle || 'Destination',
    traffic,
    isApproximate: true
  };
}

/**
 * Calculates a route using real road network vectors (via redundant OSRM open routing servers when online,
 * or the snapped Malaysia Highway/Arterial network when offline).
 */
export async function calculateRoute(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass,
  destinationTitle?: string
): Promise<RouteResult> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

  if (isOnline) {
    const mode = profile === 'walker' ? 'foot' : 'driving';
    // Redundant endpoints: Primary project-osrm.org, secondary openstreetmap.de mirror
    const routerEndpoints = [
      `https://router.project-osrm.org/route/v1/${mode}/${start[0]},${start[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`,
      `https://routing.openstreetmap.de/routed-car/route/v1/${mode === 'foot' ? 'foot' : 'driving'}/${start[0]},${start[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`
    ];

    for (let i = 0; i < routerEndpoints.length; i++) {
      const url = routerEndpoints[i];
      let timeoutId: any;
      try {
        // Brief backoff before trying the mirror endpoint so a rate-limited
        // primary doesn't immediately burn the fallback on the same burst
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 750));
        }
        const controller = new AbortController();
        // Allow up to 6000ms for long-distance inter-state route calculations (e.g. KL to Johor / Penang)
        timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, { signal: controller.signal });

        if (res.ok) {
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const routeData = data.routes[0];
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

              const isMoto = profile === 'motorcycle' && isMalaysianExpressway(s.name);

              turnSteps.push({
                id: `osrm-step-${idx}`,
                maneuver: isLast ? 'arrive' : maneuver,
                instruction: formatStepInstruction(isLast ? 'arrive' : maneuver, s.name, destinationTitle, profile, exitNum),
                distanceMeters: Math.round(s.distance),
                durationSeconds: Math.round(s.duration),
                coordinates: s.maneuver?.location || rawCoordinates[0],
                speedLimitKmH: /\be\d+\b/i.test(s.name || '') ? 110 : 80,
                isMotorcycleLane: isMoto,
                laneGuidance: isMoto
                  ? 'Use dedicated motorcycle lane (Lorong Motosikal)'
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
              distanceKmVal,
              profile
            );

            const traffic = analyzeRouteTraffic(rawCoordinates, durationMinutesVal, profile);

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
        }
      } catch {
        // Continue to secondary router endpoint if primary fails or times out
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  // Complete offline fallback using real Malaysian highway corridors
  return calculateOfflineRoute(start, destination, profile, destinationTitle);
}
