import { TrafficAnalysis, TrafficLevel } from './types';
import { VehicleClass } from '../toll/types';

export interface MalaysiaTime {
  hours: number;
  minutes: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dateString: string;
}

/**
 * Returns date and time broken down in Asia/Kuala_Lumpur (UTC+8)
 */
export function getMalaysiaDateTime(date: Date = new Date()): MalaysiaTime {
  // Use Intl.DateTimeFormat to guarantee Asia/Kuala_Lumpur timezone invariant of host OS
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const parts = formatter.formatToParts(date);
  let hours = 0;
  let minutes = 0;
  let weekdayStr = '';

  for (const p of parts) {
    if (p.type === 'hour') hours = parseInt(p.value, 10);
    if (p.type === 'minute') minutes = parseInt(p.value, 10);
    if (p.type === 'weekday') weekdayStr = p.value;
  }

  // Handle midnight 24 edge case in some ICU formats
  if (hours === 24) hours = 0;

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  const dayOfWeek = dayMap[weekdayStr] ?? date.getDay();

  return {
    hours,
    minutes,
    dayOfWeek,
    dateString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  };
}

export type PeakType =
  | 'morning_rush'
  | 'evening_rush'
  | 'friday_rush'
  | 'midday_lunch'
  | 'sunday_return'
  | 'none';

export interface PeakStatus {
  isPeak: boolean;
  peakType: PeakType;
  severity: number; // 0 to 1
  description: string;
}

/**
 * Evaluates whether current Malaysia time falls within known peak traffic windows
 */
export function isMalaysianPeakHour(date: Date = new Date()): PeakStatus {
  const { hours, minutes, dayOfWeek } = getMalaysiaDateTime(date);
  const timeDec = hours + minutes / 60;

  // Friday Special Pattern: Outbound Balik Kampung rush starts earlier
  if (dayOfWeek === 5) {
    if (timeDec >= 7.25 && timeDec <= 9.25) {
      return {
        isPeak: true,
        peakType: 'morning_rush',
        severity: 0.7,
        description: 'Waktu Puncak Pagi Jumaat (Morning Rush)'
      };
    }
    if (timeDec >= 12.25 && timeDec <= 14.25) {
      return {
        isPeak: true,
        peakType: 'midday_lunch',
        severity: 0.45,
        description: 'Trafik Solat Jumaat & Makan Tengah Hari (Friday Midday)'
      };
    }
    if (timeDec >= 16.5 && timeDec <= 21.0) {
      return {
        isPeak: true,
        peakType: 'friday_rush',
        severity: 0.95,
        description: 'Waktu Puncak Balik Kampung & Hujung Minggu Jumaat'
      };
    }
  }

  // Monday - Thursday Standard Weekday Rush
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    if (timeDec >= 7.25 && timeDec <= 9.5) {
      return {
        isPeak: true,
        peakType: 'morning_rush',
        severity: 0.85,
        description: 'Waktu Puncak Pagi Ke Tempat Kerja (Morning Rush Hour)'
      };
    }
    if (timeDec >= 12.25 && timeDec <= 14.0) {
      return {
        isPeak: true,
        peakType: 'midday_lunch',
        severity: 0.35,
        description: 'Waktu Makan Tengah Hari (Midday Lunch Traffic)'
      };
    }
    if (timeDec >= 17.0 && timeDec <= 20.0) {
      return {
        isPeak: true,
        peakType: 'evening_rush',
        severity: 0.9,
        description: 'Waktu Puncak Petang Pulang Kerja (Evening Rush Hour)'
      };
    }
  }

  // Sunday Return Rush into Klang Valley / Major Cities
  if (dayOfWeek === 0 && timeDec >= 16.5 && timeDec <= 21.5) {
    return {
      isPeak: true,
      peakType: 'sunday_return',
      severity: 0.75,
      description: 'Arus Pulang Ke Bandar (Sunday Weekend Return Traffic)'
    };
  }

  // Saturday Leisure Rush
  if (dayOfWeek === 6 && timeDec >= 11.5 && timeDec <= 15.0) {
    return {
      isPeak: true,
      peakType: 'midday_lunch',
      severity: 0.4,
      description: 'Trafik Hujung Minggu (Saturday Leisure Traffic)'
    };
  }

  return {
    isPeak: false,
    peakType: 'none',
    severity: 0,
    description: 'Lancar Di Luar Waktu Puncak (Off-Peak Free Flow)'
  };
}

