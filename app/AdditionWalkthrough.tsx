'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { speakNarration } from '../lib/narration';
import type { QuestionLesson } from '../lib/question-walkthrough';
import { additionWalkthrough } from '../lib/addition-walkthrough';
import './addition-walkthrough.css';

const subscribeSpeech = (listener: () => void) => {
  if (!('speechSynthesis' in window)) return () => {};
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', listener);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', listener);
};
const browserSpeech = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const serverSpeech = () => false;

type Props = { a: number; b: number; missing?: boolean; lesson?: QuestionLesson };

export default function AdditionWalkthrough({ a, b, missing = false, lesson }: Props) {
  const steps = useMemo(() => additionWalkthrough(a, b, missing), [a, b, missing]);
  const activeSteps = lesson?.steps ?? steps;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(false);
  const speechAvailable = useSyncExternalStore(subscribeSpeech, browserSpeech, serverSpeech);
  const [speechError, setSpeechError] = useState('');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const step = activeSteps[index];
  const total = a + b;
  const width = String(total).length;

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      if (cancelled) return;
      if (index === activeSteps.length - 1) setPlaying(false);
      else setIndex(current => current + 1);
    };
    if (voice && speechAvailable) {
      const utterance = speechRef.current?.text === step.text
        ? speechRef.current : speakNarration(step.text);
      let started = window.speechSynthesis.speaking;
      utterance.onstart = () => { started = true; };
      const watchdog = setTimeout(() => {
        if (!cancelled && !started) {
          setSpeechError('Voice has not started. Check that this Chrome tab and your speakers are unmuted, then tap Play with voice again.');
          setPlaying(false);
        }
      }, 8000);
      utterance.onend = () => { clearTimeout(watchdog); timer = setTimeout(advance, 500); };
      utterance.onerror = (event) => {
        clearTimeout(watchdog);
        if (cancelled) return;
        setSpeechError(`Voice could not start (${event.error}). Check Chrome’s tab sound and your speaker volume, then try Play with voice.`);
        setVoice(false);
        setPlaying(false);
      };
      speechRef.current = utterance;

    } else {
      timer = setTimeout(advance, Math.max(4500, step.text.split(' ').length * 320));
    }
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (speechRef.current) {
        speechRef.current.onend = null;
        speechRef.current.onerror = null;
        window.speechSynthesis.cancel();
        speechRef.current = null;
      }
    };
  }, [index, playing, voice, speechAvailable, step.text, activeSteps.length]);

  function startPlayback(withVoice: boolean) {
    const nextIndex = index === activeSteps.length - 1 ? 0 : index;
    setSpeechError('');
    setIndex(nextIndex);
    setVoice(withVoice);
    if (withVoice && speechAvailable) {
      try {
        speechRef.current = speakNarration(activeSteps[nextIndex].text);
      } catch {
        setSpeechError('Chrome could not access a voice. Check the tab sound and try again.');
        setPlaying(false);
        return;
      }
    }
    setPlaying(true);
  }

  const shownSteps = steps.slice(0, index + 1);
  function move(next: number) {
    setPlaying(false);
    setIndex(next);
  }

  return (
    <section className="addition-walkthrough" aria-label="Animated addition explanation">
      <h3>{lesson?.title ?? "Let’s add it together"}</h3>
      {lesson && <div key={index} className="lesson-visual" aria-label="Worked step">{lesson.steps[index].visual}</div>}
      {!lesson && (
      <div className="addition-board" aria-label={`${a} plus ${b} equals ${total}`}>
        <div className="addition-column symbol-column"><span/><span/><span/><span>+</span><span/></div>
        {Array.from({length: width}, (_, visualIndex) => {
          const column = width - visualIndex - 1;
          const resultStep = shownSteps.find(item => item.kind === 'column' && item.column === column);
          const carried = shownSteps.some(item => item.kind === 'carry' && item.column === column);
          const finished = ('kind' in step && step.kind === 'finish');
          const digit = (n: number) => column < String(n).length ? Math.floor(n / 10 ** column) % 10 : '';
          return (
            <div key={column} className={'addition-column ' + (('column' in step ? step.column : -1) === column ? 'is-active' : '')}>
              <small>{['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'][column]}</small>
              <span className={'carry-digit ' + (carried ? 'is-visible' : '')}>{carried ? '1 ↙' : ''}</span>
              <span>{digit(a)}</span>
              <span>{digit(b)}</span>
              <b>{finished ? digit(total) : resultStep?.digit ?? (carried && column >= Math.max(String(a).length, String(b).length) ? 1 : '·')}</b>
            </div>
          );
        })}
      </div>
      )}
      <p className="addition-caption" aria-live="polite">{step.text}</p>
      <div className="addition-controls">
        <button type="button" onClick={() => {
          if (playing) setPlaying(false);
          else startPlayback(voice);
        }}>{playing ? 'Pause' : index === activeSteps.length - 1 ? 'Replay' : '▶ Play steps'}</button>
        <button type="button" disabled={index === 0} onClick={() => move(index - 1)}>Back</button>
        <button type="button" disabled={index === activeSteps.length - 1} onClick={() => move(index + 1)}>Next step</button>
        <button type="button" disabled={!speechAvailable} aria-pressed={voice} onClick={() => {
          if (voice) { setPlaying(false); setVoice(false); }
          else startPlayback(true);
        }}>{voice ? 'Voice on · turn off' : '🔊 Play with voice'}</button>
      </div>
      <small>Step {index + 1} of {activeSteps.length} · {speechAvailable ? 'Tap Play with voice to hear each step.' : 'Voice is unavailable in this browser. Captions show every step.'}</small>
      {speechError && <p role="status">{speechError}</p>}
    </section>
  );
}
