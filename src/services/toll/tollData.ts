import { TollPlazaDefinition } from './types';

export const MALAYSIA_TOLL_REGISTRY: Record<string, TollPlazaDefinition> = {
  // MEX E20
  'MEX_SALAK_SELATAN': {
    id: 'MEX_SALAK_SELATAN',
    plazaName: 'Salak Selatan Toll Plaza',
    expressway: 'MEX E20',
    carRate: 2.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'MEX_PUTRAJAYA': {
    id: 'MEX_PUTRAJAYA',
    plazaName: 'Putrajaya Toll Plaza',
    expressway: 'MEX E20',
    carRate: 3.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'MEX_SERI_KEMBANGAN': {
    id: 'MEX_SERI_KEMBANGAN',
    plazaName: 'Seri Kembangan Toll Plaza',
    expressway: 'MEX E20',
    carRate: 2.20,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // PLUS E1 / E2 (Closed & Key Barrier Plazas)
  'PLUS_SG_BESI': {
    id: 'PLUS_SG_BESI',
    plazaName: 'Sungai Besi Toll Plaza',
    expressway: 'PLUS E2',
    carRate: 2.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'PLUS_E2_SG_BESI_SEREMBAN': {
    id: 'PLUS_E2_SG_BESI_SEREMBAN',
    plazaName: 'PLUS E2 (Sg. Besi → Seremban)',
    expressway: 'PLUS E2',
    carRate: 4.10,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_AYER_KEROH': {
    id: 'PLUS_E2_SG_BESI_AYER_KEROH',
    plazaName: 'PLUS E2 (Sg. Besi → Ayer Keroh Melaka)',
    expressway: 'PLUS E2',
    carRate: 15.60,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_SKUDAI': {
    id: 'PLUS_E2_SG_BESI_SKUDAI',
    plazaName: 'PLUS E2 (Sg. Besi → Skudai JB)',
    expressway: 'PLUS E2',
    carRate: 43.10,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_IPOH': {
    id: 'PLUS_E1_JALAN_DUTA_IPOH',
    plazaName: 'PLUS E1 (Jalan Duta → Ipoh Selatan)',
    expressway: 'PLUS E1',
    carRate: 23.40,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_JURU': {
    id: 'PLUS_E1_JALAN_DUTA_JURU',
    plazaName: 'PLUS E1 (Jalan Duta → Juru Penang)',
    expressway: 'PLUS E1',
    carRate: 43.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },

  // DUKE E33
  'DUKE_BATU': {
    id: 'DUKE_BATU',
    plazaName: 'Batu Toll Plaza',
    expressway: 'DUKE E33',
    carRate: 2.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'DUKE_SENTUL_PASAR': {
    id: 'DUKE_SENTUL_PASAR',
    plazaName: 'Sentul Pasar Toll Plaza',
    expressway: 'DUKE E33',
    carRate: 2.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // KESAS E5
  'KESAS_SUNWAY': {
    id: 'KESAS_SUNWAY',
    plazaName: 'Sunway Toll Plaza',
    expressway: 'KESAS E5',
    carRate: 2.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'KESAS_KEMUNING': {
    id: 'KESAS_KEMUNING',
    plazaName: 'Kemuning Toll Plaza',
    expressway: 'KESAS E5',
    carRate: 2.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // LDP E11
  'LDP_PENCHALA': {
    id: 'LDP_PENCHALA',
    plazaName: 'Penchala Toll Plaza',
    expressway: 'LDP E11',
    carRate: 2.10,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'LDP_PETALING_JAYA': {
    id: 'LDP_PETALING_JAYA',
    plazaName: 'Petaling Jaya Toll Plaza',
    expressway: 'LDP E11',
    carRate: 2.10,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // SMART Tunnel E38
  'SMART_TUNNEL': {
    id: 'SMART_TUNNEL',
    plazaName: 'SMART Tunnel Highway Plaza',
    expressway: 'SMART E38',
    carRate: 3.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open',
    motorcycleProhibited: true
  },

  // SPRINT E23
  'SPRINT_DAMANSARA': {
    id: 'SPRINT_DAMANSARA',
    plazaName: 'Damansara Link Plaza',
    expressway: 'SPRINT E23',
    carRate: 2.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // Penang Bridges
  'PENANG_BRIDGE_1': {
    id: 'PENANG_BRIDGE_1',
    plazaName: 'Penang Bridge Toll (Island-bound)',
    expressway: 'Penang Bridge E36',
    carRate: 5.74,
    motorcycleRate: 1.40,
    paymentMethods: ['TnG', 'RFID'],
    system: 'open'
  },
  'PENANG_BRIDGE_2': {
    id: 'PENANG_BRIDGE_2',
    plazaName: 'Sultan Abdul Halim Muadzam Shah Bridge',
    expressway: 'Sultan Abdul Halim Muadzam Shah Bridge E28',
    carRate: 8.50,
    motorcycleRate: 1.70,
    paymentMethods: ['TnG', 'RFID'],
    system: 'open'
  }
};

