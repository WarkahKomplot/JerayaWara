import React, { useState, useEffect } from 'react';
import { X, Camera, RefreshCw, AlertCircle, Compass, ExternalLink, ShieldCheck } from 'lucide-react';
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
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isImgLoading, setIsImgLoading] = useState<boolean>(true);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  const activeCam =
    cameras.find(c => c.id === selectedCamId) || (cameras.length > 0 ? cameras[0] : null);

  // 2.5 second fallback timer: if image hangs due to LLM hotlink firewall, fail over cleanly
  useEffect(() => {
    if (!activeCam) return;
    setIsImgLoading(true);
    setImgFailed(false);

    const timer = setTimeout(() => {
      setIsImgLoading(false);
      setImgFailed(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, [activeCam?.id, refreshKey]);

  if (!isOpen) return null;

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshKey(Date.now());
  };

  const portalUrl = activeCam?.portalUrl || 'https://www.jalanow.com';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-md animate-fadeIn">
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
                {cameras.length} kamera di laluan {destinationName ? `ke ${destinationName}` : ''}
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
                  {imgFailed ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-3">
                        <Camera className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {activeCam.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 font-medium">
                        {activeCam.highway} {activeCam.km ? `(${activeCam.km})` : ''} · {activeCam.source}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Suapan rasmi LLM dilindungi dari hotlinking pihak ketiga. Ketik butang di bawah untuk membuka suapan rasmi langsung tanpa sekatan:
                      </p>
                      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                        <a
                          href={portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                          <span>Buka Suapan Live di Portal Rasmi</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={handleRefresh}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Cuba Semula</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isImgLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10">
                          <RefreshCw className="h-7 w-7 text-sky-400 animate-spin mb-2" />
                          <span className="text-xs text-slate-400">Menyambung ke suapan {activeCam.source}...</span>
                        </div>
                      )}
                      <img
                        src={`${activeCam.imageUrl}${activeCam.imageUrl.includes('?') ? '&' : '?'}_t=${refreshKey}`}
                        alt={activeCam.title}
                        className="h-full w-full object-cover"
                        onLoad={() => setIsImgLoading(false)}
                        onError={() => {
                          setIsImgLoading(false);
                          setImgFailed(true);
                        }}
                      />
                    </>
                  )}

                  {/* Overlaid Camera Metadata Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                    <span className="rounded-lg bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-sky-300 backdrop-blur-md border border-slate-700/80">
                      {activeCam.highway} {activeCam.km ? `· ${activeCam.km}` : ''}
                    </span>
                    <span className="rounded-lg bg-slate-900/85 px-2 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur-md border border-slate-700/80">
                      {activeCam.source}
                    </span>
                  </div>

                  {/* Top-Right Direct Portal Link Button */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 px-2.5 text-[11px] font-bold text-white backdrop-blur-md border border-blue-400/40 transition-all shadow"
                      title="Buka suapan langsung penuh di portal rasmi"
                    >
                      <span>Live Feed</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={handleRefresh}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/85 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700/80 transition-all active:scale-90"
                      title="Muat semula suapan kamera"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Direction Badge */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[10px] font-medium text-slate-300 backdrop-blur-sm z-20">
                    <Compass className="h-3 w-3 text-sky-400" />
                    <span>{activeCam.direction}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{activeCam.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>Kamera Rasmi {activeCam.source} ({activeCam.coordinates[1].toFixed(3)}°N, {activeCam.coordinates[0].toFixed(3)}°E)</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Selection List */}
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
            <span>Disahkan:</span>
            <span className="font-semibold text-slate-300">Lembaga Lebuhraya Malaysia & PLUS</span>
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
