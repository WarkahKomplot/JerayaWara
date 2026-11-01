import { TollItem, VehicleClass, TollPlazaDefinition } from './types';

export interface ClosedInterchange {
  id: string;
  name: string;
  expressway: string;
  coord: [number, number]; // [lng, lat]
  chainageFare: number; // Cumulative Car fare from terminal (MYR)
}

export function haversineDistKm(c1: [number, number], c2: [number, number]): number {
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

// PLUS E2 Southbound/Northbound Interchanges (Sg Besi KL to Skudai JB)
export const PLUS_E2_INTERCHANGES: ClosedInterchange[] = [
  { id: 'SG_BESI', name: 'Sungai Besi (KL)', expressway: 'PLUS E2', coord: [101.712, 3.052], chainageFare: 0.00 },
  { id: 'BANGI', name: 'Bangi', expressway: 'PLUS E2', coord: [101.770, 2.930], chainageFare: 1.40 },
  { id: 'NILAI', name: 'Nilai', expressway: 'PLUS E2', coord: [101.800, 2.810], chainageFare: 2.90 },
  { id: 'SEREMBAN', name: 'Seremban', expressway: 'PLUS E2', coord: [101.938, 2.725], chainageFare: 4.10 },
  { id: 'SENAWANG', name: 'Senawang', expressway: 'PLUS E2', coord: [101.980, 2.680], chainageFare: 4.80 },
  { id: 'REMBAU', name: 'Rembau', expressway: 'PLUS E2', coord: [102.090, 2.590], chainageFare: 7.20 },
  { id: 'ALOR_GAJAH', name: 'Simpang Ampat / Alor Gajah', expressway: 'PLUS E2', coord: [102.180, 2.430], chainageFare: 11.20 },
  { id: 'AYER_KEROH', name: 'Ayer Keroh (Melaka)', expressway: 'PLUS E2', coord: [102.280, 2.280], chainageFare: 15.60 },
  { id: 'JASIN', name: 'Jasin', expressway: 'PLUS E2', coord: [102.430, 2.310], chainageFare: 18.20 },
  { id: 'TANGKAK', name: 'Tangkak / Muar', expressway: 'PLUS E2', coord: [102.540, 2.270], chainageFare: 21.00 },
  { id: 'PAGOH', name: 'Pagoh', expressway: 'PLUS E2', coord: [102.770, 2.150], chainageFare: 24.60 },
  { id: 'YONG_PENG', name: 'Yong Peng', expressway: 'PLUS E2', coord: [103.060, 2.010], chainageFare: 28.50 },
  { id: 'AYER_HITAM', name: 'Ayer Hitam / Batu Pahat', expressway: 'PLUS E2', coord: [103.180, 1.918], chainageFare: 31.80 },
  { id: 'SIMPANG_RENGGAM', name: 'Simpang Renggam / Kluang', expressway: 'PLUS E2', coord: [103.310, 1.820], chainageFare: 34.50 },
  { id: 'SEDENAK', name: 'Sedenak', expressway: 'PLUS E2', coord: [103.530, 1.710], chainageFare: 37.60 },
  { id: 'KULAI', name: 'Kulai', expressway: 'PLUS E2', coord: [103.600, 1.660], chainageFare: 40.10 },
  { id: 'SENAI', name: 'Senai', expressway: 'PLUS E2', coord: [103.640, 1.600], chainageFare: 41.50 },
  { id: 'SKUDAI', name: 'Skudai (Johor Bahru)', expressway: 'PLUS E2', coord: [103.660, 1.530], chainageFare: 43.10 }
];

// PLUS E1 Northbound/Southbound Interchanges (Jalan Duta KL to Bukit Kayu Hitam)
export const PLUS_E1_INTERCHANGES: ClosedInterchange[] = [
  { id: 'JALAN_DUTA', name: 'Jalan Duta (KL)', expressway: 'PLUS E1', coord: [101.668, 3.178], chainageFare: 0.00 },
  { id: 'RAWANG', name: 'Rawang', expressway: 'PLUS E1', coord: [101.574, 3.321], chainageFare: 2.60 },
  { id: 'BERUNTUNG', name: 'Bukit Beruntung', expressway: 'PLUS E1', coord: [101.554, 3.415], chainageFare: 3.80 },
  { id: 'TG_MALIM', name: 'Tanjung Malim', expressway: 'PLUS E1', coord: [101.518, 3.684], chainageFare: 8.80 },
  { id: 'SLIM_RIVER', name: 'Slim River', expressway: 'PLUS E1', coord: [101.401, 3.829], chainageFare: 12.30 },
  { id: 'SUNGKAI', name: 'Sungkai', expressway: 'PLUS E1', coord: [101.312, 3.996], chainageFare: 16.50 },
  { id: 'BIDOR', name: 'Bidor', expressway: 'PLUS E1', coord: [101.288, 4.112], chainageFare: 18.90 },
  { id: 'TAPAH', name: 'Tapah', expressway: 'PLUS E1', coord: [101.305, 4.192], chainageFare: 20.80 },
  { id: 'GOPENG', name: 'Gopeng / Kampar', expressway: 'PLUS E1', coord: [101.168, 4.450], chainageFare: 24.30 },
  { id: 'IPOH', name: 'Ipoh Selatan', expressway: 'PLUS E1', coord: [101.090, 4.597], chainageFare: 26.50 },
  { id: 'KK', name: 'Kuala Kangsar', expressway: 'PLUS E1', coord: [100.940, 4.767], chainageFare: 33.60 },
  { id: 'TAIPING', name: 'Taiping / Changkat Jering', expressway: 'PLUS E1', coord: [100.720, 4.795], chainageFare: 38.50 },
  { id: 'BUKIT_MERAH', name: 'Bukit Merah', expressway: 'PLUS E1', coord: [100.655, 5.035], chainageFare: 42.10 },
  { id: 'JURU', name: 'Juru (Penang)', expressway: 'PLUS E1', coord: [100.420, 5.315], chainageFare: 43.30 },
  { id: 'SG_PETANI', name: 'Sungai Petani', expressway: 'PLUS E1', coord: [100.490, 5.645], chainageFare: 46.80 },
  { id: 'ALOR_SETAR', name: 'Alor Setar', expressway: 'PLUS E1', coord: [100.368, 6.120], chainageFare: 52.80 },
  { id: 'BUKIT_KAYU_HITAM', name: 'Bukit Kayu Hitam', expressway: 'PLUS E1', coord: [100.419, 6.518], chainageFare: 58.40 }
];

// East Coast Expressway (E8 / LPT)
export const LPT_E8_INTERCHANGES: ClosedInterchange[] = [
  { id: 'GOMBAK', name: 'Gombak (KL)', expressway: 'LPT E8', coord: [101.730, 3.235], chainageFare: 0.00 },
  { id: 'BENTONG', name: 'Bentong / Karak', expressway: 'LPT E8', coord: [101.910, 3.520], chainageFare: 8.00 },
  { id: 'TEMERLOH', name: 'Temerloh', expressway: 'LPT E8', coord: [102.420, 3.450], chainageFare: 14.50 },
  { id: 'MARAN', name: 'Maran', expressway: 'LPT E8', coord: [102.775, 3.585], chainageFare: 18.20 },
  { id: 'KUANTAN', name: 'Kuantan', expressway: 'LPT E8', coord: [103.325, 3.812], chainageFare: 21.00 },
  { id: 'CHUKAI', name: 'Chukai', expressway: 'LPT2 E8', coord: [103.420, 4.250], chainageFare: 27.50 },
  { id: 'DUNGUN', name: 'Dungun', expressway: 'LPT2 E8', coord: [103.420, 4.770], chainageFare: 32.80 },
  { id: 'TERENGGANU', name: 'Kuala Terengganu', expressway: 'LPT2 E8', coord: [103.140, 5.330], chainageFare: 36.00 }
];

export function findClosestInterchange(
  point: [number, number],
  interchanges: ClosedInterchange[]
): { interchange: ClosedInterchange; distanceKm: number } {
  let best = interchanges[0];
  let minDist = Infinity;
  for (const ic of interchanges) {
    const d = haversineDistKm(point, ic.coord);
    if (d < minDist) {
      minDist = d;
      best = ic;
    }
  }
  return { interchange: best, distanceKm: minDist };
}

/**
 * Pre-generate bidirectional toll plaza definitions for all closed expressway interchanges.
 */
function buildClosedTollRegistry(): Record<string, TollPlazaDefinition> {
  const registry: Record<string, TollPlazaDefinition> = {};

  const processNetwork = (
    interchanges: ClosedInterchange[],
    prefix: string,
    minFare: number,
    expresswayTitle: string
  ) => {
    for (const entry of interchanges) {
      for (const exit of interchanges) {
        if (entry.id === exit.id) continue;
        const diffFare = Math.round(Math.abs(exit.chainageFare - entry.chainageFare) * 100) / 100;
        const carRate = Math.round(Math.max(minFare, diffFare) * 100) / 100;
        const id = `${prefix}_${entry.id}_${exit.id}`;

        registry[id] = {
          id,
          plazaName: `${prefix} (${entry.name} → ${exit.name})`,
          expressway: expresswayTitle,
          carRate,
          motorcycleRate: 0.00,
          paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
          system: 'closed'
        };
      }
    }
  };

  processNetwork(PLUS_E2_INTERCHANGES, 'PLUS_E2', 1.40, 'PLUS Expressway E2');
  processNetwork(PLUS_E1_INTERCHANGES, 'PLUS_E1', 1.40, 'PLUS Expressway E1');
  processNetwork(LPT_E8_INTERCHANGES, 'LPT_E8', 2.50, 'East Coast Expressway E8');

  return registry;
}

export const CLOSED_TOLL_REGISTRY = buildClosedTollRegistry();

/**
 * Bidirectionally discovers and returns matching closed-system toll plazas.
 * Accurately handles:
 * - Southbound travel (e.g. KL -> Pagoh / Paya Redan = RM 24.60)
 * - Northbound travel (e.g. Johor Bahru / Skudai -> Pagoh / Paya Redan = RM 18.50)
 * - Intermediate travel (e.g. Ayer Keroh -> Pagoh = RM 9.00, Yong Peng -> Pagoh = RM 3.90)
 */
export function findClosedSystemTollPlazas(
  start: [number, number],
  destination: [number, number],
  roadNames: string[],
  destTitle?: string
): TollPlazaDefinition[] {
  const totalTripDist = haversineDistKm(start, destination);
  if (totalTripDist < 8) return [];

  const fullText = [...roadNames, destTitle || ''].join(' ').toLowerCase();
  const matchedPlazas: TollPlazaDefinition[] = [];

  // 1. PLUS E2 (Kuala Lumpur <-> Johor Bahru corridor)
  const entryE2 = findClosestInterchange(start, PLUS_E2_INTERCHANGES);
  const exitE2 = findClosestInterchange(destination, PLUS_E2_INTERCHANGES);

  const hasE2Keywords =
    fullText.includes('e2') ||
    fullText.includes('plus') ||
    fullText.includes('utara-selatan') ||
    fullText.includes('utara–selatan') ||
    fullText.includes('lebuhraya utara') ||
    fullText.includes('north-south') ||
    fullText.includes('pagoh') ||
    fullText.includes('paya redan') ||
    fullText.includes('redan') ||
    fullText.includes('muar') ||
    fullText.includes('tangkak') ||
    fullText.includes('seremban') ||
    fullText.includes('melaka') ||
    fullText.includes('ayer keroh') ||
    fullText.includes('jasin') ||
    fullText.includes('yong peng') ||
    fullText.includes('ayer hitam') ||
    fullText.includes('batu pahat') ||
    fullText.includes('kluang') ||
    fullText.includes('simpang renggam') ||
    fullText.includes('kulai') ||
    fullText.includes('senai') ||
    fullText.includes('skudai') ||
    fullText.includes('johor bahru');

  const isE2Trip =
    entryE2.interchange.id !== exitE2.interchange.id &&
    ((hasE2Keywords && entryE2.distanceKm < 50 && exitE2.distanceKm < 50 && totalTripDist > 10) ||
      (entryE2.distanceKm < 40 && exitE2.distanceKm < 40 && totalTripDist > 18));

  if (isE2Trip) {
    const id = `PLUS_E2_${entryE2.interchange.id}_${exitE2.interchange.id}`;
    const diffFare = Math.round(Math.abs(exitE2.interchange.chainageFare - entryE2.interchange.chainageFare) * 100) / 100;
    const carRate = Math.round(Math.max(1.40, diffFare) * 100) / 100;

    matchedPlazas.push({
      id,
      plazaName: `PLUS E2 (${entryE2.interchange.name} → ${exitE2.interchange.name})`,
      expressway: 'PLUS Expressway E2',
      carRate,
      motorcycleRate: 0.00,
      paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
      system: 'closed'
    });
  }

  // 2. PLUS E1 (Kuala Lumpur <-> Bukit Kayu Hitam / Penang corridor)
  const entryE1 = findClosestInterchange(start, PLUS_E1_INTERCHANGES);
  const exitE1 = findClosestInterchange(destination, PLUS_E1_INTERCHANGES);

  const hasE1Keywords =
    fullText.includes('e1') ||
    fullText.includes('plus') ||
    fullText.includes('utara-selatan') ||
    fullText.includes('utara–selatan') ||
    fullText.includes('lebuhraya utara') ||
    fullText.includes('north-south') ||
    fullText.includes('rawang') ||
    fullText.includes('beruntung') ||
    fullText.includes('malim') ||
    fullText.includes('slim river') ||
    fullText.includes('sungkai') ||
    fullText.includes('bidor') ||
    fullText.includes('tapah') ||
    fullText.includes('gopeng') ||
    fullText.includes('kampar') ||
    fullText.includes('ipoh') ||
    fullText.includes('kuala kangsar') ||
    fullText.includes('taiping') ||
    fullText.includes('bukit merah') ||
    fullText.includes('juru') ||
    fullText.includes('penang') ||
    fullText.includes('sungai petani') ||
    fullText.includes('alor setar') ||
    fullText.includes('bukit kayu hitam');

  const isE1Trip =
    entryE1.interchange.id !== exitE1.interchange.id &&
    ((hasE1Keywords && entryE1.distanceKm < 50 && exitE1.distanceKm < 50 && totalTripDist > 10) ||
      (entryE1.distanceKm < 40 && exitE1.distanceKm < 40 && totalTripDist > 18));

  if (isE1Trip) {
    const id = `PLUS_E1_${entryE1.interchange.id}_${exitE1.interchange.id}`;
    const diffFare = Math.round(Math.abs(exitE1.interchange.chainageFare - entryE1.interchange.chainageFare) * 100) / 100;
    const carRate = Math.round(Math.max(1.40, diffFare) * 100) / 100;

    matchedPlazas.push({
      id,
      plazaName: `PLUS E1 (${entryE1.interchange.name} → ${exitE1.interchange.name})`,
      expressway: 'PLUS Expressway E1',
      carRate,
      motorcycleRate: 0.00,
      paymentMethods: ['TnG', 'RFID', 'SmartTAG'],
      system: 'closed'
    });
  }

  // 3. East Coast LPT E8 (Kuala Lumpur <-> Kuala Terengganu corridor)
  const entryE8 = findClosestInterchange(start, LPT_E8_INTERCHANGES);
  const exitE8 = findClosestInterchange(destination, LPT_E8_INTERCHANGES);

  const hasE8Keywords =
    fullText.includes('e8') ||
    fullText.includes('lpt') ||
    fullText.includes('karak') ||
    fullText.includes('pantai timur') ||
    fullText.includes('bentong') ||
    fullText.includes('temerloh') ||
    fullText.includes('maran') ||
    fullText.includes('kuantan') ||
    fullText.includes('chukai') ||
    fullText.includes('dungun') ||
    fullText.includes('kuala terengganu');

  const isE8Trip =
    entryE8.interchange.id !== exitE8.interchange.id &&
    ((hasE8Keywords && entryE8.distanceKm < 50 && exitE8.distanceKm < 50 && totalTripDist > 15) ||
      (entryE8.distanceKm < 40 && exitE8.distanceKm < 40 && totalTripDist > 25));

  if (isE8Trip) {
    const id = `LPT_E8_${entryE8.interchange.id}_${exitE8.interchange.id}`;
    const diffFare = Math.round(Math.abs(exitE8.interchange.chainageFare - entryE8.interchange.chainageFare) * 100) / 100;
    const carRate = Math.round(Math.max(2.50, diffFare) * 100) / 100;

    matchedPlazas.push({
      id,
      plazaName: `LPT E8 (${entryE8.interchange.name} → ${exitE8.interchange.name})`,
      expressway: 'East Coast Expressway E8',
      carRate,
      motorcycleRate: 0.00,
      paymentMethods: ['TnG', 'RFID'],
      system: 'closed'
    });
  }

  return matchedPlazas;
}

/**
 * Calculates a single closed-system ticket toll item for a vehicle class.
 */
export function calculateClosedSystemToll(
  start: [number, number],
  destination: [number, number],
  roadNames: string[],
  vehicleClass: VehicleClass,
  destTitle?: string
): TollItem | null {
  if (vehicleClass === 'walker') return null;

  const plazas = findClosedSystemTollPlazas(start, destination, roadNames, destTitle);
  if (plazas.length === 0) return null;

  const plaza = plazas[0];
  const cost = vehicleClass === 'motorcycle' ? 0.00 : plaza.carRate;

  return {
    id: plaza.id,
    plazaName: plaza.plazaName,
    expressway: plaza.expressway,
    cost,
    paymentMethods: plaza.paymentMethods
  };
}
