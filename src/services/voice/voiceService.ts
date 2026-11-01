import { TurnStep } from '../routing/types';

export type VoiceLanguage = 'ms' | 'en';

/**
 * Checks if the Web Speech API (speechSynthesis) is supported by the current browser/PWA
 */
export function isVoiceGuidanceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Extracts a clean road name from a step instruction
 */
function cleanRoadName(step: TurnStep, lang: VoiceLanguage = 'ms'): string {
  const instr = step.instruction;
  const ontoMatch = instr.match(/(?:onto|ke|di)\s+([^,]+)/i);
  if (ontoMatch && ontoMatch[1]) {
    return ontoMatch[1].trim();
  }
  return lang === 'ms' ? 'laluan utama' : 'the main road';
}

/**
 * Generates natural driving voice instructions in Bahasa Melayu or English
 */
export function generateVoiceInstruction(
  event: 'start' | 'turn' | 'arrive',
  step?: TurnStep,
  destinationName?: string,
  lang: VoiceLanguage = 'ms'
): string {
  const isBM = lang === 'ms';

  if (event === 'start') {
    return isBM
      ? `Memulakan navigasi menuju ke ${destinationName || 'destinasi'}. Pandu dengan cermat.`
      : `Starting navigation to ${destinationName || 'destination'}. Drive safely.`;
  }

  if (event === 'arrive') {
    return isBM
      ? `Anda telah tiba di destinasi, ${destinationName || ''}.`
      : `You have arrived at your destination, ${destinationName || ''}.`;
  }

  if (!step) {
    return isBM ? 'Teruskan di laluan anda.' : 'Continue on your route.';
  }

  const road = cleanRoadName(step, lang);

  if (isBM) {
    switch (step.maneuver) {
      case 'turn_left':
        return `Di hadapan, belok kiri ke ${road}.`;
      case 'turn_right':
        return `Di hadapan, belok kanan ke ${road}.`;
      case 'slight_left':
        return `Kekal di lorong kiri ke ${road}.`;
      case 'slight_right':
        return `Kekal di lorong kanan ke ${road}.`;
      case 'exit_left':
        return `Ambil susur keluar ke kiri ke ${road}.`;
      case 'exit_right':
        return `Ambil susur keluar ke kanan ke ${road}.`;
      case 'u_turn':
        return 'Lakukan pusingan U di hadapan.';
      case 'roundabout':
        return `Di bulatan, teruskan ke ${road}.`;
      case 'arrive':
        return 'Anda telah tiba di destinasi.';
      default:
        return `Teruskan di laluan ${road}.`;
    }
  } else {
    // English
    switch (step.maneuver) {
      case 'turn_left':
        return `In front, turn left onto ${road}.`;
      case 'turn_right':
        return `In front, turn right onto ${road}.`;
      case 'slight_left':
        return `Keep left onto ${road}.`;
      case 'slight_right':
        return `Keep right onto ${road}.`;
      case 'exit_left':
        return `Take the exit on the left onto ${road}.`;
      case 'exit_right':
        return `Take the exit on the right onto ${road}.`;
      case 'u_turn':
        return 'Make a U-turn ahead.';
      case 'roundabout':
        return `At the roundabout, take the exit onto ${road}.`;
      case 'arrive':
        return 'You have arrived at your destination.';
      default:
        return `Continue on ${road}.`;
    }
  }
}

/**
 * Reference to current speaking utterance to prevent browser garbage collection cutoffs
 */
let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Stops any ongoing speech synthesis and releases active utterance
 */
export function stopVoiceGuidance(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
  activeUtterance = null;
}

/**
 * Pronounces the navigation voice prompt through the device's native TTS engine.
 * Retains utterance reference to prevent mobile Chromium/Safari premature GC termination.
 */
export function speakNavigationVoice(
  text: string,
  isEnabled: boolean = true,
  lang: VoiceLanguage = 'ms'
): boolean {
  if (!isEnabled || !isVoiceGuidanceSupported()) {
    return false;
  }

  try {
    stopVoiceGuidance();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ms' ? 'ms-MY' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    activeUtterance = utterance;

    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
    };

    utterance.onerror = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
    };

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ms') {
      const msVoice = voices.find(
        v => v.lang.startsWith('ms') || v.lang.startsWith('id') || v.lang === 'en-MY'
      );
      if (msVoice) utterance.voice = msVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Voice guidance error:', err);
    activeUtterance = null;
    return false;
  }
}
