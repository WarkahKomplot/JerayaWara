import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveActiveNavSession,
  loadActiveNavSession,
  clearActiveNavSession,
  hasActiveNavSession,
  NAV_SESSION_STORAGE_KEY,
  SESSION_MAX_AGE_MS
} from '../../src/services/navigation/navigationSession';
import { RouteResult } from '../../src/services/routing/types';

describe('Active Navigation Session Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleRoute: RouteResult = {
    coordinates: [[101.693, 3.141], [101.680, 3.135]],
    distanceKm: 2.5,
    durationMinutes: 5,
    steps: [
      {
        id: 'step-0',
        maneuver: 'straight',
        instruction: 'Drive south',
        distanceMeters: 2500,
        durationSeconds: 300,
        coordinates: [101.680, 3.135]
      }
    ],
    tollPlazaKeys: [],
    profile: 'car',
    destinationName: 'KL Sentral'
  };

  it('saves and restores active navigation session from localStorage', () => {
    expect(hasActiveNavSession()).toBe(false);

    saveActiveNavSession(sampleRoute, null, 'car', 'KL Sentral');
    expect(hasActiveNavSession()).toBe(true);

    const loaded = loadActiveNavSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.destinationTitle).toBe('KL Sentral');
    expect(loaded?.vehicleMode).toBe('car');
    expect(loaded?.route.distanceKm).toBe(2.5);
  });

  it('clears session on demand', () => {
    saveActiveNavSession(sampleRoute, null, 'car', 'KL Sentral');
    expect(hasActiveNavSession()).toBe(true);

    clearActiveNavSession();
    expect(hasActiveNavSession()).toBe(false);
    expect(loadActiveNavSession()).toBeNull();
  });

  it('expires sessions older than 2.5 hours', () => {
    const expiredTime = Date.now() - (SESSION_MAX_AGE_MS + 60000);
    const expiredSession = {
      route: sampleRoute,
      tollBreakdown: null,
      vehicleMode: 'car',
      destinationTitle: 'Old Trip',
      savedAt: expiredTime
    };

    localStorage.setItem(NAV_SESSION_STORAGE_KEY, JSON.stringify(expiredSession));

    expect(loadActiveNavSession()).toBeNull();
    expect(localStorage.getItem(NAV_SESSION_STORAGE_KEY)).toBeNull();
  });
});

