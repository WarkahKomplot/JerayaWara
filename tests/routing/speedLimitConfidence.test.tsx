import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { calculateOfflineRoute } from '../../src/services/routing/routingEngine';
import { SpeedometerOverlay } from '../../src/components/navigation/SpeedometerOverlay';

describe('Speed limit provenance (verified vs estimated)', () => {
  // The routing engine snaps to its own built-in corridor table; the test route
  // below targets the real PLUS E2 polyline so no fixture corridor is needed.
  it('marks corridor highway steps as verified', () => {
    // Start/destination far enough apart to snap to the corridor (> 2.5km straight)
    const route = calculateOfflineRoute([101.70, 3.005], [101.74, 2.895], 'car', 'Test Dest');
    const mergeStep = route.steps.find(s => s.id === 'step-highway-merge');
    expect(mergeStep).toBeDefined();
    expect(mergeStep!.speedLimitSource).toBe('verified');
    expect(mergeStep!.speedLimitKmH).toBe(110);
  });

  it('marks access-road and ramp steps as estimated', () => {
    const route = calculateOfflineRoute([101.70, 3.005], [101.74, 2.895], 'car', 'Test Dest');
    const accessStep = route.steps.find(s => s.id === 'step-arterial-1');
    const exitStep = route.steps.find(s => s.id === 'step-highway-exit');
    expect(accessStep!.speedLimitSource).toBe('estimated');
    expect(exitStep!.speedLimitSource).toBe('estimated');
  });

  it('marks synthetic fallback steps as estimated', () => {
    // Destination far from any corridor forces the synthetic branch
    const route = calculateOfflineRoute([102.5, 5.5], [102.9, 5.2], 'car', 'Remote');
    const genStep = route.steps.find(s => s.id === 'step-gen-1');
    expect(genStep!.speedLimitSource).toBe('estimated');
  });
});

describe('SpeedometerOverlay speeding guard', () => {
  const baseProps = {
    currentSpeedKmH: 95,
    weather: null,
    aesAlert: null,
    lang: 'en' as const,
    isNavigating: true
  };

  it('does NOT flag speeding when the limit is estimated (95 in a guessed 80 zone)', () => {
    const { container } = render(
      <SpeedometerOverlay {...baseProps} speedLimitKmH={80} speedLimitSource="estimated" />
    );
    expect(container.innerHTML).not.toContain('text-amber-400');
  });

  it('DOES flag speeding when the limit is verified (95 in a real 80 zone)', () => {
    const { container } = render(
      <SpeedometerOverlay {...baseProps} speedLimitKmH={80} speedLimitSource="verified" />
    );
    expect(container.innerHTML).toContain('text-amber-400');
  });

  it('never flags when no limit is present', () => {
    const { container } = render(<SpeedometerOverlay {...baseProps} />);
    expect(container.innerHTML).not.toContain('text-amber-400');
  });

  it('displays the limit badge regardless of provenance (badge is informational)', () => {
    const { container } = render(
      <SpeedometerOverlay {...baseProps} speedLimitKmH={80} speedLimitSource="estimated" />
    );
    expect(container.textContent).toContain('80');
  });
});
