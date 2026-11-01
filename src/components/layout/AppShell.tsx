import React, { ReactNode } from 'react';
import { useFoldableDetection } from '../../hooks/useFoldableDetection';

export interface AppShellProps {
  childrenMap: ReactNode;
  topBanner?: ReactNode;
  bottomDrawer?: ReactNode;
  sidePanelContent?: ReactNode;
  headerBar?: ReactNode;
  isNavigating?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  childrenMap,
  topBanner,
  bottomDrawer,
  sidePanelContent,
  headerBar
}) => {
  const { isFoldableUnfolded } = useFoldableDetection();

  if (isFoldableUnfolded) {
    // Foldable Unfolded Dual-Pane View
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
        {/* Left Control & Information Cockpit Panel */}
        <aside className="relative flex w-[380px] flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900/95 shadow-2xl z-20 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-800 p-4">
            {headerBar}
          </div>

          <div className="flex-1 p-4 space-y-4">
            {topBanner}
            {sidePanelContent}
          </div>

          {bottomDrawer && (
            <div className="border-t border-slate-800 p-4 bg-slate-950/80">
              {bottomDrawer}
            </div>
          )}
        </aside>

        {/* Right 3D Map Area */}
        <main className="relative flex-1 h-full w-full overflow-hidden">
          {childrenMap}
        </main>
      </div>
    );
  }

  // Standard Phone View (Portrait floating UI)
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Floating Area */}
      <header className="absolute top-0 left-0 right-0 z-30 p-3 pt-safe space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          {headerBar}
        </div>
        <div className="pointer-events-auto">
          {topBanner}
        </div>
      </header>

      {/* Main Fullscreen Map */}
      <main className="absolute inset-0 z-10 h-full w-full">
        {childrenMap}
      </main>

      {/* Bottom Floating Drawer */}
      {bottomDrawer && (
        <footer className="absolute bottom-0 left-0 right-0 z-30 p-3 pb-safe pointer-events-none">
          <div className="pointer-events-auto">
            {bottomDrawer}
          </div>
        </footer>
      )}
    </div>
  );
};
