import { TollPlazaDefinition } from './types';
import { CLOSED_TOLL_REGISTRY } from './closedTollNetwork';

export const MALAYSIA_TOLL_REGISTRY: Record<string, TollPlazaDefinition> = {
  ...CLOSED_TOLL_REGISTRY,

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
  'MEX_SERI_KEMBANGAN': {
    id: 'MEX_SERI_KEMBANGAN',
    plazaName: 'Seri Kembangan Toll Plaza',
    expressway: 'MEX E20',
    carRate: 2.20,
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

  // PLUS E2 Southbound (From Sg Besi)
  'PLUS_SG_BESI': {
    id: 'PLUS_SG_BESI',
    plazaName: 'Sungai Besi Toll Plaza (Entry)',
    expressway: 'PLUS E2',
    carRate: 2.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'PLUS_E2_SG_BESI_BANGI': {
    id: 'PLUS_E2_SG_BESI_BANGI',
    plazaName: 'PLUS E2 (Sg. Besi → Bangi)',
    expressway: 'PLUS E2',
    carRate: 1.40,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_NILAI': {
    id: 'PLUS_E2_SG_BESI_NILAI',
    plazaName: 'PLUS E2 (Sg. Besi → Nilai)',
    expressway: 'PLUS E2',
    carRate: 2.90,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
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
  'PLUS_E2_SG_BESI_SENAWANG': {
    id: 'PLUS_E2_SG_BESI_SENAWANG',
    plazaName: 'PLUS E2 (Sg. Besi → Senawang)',
    expressway: 'PLUS E2',
    carRate: 4.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_REMBAU': {
    id: 'PLUS_E2_SG_BESI_REMBAU',
    plazaName: 'PLUS E2 (Sg. Besi → Rembau / Pedas)',
    expressway: 'PLUS E2',
    carRate: 7.20,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_ALOR_GAJAH': {
    id: 'PLUS_E2_SG_BESI_ALOR_GAJAH',
    plazaName: 'PLUS E2 (Sg. Besi → Simpang Ampat / Alor Gajah)',
    expressway: 'PLUS E2',
    carRate: 11.20,
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
  'PLUS_E2_SG_BESI_JASIN': {
    id: 'PLUS_E2_SG_BESI_JASIN',
    plazaName: 'PLUS E2 (Sg. Besi → Jasin)',
    expressway: 'PLUS E2',
    carRate: 18.20,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_TANGKAK': {
    id: 'PLUS_E2_SG_BESI_TANGKAK',
    plazaName: 'PLUS E2 (Sg. Besi → Tangkak / Muar)',
    expressway: 'PLUS E2',
    carRate: 21.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_PAGOH': {
    id: 'PLUS_E2_SG_BESI_PAGOH',
    plazaName: 'PLUS E2 (Sg. Besi → Pagoh)',
    expressway: 'PLUS E2',
    carRate: 24.60,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_YONG_PENG': {
    id: 'PLUS_E2_SG_BESI_YONG_PENG',
    plazaName: 'PLUS E2 (Sg. Besi → Yong Peng)',
    expressway: 'PLUS E2',
    carRate: 28.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_AYER_HITAM': {
    id: 'PLUS_E2_SG_BESI_AYER_HITAM',
    plazaName: 'PLUS E2 (Sg. Besi → Ayer Hitam)',
    expressway: 'PLUS E2',
    carRate: 31.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_SIMPANG_RENGGAM': {
    id: 'PLUS_E2_SG_BESI_SIMPANG_RENGGAM',
    plazaName: 'PLUS E2 (Sg. Besi → Simpang Renggam / Kluang)',
    expressway: 'PLUS E2',
    carRate: 34.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_KULAI': {
    id: 'PLUS_E2_SG_BESI_KULAI',
    plazaName: 'PLUS E2 (Sg. Besi → Kulai)',
    expressway: 'PLUS E2',
    carRate: 40.10,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_SENAI': {
    id: 'PLUS_E2_SG_BESI_SENAI',
    plazaName: 'PLUS E2 (Sg. Besi → Senai Airport)',
    expressway: 'PLUS E2',
    carRate: 41.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E2_SG_BESI_SKUDAI': {
    id: 'PLUS_E2_SG_BESI_SKUDAI',
    plazaName: 'PLUS E2 (Sg. Besi → Skudai Johor Bahru)',
    expressway: 'PLUS E2',
    carRate: 43.10,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },

  // PLUS E1 Northbound (From Jalan Duta)
  'PLUS_E1_JALAN_DUTA_RAWANG': {
    id: 'PLUS_E1_JALAN_DUTA_RAWANG',
    plazaName: 'PLUS E1 (Jalan Duta → Rawang)',
    expressway: 'PLUS E1',
    carRate: 2.60,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_BERUNTUNG': {
    id: 'PLUS_E1_JALAN_DUTA_BERUNTUNG',
    plazaName: 'PLUS E1 (Jalan Duta → Bukit Beruntung)',
    expressway: 'PLUS E1',
    carRate: 3.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_TG_MALIM': {
    id: 'PLUS_E1_JALAN_DUTA_TG_MALIM',
    plazaName: 'PLUS E1 (Jalan Duta → Tanjung Malim)',
    expressway: 'PLUS E1',
    carRate: 8.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_SLIM_RIVER': {
    id: 'PLUS_E1_JALAN_DUTA_SLIM_RIVER',
    plazaName: 'PLUS E1 (Jalan Duta → Slim River)',
    expressway: 'PLUS E1',
    carRate: 12.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_SUNGKAI': {
    id: 'PLUS_E1_JALAN_DUTA_SUNGKAI',
    plazaName: 'PLUS E1 (Jalan Duta → Sungkai)',
    expressway: 'PLUS E1',
    carRate: 16.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_BIDOR': {
    id: 'PLUS_E1_JALAN_DUTA_BIDOR',
    plazaName: 'PLUS E1 (Jalan Duta → Bidor)',
    expressway: 'PLUS E1',
    carRate: 18.90,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_TAPAH': {
    id: 'PLUS_E1_JALAN_DUTA_TAPAH',
    plazaName: 'PLUS E1 (Jalan Duta → Tapah R&R)',
    expressway: 'PLUS E1',
    carRate: 20.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_GOPENG': {
    id: 'PLUS_E1_JALAN_DUTA_GOPENG',
    plazaName: 'PLUS E1 (Jalan Duta → Gopeng / Kampar)',
    expressway: 'PLUS E1',
    carRate: 24.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_IPOH': {
    id: 'PLUS_E1_JALAN_DUTA_IPOH',
    plazaName: 'PLUS E1 (Jalan Duta → Ipoh Selatan)',
    expressway: 'PLUS E1',
    carRate: 26.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_KK': {
    id: 'PLUS_E1_JALAN_DUTA_KK',
    plazaName: 'PLUS E1 (Jalan Duta → Kuala Kangsar)',
    expressway: 'PLUS E1',
    carRate: 33.60,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_TAIPING': {
    id: 'PLUS_E1_JALAN_DUTA_TAIPING',
    plazaName: 'PLUS E1 (Jalan Duta → Taiping / Changkat Jering)',
    expressway: 'PLUS E1',
    carRate: 38.50,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_BUKIT_MERAH': {
    id: 'PLUS_E1_JALAN_DUTA_BUKIT_MERAH',
    plazaName: 'PLUS E1 (Jalan Duta → Bukit Merah)',
    expressway: 'PLUS E1',
    carRate: 42.10,
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
  'PLUS_E1_JALAN_DUTA_SG_PETANI': {
    id: 'PLUS_E1_JALAN_DUTA_SG_PETANI',
    plazaName: 'PLUS E1 (Jalan Duta → Sungai Petani)',
    expressway: 'PLUS E1',
    carRate: 46.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },
  'PLUS_E1_JALAN_DUTA_ALOR_SETAR': {
    id: 'PLUS_E1_JALAN_DUTA_ALOR_SETAR',
    plazaName: 'PLUS E1 (Jalan Duta → Alor Setar / Kedah)',
    expressway: 'PLUS E1',
    carRate: 52.80,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'closed'
  },

  // East Coast E8 (Karak & LPT)
  'LPT_BENTONG': {
    id: 'LPT_BENTONG',
    plazaName: 'Karak Highway (Gombak + Bentong)',
    expressway: 'Karak Expressway E8',
    carRate: 8.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID'],
    system: 'open'
  },
  'LPT_KUANTAN': {
    id: 'LPT_KUANTAN',
    plazaName: 'East Coast Expressway (KL → Kuantan)',
    expressway: 'LPT E8',
    carRate: 21.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID'],
    system: 'closed'
  },
  'LPT_TERENGGANU': {
    id: 'LPT_TERENGGANU',
    plazaName: 'East Coast Expressway (KL → Kuala Terengganu)',
    expressway: 'LPT2 E8',
    carRate: 36.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID'],
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

  // Grand Saga E7 (Cheras-Kajang)
  'GRAND_SAGA_BATU_9': {
    id: 'GRAND_SAGA_BATU_9',
    plazaName: 'Batu 9 Toll Plaza',
    expressway: 'Grand Saga E7',
    carRate: 1.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'GRAND_SAGA_BATU_11': {
    id: 'GRAND_SAGA_BATU_11',
    plazaName: 'Batu 11 Toll Plaza',
    expressway: 'Grand Saga E7',
    carRate: 1.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // SILK E18 (Kajang Dispersal Link)
  'SILK_SG_BALAK': {
    id: 'SILK_SG_BALAK',
    plazaName: 'Sungai Balak Toll Plaza',
    expressway: 'SILK E18',
    carRate: 1.66,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'SILK_SG_RAMAL': {
    id: 'SILK_SG_RAMAL',
    plazaName: 'Sungai Ramal Toll Plaza',
    expressway: 'SILK E18',
    carRate: 1.66,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'SILK_BUKIT_KAJANG': {
    id: 'SILK_BUKIT_KAJANG',
    plazaName: 'Bukit Kajang Toll Plaza',
    expressway: 'SILK E18',
    carRate: 1.66,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'SILK_SG_LONG': {
    id: 'SILK_SG_LONG',
    plazaName: 'Sungai Long Toll Plaza',
    expressway: 'SILK E18',
    carRate: 1.66,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // BESRAYA E9
  'BESRAYA_LOKE_YEW': {
    id: 'BESRAYA_LOKE_YEW',
    plazaName: 'Loke Yew Toll Plaza',
    expressway: 'BESRAYA E9',
    carRate: 1.85,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'BESRAYA_MINES': {
    id: 'BESRAYA_MINES',
    plazaName: 'Mines Toll Plaza',
    expressway: 'BESRAYA E9',
    carRate: 1.85,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // NPE E10
  'NPE_PJS2': {
    id: 'NPE_PJS2',
    plazaName: 'PJS 2 Toll Plaza',
    expressway: 'NPE E10',
    carRate: 1.00,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'NPE_PJS5': {
    id: 'NPE_PJS5',
    plazaName: 'PJS 5 Toll Plaza',
    expressway: 'NPE E10',
    carRate: 2.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'NPE_PANTAI_DALAM': {
    id: 'NPE_PANTAI_DALAM',
    plazaName: 'Pantai Dalam Toll Plaza',
    expressway: 'NPE E10',
    carRate: 2.30,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },

  // LEKAS E21
  'LEKAS_KAJANG_SELATAN': {
    id: 'LEKAS_KAJANG_SELATAN',
    plazaName: 'Kajang Selatan Toll Plaza',
    expressway: 'LEKAS E21',
    carRate: 3.20,
    motorcycleRate: 0.00,
    paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
    system: 'open'
  },
  'LEKAS_AMPANGAN': {
    id: 'LEKAS_AMPANGAN',
    plazaName: 'Ampangan Toll Plaza',
    expressway: 'LEKAS E21',
    carRate: 2.30,
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

/**
 * Registers a dynamically-computed closed-system toll plaza (entry → exit pair from
 * PLUS E1/E2/LPT chainage fares), overriding any static approximation of the same
 * corridor. Callers should invoke this once per detected plaza at route calculation
 * time — calculateRouteTolls then resolves names/rates through the registry alone.
 */
export function registerDynamicTollPlaza(plaza: TollPlazaDefinition): void {
  MALAYSIA_TOLL_REGISTRY[plaza.id] = plaza;
}
