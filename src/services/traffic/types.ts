export type TrafficLevel = 'smooth' | 'moderate' | 'heavy' | 'standstill';

export interface TrafficAnalysis {
  level: TrafficLevel;
  label: string;
  labelEn: string;
  delayMinutes: number;
  totalMinutes: number;
  delayFactor: number;
  reason: string;
  colorHex: string;
  corridorsDetected: string[];
}

export interface HighwayCamera {
  id: string;
  title: string;
  highway: string;
  km?: string;
  direction: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound' | 'Both';
  coordinates: [number, number]; // [lng, lat]
  imageUrl: string;
  fallbackUrl?: string;
  portalUrl?: string;
  source: 'LLM' | 'PLUS' | 'ITIS' | 'JKR';
}

