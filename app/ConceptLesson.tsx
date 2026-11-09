'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { buildConceptLesson, lessonVideos, type ConceptLesson as Lesson } from '../lib/concept-lessons';
import { speakNarration } from '../lib/narration';
import QuestionDiagram from './QuestionDiagram';
import './concept-lesson.css';

function Milo({ celebrating = false }: { celebrating?: boolean }) {
  return <svg className={`lesson-milo ${celebrating ? 'celebrating' : ''}`} viewBox="0 0 140 140" role="img" aria-label="Milo, your learning buddy">
    <ellipse cx="70" cy="123" rx="39" ry="7" fill="#1d43351a" />
    <path d="M33 62 24 14 61 40M107 62 116 14 79 40" fill="#eaa14b" stroke="#734a27" strokeWidth="3" strokeLinejoin="round" />
    <path d="m34 48-5-23 22 22m55 1 5-23-22 22" fill="#f9cdab" />
    <ellipse cx="70" cy="91" rx="39" ry="34" fill="#eaa14b" />
    <path d="M36 57Q70 32 104 57l12 23Q106 109 70 115 34 109 24 80Z" fill="#f2ad54" stroke="#734a27" strokeWidth="3" />
    <path d="M28 77q24-6 42 20 18-26 42-20-4 30-42 36-38-6-42-36" fill="#fff1d7" />
    <circle cx="48" cy="72" r="5" fill="#213c35" /><circle cx="92" cy="72" r="5" fill="#213c35" />
    <circle cx="46" cy="70" r="1.5" fill="white" /><circle cx="90" cy="70" r="1.5" fill="white" />
    <path d="m63 90 7 7 7-7Z" fill="#213c35" /><path d="M61 101q9 10 18 0" fill="none" stroke="#213c35" strokeWidth="3" strokeLinecap="round" />
    <circle cx="39" cy="85" r="6" fill="#ed9381" opacity=".6" /><circle cx="101" cy="85" r="6" fill="#ed9381" opacity=".6" />
    <path d="m45 116 12 9m38-9-12 9" stroke="#734a27" strokeWidth="4" strokeLinecap="round" />
  </svg>;
}

function ExampleModel({ lesson, working }: { lesson: Lesson; working: boolean }) {
  const q = lesson.example;
  if (q.diagram) return <QuestionDiagram diagram={q.diagram} />;
  if (q.topicId === 'multiply' && q.a > 0 && q.a <= 6 && q.b > 0 && q.b <= 6) {
    return <div className="lesson-equal-groups" aria-label={`${q.a} equal groups of ${q.b}`}>
      {Array.from({ length: q.a }, (_, i) => <span key={i}>{'● '.repeat(q.b)}</span>)}
    </div>;
  }
  if (q.topicId === 'addition' && q.a <= 12 && q.b <= 12) {
    if (working && q.a + q.b >= 10) {
      const tens = Math.floor((q.a + q.b) / 10);
      const ones = (q.a + q.b) % 10;
      return <div className="lesson-bundle-model" aria-label={`${tens} ten and ${ones} ones`}>
        <span className="lesson-ten-bundle">{'● '.repeat(10)}<small>10 ones = 1 ten</small></span>
        {tens === 2 && <span className="lesson-ten-bundle">{'● '.repeat(10)}<small>another ten</small></span>}
        <span className="lesson-loose-ones">{'● '.repeat(ones)}<small>{ones} ones</small></span>
      </div>;
    }
    return <div className="lesson-dot-add" aria-label={`${q.a} and ${q.b} counters`}>
      <span>{'● '.repeat(q.a)}</span><b>+</b><span>{'● '.repeat(q.b)}</span>
    </div>;
  }
  if (['addition', 'subtraction', 'multiply', 'division'].includes(q.topicId || '') && /^\d+\s*[+−×÷-]\s*\d+\s*=\s*\?$/.test(q.prompt.trim())) {
    const symbol = { addition: '+', subtraction: '−', multiply: '×', division: '÷' }[q.topicId as 'addition'];
    return <div className="lesson-number-pieces" aria-hidden="true"><span>{q.a}</span><b>{symbol}</b><span>{q.b}</span>{working && <><b>=</b><span>{q.answer}</span></>}</div>;
  }
  return null;
}

const speechSubscribe = (listener: () => void) => {
  if (!('speechSynthesis' in window)) return () => {};
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', listener);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', listener);
};

