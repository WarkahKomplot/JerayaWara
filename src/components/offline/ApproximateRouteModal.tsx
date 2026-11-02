import React from 'react';
import { TriangleAlert, MapPinned, WifiOff } from 'lucide-react';
import { Language } from '../../services/i18n/translations';

export interface ApproximateRouteModalProps {
  isOpen: boolean;
  destinationName?: string;
  lang?: Language;
  onCancel: () => void;
  onContinue: () => void;
}

/**
 * Blocking confirmation shown when the calculated route has synthetic geometry
 * (offline, area not covered by the corridor network). Navigation only proceeds
 * if the user explicitly accepts an approximate, non-turn-accurate route.
 */
export const ApproximateRouteModal: React.FC<ApproximateRouteModalProps> = ({
  isOpen,
  destinationName,
  lang = 'ms',
  onCancel,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-amber-600/40 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-slate-800 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {lang === 'ms' ? 'Tiada Data Jalan Offline' : 'No Offline Road Data'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ms' ? 'Laluan anggaran sahaja' : 'Approximate route only'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-300">
            {lang === 'ms'
              ? `Laluan ke ${destinationName || 'destinasi'} menggunakan geometri anggaran kerana kawasan ini tiada dalam rangkaian jalan offline. Aliran giliran (turn-by-turn) tidak tepat dan garisan laluan mungkin tidak mengikut jalan sebenar.`
              : `The route to ${destinationName || 'your destination'} uses estimated geometry because this area is not covered by the offline road network. Turn-by-turn guidance is inaccurate and the route line may not follow real roads.`}
          </p>
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
            <WifiOff className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              {lang === 'ms'
                ? 'Sambung ke internet untuk laluan tepat, atau muat turun pek zon dari Pengurus Offline.'
                : 'Connect to the internet for an accurate route, or download a region pack from the Offline Manager.'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-800 bg-slate-950/60 p-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all"
          >
            {lang === 'ms' ? 'Batal' : 'Cancel'}
          </button>
          <button
            onClick={onContinue}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-500 transition-all"
          >
            <MapPinned className="h-4 w-4" />
            {lang === 'ms' ? 'Guna Laluan Anggaran' : 'Use Approximate Route'}
          </button>
        </div>
      </div>
    </div>
  );
};
