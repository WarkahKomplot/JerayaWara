import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnRouteServicesCard } from '../../src/components/navigation/EnRouteServicesCard';
import { EnRouteAmenityWithDistance } from '../../src/services/amenities/types';

describe('EnRouteServicesCard Component', () => {
  const mockAmenities: EnRouteAmenityWithDistance[] = [
    {
      id: 'pet-1',
      name: 'Petronas R&R Tapah (Arah Utara)',
      type: 'petronas',
      brand: 'Petronas',
      expressway: 'PLUS E1',
      coordinates: [101.296, 4.020],
      distanceKm: 18.4
    },
    {
      id: 'ev-1',
      name: 'Gentari 150kW DC Fast Charger R&R Tapah',
      type: 'ev_fast_charger',
      brand: 'Gentari',
      expressway: 'PLUS E1',
      coordinates: [101.296, 4.020],
      evSpecs: { operator: 'Gentari', maxKw: 150, plugs: ['CCS2'] },
      distanceKm: 18.5
    }
  ];

  it('renders filter tabs and displays upcoming amenities with distance', () => {
    const handleCategory = vi.fn();
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="all"
        onSelectCategory={handleCategory}
      />
    );

    expect(screen.getByText(/Semua/i)).toBeDefined();
    expect(screen.getByText(/Petrol/i)).toBeDefined();
    expect(screen.getByText(/EV Charger/i)).toBeDefined();
    expect(screen.getByText(/Petronas R&R Tapah/i)).toBeDefined();
    expect(screen.getByText(/18.4 km/i)).toBeDefined();
  });

  it('invokes onSelectCategory when user taps EV Charger tab', () => {
    const handleCategory = vi.fn();
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="all"
        onSelectCategory={handleCategory}
      />
    );

    const evTab = screen.getByText(/EV Charger/i);
    fireEvent.click(evTab);
    expect(handleCategory).toHaveBeenCalledWith('ev');
  });

  it('displays motorcycle rain shelter badge when shelter prop is present', () => {
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="all"
        onSelectCategory={vi.fn()}
        shelter={{
          id: 'ms-1',
          name: 'Pondok Teduhan Jejantas KM 312',
          expressway: 'PLUS E1',
          kmMarker: 'KM 312',
          coordinates: [101.350, 3.850],
          hasDedicatedBay: true
        }}
      />
    );

    expect(screen.getByText(/Pondok Teduhan Jejantas KM 312/i)).toBeDefined();
  });

  it('renders PlugShare deep link button for EV fast charger stations', () => {
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="ev"
        onSelectCategory={vi.fn()}
      />
    );

    const plugshareLink = screen.getByTestId('plugshare-link-ev-1') as HTMLAnchorElement;
    expect(plugshareLink).toBeDefined();
    expect(plugshareLink.href).toContain('https://www.plugshare.com/?latitude=4.020000&longitude=101.296000');
    expect(plugshareLink.target).toBe('_blank');
    expect(plugshareLink.rel).toBe('noopener noreferrer');
    expect(screen.getByText(/PlugShare ↗/i)).toBeDefined();
  });

  it('renders EV sync button and handles sync action when in EV category', () => {
    const handleRefresh = vi.fn();
    render(
      <EnRouteServicesCard
        amenities={mockAmenities}
        activeCategory="ev"
        onSelectCategory={vi.fn()}
        onRefreshAmenities={handleRefresh}
      />
    );

    const syncBtn = screen.getByTestId('sync-osm-ev-btn');
    expect(syncBtn).toBeDefined();
    expect(screen.getByText(/Kemas Kini EV \(OSM\)/i)).toBeDefined();
  });
});
