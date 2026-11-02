import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SpeedometerOverlay } from '../../src/components/navigation/SpeedometerOverlay';

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
