import React from 'react';
import { Car, Bike } from 'lucide-react';
import { VehicleClass } from '../../services/toll/types';
import { Language, t } from '../../services/i18n/translations';

export interface ModeSelectorProps {
  selectedMode: VehicleClass;
  onSelectMode: (mode: VehicleClass) => void;
  lang?: Language;
}

export const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({
  selectedMode,
  onSelectMode,
  lang = 'en'
}) => {
  return (
    <div className="inline-flex rounded-xl bg-slate-900/90 p-1 backdrop-blur-md border border-slate-700/60 shadow-lg">
      {/* Car Option */}
      <button
        onClick={() => onSelectMode('car')}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
          selectedMode === 'car'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Car className="h-4 w-4" />
        <span>{t('modeCar', lang)}</span>
      </button>

      {/* Motorcycle Option */}
      <button
        onClick={() => onSelectMode('motorcycle')}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
          selectedMode === 'motorcycle'
            ? 'bg-emerald-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Bike className="h-4 w-4" />
        <span>{t('modeMotorcycle', lang)}</span>
      </button>
    </div>
  );
});

