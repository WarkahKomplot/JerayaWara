import { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateVoiceInstruction,
  generateApproachInstruction,
  speakNavigationVoice,
  stopVoiceGuidance,
  isVoiceGuidanceSupported,
  VoiceLanguage
} from '../services/voice/voiceService';
import { TurnStep } from '../services/routing/types';

export function useVoiceNavigation() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jerayawara_voice_enabled');
        return stored !== null ? stored === 'true' : true;
      } catch {
        // Fallback for private browsing / restricted sandboxes
      }
    }
    return true;
  });

  const [voiceLanguage, setVoiceLanguageState] = useState<VoiceLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jerayawara_voice_lang');
        return stored === 'en' ? 'en' : 'ms';
      } catch {
        // Fallback for private browsing / restricted sandboxes
      }
    }
    return 'ms';
  });

  const lastSpokenKeyRef = useRef<string>('');

  const setVoiceLanguage = useCallback((lang: VoiceLanguage) => {
    setVoiceLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jerayawara_voice_lang', lang);
      } catch {
        // Ignore quota/private browsing errors
      }
    }
    speakNavigationVoice(
      lang === 'ms' ? 'Bahasa Melayu dipilih.' : 'English voice selected.',
      isVoiceEnabled,
      lang
    );
  }, [isVoiceEnabled]);

  const toggleVoiceLanguage = useCallback(() => {
    setVoiceLanguage(voiceLanguage === 'ms' ? 'en' : 'ms');
  }, [voiceLanguage, setVoiceLanguage]);

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('jerayawara_voice_enabled', String(next));
        } catch {
          // Ignore quota/private browsing errors
        }
      }
      if (next) {
        speakNavigationVoice(
          voiceLanguage === 'ms' ? 'Panduan suara diaktifkan.' : 'Voice guidance enabled.',
          true,
          voiceLanguage
        );
      } else {
        stopVoiceGuidance();
      }
      return next;
    });
  }, [voiceLanguage]);

  const announceStart = useCallback(
    (destinationName?: string) => {
      const key = `start-${destinationName}-${voiceLanguage}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateVoiceInstruction('start', undefined, destinationName, voiceLanguage);
      speakNavigationVoice(text, isVoiceEnabled, voiceLanguage);
    },
    [isVoiceEnabled, voiceLanguage]
  );

  const announceStep = useCallback(
    (step: TurnStep, index: number) => {
      const key = `step-${index}-${step.id || step.instruction}-${voiceLanguage}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateVoiceInstruction('turn', step, undefined, voiceLanguage);
      speakNavigationVoice(text, isVoiceEnabled, voiceLanguage);
    },
    [isVoiceEnabled, voiceLanguage]
  );

  const announceApproach = useCallback(
    (step: TurnStep, index: number, metersAhead: number) => {
      const key = `approach-${index}-${step.id || step.instruction}-${voiceLanguage}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateApproachInstruction(step, metersAhead, voiceLanguage);
      speakNavigationVoice(text, isVoiceEnabled, voiceLanguage);
    },
    [isVoiceEnabled, voiceLanguage]
  );

  const announceArrive = useCallback(
    (destinationName?: string) => {
      const key = `arrive-${destinationName}-${voiceLanguage}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateVoiceInstruction('arrive', undefined, destinationName, voiceLanguage);
      speakNavigationVoice(text, isVoiceEnabled, voiceLanguage);
    },
    [isVoiceEnabled, voiceLanguage]
  );

  // Reset spoken memory when navigation stops
  const resetVoiceAnnouncements = useCallback(() => {
    lastSpokenKeyRef.current = '';
    stopVoiceGuidance();
  }, []);

  useEffect(() => {
    return () => {
      stopVoiceGuidance();
    };
  }, []);

  return {
    isVoiceEnabled,
    voiceLanguage,
    toggleVoice,
    setVoiceLanguage,
    toggleVoiceLanguage,
    announceStart,
    announceStep,
    announceApproach,
    announceArrive,
    resetVoiceAnnouncements,
    isSupported: isVoiceGuidanceSupported()
  };
}
