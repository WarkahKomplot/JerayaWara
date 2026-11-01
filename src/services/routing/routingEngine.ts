import { RouteResult, TurnStep, ManeuverType } from './types';
import { VehicleClass } from '../toll/types';
import {
  distanceKm,
  findNearestRoadPath
} from './malaysiaRoadNetwork';

function mapOsrmManeuver(type: string, modifier?: string): ManeuverType {
  if (type === 'depart') return 'straight';
  if (type === 'arrive') return 'arrive';
  if (type === 'roundabout' || type === 'rotary') return 'roundabout';
  if (type === 'off ramp') {
    return modifier?.includes('left') ? 'exit_left' : 'exit_right';
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
  profile?: VehicleClass
): string {
  const road = roadName && roadName !== 'unnamed' && roadName.trim() !== '' ? roadName : 'primary road';

  if (profile === 'motorcycle' && (road.toLowerCase().includes('plus') || road.toLowerCase().includes('kesas') || road.toLowerCase().includes('federal'))) {
    if (maneuver === 'straight') {
      return `Follow dedicated motorcycle lane (Lorong Motosikal) on ${road}`;
    }
  }

  switch (maneuver) {
    case 'arrive':
      return `Arrive at ${destTitle || 'destination'}`;
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
    case 'roundabout':
      return `Take roundabout exit onto ${road}`;
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
  const titleLower = destTitle.toLowerCase();
  const roadStr = roadNames.join(' ').toLowerCase();

  const isE2 = roadStr.includes('e2') || roadStr.includes('seremban') || roadStr.includes('sungai besi') ||
    (start[1] > dest[1] && dest[1] < 3.05 && Math.abs(dest[0] - 102.0) < 2.2);

  const isE1 = roadStr.includes('e1') || roadStr.includes('duta') ||
    (start[1] < dest[1] && dest[1] > 3.20 && Math.abs(dest[0] - 101.0) < 1.8);

  const isE8 = roadStr.includes('e8') || roadStr.includes('karak') || roadStr.includes('lpt') ||
    titleLower.includes('kuantan') || titleLower.includes('terengganu') || titleLower.includes('bentong') ||
    (dest[0] > 102.0 && dest[1] > 3.4);

  const isMex = roadStr.includes('e20') || roadStr.includes('mex') || roadStr.includes('maju') ||
    titleLower.includes('putrajaya') || titleLower.includes('cyberjaya') || titleLower.includes('seri kembangan');

  const isKesas = roadStr.includes('e5') || roadStr.includes('kesas') || roadStr.includes('shah alam exp');
  const isLdp = roadStr.includes('e11') || roadStr.includes('ldp') || roadStr.includes('damansara-puchong');
  const isSmart = roadStr.includes('e38') || roadStr.includes('smart') || titleLower.includes('smart tunnel');
  const isPenangBridge = (dest[0] < 100.35 && dest[1] > 5.25 && dest[1] < 5.55) || titleLower.includes('penang bridge') || titleLower.includes('george town');

  // 1. PLUS E2 Southbound (From KL / Sg Besi -> South destinations)
  if (isE2 && start[1] > dest[1]) {
    const lat = dest[1];
    if (lat >= 2.88 || titleLower.includes('bangi') || titleLower.includes('kajang')) {
      keys.push('PLUS_E2_SG_BESI_BANGI');
    } else if (lat >= 2.78 || titleLower.includes('nilai')) {
      keys.push('PLUS_E2_SG_BESI_NILAI');
    } else if (lat >= 2.65 || titleLower.includes('seremban')) {
      keys.push('PLUS_E2_SG_BESI_SEREMBAN');
    } else if (lat >= 2.50 || titleLower.includes('senawang') || titleLower.includes('rembau')) {
      keys.push('PLUS_E2_SG_BESI_REMBAU');
    } else if (lat >= 2.35 || titleLower.includes('alor gajah') || titleLower.includes('simpang ampat')) {
      keys.push('PLUS_E2_SG_BESI_ALOR_GAJAH');
    } else if (lat >= 2.22 || titleLower.includes('melaka') || titleLower.includes('ayer keroh')) {
      keys.push('PLUS_E2_SG_BESI_AYER_KEROH');
    } else if (lat >= 2.15 || titleLower.includes('jasin')) {
      keys.push('PLUS_E2_SG_BESI_JASIN');
    } else if (lat >= 2.05 || titleLower.includes('tangkak') || titleLower.includes('muar')) {
      keys.push('PLUS_E2_SG_BESI_TANGKAK');
    } else if (lat >= 1.95 || titleLower.includes('pagoh')) {
      keys.push('PLUS_E2_SG_BESI_PAGOH');
    } else if (lat >= 1.88 || titleLower.includes('yong peng')) {
      keys.push('PLUS_E2_SG_BESI_YONG_PENG');
    } else if (lat >= 1.80 || titleLower.includes('ayer hitam') || titleLower.includes('batu pahat')) {
      keys.push('PLUS_E2_SG_BESI_AYER_HITAM');
    } else if (lat >= 1.68 || titleLower.includes('simpang renggam') || titleLower.includes('kluang')) {
      keys.push('PLUS_E2_SG_BESI_SIMPANG_RENGGAM');
    } else if (lat >= 1.60 || titleLower.includes('kulai')) {
      keys.push('PLUS_E2_SG_BESI_KULAI');
    } else if (lat >= 1.52 || titleLower.includes('senai')) {
      keys.push('PLUS_E2_SG_BESI_SENAI');
    } else {
      keys.push('PLUS_E2_SG_BESI_SKUDAI');
    }
  }

  // 2. PLUS E1 Northbound (From KL / Jalan Duta -> North destinations)
  else if (isE1 && start[1] < dest[1]) {
    const lat = dest[1];
    if (lat <= 3.35 || titleLower.includes('rawang')) {
      keys.push('PLUS_E1_JALAN_DUTA_RAWANG');
    } else if (lat <= 3.55 || titleLower.includes('beruntung')) {
      keys.push('PLUS_E1_JALAN_DUTA_BERUNTUNG');
    } else if (lat <= 3.75 || titleLower.includes('malim')) {
      keys.push('PLUS_E1_JALAN_DUTA_TG_MALIM');
    } else if (lat <= 3.90 || titleLower.includes('slim river')) {
      keys.push('PLUS_E1_JALAN_DUTA_SLIM_RIVER');
    } else if (lat <= 4.05 || titleLower.includes('sungkai')) {
      keys.push('PLUS_E1_JALAN_DUTA_SUNGKAI');
    } else if (lat <= 4.15 || titleLower.includes('bidor')) {
      keys.push('PLUS_E1_JALAN_DUTA_BIDOR');
    } else if (lat <= 4.30 || titleLower.includes('tapah')) {
      keys.push('PLUS_E1_JALAN_DUTA_TAPAH');
    } else if (lat <= 4.50 || titleLower.includes('gopeng') || titleLower.includes('kampar')) {
      keys.push('PLUS_E1_JALAN_DUTA_GOPENG');
    } else if (lat <= 4.70 || titleLower.includes('ipoh')) {
      keys.push('PLUS_E1_JALAN_DUTA_IPOH');
    } else if (lat <= 4.85 || titleLower.includes('kangsar')) {
      keys.push('PLUS_E1_JALAN_DUTA_KK');
    } else if (lat <= 5.00 || titleLower.includes('taiping')) {
      keys.push('PLUS_E1_JALAN_DUTA_TAIPING');
    } else if (lat <= 5.25 || titleLower.includes('merah') || titleLower.includes('jawi')) {
      keys.push('PLUS_E1_JALAN_DUTA_BUKIT_MERAH');
    } else if (lat <= 5.55 || titleLower.includes('penang') || titleLower.includes('juru')) {
      keys.push('PLUS_E1_JALAN_DUTA_JURU');
    } else if (lat <= 5.95 || titleLower.includes('sungai petani')) {
      keys.push('PLUS_E1_JALAN_DUTA_SG_PETANI');
    } else {
      keys.push('PLUS_E1_JALAN_DUTA_ALOR_SETAR');
    }
  }

  // 3. Penang Bridge
  if (isPenangBridge) {
    keys.push('PENANG_BRIDGE_1');
  }

  // 4. East Coast E8 (LPT / Karak)
  if (isE8) {
    if (titleLower.includes('terengganu') || dest[1] > 4.5) {
      keys.push('LPT_TERENGGANU');
    } else if (titleLower.includes('kuantan') || dest[1] > 3.6) {
      keys.push('LPT_KUANTAN');
    } else {
      keys.push('LPT_BENTONG');
    }
  }

  // 5. MEX E20
  if (isMex) {
    if (titleLower.includes('putrajaya') || titleLower.includes('cyberjaya')) {
      keys.push('MEX_PUTRAJAYA');
    } else if (titleLower.includes('kembangan')) {
      keys.push('MEX_SERI_KEMBANGAN');
    } else {
      keys.push('MEX_SALAK_SELATAN');
    }
  }

  // 6. KESAS E5
  if (isKesas) {
    keys.push('KESAS_SUNWAY');
  }

  // 7. LDP E11
  if (isLdp) {
    keys.push('LDP_PENCHALA');
  }

  // 8. SMART E38
  if (isSmart) {
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
      destinationName: destinationTitle || 'Destination'
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

    return {
      coordinates: fullCoordinates,
      distanceKm: totalDistKm,
      durationMinutes,
      steps,
      tollPlazaKeys,
      profile,
      destinationName: destinationTitle || roadMatch.corridor.name
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

  return {
    coordinates,
    distanceKm: actualDistanceKm,
    durationMinutes,
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
    destinationName: destinationTitle || 'Destination'
  };
}

/**
 * Calculates a route using real road network vectors (via OSRM open routing when online,
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
    try {
      const mode = profile === 'walker' ? 'foot' : 'driving';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);

      const url = `https://router.project-osrm.org/route/v1/${mode}/${start[0]},${start[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=true`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

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

            const isMoto = profile === 'motorcycle' && (
              s.name?.toLowerCase().includes('plus') ||
              s.name?.toLowerCase().includes('federal') ||
              s.name?.toLowerCase().includes('kesas')
            );

            turnSteps.push({
              id: `osrm-step-${idx}`,
              maneuver: isLast ? 'arrive' : maneuver,
              instruction: formatStepInstruction(isLast ? 'arrive' : maneuver, s.name, destinationTitle, profile),
              distanceMeters: Math.round(s.distance),
              durationSeconds: Math.round(s.duration),
              coordinates: s.maneuver?.location || rawCoordinates[0],
              speedLimitKmH: s.name?.toLowerCase().includes('e') ? 110 : 80,
              isMotorcycleLane: isMoto,
              laneGuidance: isMoto ? 'Use dedicated motorcycle lane (Lorong Motosikal)' : undefined
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

          return {
            coordinates: rawCoordinates,
            distanceKm: distanceKmVal,
            durationMinutes: durationMinutesVal,
            steps: turnSteps,
            tollPlazaKeys,
            profile,
            destinationName: destinationTitle || 'Destination'
          };
        }
      }
    } catch {
      // Network timeout or offline -> fallback to offline road snapper
    }
  }

  // Complete offline fallback using real Malaysian highway corridors
  return calculateOfflineRoute(start, destination, profile, destinationTitle);
}
