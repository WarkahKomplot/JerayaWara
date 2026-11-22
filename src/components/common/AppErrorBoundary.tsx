import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/** Last-resort boundary so a component crash does not leave a blank white PWA. */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('JerayaWara UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center text-slate-100">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <div>
          <h1 className="text-lg font-bold">Something went wrong / Ralat berlaku</h1>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            The app hit an unexpected error. Your active trip is saved and will resume after a
            reload. / Perjalanan aktif disimpan dan akan disambung semula.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
        >
          <RefreshCw className="h-4 w-4" />
          Reload / Muat semula
        </button>
      </div>
    );
  }
}
