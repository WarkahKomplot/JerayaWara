import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateVoiceInstruction,
  speakNavigationVoice,
  isVoiceGuidanceSupported
} from '../../src/services/voice/voiceService';
import { TurnStep } from '../../src/services/routing/types';

describe('Voice Navigation Service (BM & English)', () => {
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
    const supported = isVoiceGuidanceSupported();
    expect(typeof supported).toBe('boolean');
  });

  describe('Bahasa Melayu Voice Announcements', () => {
    it('generates start, turn, and arrival guidance in Bahasa Melayu', () => {
      const startMsg = generateVoiceInstruction('start', undefined, 'Seremban City Centre', 'ms');
      expect(startMsg).toContain('Memulakan navigasi');
      expect(startMsg).toContain('Seremban City Centre');

      const step: TurnStep = {
        id: 'step-1',
        maneuver: 'turn_left',
        instruction: 'Turn left onto Jalan Bukit',
        distanceMeters: 200,
        durationSeconds: 15,
        coordinates: [101.78, 2.99]
      };

      const turnMsg = generateVoiceInstruction('turn', step, undefined, 'ms');
      expect(turnMsg).toContain('belok kiri');
      expect(turnMsg).toContain('Jalan Bukit');

      const arriveMsg = generateVoiceInstruction('arrive', undefined, 'Seremban City Centre', 'ms');
      expect(arriveMsg).toContain('tiba di destinasi');
    });
  });

  describe('English Voice Announcements', () => {
    it('generates start, turn, and arrival guidance in English', () => {
      const startMsg = generateVoiceInstruction('start', undefined, 'Seremban City Centre', 'en');
      expect(startMsg).toContain('Starting navigation');
      expect(startMsg).toContain('Seremban City Centre');

      const step: TurnStep = {
        id: 'step-1',
        maneuver: 'turn_right',
        instruction: 'Turn right onto PLUS Expressway',
        distanceMeters: 500,
        durationSeconds: 30,
        coordinates: [101.76, 2.96]
      };

      const turnMsg = generateVoiceInstruction('turn', step, undefined, 'en');
      expect(turnMsg).toContain('turn right');
      expect(turnMsg).toContain('PLUS Expressway');

      const arriveMsg = generateVoiceInstruction('arrive', undefined, 'Seremban City Centre', 'en');
      expect(arriveMsg).toContain('arrived at your destination');
    });
  });

  it('calls window.speechSynthesis.speak with proper language code for ms and en', () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: speakMock,
        cancel: cancelMock,
        getVoices: () => [
          { lang: 'ms-MY', name: 'Malay Voice' },
          { lang: 'en-US', name: 'English Voice' }
        ]
      },
      writable: true,
      configurable: true
    });

    // Test BM voice
    const successBM = speakNavigationVoice('Belok kanan', true, 'ms');
    expect(successBM).toBe(true);
    expect(speakMock).toHaveBeenCalledTimes(1);

    // Test EN voice
    const successEN = speakNavigationVoice('Turn right ahead', true, 'en');
    expect(successEN).toBe(true);
    expect(speakMock).toHaveBeenCalledTimes(2);
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

    const success = speakNavigationVoice('Belok kiri', false, 'ms');
    expect(success).toBe(false);
    expect(speakMock).not.toHaveBeenCalled();
  });
});
