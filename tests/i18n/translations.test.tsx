import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getLocalizedStepInstruction, UI_TRANSLATIONS } from '../../src/services/i18n/translations';
import { ModeSelector } from '../../src/components/navigation/ModeSelector';
import { FavoritesQuickChips } from '../../src/components/favorites/FavoritesQuickChips';
import { TripSummaryDrawer } from '../../src/components/navigation/TripSummaryDrawer';
import { TollBreakdownModal } from '../../src/components/navigation/TollBreakdownModal';
import { RegionDownloadModal } from '../../src/components/offline/RegionDownloadModal';
import { EnRouteServicesCard } from '../../src/components/navigation/EnRouteServicesCard';
import { RouteResult } from '../../src/services/routing/types';
import { TollBreakdown } from '../../src/services/toll/types';

describe('Bilingual Localization System (BM / EN)', () => {
  it('contains matching keys for both BM and EN dictionaries', () => {
    const msKeys = Object.keys(UI_TRANSLATIONS.ms);
    const enKeys = Object.keys(UI_TRANSLATIONS.en);
    expect(msKeys.sort()).toEqual(enKeys.sort());
  });

  it('translates navigation maneuver instructions accurately between BM and EN', () => {
    const stepLeft = {
      instruction: 'Turn left onto Jalan Ampang',
      maneuver: 'turn_left' as const,
      distanceMeters: 300,
      durationSeconds: 30,
      coordinates: [101.7, 3.15] as [number, number]
    };
    expect(getLocalizedStepInstruction(stepLeft, 'ms')).toBe('Belok kiri ke Jalan Ampang');
    expect(getLocalizedStepInstruction(stepLeft, 'en')).toBe('Turn left onto Jalan Ampang');

    const stepExit = {
      instruction: 'Take exit on right onto PLUS Highway E2',
      maneuver: 'exit_right' as const,
      distanceMeters: 500,
      durationSeconds: 20,
      coordinates: [101.7, 3.15] as [number, number]
    };
    expect(getLocalizedStepInstruction(stepExit, 'ms')).toBe('Susur keluar kanan ke PLUS Highway E2');
    expect(getLocalizedStepInstruction(stepExit, 'en')).toBe('Take exit on right onto PLUS Highway E2');

    const stepArrive = {
      instruction: 'Arrive at destination',
      maneuver: 'arrive' as const,
      distanceMeters: 0,
      durationSeconds: 0,
      coordinates: [101.7, 3.15] as [number, number]
    };
    expect(getLocalizedStepInstruction(stepArrive, 'ms', 'Genting Highlands')).toBe('Tiba di Genting Highlands');
    expect(getLocalizedStepInstruction(stepArrive, 'en', 'Genting Highlands')).toBe('Arrive at Genting Highlands');
  });

  it('renders ModeSelector in Bahasa Melayu and English', () => {
    const { rerender } = render(<ModeSelector selectedMode="car" onSelectMode={() => {}} lang="ms" />);
    expect(screen.getByText('Kereta')).toBeDefined();
    expect(screen.getByText('Motosikal')).toBeDefined();

    rerender(<ModeSelector selectedMode="car" onSelectMode={() => {}} lang="en" />);
    expect(screen.getByText('Car')).toBeDefined();
    expect(screen.getByText('Motorcycle')).toBeDefined();
  });

  it('renders FavoritesQuickChips labels in Bahasa Melayu and English', () => {
    const { rerender } = render(
      <FavoritesQuickChips
        refreshTrigger={0}
        onAddFavorite={() => {}}
        onRemoveFavorite={() => {}}
        onSelectFavorite={() => {}}
        lang="ms"
      />
    );
    expect(screen.getByText(/Rumah/i)).toBeDefined();
    expect(screen.getByText(/Kerja/i)).toBeDefined();
    expect(screen.getByText(/Balik Kampung/i)).toBeDefined();

    rerender(
      <FavoritesQuickChips
        refreshTrigger={0}
        onAddFavorite={() => {}}
        onRemoveFavorite={() => {}}
        onSelectFavorite={() => {}}
        lang="en"
      />
    );
    expect(screen.getByText(/\bHome\b/i)).toBeDefined();
    expect(screen.getByText(/Work/i)).toBeDefined();
    expect(screen.getByText(/Hometown/i)).toBeDefined();
  });

  it('renders TripSummaryDrawer completely in Bahasa Melayu and English without mixed text', () => {
    const mockRoute: RouteResult = {
      coordinates: [[101.693, 3.141], [101.938, 2.725]],
      distanceKm: 42.9,
      durationMinutes: 45,
      steps: [
        {
          id: 'step-1',
          instruction: 'Continue on PLUS E2',
          distanceMeters: 42000,
          durationSeconds: 2700,
          coordinates: [101.693, 3.141],
          maneuver: 'straight'
        }
      ],
      tollPlazaKeys: ['PLUS_SG_BESI'],
      profile: 'car',
      destinationName: 'Seremban City Centre'
    };

    const mockTolls: TollBreakdown = {
      totalCost: 2.7,
      currency: 'MYR',
      items: [],
      hasMotorcycleRestriction: false,
      vehicleClass: 'car'
    };

    const { rerender } = render(
      <TripSummaryDrawer
        route={mockRoute}
        tollBreakdown={mockTolls}
        onOpenTolls={() => {}}
        onEndNavigation={() => {}}
        onExportGpx={() => {}}
        initialExpanded={true}
        lang="ms"
      />
    );

    // In BM mode, all headers, toll badges, and actions are Bahasa Melayu
    expect(screen.getByText(/KADAR TOL/i)).toBeDefined();
    expect(screen.getByText(/Keluar Navigasi/i)).toBeDefined();
    expect(screen.getByText(/Eksport GPX/i)).toBeDefined();
    expect(screen.getByText(/Laluan GPS Langsung/i)).toBeDefined();
    expect(screen.getByText(/Langkah Laluan & Jalan/i)).toBeDefined();

    // Rerender in EN mode
    rerender(
      <TripSummaryDrawer
        route={mockRoute}
        tollBreakdown={mockTolls}
        onOpenTolls={() => {}}
        onEndNavigation={() => {}}
        onExportGpx={() => {}}
        initialExpanded={true}
        lang="en"
      />
    );

    // In EN mode, all text reactively becomes English
    expect(screen.getByText(/TOLL FARES/i)).toBeDefined();
    expect(screen.getByText(/Exit Navigation/i)).toBeDefined();
    expect(screen.getByText(/Export GPX/i)).toBeDefined();
    expect(screen.getByText(/Live GPS Route/i)).toBeDefined();
    expect(screen.getByText(/Route Steps & Roads/i)).toBeDefined();
  });

  it('renders TollBreakdownModal in Bahasa Melayu and English', () => {
    const mockTolls: TollBreakdown = {
      totalCost: 5.4,
      currency: 'MYR',
      items: [
        { id: 't1', plazaName: 'Plaza Batu Tiga', cost: 2.7, expressway: 'Federal Highway', paymentMethods: ['TnG', 'RFID'] }
      ],
      hasMotorcycleRestriction: false,
      vehicleClass: 'car'
    };

    const { rerender } = render(
      <TollBreakdownModal
        isOpen={true}
        onClose={() => {}}
        tollBreakdown={mockTolls}
        lang="ms"
      />
    );
    expect(screen.getByText('Pecahan Tol Lebuhraya Malaysia')).toBeDefined();
    expect(screen.getByText(/Jumlah Anggaran Tol/i)).toBeDefined();
    expect(screen.getByText('Tutup')).toBeDefined();

    rerender(
      <TollBreakdownModal
        isOpen={true}
        onClose={() => {}}
        tollBreakdown={mockTolls}
        lang="en"
      />
    );
    expect(screen.getByText('Malaysian Highway Toll Breakdown')).toBeDefined();
    expect(screen.getByText(/Total Estimated Toll/i)).toBeDefined();
    expect(screen.getByText('Close')).toBeDefined();
  });

  it('renders RegionDownloadModal in Bahasa Melayu and English', () => {
    const { rerender } = render(
      <RegionDownloadModal
        isOpen={true}
        onClose={() => {}}
        lang="ms"
      />
    );
    expect(screen.getByText('Peta Luar Talian Malaysia')).toBeDefined();

    rerender(
      <RegionDownloadModal
        isOpen={true}
        onClose={() => {}}
        lang="en"
      />
    );
    expect(screen.getByText('Malaysia Offline Maps')).toBeDefined();
  });

  it('renders EnRouteServicesCard in Bahasa Melayu and English', () => {
    const { rerender } = render(
      <EnRouteServicesCard
        amenities={[]}
        activeCategory="all"
        onSelectCategory={() => {}}
        lang="ms"
      />
    );
    expect(screen.getByText('Sepanjang Laluan')).toBeDefined();
    expect(screen.getByText('Semua')).toBeDefined();

    rerender(
      <EnRouteServicesCard
        amenities={[]}
        activeCategory="all"
        onSelectCategory={() => {}}
        lang="en"
      />
    );
    expect(screen.getByText('Along Route')).toBeDefined();
    expect(screen.getByText('All')).toBeDefined();
  });
});
