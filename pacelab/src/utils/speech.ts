export function speakSpeed(formattedSpeed: string, unit: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const cleanUnit = unit === 'km/h' ? 'kilometres per hour' : unit === 'mph' ? 'miles per hour' : 'metres per second';
    const text = `${formattedSpeed} ${cleanUnit}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1; // crisp, brisk pace
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis error suppressed
  }
}