interface CorridorBoundary {
  name: string;
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

const KNOWN_CORRIDORS: CorridorBoundary[] = [
  {
    name: 'PLUS Expressway South (E2 - Sg Besi / Nilai / Seremban / JB)',
    minLng: 101.68,
    maxLng: 103.85,
    minLat: 1.45,
    maxLat: 3.08
  },
  {
    name: 'PLUS Expressway North (E1 - Duta / Rawang / Ipoh / Penang)',
    minLng: 100.25,
    maxLng: 101.65,
    minLat: 3.15,
    maxLat: 6.45
  },
  {
    name: 'Federal Highway (Route 2 - Klang / Shah Alam / PJ / KL)',
    minLng: 101.44,
    maxLng: 101.70,
    minLat: 3.02,
    maxLat: 3.14
  },
  {
    name: 'LDP (E11 - Puchong / Sunway / Kelana Jaya / Damansara)',
    minLng: 101.57,
    maxLng: 101.66,
    minLat: 2.97,
    maxLat: 3.17
  },
  {
    name: 'MEX (E20 - Seri Kembangan / Putrajaya / Cyberjaya)',
    minLng: 101.65,
    maxLng: 101.72,
    minLat: 2.92,
    maxLat: 3.15
  },
  {
    name: 'KL-Karak Expressway (E8 - Gombak / Genting / Bentong)',
    minLng: 101.70,
    maxLng: 101.95,
    minLat: 3.22,
    maxLat: 3.55
  },
  {
    name: 'Penang Bridge & Coastal Highways (E36 / E28)',
    minLng: 100.28,
    maxLng: 100.45,
    minLat: 5.25,
    maxLat: 5.40
  }
];

/**
 * Detects which known Malaysian traffic corridors the route intersects
 */
export function detectRouteCorridors(routeCoordinates: [number, number][]): string[] {
  const detected: string[] = [];

  for (const c of KNOWN_CORRIDORS) {
    const hits = routeCoordinates.some(
      ([lng, lat]) =>
        lng >= c.minLng &&
        lng <= c.maxLng &&
        lat >= c.minLat &&
        lat <= c.maxLat
    );
    if (hits) {
      detected.push(c.name);
    }
  }

  return detected;
}

/**
 * Evaluates route congestion and delay time using smart local Malaysian heuristics
 */
export function analyzeRouteTraffic(
  routeCoordinates: [number, number][],
  freeFlowMinutes: number,
  vehicleMode: VehicleClass = 'car',
  referenceDate: Date = new Date()
): TrafficAnalysis {
  if (!routeCoordinates || routeCoordinates.length < 2 || freeFlowMinutes <= 0) {
    return {
      level: 'smooth',
      label: 'Lancar',
      labelEn: 'Smooth',
      delayMinutes: 0,
      totalMinutes: freeFlowMinutes,
      delayFactor: 1.0,
      reason: 'Tiada kesesakan dilaporkan',
      colorHex: '#10b981',
      corridorsDetected: []
    };
  }

  const peak = isMalaysianPeakHour(referenceDate);
  const corridors = detectRouteCorridors(routeCoordinates);

  if (!peak.isPeak || corridors.length === 0) {
    return {
      level: 'smooth',
      label: 'Lancar',
      labelEn: 'Smooth',
      delayMinutes: 0,
      totalMinutes: freeFlowMinutes,
      delayFactor: 1.0,
      reason: peak.description,
      colorHex: '#10b981',
      corridorsDetected: corridors
    };
  }

  // Base delay factor calculated from peak severity and corridor congestion risk
  let delayMultiplier = 0;

  if (peak.peakType === 'friday_rush') {
    delayMultiplier = 0.55 * peak.severity; // Up to +52% delay on Friday Balik Kampung
  } else if (peak.peakType === 'morning_rush' || peak.peakType === 'evening_rush') {
    delayMultiplier = 0.45 * peak.severity; // Up to +40% delay on typical weekday peak
  } else if (peak.peakType === 'sunday_return') {
    delayMultiplier = 0.38 * peak.severity; // Up to +30% delay on Sunday night
  } else {
    delayMultiplier = 0.20 * peak.severity; // Midday / mild
  }

  // Calculate gross delay in minutes
  let delayMinutes = Math.round(freeFlowMinutes * delayMultiplier);

  // Motorcycles have lane filtering and dedicated motorcycle paths in Malaysia (75% discount)
  if (vehicleMode === 'motorcycle') {
    delayMinutes = Math.round(delayMinutes * 0.25);
  } else if (vehicleMode === 'walker') {
    delayMinutes = 0;
  }

  const totalMinutes = freeFlowMinutes + delayMinutes;
  const delayFactor = parseFloat((totalMinutes / freeFlowMinutes).toFixed(2));

  let level: TrafficLevel = 'smooth';
  let label = 'Lancar';
  let labelEn = 'Smooth';
  let colorHex = '#10b981';

  if (delayMinutes >= 12 || delayFactor >= 1.35) {
    level = 'heavy';
    label = 'Sesak Waktu Puncak';
    labelEn = 'Peak Hour Congestion';
    colorHex = '#ef4444';
  } else if (delayMinutes >= 5 || delayFactor >= 1.12) {
    level = 'moderate';
    label = 'Trafik Sederhana';
    labelEn = 'Moderate Traffic';
    colorHex = '#f59e0b';
  }

  return {
    level,
    label,
    labelEn,
    delayMinutes,
    totalMinutes,
    delayFactor,
    reason: `${peak.description} di laluan utama`,
    colorHex,
    corridorsDetected: corridors
  };
}