function StoryPlayer({ lesson }: { lesson: Lesson }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(false);
  const [notice, setNotice] = useState('');
  const speechAvailable = useSyncExternalStore(speechSubscribe,
    () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, () => false);
  const step = lesson.steps[index];
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      if (cancelled) return;
      if (index + 1 === lesson.steps.length) setPlaying(false);
      else setIndex(current => current + 1);
    };
    if (voice && speechAvailable) {
      const utterance = speechRef.current || speakNarration(step.text);
      speechRef.current = utterance;
      let began = window.speechSynthesis.speaking;
      const watchdog = setTimeout(() => {
        if (cancelled || began) return;
        setNotice('Voice has not started. Check the tab and speaker sound, or use Play quietly.');
        setPlaying(false);
      }, 8000);
      utterance.onstart = () => { began = true; };
      utterance.onend = () => { clearTimeout(watchdog); timer = setTimeout(advance, 650); };
      utterance.onerror = () => {
        if (cancelled) return;
        clearTimeout(watchdog);
        setNotice('Voice is unavailable right now. Every word is also shown below.');
        setPlaying(false);
      };
      return () => {
        cancelled = true;
        clearTimeout(watchdog);
        clearTimeout(timer);
        utterance.onend = null;
        utterance.onerror = null;
        window.speechSynthesis.cancel();
        speechRef.current = null;
      };
    }
    timer = setTimeout(advance, Math.max(4500, step.text.split(' ').length * 340));
    return () => { cancelled = true; clearTimeout(timer); };
  }, [index, playing, voice, speechAvailable, step.text, lesson.steps.length]);

  function play(withVoice: boolean) {
    const next = index === lesson.steps.length - 1 ? 0 : index;
    setNotice('');
    setIndex(next);
    setVoice(withVoice);
    if (withVoice && speechAvailable) {
      try { speechRef.current = speakNarration(lesson.steps[next].text); }
      catch { setNotice('Voice could not start. You can play quietly and read every step.'); return; }
    }
    setPlaying(true);
  }

  function move(to: number) {
    setPlaying(false);
    setIndex(to);
  }

  const isExample = step.scene === 'example' || step.scene === 'work';
  const chapter = { discover: 'Meet the idea', example: 'Try one together', work: 'One little step', remember: 'Keep this little trick' }[step.scene];
  return <div className="concept-story-player">
    <div className="concept-playback">
      <button type="button" className="concept-main-play" onClick={() => playing ? setPlaying(false) : play(speechAvailable)}>
        {playing ? <Pause size={18} /> : <Play size={18} />}{playing ? 'Pause story' : index === lesson.steps.length - 1 ? 'Play again' : speechAvailable ? 'Play with voice' : 'Play story'}
      </button>
      <button type="button" aria-label="Previous lesson step" disabled={index === 0} onClick={() => move(index - 1)}><ArrowLeft size={18} /></button>
      <button type="button" aria-label="Next lesson step" disabled={index === lesson.steps.length - 1} onClick={() => move(index + 1)}><ArrowRight size={18} /></button>
      <button type="button" aria-label="Replay lesson from beginning" onClick={() => move(0)}><RotateCcw size={17} /></button>
      <button type="button" aria-label={voice ? 'Turn lesson voice off' : 'Play lesson quietly'} onClick={() => { setPlaying(false); setVoice(false); play(false); }}><VolumeX size={17} /></button>
    </div>
    <div className="concept-story-stage" key={index}>
      <div className="concept-story-chapter"><span>{chapter}</span><small>{index + 1} / {lesson.steps.length}</small></div>
      <div className={`concept-story-art scene-${step.scene}`}>
        {isExample ? <>
          <span className="concept-example-label">WORKED EXAMPLE · NOT YOUR GAME QUESTION</span>
          <ExampleModel lesson={lesson} working={step.scene === 'work'} />
          <div className="concept-work-visual">{step.visual}</div>
        </> : <>
          <div className="concept-milo-scene"><span className="concept-scene-spark">✦</span><Milo celebrating={step.scene === 'remember'} /><span className="concept-story-object">{lesson.icon}</span></div>
          <strong>{step.scene === 'remember' ? 'A little idea. A big next step.' : index === 0 ? 'An adventure with Milo' : step.visual}</strong>
        </>}
      </div>
      <p className="concept-story-caption" aria-live="polite">{step.text}</p>
    </div>
    <div className="concept-story-track" aria-label={`Lesson step ${index + 1} of ${lesson.steps.length}`}>
      {lesson.steps.map((_, position) => <i key={position} className={position <= index ? 'filled' : ''} />)}
    </div>
    <p className="concept-playback-note">Your pace, always. Use the arrows or play the story. {speechAvailable ? 'Voice uses your browser’s available English voice.' : 'Voice is unavailable here; captions include the complete lesson.'}</p>
    {notice && <p role="status" className="concept-voice-notice">{notice}</p>}
  </div>;
}

