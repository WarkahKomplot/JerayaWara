import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStepProgress } from '../../src/hooks/useStepProgress';
import { RouteResult } from '../../src/services/routing/types';

// Junctions ~555m apart (0.005° latitude) so the 350m warning window has clean
// inside/outside zones.
const mockRoute: RouteResult = {
  coordinates: [[101.7, 3.100], [101.7, 3.080]],
  distanceKm: 2.2,
  durationMinutes: 5,
  steps: [
    { id: 's0', maneuver: 'straight', instruction: 'Head on road', distanceMeters: 550, durationSeconds: 40, coordinates: [101.7, 3.0990] },
    { id: 's1', maneuver: 'turn_right', instruction: 'Turn right onto Jalan Test', distanceMeters: 550, durationSeconds: 40, coordinates: [101.7, 3.0940] },
    { id: 's2', maneuver: 'turn_left', instruction: 'Turn left onto Jalan Dua', distanceMeters: 550, durationSeconds: 40, coordinates: [101.7, 3.0890] },
    { id: 's3', maneuver: 'arrive', instruction: 'Arrive at destination', distanceMeters: 0, durationSeconds: 0, coordinates: [101.7, 3.0800] }
  ],
  tollPlazaKeys: [],
  profile: 'car',
  destinationName: 'Test Destination'
};

describe('useStepProgress (GPS-driven turn-by-turn)', () => {
  it('starts at step 0 far from any junction', () => {
    const { result } = renderHook(() =>
      useStepProgress(true, mockRoute, [101.7, 3.1000])
    );
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.approachingStep).toBeNull();
    expect(result.current.isNearDestination).toBe(false);
  });

  it('flags the approaching step within the advance warning window', () => {
    // 3.0965 is ~278m south of the step-1 junction (3.0940) — inside the 350m
    // warning window but outside the 40m switch radius.
    const { result } = renderHook(() =>
      useStepProgress(true, mockRoute, [101.7, 3.0965])
    );
    expect(result.current.approachingStep).not.toBeNull();
    expect(result.current.approachingStep!.id).toBe('s1');
    expect(result.current.metersToNextTurn).toBeLessThan(350);
    expect(result.current.metersToNextTurn).toBeGreaterThan(40);
  });

  it('does not flag approaching step when far from the junction', () => {
    const { result } = renderHook(() =>
      useStepProgress(true, mockRoute, [101.7, 3.1000])
    );
    expect(result.current.approachingStep).toBeNull();
  });

  it('advances the current step when the driver reaches the next junction', () => {
    // Start within the step-0 zone but past the warning window check,
    // then jump straight onto the step-1 junction.
    const { result, rerender } = renderHook(
      ({ coords }: { coords: [number, number] }) => useStepProgress(true, mockRoute, coords),
      { initialProps: { coords: [101.7, 3.0950] as [number, number] } }
    );
    expect(result.current.currentStepIndex).toBe(0);

    // 3.0940 is the step-1 junction — within the 40m switch radius
    rerender({ coords: [101.7, 3.0940] });
    expect(result.current.currentStepIndex).toBeGreaterThanOrEqual(1);
  });

  it('flags near-destination when within arrival radius', () => {
    const { result } = renderHook(() =>
      useStepProgress(true, mockRoute, [101.7, 3.08005])
    );
    expect(result.current.isNearDestination).toBe(true);
  });

  it('resets progress when a new route is loaded', () => {
    const { result, rerender } = renderHook(
      ({ route, coords }: { route: RouteResult; coords: [number, number] }) =>
        useStepProgress(true, route, coords),
      { initialProps: { route: mockRoute, coords: [101.7, 3.0940] as [number, number] } }
    );
    // Driver is on the step-1 junction, so progress has advanced past 0
    expect(result.current.currentStepIndex).toBeGreaterThanOrEqual(1);

    // New route AND driver now mid-segment (far from all junctions) — the reset
    // to step 0 must stick rather than immediately re-advancing.
    rerender({
      route: { ...mockRoute, destinationName: 'New Trip' },
      coords: [101.7, 3.0965]
    });
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.approachingStep!.id).toBe('s1');
  });

  it('does nothing when navigation is off', () => {
    const { result } = renderHook(() =>
      useStepProgress(false, mockRoute, [101.7, 3.0940])
    );
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.approachingStep).toBeNull();
    expect(result.current.isNearDestination).toBe(false);
  });
});
