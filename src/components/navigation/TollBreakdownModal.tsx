import React from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { TollBreakdown } from '../../services/toll/types';

export interface TollBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  tollBreakdown: TollBreakdown | null;
}

export const TollBreakdownModal: React.FC<TollBreakdownModalProps> = ({
  isOpen,
  onClose,
  tollBreakdown
}) => {
  if (!isOpen || !tollBreakdown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Malaysia Expressway Tolls</h3>
              <p className="text-xs text-slate-400">
                Vehicle: {tollBreakdown.vehicleClass.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {tollBreakdown.note && (
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-500/10 p-3.5 border border-blue-500/20 text-xs text-blue-300">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-400 mt-0.5" />
              <span>{tollBreakdown.note}</span>
            </div>
          )}

          {tollBreakdown.items.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-400">
              No tolls along this route (Toll-Free Route).
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Toll Plaza Breakdown
              </div>
              {tollBreakdown.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/40 p-3.5"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{item.plazaName}</div>
                    <div className="text-xs text-slate-400">{item.expressway}</div>
                    <div className="mt-1 flex gap-1">
                      {item.paymentMethods.map(pm => (
                        <span
                          key={pm}
                          className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                        >
                          {pm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400">
                      RM {item.cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Footer */}
        <div className="border-t border-slate-800 bg-slate-950/60 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Estimated Total Fares</div>
            <div className="text-xl font-black text-amber-400">
              RM {tollBreakdown.totalCost.toFixed(2)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
