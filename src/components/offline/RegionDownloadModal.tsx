import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, CheckCircle2, HardDrive, Wifi } from 'lucide-react';
import { MALAYSIA_REGIONS, RegionPack } from '../../services/offline/regions';
import { regionManager, DownloadProgress } from '../../services/offline/regionManager';
import { CachedRegionRecord } from '../../services/offline/db';

export interface RegionDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegionDownloadModal: React.FC<RegionDownloadModalProps> = ({
  isOpen,
  onClose
}) => {
  const [downloaded, setDownloaded] = useState<CachedRegionRecord[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<Record<string, DownloadProgress>>({});

  useEffect(() => {
    if (!isOpen) return;

    regionManager.getDownloadedRegions().then(setDownloaded);

    const unsubscribe = regionManager.onProgress(progress => {
      setActiveDownloads(prev => ({
        ...prev,
        [progress.regionId]: progress
      }));

      if (progress.status === 'completed') {
        regionManager.getDownloadedRegions().then(setDownloaded);
      }
    });

    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = (region: RegionPack) => {
    regionManager.downloadRegion(region);
  };

  const handleDelete = async (regionId: string) => {
    await regionManager.deleteRegion(regionId);
    regionManager.getDownloadedRegions().then(setDownloaded);
  };

  const isReady = (regionId: string) => downloaded.some(d => d.regionId === regionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Offline Malaysia Maps</h3>
              <p className="text-xs text-slate-400">
                Download regional packs for 100% offline GPS navigation
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

        {/* Region List */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-3">
          {MALAYSIA_REGIONS.map(region => {
            const ready = isReady(region.id);
            const progress = activeDownloads[region.id];
            const isDownloading = progress?.status === 'downloading';

            return (
              <div
                key={region.id}
                className="flex items-center justify-between rounded-2xl bg-slate-800/60 border border-slate-700/40 p-4 transition-all"
              >
                <div className="pr-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {region.name}
                    </span>
                    <span className="rounded bg-slate-700/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {region.sizeMB} MB
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                    {region.description}
                  </p>

                  {progress?.status === 'quota_exceeded' && (
                    <div className="mt-2 text-[11px] font-semibold text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      ⚠️ {progress.errorMessage || 'Storage quota exceeded. Please evict an existing regional pack.'}
                    </div>
                  )}

                  {isDownloading && (
                    <div className="mt-2.5 w-full">
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                        <span>Downloading pack...</span>
                        <span>{progress.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-200"
                          style={{ width: `${progress.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {ready ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Ready</span>
                      </span>
                      <button
                        onClick={() => handleDelete(region.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20"
                        title="Delete Pack"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(region)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isDownloading ? 'Saving...' : 'Get'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/60 p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Wifi className="h-4 w-4 text-sky-400" />
          <span>Auto-prefetches neighboring regions when within 15 km of state borders</span>
        </div>
      </div>
    </div>
  );
};

