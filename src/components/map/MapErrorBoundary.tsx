import { Component, ErrorInfo, ReactNode } from 'react';
import { Compass } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('MapLibre WebGL Boundary caught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 shadow-lg">
            <Compass className="h-8 w-8 text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Mod Navigasi Sensor Aktif</h2>
          <p className="mt-1.5 text-xs text-slate-400 max-w-xs">
            WebGL grafik peta disekat atau dihadkan oleh tetapan pelayar. Panduan GPS, meter kelajuan, dan radar AES tetap beroperasi.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 border border-slate-700 active:scale-95 transition-all"
          >
            Cuba Muat Semula Peta
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

