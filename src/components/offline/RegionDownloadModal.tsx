import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, CheckCircle2, HardDrive, Wifi } from 'lucide-react';
import { MALAYSIA_REGIONS, RegionPack } from '../../services/offline/regions';
import { regionManager, DownloadProgress } from '../../services/offline/regionManager';
import { CachedRegionRecord } from '../../services/offline/db';
import { Language, t } from '../../services/i18n/translations';

export interface RegionDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const RegionDownloadModal: React.FC<RegionDownloadModalProps> = ({
  isOpen,
  onClose,
  lang = 'ms'
}) => {
  const [downloaded, setDownloaded] = useState<CachedRegionRecord[]>([]);
  const [activeDownloads, setActiveDownloads] = useState<Record<string, DownloadProgress>>({});

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    regionManager.getDownloadedRegions().then(records => {
      if (isMounted) setDownloaded(records);
    });

    const unsubscribe = regionManager.onProgress(progress => {
      if (!isMounted) return;
      setActiveDownloads(prev => ({
        ...prev,
        [progress.regionId]: progress
      }));

      if (progress.status === 'completed') {
        regionManager.getDownloadedRegions().then(records => {
          if (isMounted) setDownloaded(records);
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async (region: RegionPack) => {
    await regionManager.downloadRegion(region);
    const updated = await regionManager.getDownloadedRegions();
    setDownloaded(updated);
  };

  const handleDelete = async (regionId: string) => {
    await regionManager.deleteRegion(regionId);
    setActiveDownloads(prev => {
      const next = { ...prev };
      delete next[regionId];
      return next;
    });
    const updated = await regionManager.getDownloadedRegions();
    setDownloaded(updated);
  };

  const isReady = (regionId: string) =>
    downloaded.some(d => d.regionId === regionId) ||
    activeDownloads[regionId]?.status === 'completed';

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
              <h3 className="text-base font-bold text-white">{t('offlineModalTitle', lang)}</h3>
              <p className="text-xs text-slate-400">
                {t('offlineModalSubtitle', lang)}
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
                      ⚠️ {progress.errorMessage || (lang === 'ms' ? 'Had storan dicapai. Sila padam pek zon lain terlebih dahulu.' : 'Storage quota exceeded. Please evict an existing regional pack.')}
                    </div>
                  )}

                  {isDownloading && (
                    <div className="mt-2.5 w-full">
                      <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                        <span>{t('downloading', lang)}</span>
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
                        <span>{t('readyToUse', lang)}</span>
                      </span>
                      <button
                        onClick={() => handleDelete(region.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20"
                        title={t('delete', lang)}
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
                      <span>{isDownloading ? t('downloading', lang) : t('download', lang)}</span>
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
          <span>{lang === 'ms' ? 'Memuat turun secara automatik apabila berada dalam jarak 15 km dari sempadan zon' : 'Auto-prefetches neighboring regions when within 15 km of state borders'}</span>
        </div>
      </div>
    </div>
  );
};

