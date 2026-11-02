import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { Language } from '../../services/i18n/translations';

export interface PwaInstallBannerProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
  lang?: Language;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  isInstallable,
  isInstalled,
  isIOS,
  isDismissed,
  onInstall,
  onDismiss,
  lang = 'ms'
}) => {
  const [showIosGuide, setShowIosGuide] = useState(false);

  // If already installed or dismissed by user, do not show
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show on installable devices (Chromium/Android via beforeinstallprompt) or iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-blue-950/90 p-3 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 shadow-inner">
            <Smartphone className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">
                {lang === 'ms' ? 'Pasang Aplikasi JerayaWara' : 'Install JerayaWara PWA'}
              </span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-blue-300 border border-blue-400/30">
                PWA
              </span>
            </div>
            <p className="mt-0.5 text-[11px] leading-tight text-slate-300">
              {lang === 'ms'
                ? 'Navigasi skrin penuh tanpa bar carian pelayar & sokongan luar talian pantas.'
                : 'Full-screen navigation without browser bars & instant offline access.'}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-2.5 flex items-center gap-2 pt-0.5">
        {isIOS ? (
          <button
            onClick={() => setShowIosGuide(!showIosGuide)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 active:scale-[0.99] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{lang === 'ms' ? 'Cara Pasang di iPhone/iPad' : 'Install on iPhone/iPad'}</span>
          </button>
        ) : (
          <button
            onClick={onInstall}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 active:scale-[0.99] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{lang === 'ms' ? 'Pasang ke Skrin Utama' : 'Add to Home Screen'}</span>
          </button>
        )}

        <button
          onClick={onDismiss}
          className="rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          {lang === 'ms' ? 'Nanti' : 'Later'}
        </button>
      </div>

      {/* iOS Step-by-Step Tooltip Guide */}
      {showIosGuide && (
        <div className="mt-2.5 rounded-xl bg-slate-950/90 border border-slate-800 p-2.5 text-[11px] text-slate-300 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Share className="h-3.5 w-3.5 flex-shrink-0" />
            <span>1. {lang === 'ms' ? 'Tekan butang Kongsi (Share)' : 'Tap the Share button in Safari'}</span>
          </div>
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <PlusSquare className="h-3.5 w-3.5 flex-shrink-0" />
            <span>2. {lang === 'ms' ? 'Pilih "Add to Home Screen"' : 'Select "Add to Home Screen"'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

