import { TurnStep } from './types';

export interface PredefinedCorridor {
  id: string;
  name: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  carSteps: TurnStep[];
  motorcycleSteps: TurnStep[];
  distanceKm: number;
  tollPlazaKeys: string[];
}

export const CORRIDOR_KL_SEREMBAN: PredefinedCorridor = {
  id: 'kl_seremban',
  name: 'Kuala Lumpur to Seremban (PLUS E2)',
  fromCoords: [101.693, 3.141],
  toCoords: [101.938, 2.725],
  distanceKm: 58.4,
  tollPlazaKeys: ['PLUS_E2_SG_BESI_SEREMBAN'],
  carSteps: [
    {
      id: 'step-1',
      maneuver: 'straight',
      instruction: 'Head south on Jalan Syed Putra towards E2 PLUS',
      distanceMeters: 4500,
      durationSeconds: 300,
      coordinates: [101.693, 3.141],
      speedLimitKmH: 70
    },
    {
      id: 'step-2',
      maneuver: 'exit_right',
      instruction: 'Take Exit 215 onto PLUS North-South Expressway (E2)',
      distanceMeters: 450,
      durationSeconds: 30,
      coordinates: [101.710, 3.055],
      speedLimitKmH: 110,
      laneGuidance: 'Stay in 2 right lanes for Seremban / Melaka / JB'
    },
    {
      id: 'step-3',
      maneuver: 'straight',
      instruction: 'Pass through Sungai Besi Toll Plaza (Closed System Entry)',
      distanceMeters: 800,
      durationSeconds: 45,
      coordinates: [101.712, 3.052],
      tollPlazaKey: 'PLUS_SG_BESI',
      laneGuidance: 'RFID in Rightmost, TnG in Center'
    },
    {
      id: 'step-4',
      maneuver: 'straight',
      instruction: 'Continue on PLUS E2 towards Seremban',
      distanceMeters: 48000,
      durationSeconds: 1600,
      coordinates: [101.750, 2.950],
      speedLimitKmH: 110
    },
    {
      id: 'step-5',
      maneuver: 'exit_left',
      instruction: 'Take Exit 218 - Seremban Interchange onto Jalan Sungai Ujong',
      distanceMeters: 1200,
      durationSeconds: 90,
      coordinates: [101.930, 2.730],
      speedLimitKmH: 60,
      tollPlazaKey: 'PLUS_E2_SG_BESI_SEREMBAN'
    },
    {
      id: 'step-6',
      maneuver: 'arrive',
      instruction: 'Arrive at Seremban City Centre',
      distanceMeters: 0,
      durationSeconds: 0,
      coordinates: [101.938, 2.725]
    }
  ],
  motorcycleSteps: [
    {
      id: 'moto-1',
      maneuver: 'straight',
      instruction: 'Head south on Jalan Syed Putra',
      distanceMeters: 4500,
      durationSeconds: 320,
      coordinates: [101.693, 3.141],
      speedLimitKmH: 70
    },
    {
      id: 'moto-2',
      maneuver: 'slight_left',
      instruction: 'Enter Dedicated Motorcycle Lane (Lorong Motosikal PLUS E2)',
      distanceMeters: 600,
      durationSeconds: 45,
      coordinates: [101.710, 3.055],
      isMotorcycleLane: true,
      laneGuidance: 'Keep left into sheltered moto lane'
    },
    {
      id: 'moto-3',
      maneuver: 'straight',
      instruction: 'Pass through Sungai Besi Motorcycle Toll Bypass (Toll Free)',
      distanceMeters: 800,
      durationSeconds: 50,
      coordinates: [101.712, 3.052],
      isMotorcycleLane: true,
      tollPlazaKey: 'PLUS_SG_BESI'
    },
    {
      id: 'moto-4',
      maneuver: 'straight',
      instruction: 'Continue on Highway E2 motorcycle path / emergency shoulder',
      distanceMeters: 48000,
      durationSeconds: 1800,
      coordinates: [101.750, 2.950],
      isMotorcycleLane: true,
      speedLimitKmH: 90
    },
    {
      id: 'moto-5',
      maneuver: 'exit_left',
      instruction: 'Exit at Seremban Motorcycle Ramp into Jalan Sungai Ujong',
      distanceMeters: 1200,
      durationSeconds: 100,
      coordinates: [101.930, 2.730],
      speedLimitKmH: 60
    },
    {
      id: 'moto-6',
      maneuver: 'arrive',
      instruction: 'Arrive at Seremban City Centre',
      distanceMeters: 0,
      durationSeconds: 0,
      coordinates: [101.938, 2.725]
    }
  ]
};

