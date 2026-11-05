export type VehicleClass = 'car' | 'motorcycle';

export type PaymentMethod = 'TnG' | 'RFID' | 'SmartTAG';

export interface TollItem {
  id: string;
  plazaName: string;
  expressway: string;
  cost: number;
  paymentMethods: PaymentMethod[];
}

export interface TollBreakdown {
  totalCost: number;
  currency: 'MYR';
  items: TollItem[];
  vehicleClass: VehicleClass;
  note?: string;
  hasMotorcycleRestriction?: boolean;
}

export interface TollPlazaDefinition {
  id: string;
  plazaName: string;
  expressway: string;
  carRate: number;
  motorcycleRate: number;
  paymentMethods: PaymentMethod[];
  system: 'open' | 'closed';
  motorcycleProhibited?: boolean;
}

