import { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateVoiceInstruction,
  speakNavigationVoice,
  isVoiceGuidanceSupported,
  VoiceLanguage
} from '../services/voice/voiceService';
import { TurnStep } from '../services/routing/types';

export function useVoiceNavigation() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jerayawara_voice_enabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const [voiceLanguage, setVoiceLanguageState] = useState<VoiceLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jerayawara_voice_lang');
      return stored === 'en' ? 'en' : 'ms';
    }
    return 'ms';
  });

  const lastSpokenKeyRef = useRef<string>('');

  const setVoiceLanguage = useCallback((lang: VoiceLanguage) => {
    setVoiceLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jerayawara_voice_lang', lang);
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
        localStorage.setItem('jerayawara_voice_enabled', String(next));
      }
      if (next) {
        speakNavigationVoice(
          voiceLanguage === 'ms' ? 'Panduan suara diaktifkan.' : 'Voice guidance enabled.',
          true,
          voiceLanguage
        );
      } else {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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
    announceArrive,
    resetVoiceAnnouncements,
    isSupported: isVoiceGuidanceSupported()
  };
}
