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

