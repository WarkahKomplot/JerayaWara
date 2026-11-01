import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('JerayaWara Uncaught Error in Safari/Browser:', error, errorInfo);
  }

  private handleHardReset = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    } catch (err) {
      console.warn('Cache purge failed:', err);
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-4 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 className="text-xl font-black text-white">Memuat Semula JerayaWara</h1>
          <p className="mt-2 text-xs text-slate-400 max-w-sm">
            Kemas kini sistem terbaharu dikesan. Tekan butang di bawah untuk menyegarkan cache pelayar anda.
          </p>

          {/* Diagnostic Error Details */}
          {this.state.error && (
            <div className="mt-4 max-w-lg w-full rounded-2xl bg-slate-900 border border-red-500/30 p-3.5 text-left shadow-2xl">
              <div className="text-xs font-bold text-red-400 break-words mb-1">
                {this.state.error.name}: {this.state.error.message}
              </div>
              {this.state.error.stack && (
                <div className="text-[10px] text-slate-400 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap break-all mt-2 bg-black/50 p-2.5 rounded-lg border border-slate-800">
                  {this.state.error.stack}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleHardReset}
              className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              Kemas Kini & Muat Semula
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="rounded-2xl bg-slate-800 hover:bg-slate-700 px-6 py-3 text-xs font-bold text-slate-300 transition-all active:scale-95"
            >
              Muat Semula Biasa
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
