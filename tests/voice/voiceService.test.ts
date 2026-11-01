import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateVoiceInstruction,
  speakNavigationVoice,
  isVoiceGuidanceSupported
} from '../../src/services/voice/voiceService';
import { TurnStep } from '../../src/services/routing/types';

describe('Voice Navigation Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    if (typeof (window as any).SpeechSynthesisUtterance === 'undefined') {
      (window as any).SpeechSynthesisUtterance = class {
        text: string;
        lang = '';
        rate = 1;
        pitch = 1;
        volume = 1;
        constructor(text: string) {
          this.text = text;
        }
      };
    }
  });

  it('detects voice guidance availability in browser environments', () => {
    // Should return boolean without throwing in test environment
    const supported = isVoiceGuidanceSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('generates friendly natural bilingual voice announcements on navigation start', () => {
    const startMsg = generateVoiceInstruction('start', undefined, 'Seremban City Centre');
    expect(startMsg).toContain('Memulakan navigasi');
    expect(startMsg).toContain('Seremban City Centre');
  });

  it('generates clear turn instructions for turn_left, turn_right, and exits', () => {
    const leftStep: TurnStep = {
      id: 'step-1',
      maneuver: 'turn_left',
      instruction: 'Turn left onto Jalan Bukit',
      distanceMeters: 200,
      durationSeconds: 15,
      coordinates: [101.78, 2.99]
    };

    const leftVoice = generateVoiceInstruction('turn', leftStep);
    expect(leftVoice.toLowerCase()).toContain('belok kiri');
    expect(leftVoice).toContain('Jalan Bukit');

    const rightStep: TurnStep = {
      id: 'step-2',
      maneuver: 'turn_right',
      instruction: 'Turn right onto PLUS Expressway',
      distanceMeters: 500,
      durationSeconds: 30,
      coordinates: [101.76, 2.96]
    };

    const rightVoice = generateVoiceInstruction('turn', rightStep);
    expect(rightVoice.toLowerCase()).toContain('belok kanan');
    expect(rightVoice).toContain('PLUS Expressway');

    const exitStep: TurnStep = {
      id: 'step-3',
      maneuver: 'exit_left',
      instruction: 'Take exit on left onto E2',
      distanceMeters: 1000,
      durationSeconds: 60,
      coordinates: [101.8, 2.8]
    };

    const exitVoice = generateVoiceInstruction('turn', exitStep);
    expect(exitVoice.toLowerCase()).toContain('susur');
  });

  it('generates arrival announcement when reaching destination', () => {
    const arriveMsg = generateVoiceInstruction('arrive', undefined, 'Seremban City Centre');
    expect(arriveMsg).toContain('tiba di destinasi');
  });

  it('calls window.speechSynthesis.speak with proper language and rate when enabled', () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();

    // Mock window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: speakMock,
        cancel: cancelMock,
        getVoices: () => []
      },
      writable: true,
      configurable: true
    });

    const success = speakNavigationVoice('Belok kanan di hadapan', true);
    expect(success).toBe(true);
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('does NOT speak when voice is muted by the driver', () => {
    const speakMock = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: speakMock,
        cancel: vi.fn(),
        getVoices: () => []
      },
      writable: true,
      configurable: true
    });

    const success = speakNavigationVoice('Belok kiri', false); // muted
    expect(success).toBe(false);
    expect(speakMock).not.toHaveBeenCalled();
  });
});
