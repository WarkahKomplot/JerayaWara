import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Language } from '../../services/i18n/translations';

export interface UpdatePromptProps {
  isVisible: boolean;
  onReload: () => void;
  lang?: Language;
}

/** Small non-blocking toast shown when a new app version has been downloaded. */
export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  isVisible,
  onReload,
  lang = 'ms'
}) => {
  if (!isVisible) return null;

  return (
    <div
      data-testid="sw-update-prompt"
      className="fixed left-1/2 top-3 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-sky-500/40 bg-slate-900/95 px-3 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur"
      role="status"
    >
      <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
      <span>{lang === 'ms' ? 'Versi baharu tersedia' : 'New version available'}</span>
      <button
        type="button"
        onClick={onReload}
        className="rounded-lg bg-sky-600 px-2 py-1 text-[11px] font-black text-white transition-colors hover:bg-sky-500"
      >
        {lang === 'ms' ? 'Muat semula' : 'Reload'}
      </button>
    </div>
  );
};
