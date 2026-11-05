/**
 * Active Navigation Session Persistence & Auto-Resume
 *
 * Saves the active navigation state (route, vehicle mode, destination, tolls)
 * to localStorage so that accidental browser refreshes, iOS Safari memory evictions,
 * or background task reloads can resume the active trip with zero user friction.
 */

import { RouteResult } from '../routing/types';
import { VehicleClass, TollBreakdown } from '../toll/types';

export const NAV_SESSION_STORAGE_KEY = 'jerayawara_active_session_v1';
export const SESSION_MAX_AGE_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours

export interface ActiveNavSession {
  route: RouteResult;
  tollBreakdown: TollBreakdown | null;
  vehicleMode: VehicleClass;
  destinationTitle?: string;
  savedAt: number;
}

export function saveActiveNavSession(
  route: RouteResult,
  tollBreakdown: TollBreakdown | null,
  vehicleMode: VehicleClass,
  destinationTitle?: string
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const session: ActiveNavSession = {
      route,
      tollBreakdown,
      vehicleMode,
      destinationTitle,
      savedAt: Date.now()
    };
    localStorage.setItem(NAV_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Gracefully handle storage quota or privacy mode errors
  }
}

export function loadActiveNavSession(): ActiveNavSession | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = localStorage.getItem(NAV_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session: ActiveNavSession = JSON.parse(raw);
    if (!session || !session.route || !Array.isArray(session.route.coordinates)) {
      clearActiveNavSession();
      return null;
    }

    // Expire old sessions
    const age = Date.now() - (session.savedAt || 0);
    if (age > SESSION_MAX_AGE_MS || age < 0) {
      clearActiveNavSession();
      return null;
    }

    return session;
  } catch {
    clearActiveNavSession();
    return null;
  }
}

export function clearActiveNavSession(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(NAV_SESSION_STORAGE_KEY);
  } catch {
    // Graceful
  }
}

export function hasActiveNavSession(): boolean {
  return loadActiveNavSession() !== null;
}
