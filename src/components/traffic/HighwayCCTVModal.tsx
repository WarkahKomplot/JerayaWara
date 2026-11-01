import React, { useState } from 'react';
import { X, Camera, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { HighwayCamera } from '../../services/traffic/types';

export interface HighwayCCTVModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: HighwayCamera[];
  destinationName?: string;
}

export const HighwayCCTVModal: React.FC<HighwayCCTVModalProps> = ({
  isOpen,
  onClose,
  cameras = [],
  destinationName
}) => {
  const [selectedCamId, setSelectedCamId] = useState<string | null>(null);
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const activeCam =
    cameras.find(c => c.id === selectedCamId) || (cameras.length > 0 ? cameras[0] : null);

  const handleRefresh = (camId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshKeys(prev => ({
      ...prev,
      [camId]: Date.now()
    }));
    setFailedImages(prev => ({
      ...prev,
      [camId]: false
    }));
  };

  const handleImageError = (camId: string) => {
    setFailedImages(prev => ({
      ...prev,
      [camId]: true
    }));
  };

  const getActiveImageUrl = (cam: HighwayCamera) => {
    const timestamp = refreshKeys[cam.id] || 0;
    const base = failedImages[cam.id] && cam.fallbackUrl ? cam.fallbackUrl : cam.imageUrl;
    const separator = base.includes('?') ? '&' : '?';
    return timestamp > 0 ? `${base}${separator}_t=${timestamp}` : base;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div
        className="flex max-h-[92vh] sm:max-h-[85vh] w-full max-w-2xl flex-col rounded-t-3xl sm:rounded-3xl border border-slate-700/80 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cctv-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="cctv-modal-title" className="text-base font-extrabold tracking-tight text-white">
                  Kamera Lebuhraya Live
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {cameras.length} kamera dikesan di laluan {destinationName ? `ke ${destinationName}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {cameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <AlertCircle className="h-12 w-12 text-slate-500 mb-3" />
            <h3 className="text-base font-bold text-slate-200">Tiada Kamera di Laluan Ini</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Kamera CCTV lebuhraya tersedia untuk PLUS (E1/E2), Lebuhraya Persekutuan, LDP, MEX, Karak, dan Jambatan Pulau Pinang.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Active Camera Live Preview Card */}
            {activeCam && (
              <div className="relative border-b border-slate-800 bg-black/60 p-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 shadow-inner flex items-center justify-center">
                  {failedImages[activeCam.id] ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Camera className="h-10 w-10 text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">
                        Suapan kamera sedang dikemas kini oleh {activeCam.source}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeCam.title} ({activeCam.highway})
                      </p>
                      <button
                        onClick={(e) => handleRefresh(activeCam.id, e)}
                        className="mt-3 flex items-center gap-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Cuba Semula (Reload)
                      </button>
                    </div>
                  ) : (
                    <img
                      src={getActiveImageUrl(activeCam)}
                      alt={activeCam.title}
                      className="h-full w-full object-cover"
                      onError={() => handleImageError(activeCam.id)}
                      loading="eager"
                    />
                  )}

                  {/* Overlaid Camera Metadata Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-lg bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-sky-300 backdrop-blur-md border border-slate-700/80">
                      {activeCam.highway} {activeCam.km ? `· ${activeCam.km}` : ''}
                    </span>
                    <span className="rounded-lg bg-slate-900/85 px-2 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur-md border border-slate-700/80">
                      {activeCam.source}
                    </span>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={(e) => handleRefresh(activeCam.id, e)}
                    className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/85 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700/80 transition-all active:scale-90"
                    title="Muat semula gambar kamera"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>

                  {/* Direction Badge */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[10px] font-medium text-slate-300 backdrop-blur-sm">
                    <Compass className="h-3 w-3 text-sky-400" />
                    <span>{activeCam.direction}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{activeCam.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lokasi: {activeCam.coordinates[1].toFixed(4)}°N, {activeCam.coordinates[0].toFixed(4)}°E
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal Scroll / List of Other Cameras on Route */}
            <div className="p-4 overflow-y-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Pilih Kamera di Sepanjang Laluan ({cameras.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cameras.map((cam, idx) => {
                  const isSelected = (activeCam?.id || cameras[0]?.id) === cam.id;
                  return (
                    <button
                      key={cam.id}
                      onClick={() => setSelectedCamId(cam.id)}
                      className={`flex items-center gap-3 rounded-xl p-2.5 text-left transition-all border ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-500/80 shadow-md shadow-sky-500/10'
                          : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/70 overflow-hidden relative">
                        <Camera className="h-5 w-5 text-sky-400" />
                        <span className="absolute bottom-0 right-0 rounded-tl bg-sky-600 px-1 text-[8px] font-black text-white">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-400">
                          <span>{cam.highway}</span>
                          {cam.km && <span>• {cam.km}</span>}
                        </div>
                        <div className="truncate text-xs font-bold text-slate-200 mt-0.5">
                          {cam.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {cam.direction} ({cam.source})
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/80 px-5 py-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span>Sumber:</span>
            <span className="font-semibold text-slate-300">LLM, PLUS & ITIS Malaysia</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-bold text-white transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
