import { useRef, useState, useEffect } from 'react';
import { distanceKm } from '../services/routing/malaysiaRoadNetwork';
import { RouteResult, TurnStep } from '../services/routing/types';

export interface StepProgress {
  /** Index of the current turn step the driver is on. */
  currentStepIndex: number;
  /** Straight-line distance in meters to the END of the current step (the junction). */
  metersToNextTurn: number;
  /**
   * The upcoming step when the driver is within advanceWarningMeters of its
   * junction — null otherwise. UI/voice use this for "In 300 m, turn left".
   */
  approachingStep: TurnStep | null;
  approachingStepIndex: number;
  /** True when the driver is within arrivalRadiusMeters of the final destination. */
  isNearDestination: boolean;
}

/**
 * GPS-driven turn-by-turn progress engine. Advances the current step when the
 * driver passes the step's junction coordinate, and computes approach distances
 * for advance warnings.
 *
 * Step boundaries come from steps[i].coordinates (junction location). A step is
 * passed when the driver gets within stepSwitchRadiusMeters of the NEXT step's
 * junction — simple, robust against GPS jitter on the polyline itself.
 */
export function useStepProgress(
  isNavigating: boolean,
  route: RouteResult | null,
  coords: [number, number] | null,
  options?: {
    /** Distance from the next junction at which the "approaching" warning fires. Default 350m. */
    advanceWarningMeters?: number;
    /** Distance from the next junction at which the current step is advanced. Default 40m. */
    stepSwitchRadiusMeters?: number;
    /** Distance from the destination at which arrival is flagged. Default 60m. */
    arrivalRadiusMeters?: number;
  }
): StepProgress {
  const advanceWarningMeters = options?.advanceWarningMeters ?? 350;
  const stepSwitchRadiusMeters = options?.stepSwitchRadiusMeters ?? 40;
  const arrivalRadiusMeters = options?.arrivalRadiusMeters ?? 60;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [metersToNextTurn, setMetersToNextTurn] = useState(0);
  const [isNearDestination, setIsNearDestination] = useState(false);
  const routeRef = useRef<RouteResult | null>(null);

  useEffect(() => {
    if (!isNavigating || !route || !coords || route.steps.length === 0) {
      return;
    }

    // New route detected: rebind and fall through so progression computes in the
    // same pass (returning here would skip it — reset values equal current state,
    // so no rerender would follow and the effect would never re-run).
    if (routeRef.current !== route) {
      routeRef.current = route;
      setCurrentStepIndex(0);
      setMetersToNextTurn(0);
      setIsNearDestination(false);
    }

    const steps = route.steps;

    // If the user manually selected a step ahead, don't fight them — only
    // auto-advance from the max of (GPS-derived, manual selection).
    // We detect GPS-derived by scanning forward from currentStepIndex.
    let idx = currentStepIndex;

    // Find distance to the next step junction (end of current step)
    const nextJunction = idx + 1 < steps.length ? steps[idx + 1].coordinates : steps[idx].coordinates;
    const dNext = distanceKm(coords, nextJunction) * 1000;

    // Auto-advance: driver is at/just past the next junction
    if (idx + 1 < steps.length && dNext < stepSwitchRadiusMeters) {
      setCurrentStepIndex(idx + 1);
      return;
    }

    // Missed-junction recovery: if the driver is far from the current step's
    // junction AND far from the next one, and closer to a later junction,
    // jump forward (the off-route engine handles full reroutes).
    if (idx + 2 < steps.length && dNext > 500) {
      for (let j = idx + 2; j < Math.min(steps.length, idx + 6); j++) {
        const dJ = distanceKm(coords, steps[j].coordinates) * 1000;
        if (dJ < stepSwitchRadiusMeters) {
          setCurrentStepIndex(j - 1);
          return;
        }
      }
    }

    setMetersToNextTurn(Math.round(dNext));

    // Arrival detection
    const destCoord = steps[steps.length - 1].coordinates;
    const dDest = distanceKm(coords, destCoord) * 1000;
    setIsNearDestination(dDest < arrivalRadiusMeters);
  }, [isNavigating, route, coords, currentStepIndex, stepSwitchRadiusMeters, arrivalRadiusMeters]);

  const steps = route?.steps || [];
  const nextIdx = currentStepIndex + 1;
  const approaching =
    isNavigating &&
    nextIdx < steps.length &&
    metersToNextTurn > 0 &&
    metersToNextTurn <= advanceWarningMeters
      ? steps[nextIdx]
      : null;

  return {
    currentStepIndex,
    metersToNextTurn,
    approachingStep: approaching,
    approachingStepIndex: nextIdx,
    isNearDestination
  };
}
