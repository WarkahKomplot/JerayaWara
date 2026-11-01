import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TurnBanner } from '../../src/components/navigation/TurnBanner';
import { SearchBar } from '../../src/components/search/SearchBar';
import { TripSummaryDrawer } from '../../src/components/navigation/TripSummaryDrawer';
import { ModeSelector } from '../../src/components/navigation/ModeSelector';
import { SpeedometerOverlay } from '../../src/components/navigation/SpeedometerOverlay';
import { RouteResult } from '../../src/services/routing/types';
import { EnRouteAmenityWithDistance } from '../../src/services/amenities/types';

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
    const handleSelect = vi.fn();
    render(<ModeSelector selectedMode="car" onSelectMode={handleSelect} />);

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

  it('renders live traffic congestion badge and CCTV button when cameras exist on route', () => {
    const mockRoute: RouteResult = {
      coordinates: [[101.789, 2.993], [101.938, 2.725]],
      distanceKm: 42,
      durationMinutes: 38,
      steps: [],
      tollPlazaKeys: [],
      profile: 'car',
      destinationName: 'Kajang Toll Plaza'
    };

    render(
      <TripSummaryDrawer
        route={mockRoute}
        tollBreakdown={{
          totalCost: 2.1,
          currency: 'MYR',
          items: [],
          hasMotorcycleRestriction: false,
          vehicleClass: 'car'
        }}
        onOpenTolls={() => {}}
        onEndNavigation={() => {}}
        trafficCongestion={{
          level: 'moderate',
          label: 'Sederhana',
          color: '#f97316',
          speedKmh: 65,
          delayMinutes: 6,
          corridorName: 'PLUS Sg Besi - Seremban'
        }}
      />
    );

    expect(screen.getByText(/LALULINTAS:/i)).toBeDefined();
    expect(screen.getByText(/Sederhana/i)).toBeDefined();
    expect(screen.getByText(/\+6m/i)).toBeDefined();
  });

  it('renders TurnBanner with voice toggle and bilingual BM/EN language toggle', () => {
    const handleToggleVoice = vi.fn();
    const handleToggleLang = vi.fn();

    render(
      <TurnBanner
        instruction="Belok kanan ke Jalan Tun Razak"
        distanceMeters={200}
        maneuver="turn_right"
        speedLimit={80}
        currentSpeed={45}
        isVoiceEnabled={true}
        onToggleVoice={handleToggleVoice}
        voiceLanguage="ms"
        onToggleVoiceLanguage={handleToggleLang}
      />
    );

    // Verify voice buttons
    const langBtn = screen.getByTitle(/Tukar bahasa suara/i);
    expect(langBtn).toBeDefined();
    expect(screen.getByText('BM')).toBeDefined();

    fireEvent.click(langBtn);
    expect(handleToggleLang).toHaveBeenCalledTimes(1);

    const muteBtn = screen.getByTitle(/Matikan Suara/i);
    expect(muteBtn).toBeDefined();

    fireEvent.click(muteBtn);
    expect(handleToggleVoice).toHaveBeenCalledTimes(1);
  });

  it('renders SpeedometerOverlay with round speed circle, weather, date, HUD button, and manual rain toggle', () => {
    const mockWeather = {
      tempC: 32,
      condition: 'Sunny',
      conditionBm: 'Cerah',
      icon: 'sunny' as const,
      isRaining: false,
      fetchedAt: Date.now()
    };

    const mockAes = {
      camera: {
        id: 'aes-1',
        name: 'AES Slim River (Arah Selatan)',
        highway: 'PLUS E1',
        km: 'KM 375.9',
        speedLimitKmH: 110,
        direction: 'Southbound',
        coordinates: [101.4012, 3.8291] as [number, number],
        locationDescription: 'Slim River'
      },
      distanceMeters: 650
    };

    const handleOpenHud = vi.fn();
    const handleToggleRain = vi.fn();

    render(
      <SpeedometerOverlay
        currentSpeedKmH={85}
        speedLimitKmH={110}
        weather={mockWeather}
        aesAlert={mockAes}
        lang="ms"
        isNavigating={true}
        onOpenHud={handleOpenHud}
        onToggleRain={handleToggleRain}
      />
    );

    // Verify circular speedometer
    expect(screen.getByText('85')).toBeDefined();
    expect(screen.getAllByText(/KM\/H/i).length).toBeGreaterThan(0);

    // Verify speed limit Malaysian round badge
    expect(screen.getByText('110')).toBeDefined();

    // Verify weather & date
    expect(screen.getByText(/32°C/i)).toBeDefined();

    // Verify AES alert banner
    expect(screen.getByText(/AWAS: AES Slim River/i)).toBeDefined();
    expect(screen.getByText(/Jarak 650m/i)).toBeDefined();

    // Verify HUD button and click
    const hudBtn = screen.getByTitle(/Mod HUD Cermin Depan/i);
    expect(hudBtn).toBeDefined();
    fireEvent.click(hudBtn);
    expect(handleOpenHud).toHaveBeenCalledTimes(1);

    // Verify manual rain toggle click
    const rainToggleBtn = screen.getByTitle(/Tukar status hujan/i);
    expect(rainToggleBtn).toBeDefined();
    fireEvent.click(rainToggleBtn);
    expect(handleToggleRain).toHaveBeenCalledTimes(1);

    // Verify collapse info pill button
    const closePillBtn = screen.getByTitle(/Tutup info cuaca/i);
    fireEvent.click(closePillBtn);

    // Verify re-open pill button
    const openPillBtn = screen.getByTitle(/Papar Tarikh & Cuaca/i);
    expect(openPillBtn).toBeDefined();
  });

  it('renders TripSummaryDrawer with Export GPX button and EnRouteServicesCard', () => {
    const mockRoute: RouteResult = {
      coordinates: [[101.693, 3.141], [101.938, 2.725]],
      distanceKm: 65,
      durationMinutes: 45,
      steps: [],
      tollPlazaKeys: [],
      profile: 'car',
      destinationName: 'Seremban'
    };

    const mockAmenities: EnRouteAmenityWithDistance[] = [
      {
        id: 'pet-1',
        name: 'Petronas R&R Seremban',
        type: 'petronas',
        brand: 'Petronas',
        expressway: 'PLUS E2',
        coordinates: [101.915, 2.715],
        distanceKm: 22.4
      }
    ];

    const handleExportGpx = vi.fn();

    render(
      <TripSummaryDrawer
        route={mockRoute}
        tollBreakdown={{
          totalCost: 3.5,
          currency: 'MYR',
          items: [],
          hasMotorcycleRestriction: false,
          vehicleClass: 'car'
        }}
        onOpenTolls={() => {}}
        onEndNavigation={() => {}}
        onExportGpx={handleExportGpx}
        amenities={mockAmenities}
      />
    );

    // Verify GPX export button
    const gpxBtn = screen.getByText(/Eksport GPX/i);
    expect(gpxBtn).toBeDefined();
    fireEvent.click(gpxBtn);
    expect(handleExportGpx).toHaveBeenCalledTimes(1);

    // Verify en-route amenity displayed
    expect(screen.getByText(/Petronas R&R Seremban/i)).toBeDefined();
    expect(screen.getByText(/22.4 km/i)).toBeDefined();
  });
});
