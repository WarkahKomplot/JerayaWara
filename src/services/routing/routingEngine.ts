import { RouteResult, TurnStep } from './types';
import { VehicleClass } from '../toll/types';
import { CORRIDOR_KL_SEREMBAN } from './sampleCorridors';

function haversineDistanceKm(c1: [number, number], c2: [number, number]): number {
  const [lng1, lat1] = c1;
  const [lng2, lat2] = c2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateRoute(
  start: [number, number],
  destination: [number, number],
  profile: VehicleClass
): RouteResult {
  const straightDistKm = haversineDistanceKm(start, destination);

  // Check if route matches KL -> Seremban corridor (approx start near KL and dest near Seremban)
  const isNearKL = haversineDistanceKm(start, CORRIDOR_KL_SEREMBAN.fromCoords) < 15;
  const isNearSeremban = haversineDistanceKm(destination, CORRIDOR_KL_SEREMBAN.toCoords) < 15;

  if (isNearKL && isNearSeremban && profile !== 'walker') {
    const steps = profile === 'motorcycle'
      ? CORRIDOR_KL_SEREMBAN.motorcycleSteps
      : CORRIDOR_KL_SEREMBAN.carSteps;

    // Generate polyline points along the highway
    const coordinates: [number, number][] = [
      start,
      [101.700, 3.100],
      [101.710, 3.055],
      [101.750, 2.950],
      [101.820, 2.850],
      [101.890, 2.780],
      destination
    ];

    return {
      coordinates,
      distanceKm: CORRIDOR_KL_SEREMBAN.distanceKm,
      durationMinutes: profile === 'motorcycle' ? 44 : 38,
      steps,
      tollPlazaKeys: profile === 'car' ? CORRIDOR_KL_SEREMBAN.tollPlazaKeys : [],
      profile,
      destinationName: 'Seremban City Centre'
    };
  }

  // General Dynamic Route Generator
  const roadFactor = profile === 'walker' ? 1.15 : 1.25;
  const actualDistanceKm = Math.round(straightDistKm * roadFactor * 10) / 10;

  // Speeds in km/h
  const avgSpeed = profile === 'walker' ? 4.5 : profile === 'motorcycle' ? 65 : 75;
  const durationMinutes = Math.max(1, Math.round((actualDistanceKm / avgSpeed) * 60));

  // Intermediate coordinates
  const stepsCount = Math.max(3, Math.min(8, Math.round(actualDistanceKm / 4)));
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    // slight curve offset
    const curve = Math.sin(ratio * Math.PI) * 0.008;
    const lng = start[0] + (destination[0] - start[0]) * ratio + curve;
    const lat = start[1] + (destination[1] - start[1]) * ratio + curve;
    coordinates.push([lng, lat]);
  }

  const steps: TurnStep[] = [];
  const distancePerStep = Math.round((actualDistanceKm * 1000) / stepsCount);

  if (profile === 'walker') {
    steps.push({
      id: 'step-w1',
      maneuver: 'straight',
      instruction: 'Head towards destination on pedestrian walkway',
      distanceMeters: Math.round(distancePerStep * 0.4),
      durationSeconds: Math.round((distancePerStep * 0.4) / 1.25),
      coordinates: start,
      speedLimitKmH: undefined
    });
    steps.push({
      id: 'step-w2',
      maneuver: 'turn_left',
      instruction: 'Turn onto safe sidewalk (expressways strictly avoided)',
      distanceMeters: Math.round(distancePerStep * 0.6),
      durationSeconds: Math.round((distancePerStep * 0.6) / 1.25),
      coordinates: coordinates[Math.floor(coordinates.length / 2)]
    });
    steps.push({
      id: 'step-w3',
      maneuver: 'arrive',
      instruction: 'Arrive at destination',
      distanceMeters: 0,
      durationSeconds: 0,
      coordinates: destination
    });

    return {
      coordinates,
      distanceKm: actualDistanceKm,
      durationMinutes,
      steps,
      tollPlazaKeys: [],
      profile,
      destinationName: 'Destination'
    };
  }

  // Car or Motorcycle general route
  steps.push({
    id: 'dyn-1',
    maneuver: 'straight',
    instruction: profile === 'motorcycle' 
      ? 'Head toward main road, watch for dedicated motorcycle lanes'
      : 'Head toward main arterial road',
    distanceMeters: Math.round(distancePerStep * 0.3),
    durationSeconds: 60,
    coordinates: start,
    speedLimitKmH: 60,
    isMotorcycleLane: profile === 'motorcycle'
  });

  steps.push({
    id: 'dyn-2',
    maneuver: 'turn_right',
    instruction: 'Merge onto primary road and follow route guidance',
    distanceMeters: Math.round(distancePerStep * 0.7),
    durationSeconds: 120,
    coordinates: coordinates[Math.floor(coordinates.length / 2)],
    speedLimitKmH: 80
  });

  steps.push({
    id: 'dyn-3',
    maneuver: 'arrive',
    instruction: 'Arrive at destination',
    distanceMeters: 0,
    durationSeconds: 0,
    coordinates: destination
  });

  return {
    coordinates,
    distanceKm: actualDistanceKm,
    durationMinutes,
    steps,
    tollPlazaKeys: profile === 'car' && actualDistanceKm > 20 ? ['PLUS_SG_BESI'] : [],
    profile,
    destinationName: 'Destination'
  };
}

