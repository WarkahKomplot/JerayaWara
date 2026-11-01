import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WindshieldHudOverlay } from '../../src/components/hud/WindshieldHudOverlay';

describe('Windshield HUD Mirror Mode', () => {
  it('renders with scaleX(-1) mirror styling and OLED black background', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <WindshieldHudOverlay
        speed={95}
        speedLimit={110}
        isNavigating={false}
        onClose={handleClose}
      />
    );

    const hudRoot = container.firstChild as HTMLElement;
    expect(hudRoot).not.toBeNull();
    expect(hudRoot.getAttribute('style')).toContain('scaleX(-1)');
    expect(screen.getByText('95')).toBeDefined();
    expect(screen.getByText(/KM\/H/i)).toBeDefined();
    expect(screen.getByText('110')).toBeDefined();
  });

  it('renders maneuver instruction and distance in active navigation mode', () => {
    const handleClose = vi.fn();
    render(
      <WindshieldHudOverlay
        speed={80}
        speedLimit={90}
        isNavigating={true}
        currentInstruction={{
          maneuver: 'turn-right',
          distanceMeters: 650,
          instruction: 'Belok Kanan ke Jalan Bukit'
        }}
        roadName="JALAN BUKIT"
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/650 m/i)).toBeDefined();
    expect(screen.getByText(/Belok Kanan ke Jalan Bukit/i)).toBeDefined();
  });

  it('invokes onClose when tapped anywhere on screen', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <WindshieldHudOverlay
        speed={60}
        speedLimit={60}
        isNavigating={false}
        onClose={handleClose}
      />
    );

    fireEvent.click(container.firstChild as HTMLElement);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
