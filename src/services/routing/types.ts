import { VehicleClass } from '../toll/types';
import { TrafficAnalysis, HighwayCamera } from '../traffic/types';

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
  cameras?: HighwayCamera[];
}

