import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoReroute } from '../../src/hooks/useAutoReroute';
import { RouteResult } from '../../src/services/routing/types';

vi.mock('../../src/services/routing/routingEngine', () => ({
  calculateRoute: vi.fn().mockResolvedValue({
    coordinates: [[101.7, 3.1], [101.71, 3.12]],
    distanceKm: 5,
    durationMinutes: 8,
    steps: [],
    tollPlazaKeys: [],
    profile: 'car',
    destinationName: 'KLCC'
  })
}));

vi.mock('../../src/services/toll/tollCalculator', () => ({
  calculateRouteTolls: vi.fn().mockReturnValue({
    totalTollCost: 2.5,
    formattedTotalCost: 'RM 2.50',
    plazaBreakdown: []
  })
}));

vi.mock('../../src/services/voice/voiceService', () => ({
  speakNavigationVoice: vi.fn()
}));

describe('useAutoReroute Hook', () => {
  const mockRoute: RouteResult = {
    coordinates: [
      [101.700, 3.100],
      [101.710, 3.110],
      [101.720, 3.120]
    ],
    distanceKm: 10,
    durationMinutes: 15,
    steps: [],
    tollPlazaKeys: [],
    profile: 'car',
    destinationName: 'KLCC'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stays idle when coords are close to the route polyline', () => {
    const onRouteUpdated = vi.fn();
    const { result } = renderHook(() =>
      useAutoReroute({
        isNavigating: true,
        activeRoute: mockRoute,
        coords: [101.7001, 3.1001], // ~15m away
        vehicleMode: 'car',
        voiceLanguage: 'ms',
        isVoiceEnabled: false,
        onRouteUpdated
      })
    );

    expect(result.current.isOffRoute).toBe(false);
    expect(result.current.isRerouting).toBe(false);
    expect(onRouteUpdated).not.toHaveBeenCalled();
  });

  it('detects off-route and triggers recalculation after consecutive off-route ticks', async () => {
    const onRouteUpdated = vi.fn();

    const { result, rerender } = renderHook(
      (props: { coords: [number, number] }) =>
        useAutoReroute({
          isNavigating: true,
          activeRoute: mockRoute,
          coords: props.coords,
          vehicleMode: 'car',
          voiceLanguage: 'ms',
          isVoiceEnabled: false,
          maxDriftMeters: 50,
          consecutiveOffRouteThreshold: 2,
          onRouteUpdated
        }),
      { initialProps: { coords: [101.7001, 3.1001] } }
    );

    // Tick 1 off-route: user moved ~5km away
    rerender({ coords: [101.750, 3.150] });
    expect(result.current.isOffRoute).toBe(true);
    expect(onRouteUpdated).not.toHaveBeenCalled();

    // Tick 2 off-route: second consecutive tick exceeds threshold of 2
    await act(async () => {
      rerender({ coords: [101.751, 3.151] });
    });

    expect(onRouteUpdated).toHaveBeenCalledTimes(1);
  });
});
