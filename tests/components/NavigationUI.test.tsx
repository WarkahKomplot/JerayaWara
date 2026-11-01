import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TurnBanner } from '../../src/components/navigation/TurnBanner';
import { ModeSelector } from '../../src/components/navigation/ModeSelector';
import { SearchBar } from '../../src/components/search/SearchBar';
import { TripSummaryDrawer } from '../../src/components/navigation/TripSummaryDrawer';
import { RouteResult } from '../../src/services/routing/types';

describe('Navigation UI Components', () => {
  it('renders turn instruction and lane guidance accurately', () => {
    render(
      <TurnBanner
        instruction="Exit 215 onto PLUS Hwy E2"
        distanceMeters={450}
        maneuver="exit_right"
        speedLimit={110}
        currentSpeed={94}
      />
    );
    expect(screen.getByText('Exit 215 onto PLUS Hwy E2')).toBeDefined();
    expect(screen.getByText(/450 m/i)).toBeDefined();
    expect(screen.getByText('110')).toBeDefined();
  });

  it('renders mode switchers for Car, Motorcycle, and Walker', () => {
    render(<ModeSelector selectedMode="car" onSelectMode={() => {}} />);
    expect(screen.getByText(/Car/i)).toBeDefined();
    expect(screen.getByText(/Motorcycle/i)).toBeDefined();
    expect(screen.getByText(/Walker/i)).toBeDefined();
  });

  it('invokes onSelectDestination when user clicks a search item', async () => {
    const handleSelect = vi.fn();
    render(<SearchBar onSelectDestination={handleSelect} isOnline={false} />);

    const input = screen.getByPlaceholderText(/Search Malaysian city/i);
    fireEvent.change(input, { target: { value: 'Tapah' } });

    await waitFor(() => {
      const items = screen.getAllByText(/Tapah R&R/i);
      expect(items.length).toBeGreaterThan(0);
    });

    const itemBtn = screen.getAllByText(/Tapah R&R/i)[0].closest('button');
    expect(itemBtn).not.toBeNull();
    fireEvent.click(itemBtn!);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect.mock.calls[0][0].title).toContain('Tapah');
  });

  it('renders trip summary with destination title and enables exit navigation', () => {
    const mockRoute: RouteResult = {
      coordinates: [[101.693, 3.141], [101.938, 2.725]],
      distanceKm: 65,
      durationMinutes: 45,
      steps: [
        {
          id: 'step-1',
          instruction: 'Proceed to destination',
          distanceMeters: 65000,
          durationSeconds: 2700,
          coordinates: [101.693, 3.141],
          maneuver: 'straight'
        }
      ],
      tollPlazaKeys: ['PLUS_SG_BESI'],
      profile: 'car',
      destinationName: 'Tapah R&R (Northbound)'
    };

    const handleExit = vi.fn();
    render(
      <TripSummaryDrawer
        route={mockRoute}
        tollBreakdown={{
          totalCost: 4.8,
          currency: 'MYR',
          items: [{ id: 'PLUS_SG_BESI', plazaName: 'Sg Besi Plaza', cost: 4.8, expressway: 'E2', paymentMethods: ['TnG', 'RFID'] }],
          hasMotorcycleRestriction: false,
          vehicleClass: 'car'
        }}
        onOpenTolls={() => {}}
        onEndNavigation={handleExit}
      />
    );

    expect(screen.getByText('Tapah R&R (Northbound)')).toBeDefined();
    expect(screen.getByText('65 km')).toBeDefined();
    expect(screen.getByText('RM 4.80')).toBeDefined();

    const exitBtn = screen.getByText(/Exit Navigation/i);
    fireEvent.click(exitBtn);
    expect(handleExit).toHaveBeenCalledTimes(1);
  });
});
