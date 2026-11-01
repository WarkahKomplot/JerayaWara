import { TollBreakdown, TollItem, VehicleClass } from './types';
import { MALAYSIA_TOLL_REGISTRY } from './tollData';

export function calculateRouteTolls(plazaKeys: string[], vehicleClass: VehicleClass): TollBreakdown {
  if (vehicleClass === 'walker') {
    return {
      totalCost: 0,
      currency: 'MYR',
      items: [],
      vehicleClass: 'walker',
      note: 'Pedestrian route avoids all expressways and toll plazas.'
    };
  }

  const items: TollItem[] = [];
  let totalCost = 0;

  for (const key of plazaKeys) {
    const plaza = MALAYSIA_TOLL_REGISTRY[key];
    if (!plaza) continue;

    const cost = vehicleClass === 'motorcycle' ? plaza.motorcycleRate : plaza.carRate;
    totalCost += cost;

    items.push({
      id: plaza.id,
      plazaName: plaza.plazaName,
      expressway: plaza.expressway,
      cost,
      paymentMethods: plaza.paymentMethods
    });
  }

  // Round total to 2 decimal places to avoid floating point inaccuracies
  totalCost = Math.round(totalCost * 100) / 100;

  let note: string | undefined;
  if (vehicleClass === 'motorcycle') {
    note = totalCost === 0 
      ? 'Motorcycles are toll-exempt across standard Malaysian expressways.'
      : 'Special motorcycle bridge rates apply.';
  }

  return {
    totalCost,
    currency: 'MYR',
    items,
    vehicleClass,
    note
  };
}
