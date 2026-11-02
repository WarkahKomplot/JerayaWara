import { describe, it, expect, vi } from 'vitest';
import {
  extractOsrmLaneGuidance,
  isActuallyOnline,
  resetLivenessCacheForTest
} from '../../src/services/routing/routingEngine';
import { generateApproachInstruction, generateNowInstruction } from '../../src/services/voice/voiceService';
import { TurnStep } from '../../src/services/routing/types';

const turnStep: TurnStep = {
  id: 's1',
  maneuver: 'turn_right',
  instruction: 'Turn right onto Jalan Test',
  distanceMeters: 300,
  durationSeconds: 30,
  coordinates: [101.7, 3.09]
};

describe('OSRM lane guidance extraction', () => {
  it('produces "Use lane N of M" for a single valid lane', () => {
    const hint = extractOsrmLaneGuidance(
      { intersections: [{ lanes: [{ valid: false }, { valid: true }, { valid: false }] }] },
      'turn_right'
    );
    expect(hint).toBe('Use lane 2 of 3 for the upcoming turn');
  });

  it('produces "Use lanes N and M" for two adjacent valid lanes', () => {
    const hint = extractOsrmLaneGuidance(
      { intersections: [{ lanes: [{ valid: true }, { valid: true }, { valid: false }] }] },
      'exit_left'
    );
    expect(hint).toBe('Use lanes 1 and 2 of 3 for the upcoming turn');
  });

  it('names two adjacent valid lanes even in the upper half', () => {
    const hint = extractOsrmLaneGuidance(
      { intersections: [{ lanes: [{ valid: false }, { valid: false }, { valid: true }, { valid: true }] }] },
      'turn_right'
    );
    expect(hint).toBe('Use lanes 3 and 4 of 4 for the upcoming turn');
  });

  it('falls back to side wording for non-adjacent valid lanes', () => {
    const hint = extractOsrmLaneGuidance(
      { intersections: [{ lanes: [{ valid: true }, { valid: false }, { valid: false }, { valid: true }] }] },
      'turn_right'
    );
    expect(hint).toBe('Keep to the left lanes of 4 for the upcoming turn');
  });

  it('returns undefined when all lanes are valid (no guidance needed)', () => {
    expect(
      extractOsrmLaneGuidance(
        { intersections: [{ lanes: [{ valid: true }, { valid: true }] }] },
        'turn_left'
      )
    ).toBeUndefined();
  });

  it('tolerates missing intersections / malformed data', () => {
    expect(extractOsrmLaneGuidance({}, 'turn_left')).toBeUndefined();
    expect(extractOsrmLaneGuidance({ intersections: [{}] }, 'turn_left')).toBeUndefined();
    expect(extractOsrmLaneGuidance({ intersections: [{ lanes: 'garbage' }] }, 'turn_left')).toBeUndefined();
  });

  it('skips straight/arrive/roundabout maneuvers', () => {
    expect(
      extractOsrmLaneGuidance(
        { intersections: [{ lanes: [{ valid: false }, { valid: true }] }] },
        'straight'
      )
    ).toBeUndefined();
  });
});

describe('Two-stage voice cadence', () => {
  it('approach instruction prefixes distance and strips duplicate "in front"', () => {
    const bm = generateApproachInstruction(turnStep, 320, 'ms');
    expect(bm).toBe('Dalam 300 meter, belok kanan ke Jalan Test.');
    const en = generateApproachInstruction(turnStep, 320, 'en');
    expect(en).toBe('In 300 meters, turn right onto Jalan Test.');
  });

  it('approach instruction rounds distances to natural increments', () => {
    expect(generateApproachInstruction(turnStep, 843, 'en')).toContain('850 meters');
    expect(generateApproachInstruction(turnStep, 87, 'en')).toContain('90 meters');
  });

  it('now instruction prefixes "Sekarang"/"Now"', () => {
    expect(generateNowInstruction(turnStep, 'ms')).toBe('Sekarang, belok kanan ke Jalan Test.');
    expect(generateNowInstruction(turnStep, 'en')).toBe('Now, turn right onto Jalan Test.');
  });
});

describe('Connectivity liveness check', () => {
  // jsdom's onLine lives on the prototype and cannot be 'restored' from a saved
  // instance descriptor — manage it explicitly per test instead.
  const setOnLine = (value: boolean) =>
    Object.defineProperty(window.navigator, 'onLine', { value, configurable: true });

  it('returns false immediately when navigator.onLine is false', async () => {
    setOnLine(false);
    const start = Date.now();
    expect(await isActuallyOnline()).toBe(false);
    // Must not have waited for any network probe
    expect(Date.now() - start).toBeLessThan(500);
  });

  it('probes and caches the result for 15s when onLine is true', async () => {
    setOnLine(true);
    resetLivenessCacheForTest();
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{"code":"Ok"}', { status: 200 }));
    try {
      expect(await isActuallyOnline()).toBe(true);
      expect(await isActuallyOnline()).toBe(true);
      // Second call served from cache — only one probe
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
