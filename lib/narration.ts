export function selectNarrationVoice<T extends {lang: string; localService: boolean}>(voices: readonly T[]): T | undefined {
  const english = voices.filter(voice => /^en(?:-|_)/i.test(voice.lang));
  return english.find(voice => voice.localService) ?? english[0];
}

export function speakNarration(text: string) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectNarrationVoice(synth.getVoices());
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.volume = 1;
  synth.cancel();
  synth.resume();
  synth.speak(utterance);
  return utterance;
}