export default function ConceptLesson({ skill, level, activePrompt, openedVideoIds, introductory, recovery, onFinish }: {
  skill: number;
  level: number;
  activePrompt: string;
  openedVideoIds: string[];
  introductory: boolean;
  recovery: boolean;
  onFinish: (outcome: 'explored' | 'skipped', videos: string[]) => void;
}) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const lesson = useMemo(() => buildConceptLesson(skill, level, activePrompt), [skill, level, activePrompt]);
  const videos = useMemo(() => lessonVideos(skill, level), [skill, level]);
  const [mode, setMode] = useState<'story' | 'video'>('video');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const [engaged, setEngaged] = useState(false);
  // Capture the host once: fullscreening the dialog must never portal it into itself.
  const [portalHost] = useState<Element | null>(() => typeof document === 'undefined'
    ? null : document.fullscreenElement || document.body);
  const [full, setFull] = useState(false);
  const [fullNotice, setFullNotice] = useState('');
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mounted) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root.current?.focus();
    const syncFullscreen = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.body.style.overflow = oldOverflow;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (previous?.isConnected) previous.focus();
      else document.getElementById('concept-lesson-trigger')?.focus();
    };
  }, [mounted]);

  function finish(skip: boolean) {
    onFinish(skip || !engaged ? 'skipped' : 'explored', opened);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === root.current) await document.exitFullscreen();
      else await root.current?.requestFullscreen();
      setFull(document.fullscreenElement === root.current);
    } catch { setFullNotice('Fullscreen is unavailable here. The lesson still fits your screen.'); }
  }

  if (!mounted || !portalHost) return null;
  return createPortal(<div className="concept-lesson-backdrop" onKeyDown={event => {
    if (event.key === 'Escape' && !document.fullscreenElement) { event.preventDefault(); finish(true); }
    if (event.key !== 'Tab') return;
    const items = [...(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], iframe') || [])];
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
  }}>
    <section className="concept-lesson-dialog" ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="concept-lesson-title">
      <header className="concept-lesson-header">
        <div className="concept-lesson-brand"><BookOpen size={18} /><span>{recovery ? 'Let’s untangle it' : introductory ? 'A new little discovery' : 'Your lesson shelf'}</span></div>
        <div><button type="button" aria-label={full ? 'Exit lesson fullscreen' : 'Make lesson fullscreen'} onClick={() => void toggleFullscreen()}>{full ? <Minimize size={18} /> : <Maximize size={18} />}</button>
          <button type="button" aria-label="Skip lesson and return to question" onClick={() => finish(true)}><X size={20} /></button></div>
      </header>
      <div className="concept-lesson-scroll">
        <div className="concept-lesson-heading"><span className="concept-lesson-kicker">LEARN A LITTLE. TRY IT YOURSELF.</span><h1 id="concept-lesson-title">{lesson.title}</h1><p>{lesson.goal}</p></div>
        <div className="concept-mode-buttons" role="group" aria-label="Choose how to learn">
          <button type="button" aria-pressed={mode === 'video'} onClick={() => setMode('video')}><Play size={18} /> Watch a video <small>{videos.length ? `${videos.length} handpicked option${videos.length === 1 ? '' : 's'}` : 'Video shelf'}</small></button>
          <button type="button" aria-pressed={mode === 'story'} onClick={() => { setMode('story'); setSelectedVideo(null); }}><span>✦</span> Milo’s story <small>Animation + voice</small></button>
        </div>
        <div onClick={() => setEngaged(true)} onKeyDown={() => setEngaged(true)}>
          {mode === 'story' ? <StoryPlayer lesson={lesson} /> : <div className="concept-video-shelf">
            <p className="concept-video-intro">Another way to see the idea. These videos may cover more than this one step; Milo’s story matches your current example.</p>
            {!videos.length && <div className="concept-video-empty"><span>🌱</span><h2>A clear story is ready for you.</h2><p>We haven’t selected a close enough video for this step yet. You can learn with Milo now.</p><button type="button" onClick={() => setMode('story')}>Open Milo’s story →</button></div>}
            <div className="concept-video-choices">{videos.map(video => <button type="button" key={video.id} aria-pressed={selectedVideo === video.id} onClick={() => {
              setSelectedVideo(video.id);
              setOpened(current => [...new Set([...current, video.id])]);
            }}><span className="concept-video-play"><Play size={20} /></span><span><strong>{video.title}</strong><small>{video.channel}</small>{openedVideoIds.includes(video.id) && <em>Opened before · replay if you like</em>}</span>{selectedVideo === video.id && <Check size={18} />}</button>)}</div>
            {selectedVideo && <div className="concept-video-player"><iframe key={selectedVideo} title={videos.find(video => video.id === selectedVideo)?.title} src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?rel=0`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              <p>Not playing? <a href={`https://www.youtube.com/watch?v=${selectedVideo}`} target="_blank" rel="noreferrer">Open this video on YouTube ↗</a>. Your question clock stays paused.</p></div>}
          </div>}
        </div>
        {fullNotice && <p role="status">{fullNotice}</p>}
      </div>
      <footer className="concept-lesson-footer"><span><Volume2 size={15} /> No timer. No marks. Just a little help.</span><div>
        <button type="button" className="concept-skip" onClick={() => finish(true)}>Skip learning</button>
        <button type="button" className="concept-ready" onClick={() => finish(false)}>{recovery ? 'Let me try again' : 'I’m ready to try'} <ArrowRight size={18} /></button>
      </div></footer>
    </section>
  </div>, portalHost);
}
