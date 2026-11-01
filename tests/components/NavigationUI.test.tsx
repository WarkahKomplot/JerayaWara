import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TurnBanner } from '../../src/components/navigation/TurnBanner';
import { ModeSelector } from '../../src/components/navigation/ModeSelector';

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
});
