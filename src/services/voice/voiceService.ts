import { TurnStep } from '../routing/types';

/**
 * Checks if the Web Speech API (speechSynthesis) is supported by the current browser/PWA
 */
export function isVoiceGuidanceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Extracts a clean road name from a step instruction
 */
function cleanRoadName(step: TurnStep): string {
  const instr = step.instruction;
  const ontoMatch = instr.match(/(?:onto|ke|di)\s+([^,]+)/i);
  if (ontoMatch && ontoMatch[1]) {
    return ontoMatch[1].trim();
  }
  return 'laluan utama';
}

/**
 * Generates natural Malaysian driving voice instructions
 */
export function generateVoiceInstruction(
  event: 'start' | 'turn' | 'arrive',
  step?: TurnStep,
  destinationName?: string
): string {
  if (event === 'start') {
    return `Memulakan navigasi menuju ke ${destinationName || 'destinasi'}. Pandu dengan cermat.`;
  }

  if (event === 'arrive') {
    return `Anda telah tiba di destinasi, ${destinationName || ''}.`;
  }

  if (!step) {
    return 'Teruskan perjalanan di laluan anda.';
  }

  const road = cleanRoadName(step);

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
      return `Anda telah tiba di destinasi.`;
    default:
      return `Teruskan di laluan ${road}.`;
  }
}

/**
 * Pronounces the navigation voice prompt through the device's native TTS engine
 */
export function speakNavigationVoice(
  text: string,
  isEnabled: boolean = true,
  preferredLang: string = 'ms-MY'
): boolean {
  if (!isEnabled || !isVoiceGuidanceSupported()) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick Malay or Indonesian or Malaysian English voice if installed
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      v =>
        v.lang.startsWith('ms') ||
        v.lang.startsWith('id') ||
        v.lang === 'en-MY' ||
        v.lang.startsWith('en')
    );
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Voice guidance error:', err);
    return false;
  }
}
