import { VehicleClass } from '../toll/types';
import { TrafficAnalysis } from '../traffic/types';

export type ManeuverType =
  | 'straight'
  | 'turn_left'
  | 'turn_right'
  | 'slight_left'
  | 'slight_right'
  | 'exit_left'
  | 'exit_right'
  | 'u_turn'
  | 'roundabout'
  | 'flyover'
  | 'underpass'
  | 'arrive';

export interface TurnStep {
  id: string;
  maneuver: ManeuverType;
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number]; // [lng, lat]
  speedLimitKmH?: number;
  isMotorcycleLane?: boolean;
  tollPlazaKey?: string;
  laneGuidance?: string;
  exitNumber?: number; // Roundabout exit number (1, 2, 3, etc.)
}

export interface RouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  steps: TurnStep[];
  tollPlazaKeys: string[];
  profile: VehicleClass;
  destinationName?: string;
  traffic?: TrafficAnalysis;
}

