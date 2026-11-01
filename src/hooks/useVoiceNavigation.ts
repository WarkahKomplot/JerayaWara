import { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateVoiceInstruction,
  speakNavigationVoice,
  isVoiceGuidanceSupported
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

  const lastSpokenKeyRef = useRef<string>('');

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('jerayawara_voice_enabled', String(next));
      }
      if (next) {
        speakNavigationVoice('Panduan suara diaktifkan.', true);
      } else {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      return next;
    });
  }, []);

  const announceStart = useCallback(
    (destinationName?: string) => {
      const key = `start-${destinationName}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateVoiceInstruction('start', undefined, destinationName);
      speakNavigationVoice(text, isVoiceEnabled);
    },
    [isVoiceEnabled]
  );

  const announceStep = useCallback(
    (step: TurnStep, index: number) => {
      const key = `step-${index}-${step.id || step.instruction}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateVoiceInstruction('turn', step);
      speakNavigationVoice(text, isVoiceEnabled);
    },
    [isVoiceEnabled]
  );

  const announceArrive = useCallback(
    (destinationName?: string) => {
      const key = `arrive-${destinationName}`;
      if (lastSpokenKeyRef.current === key) return;
      lastSpokenKeyRef.current = key;
      const text = generateVoiceInstruction('arrive', undefined, destinationName);
      speakNavigationVoice(text, isVoiceEnabled);
    },
    [isVoiceEnabled]
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
    toggleVoice,
    announceStart,
    announceStep,
    announceArrive,
    resetVoiceAnnouncements,
    isSupported: isVoiceGuidanceSupported()
  };
}
