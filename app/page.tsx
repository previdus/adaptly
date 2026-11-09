'use client';

import ParentLearningReport from './ParentLearningReport';
import { exportParentCsv, getLearningGoal } from '../lib/parent-insights';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Download,
  LogOut,
  Play,
  Plus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  advanceTopicProgress,
  budget,
  generate,
  nextConcept,
  progressFromTopic,
  skills,
  skillsForTopic,
  skillMatchesTopic,
  isGrammarTopic,
  stageForTopic,
  stats,
  topicInfo,
  topics,
  type Attempt,
  type Question,
  type Student,
  type TopicId,
} from '../lib/learning';
import { isCurriculumTopic } from '../lib/curriculum-catalog';
import { curriculumPool, curriculumSkillStart } from '../lib/curriculum';
import ConceptLesson from './ConceptLesson';
import { openedLessonVideos, recordLessonVisit, shouldIntroduceLesson } from '../lib/concept-lessons';
import PlayArena from './PlayArena';
import ArenaHub from './ArenaHub';
import MathSprint from './MathSprint';
import './game-select.css';
import GameChooser from './GameChooser';
import AdaptiveStory from './AdaptiveStory';
import './game-chooser.css';
import './responsive-overrides.css';
import './ux/ux-variants.css';
import {
  exportClassroomCsv,
  summarizeClassroom,
} from '../lib/classroom-report';
import { MAX_FAMILY_LEARNERS } from '../lib/state-repair';
import {
  resolveUxVariant,
  uxCapabilities,
  type UXVariantId,
} from '../lib/ux-variants';
import UxLabSwitcher from './ux/UxLabSwitcher';
import QuestMapHome from './ux/QuestMapHome';
import TactileWorkbenchHome from './ux/TactileWorkbenchHome';
import ArcadeStageHome from './ux/ArcadeStageHome';

type Family = {
  students: Student[];
  active: number;
};

type FamilyApiResponse = {
  state?: Family | null;
  email?: string;
  ok?: boolean;
  error?: string;
};

function conceptExample(index: number) {
  const topic = skills[index]?.topic;
  if (isCurriculumTopic(topic)) {
    const example = curriculumPool(topic, index - curriculumSkillStart(topic), 1)[0];
    return `${example.prompt} → ${example.answer}`;
  }

  const examples = [
    '4 baskets with 3 apples each → 4 × 3 = 12',
    '3 rows of 5 stars → 3 × 5 = 15',
    '7 × 8 = 56 · builds towards facts up to 12 × 12',
    '40 × 3 = 120 · later: 400 × 3 = 1,200',
    '23 × 3 = 69 · each digit product stays below 10',
    '27 × 3 = 81 · regroup 21 ones as 2 tens and 1 one',
    '24 × 12 = (24 × 10) + (24 × 2) = 288',
    '6 boxes of 8 cookies → 6 × 8 = 48',
    '4 + 3 = 7, then 8 + 6 = 14, then 24 + 35 = 59',
    '38 + 27 = 65 · carry from the ones into the tens',
    '248 + 175 = 423 · regroup ones and tens',
    '27 + □ = 63 → □ = 36',
    '28 red marbles + 37 blue = 65 marbles',
    '74 − 32 = 42 · subtract each column',
    '52 − 28 = 24 · trade one ten for ten ones',
    '500 − 276 = 224 · regroup across zero',
    '83 − □ = 46 → □ = 37',
    '65 stickers − 28 used = 37 left',
    '24 shared into 4 equal groups → 6 in each',
    '56 ÷ 7 = 8 · use 7 × 8 = 56',
    '144 ÷ 12 = 12 · check 12 × 12',
    '29 ÷ 5 leaves remainder 4',
    'Share 48 cards among 6 players → 8 each',
    'Factors of 12 and 18 overlap at 1, 2, 3, 6',
    'HCF of 24 and 36 = 12',
    'Cut 24 cm and 36 cm ribbons into 12 cm pieces',
    'Multiples of 4: 4, 8, 12… · of 6: 6, 12…',
    'LCM of 8 and 12 = 24',
    'A bell every 8 min and 12 min rings together in 24 min',
  ];
  const english = [
    'A backpack is a thing noun.',
    'She can replace Maya in a sentence.',
    'Yesterday we danced; tomorrow we will dance.',
    'A fluffy rabbit hopped quickly.',
    'The cat sits; the cats sit.',
    '“Under the old tree” is a fragment.',
    'Start names and sentences with capitals.',
    '“Under” tells where; “because” joins ideas.',
  ];
  return (
    examples[index] ||
    english[index - 29] ||
    'Try an example question to see this skill in action.'
  );
}

export default function Page() {
  const [family, setFamily] = useState<Family | null>(null);
  const [email, setEmail] = useState('');
  const [view, setView] = useState('home');
  const [auth, setAuth] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [demo, setDemo] = useState(false);

  const [q, setQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<Attempt | null>(null);
  const [hint, setHint] = useState(false);
  const [help, setHelp] = useState<number | null>(null);
  const [lessonIntro, setLessonIntro] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [count, setCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [misses, setMisses] = useState<Record<number, number>>({});
  const [activeTopic, setActiveTopic] = useState<TopicId>('multiply');
  const [uxVariant, setUxVariant] = useState<UXVariantId>('a');
  const [reportTab, setReportTab] = useState<'learner' | 'classroom'>('learner');
  const [classroomTopicFilter, setClassroomTopicFilter] = useState<
    TopicId | 'all'
  >('all');

  const audioRef = useRef<AudioContext | null>(null);
  const lastTick = useRef(-1);
  const started = useRef(0);
  const hiddenAt = useRef(0);
  const saveQueue = useRef(Promise.resolve());
  const currentFamily = useRef<Family | null>(null);

  const student = family?.students[family.active] || null;
  const attempts = useMemo(() => student?.attempts ?? [], [student]);
  const classroom = useMemo(
    () =>
      family ? summarizeClassroom(family.students, classroomTopicFilter) : null,
    [family, classroomTopicFilter]
  );
  const correct = attempts.filter((x) => x.correct).length;

  useEffect(() => {
    started.current = Date.now();
    const searchParams = new URLSearchParams(location.search);
    const roomParam = searchParams.get('room');
    if (roomParam && /^[A-HJ-NP-Z2-9]{5}$/i.test(roomParam)) {
      setTimeout(() => setView('arena'), 0);
    }
    const rawUx =
      searchParams.get('ux') ||
      (() => {
        try {
          return sessionStorage.getItem('adaptly-ux-variant');
        } catch {
          return null;
        }
      })();
    if (rawUx) {
      const resolved = resolveUxVariant(rawUx, 'a');
      setTimeout(() => setUxVariant(resolved), 0);
    }
    fetch('/api/family')
      .then((r) => r.json() as Promise<FamilyApiResponse>)
      .then((d) => {
        if (d.state) {
          setFamily(d.state);
          currentFamily.current = d.state;
          setEmail(d.email || '');
        } else if (d.error) {
          setError(d.error);
        }
      })
      .catch(() =>
        setError('Connection unavailable. You can still try the demo.')
      )
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!q || result || help !== null || paused) return;
    const id = setInterval(
      () => setElapsed((Date.now() - started.current) / 1000),
      200
    );
    return () => clearInterval(id);
  }, [q, result, help, paused]);

  useEffect(() => {
    const fn = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current) {
        started.current += Date.now() - hiddenAt.current;
        hiddenAt.current = 0;
      }
    };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  function persist(nextState: Family) {
    setFamily(nextState);
    currentFamily.current = nextState;
    if (demo) return;
    setSaveStatus('Saving…');
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        const r = await fetch('/api/family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', state: nextState }),
        });
        const d = (await r.json()) as FamilyApiResponse;
        if (!r.ok) {
          throw new Error(d.error || 'Progress could not be saved.');
        }
        setSaveStatus('Saved securely');
      } catch (e: unknown) {
        setSaveStatus('Not saved — retry');
        setError(
          e instanceof Error ? e.message : 'Progress could not be saved.'
        );
      }
    });
  }

  function changeUxVariant(next: UXVariantId) {
    setUxVariant(next);
    try {
      sessionStorage.setItem('adaptly-ux-variant', next);
      const url = new URL(location.href);
      url.searchParams.set('ux', next);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore storage or URL history failures in restricted contexts
    }
  }

  function tryDemo() {
    const nextState: Family = {
      students: [{ id: 'demo', name: 'Explorer', attempts: [] }],
      active: 0,
    };
    setFamily(nextState);
    currentFamily.current = nextState;
    setDemo(true);
    setError('');
  }

  async function authenticate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'identify' }),
      });
      const d = (await r.json()) as FamilyApiResponse;
      if (!r.ok || !d.state) {
        throw new Error(d.error || 'Could not load your family profile.');
      }
      setFamily(d.state);
      currentFamily.current = d.state;
      setEmail(String(data.email));
      setDemo(false);
      setAuth('');
      setView('home');
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : 'Could not load your family profile.'
      );
    } finally {
      setBusy(false);
    }
  }

  const progressFor = useCallback(
    (
      topic: TopicId,
      as: Attempt[] = attempts,
      learner: Student | null = student
    ) => {
      return (
        learner?.topicProgress?.[topic] ??
        (topic === 'multiply' && learner?.progress
          ? learner.progress
          : progressFromTopic(topic, as))
      );
    },
    [attempts, student]
  );

  const newQuestion = useCallback(
    (
      skill: number,
      forceEasy = false,
      as: Attempt[] = attempts,
      topic: TopicId = activeTopic
    ) => {
      lastTick.current = -1;
      const progress = progressFor(topic, as);
      const level = forceEasy
        ? 1
        : stageForTopic(topic, progress.stage).level;
      const topicAttempts = as.filter((a) => skillMatchesTopic(a.skill, topic));
      const previous = topicAttempts.map((attempt) => attempt.prompt);
      setQ(generate(skill, level, previous, progress.run));
      const state = currentFamily.current;
      const learner = state?.students[state.active];
      const introduce = shouldIntroduceLesson(learner, skill, level);
      setLessonIntro(introduce);
      setIsRecovery(false);
      setHelp(introduce ? skill : null);
      setAnswer('');
      setResult(null);
      setHint(false);
      setElapsed(0);
      setPaused(false);
      started.current = Date.now();
    },
    [activeTopic, attempts, progressFor]
  );

  function start(selection: TopicId | number = activeTopic) {
    const chosenSkill = typeof selection === 'number' ? selection : null;
    const topic =
      chosenSkill !== null
        ? skills[chosenSkill]?.topic ?? activeTopic
        : (selection as TopicId);
    if (!family) {
      setActiveTopic(topic);
      setAuth('signup');
      return;
    }
    setActiveTopic(topic);
    setCount(0);
    setStreak(0);
    setMisses({});
    setView('practice');
    const progress = progressFor(topic);
    const target = chosenSkill ?? nextConcept(progress, attempts, topic);
    if (target < 0) {
      setQ(null);
      setView('summary');
      return;
    }
    newQuestion(target, false, attempts, topic);
  }

  const playTone = useCallback(
    (kind: 'correct' | 'tick' | 'urgent' | 'finish') => {
      if (!sound) return;
      try {
        const ctx = audioRef.current ?? (audioRef.current = new AudioContext());
        void ctx.resume();
        const notes =
          kind === 'correct'
            ? [523, 659, 784]
            : kind === 'finish'
              ? [659, 784, 1047]
              : kind === 'urgent'
                ? [740]
                : [440];
        notes.forEach((frequency, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = frequency;
          o.connect(g);
          g.connect(ctx.destination);
          const at = ctx.currentTime + i * 0.095;
          g.gain.setValueAtTime(0, at);
          g.gain.linearRampToValueAtTime(
            kind === 'urgent' ? 0.035 : 0.025,
            at + 0.008
          );
          g.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
          o.start(at);
          o.stop(at + 0.14);
        });
      } catch {
        // Ignore WebAudio restrictions when user has not interacted
      }
    },
    [sound]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q || result || !family || answer.trim() === '') return;
    const ok =
      typeof q.answer === 'number'
        ? Number(answer) === q.answer
        : answer.trim().toLocaleLowerCase() === q.answer.toLocaleLowerCase();
    const a: Attempt = {
      skill: q.skill,
      level: q.level,
      correct: ok,
      seconds: Math.round(elapsed * 10) / 10,
      hinted: hint,
      at: Date.now(),
      prompt: q.prompt,
      answer: q.answer,
      given: answer,
      learningGoal: q.learningGoal || getLearningGoal(q.skill, q.level),
      answerFormat: q.options ? 'choice' : 'typed',
    };
    setResult(a);
    setStreak(ok ? streak + 1 : 0);
    setMisses({ ...misses, [q.skill]: ok ? 0 : (misses[q.skill] || 0) + 1 });

    const nextState = structuredClone(family);
    const learner = nextState.students[nextState.active];
    learner.attempts = [...attempts, a].slice(-2000);
    const topicProgress = advanceTopicProgress(
      activeTopic,
      progressFor(activeTopic),
      a
    );
    learner.topicProgress = {
      ...learner.topicProgress,
      [activeTopic]: topicProgress,
    };
    if (activeTopic === 'multiply') {
      learner.progress = topicProgress;
    }
    persist(nextState);
    if (sound && ok) playTone('correct');
  }

  const next = useCallback(() => {
    if (!q) return;
    if (!result?.correct && (misses[q.skill] || 0) >= 2) {
      setHelp(q.skill);
      setIsRecovery(true);
      return;
    }
    setCount((c) => c + 1);
    const target = nextConcept(progressFor(activeTopic), attempts, activeTopic);
    if (target < 0) {
      setQ(null);
      setView('summary');
      return;
    }
    newQuestion(target, false, attempts, activeTopic);
  }, [activeTopic, attempts, misses, newQuestion, progressFor, q, result]);

  function closeHelp(outcome: 'explored' | 'skipped' = 'explored', videos: string[] = []) {
    const s = help;
    const state = currentFamily.current;
    if (s !== null && state) {
      const nextState = structuredClone(state);
      nextState.students[nextState.active] = recordLessonVisit(
        nextState.students[nextState.active], s,
        view === 'practice' && q?.skill === s ? q.level : 1,
        outcome, videos,
      );
      persist(nextState);
    }
    setLessonIntro(false);
    setHelp(null);
    if (isRecovery && s !== null) {
      setIsRecovery(false);
      setMisses({ ...misses, [s]: 0 });
      setCount((c) => c + 1);
      newQuestion(s);
    } else {
      started.current = Date.now() - elapsed * 1000;
    }
  }

  function reportDownload() {
    const csvContent =
      reportTab === 'classroom' && family
        ? exportClassroomCsv(family.students)
        : exportParentCsv(student || {id: '', name: '', attempts: []});
    const url = URL.createObjectURL(
      new Blob([csvContent], { type: 'text/csv' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download =
      reportTab === 'classroom'
        ? 'adaptly-classroom-report.csv'
        : 'adaptly-learning-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (
      result &&
      !result.correct &&
      q &&
      (misses[q.skill] || 0) >= 2 &&
      help === null
    ) {
      const id = setTimeout(() => {
        setIsRecovery(true);
        setHelp(q.skill);
      }, 1800);
      return () => clearTimeout(id);
    }
  }, [result, q, misses, help]);


  const time = q ? budget(attempts, q.skill, q.level, q) : 40;
  const topic = topicInfo(activeTopic);
  const topicSkills = skillsForTopic(activeTopic);
  const totalStages = stageForTopic(activeTopic, 100000).stage + 1;
  const rawPath = progressFor(activeTopic);
  const latest = attempts
    .filter((a) => skillMatchesTopic(a.skill, activeTopic))
    .at(-1);
  const expected = stageForTopic(activeTopic, rawPath.stage);
  const path = {
    ...rawPath,
    run:
      latest &&
      (latest.skill !== expected.skill || latest.level !== expected.level)
        ? 0
        : rawPath.run,
  };
  const currentConcept = nextConcept(path, attempts, activeTopic);
  const isMastered = path.stage >= totalStages && currentConcept < 0;
  const topicLevel = Math.min(totalStages, path.stage + 1);
  const topicRank = ['Beginner', 'Explorer', 'Pro', 'Genius'][
    Math.min(3, Math.floor(path.stage / Math.max(1, totalStages / 4)))
  ];
  const leveledUp =
    !!result &&
    result.correct &&
    !result.hinted &&
    path.run === 0 &&
    !!q &&
    path.stage > 0 &&
    stageForTopic(activeTopic, path.stage - 1).skill === q.skill &&
    stageForTopic(activeTopic, path.stage - 1).level === q.level;
  const activeLevel = leveledUp ? Math.max(1, path.stage) : topicLevel;
  const masteryPercent = isMastered
    ? 100
    : Math.min(97, ((path.stage + path.run / 3) / totalStages) * 100);

  useEffect(() => {
    if (
      view === 'practice' &&
      q &&
      !paused &&
      !result &&
      help === null &&
      window.matchMedia('(min-width: 900px)').matches
    ) {
      const id = setTimeout(
        () => document.getElementById('answer')?.focus({ preventScroll: true }),
        60
      );
      return () => clearTimeout(id);
    }
  }, [q, view, paused, result, help]);

  useEffect(() => {
    if (
      !q ||
      result ||
      paused ||
      help !== null ||
      view !== 'practice' ||
      !sound ||
      document.hidden
    ) {
      return;
    }
    const remaining = Math.max(0, Math.ceil(time - elapsed));
    if (remaining === lastTick.current) return;
    lastTick.current = remaining;
    if (remaining === 0) playTone('finish');
    else if (remaining <= Math.ceil(time * 0.15)) playTone('urgent');
    else if (remaining <= Math.ceil(time * 0.35) && remaining % 2 === 0) {
      playTone('tick');
    }
  }, [elapsed, q, result, paused, help, sound, view, time, playTone]);

  const activeCaps = uxCapabilities(uxVariant);

  return (
    <div
      className={
        'shell adaptly-shell ' +
        activeCaps.themeClass +
        ' ' +
        (view === 'practice' ? 'is-playing' : '')
      }
      data-ux-variant={uxVariant}
    >
      <div className="workspace">
        <header className="topbar">
          <button
            className="adaptly-brand"
            onClick={() => {
              setView('home');
              setQ(null);
            }}
            aria-label="Adaptly home"
          >
            <span className="adaptly-mark">
              a<span>↗</span>
            </span>
            adaptly
            <span className="branddot">.</span>
          </button>
          <div className="top-actions">
            <UxLabSwitcher variant={uxVariant} onChange={changeUxVariant} />
            <button
              className="parent-nav"
              aria-label="Parent report"
              onClick={() => {
                setView('report');
                setQ(null);
              }}
            >
              <ChartNoAxesCombined size={16} />
              <span>Parent report</span>
            </button>
            <button
              className="iconbutton"
              aria-label={sound ? 'Mute sound' : 'Enable sound'}
              onClick={() => {
                setSound(!sound);
                if (!sound) {
                  try {
                    const ctx =
                      audioRef.current ??
                      (audioRef.current = new AudioContext());
                    void ctx.resume();
                  } catch {
                    // Ignore audio context startup failure
                  }
                }
              }}
            >
              {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
            <button
              className="avatar"
              onClick={() => (family ? setView('account') : setAuth('signup'))}
              aria-label="Family account"
            >
              {student?.name?.[0]?.toUpperCase() || '✦'}
            </button>
          </div>
        </header>

        <main>
          {demo && (
            <div className="demo-banner">
              You’re exploring a demo. Progress lasts until you leave this page.{' '}
              <button onClick={() => setAuth('signup')}>
                Save or resume progress →
              </button>
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
              <button aria-label="Dismiss" onClick={() => setError('')}>
                ×
              </button>
            </div>
          )}

          {(view === 'home' || view === 'map') && (
            <div className="topic-page">
              {activeCaps.homeLayout === 'classic-cards' && (
                <>
                  <div className="topic-intro">
                    <span className="eyebrow">LEARNING THAT MOVES WITH YOU</span>
                    <h1>
                      {student
                        ? `Your next move, ${student.name}.`
                        : 'Little player. Big possibilities.'}
                    </h1>
                    <p>
                      Your answers help shape what comes next. Let’s grow a
                      little today.
                    </p>
                  </div>
                  <GameChooser
                    level={topicLevel}
                    totalLevels={totalStages}
                    topicId={activeTopic}
                    topicName={topic.name}
                    rank={topicRank}
                    percent={masteryPercent}
                    mastered={isMastered}
                    run={path.run}
                    attempts={attempts}
                    focusSkillIndex={currentConcept}
                    onLevelUp={(t) => start(t)}
                    onSprint={(t) => {
                      setActiveTopic(t);
                      setView('sprint');
                    }}
                    onArena={(t) => {
                      setActiveTopic(t);
                      setView('arena');
                    }}
                    onDetails={() => setView('details')}
                  />
                  <AdaptiveStory />
                </>
              )}

              {activeCaps.homeLayout === 'constellation-map' && (
                <QuestMapHome
                  topicId={activeTopic}
                  level={topicLevel}
                  totalLevels={totalStages}
                  rank={topicRank}
                  percent={masteryPercent}
                  focusSkillIndex={currentConcept}
                  attempts={attempts}
                  onSelectTopic={(t) => setActiveTopic(t)}
                  onLaunchSkill={(skillIdx) => start(skillIdx)}
                  onStartTopic={(t) => start(t)}
                  onSprint={(t) => {
                    setActiveTopic(t);
                    setView('sprint');
                  }}
                  onArena={(t) => {
                    setActiveTopic(t);
                    setView('arena');
                  }}
                  onDetails={() => setView('details')}
                />
              )}

              {activeCaps.homeLayout === 'tactile-workbench' && (
                <TactileWorkbenchHome
                  topicId={activeTopic}
                  level={topicLevel}
                  totalLevels={totalStages}
                  rank={topicRank}
                  percent={masteryPercent}
                  focusSkillIndex={currentConcept}
                  attempts={attempts}
                  onSelectTopic={(t) => setActiveTopic(t)}
                  onLaunchSkill={(skillIdx) => start(skillIdx)}
                  onStartTopic={(t) => start(t)}
                  onSprint={(t) => {
                    setActiveTopic(t);
                    setView('sprint');
                  }}
                  onArena={(t) => {
                    setActiveTopic(t);
                    setView('arena');
                  }}
                  onDetails={() => setView('details')}
                />
              )}

              {activeCaps.homeLayout === 'arcade-stadium' && (
                <ArcadeStageHome
                  topicId={activeTopic}
                  level={topicLevel}
                  totalLevels={totalStages}
                  rank={topicRank}
                  percent={masteryPercent}
                  focusSkillIndex={currentConcept}
                  attempts={attempts}
                  onSelectTopic={(t) => setActiveTopic(t)}
                  onLaunchSkill={(skillIdx) => start(skillIdx)}
                  onStartTopic={(t) => start(t)}
                  onSprint={(t) => {
                    setActiveTopic(t);
                    setView('sprint');
                  }}
                  onArena={(t) => {
                    setActiveTopic(t);
                    setView('arena');
                  }}
                  onDetails={() => setView('details')}
                />
              )}
            </div>
          )}

          {view === 'details' && (
            <div className="details-page">
              <button className="textbutton" onClick={() => setView('home')}>
                ← Back to the arcade
              </button>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ADAPTLY · GROWN-UP GUIDE</span>
                  <h1>A simple game. A thoughtful path.</h1>
                  <p>
                    Choose a subject, then let the questions grow with the
                    learner.
                  </p>
                </div>
              </div>
              <section className="whitecard path-explainer">
                <h2>How the path adapts</h2>
                <p>
                  Each topic has its own ordered learning path. Questions move
                  from a gentle starting point toward more complex steps. Three
                  consecutive correct, unassisted answers open the next step; a
                  mistake or hint gives the learner another chance to practise.
                  When the path is complete, practice checks each skill again
                  and returns to areas still developing.
                </p>
                <p>
                  Two consecutive mistakes can open a matching lesson, then
                  return to the same skill. Each topic has its own progress and
                  saved history. The timer is a thinking guide: answers remain
                  available after it reaches zero, and speed does not lower
                  understanding scores.
                </p>
                <p>
                  Parent reports use actual answers. New or lightly practised
                  skills stay marked as not assessed or developing.
                </p>
              </section>

              {topics.filter(item => item.id !== 'english').sort((a,b) => Number(isGrammarTopic(a.id)) - Number(isGrammarTopic(b.id))).map((topicItem, index) => (
                <Fragment key={topicItem.id}>
                  {(index === 0 || topicItem.id === topics.find(item => isGrammarTopic(item.id) && item.id !== 'english')?.id) && (
                    <h2 className="subject-coverage-heading">
                      {isGrammarTopic(topicItem.id) ? 'English Grammar' : 'Maths'}
                    </h2>
                  )}
                  <section className="topic-coverage">
                    <h3 className="coverage-title">
                      {topicItem.icon} {topicItem.name}
                    </h3>
                    <div className="coverage-list">
                      {skills
                        .map((s, i) => ({ s, i }))
                        .filter((x) => x.s.topic === topicItem.id)
                        .map(({ s, i }, conceptIndex) => (
                          <details key={s.name} className="coverage-item">
                            <summary>
                              <span className="coverage-number">
                                {String(conceptIndex + 1).padStart(2, '0')}
                              </span>
                              <span>
                                {s.icon} {s.name}
                              </span>
                              <ChevronRight size={16} />
                            </summary>
                            <div className="coverage-body">
                              <p>{s.sub}</p>
                              <div className="coverage-example">
                                <b>Example</b>
                                <span>{conceptExample(i)}</span>
                              </div>
                              <p>{s.help}</p>
                              <button
                                className="textbutton"
                                onClick={() => setHelp(i)}
                              >
                                Preview supporting lesson <Play size={14} />
                              </button>
                            </div>
                          </details>
                        ))}
                    </div>
                  </section>
                </Fragment>
              ))}

              <button className="secondary" onClick={() => setView('report')}>
                Open parent report <ArrowRight size={16} />
              </button>
            </div>
          )}

          {view === 'arena' && (
            <ArenaHub
              name={student?.name || 'Explorer'}
              topicId={activeTopic}
              uxVariant={uxVariant}
              onBack={() => setView('home')}
              onSwitchSprint={(t) => {
                setActiveTopic(t);
                setView('sprint');
              }}
            />
          )}

          {view === 'sprint' && (
            <MathSprint
              name={student?.name || 'Explorer'}
              identity={student?.id || 'guest'}
              topicId={activeTopic}
              onBack={() => setView('home')}
            />
          )}

          {view === 'practice' && q && (
            <PlayArena
              q={q}
              topic={topic}
              totalLevels={totalStages}
              answer={answer}
              result={result}
              hint={hint}
              paused={paused || help !== null}
              elapsed={elapsed}
              time={time}
              level={activeLevel}
              rank={topicRank}
              percent={masteryPercent}
              run={path.run}
              count={count}
              stars={correct * 10}
              name={student?.name || 'Explorer'}
              levelUp={leveledUp}
              mastered={isMastered}
              sound={sound}
              demo={demo}
              saveStatus={saveStatus}
              uxVariant={uxVariant}
              onAnswer={setAnswer}
              onSubmit={submit}
              onExit={() => {
                setView('home');
                setQ(null);
              }}
              onPause={() => {
                if (paused) started.current = Date.now() - elapsed * 1000;
                setPaused(!paused);
              }}
              onSound={() => {
                setSound(!sound);
                if (!sound) {
                  try {
                    const ctx =
                      audioRef.current ??
                      (audioRef.current = new AudioContext());
                    void ctx.resume();
                  } catch {
                    // Ignore audio context startup failure
                  }
                }
              }}
              onLesson={() => { setLessonIntro(false); setHelp(q.skill); }}
              onHint={() => setHint(true)}
              onNext={next}
            />
          )}

          {view === 'summary' && (
            <div className="summary-card mastered-card">
              <div className="celebration">👑</div>
              <div className="eyebrow">
                {topic.name.toUpperCase()} · MASTERY EVIDENCE
              </div>
              <h1>Good job, {student?.name || 'Explorer'}!</h1>
              <p>
                You completed the {topic.name} path.
                <br />
                Every skill has had a chance to shine.
              </p>
              <div className="summary-stats">
                <div>
                  <strong>
                    {totalStages} / {totalStages}
                  </strong>
                  steps crossed
                </div>
                <div>
                  <strong>
                    {topicSkills.filter((i) => stats(attempts, i).mastered)
                      .length}{' '}
                    / {topicSkills.length}
                  </strong>
                  skills secure
                </div>
              </div>
              <button className="primary" onClick={() => setView('report')}>
                See my progress <ArrowRight size={18} />
              </button>
              <button className="textbutton" onClick={() => setView('home')}>
                Back to the arcade →
              </button>
            </div>
          )}

          {view === 'report' && (
            <>
              <div className="page-heading parent-report-heading">
                <div>
                  <div className="eyebrow">
                    A CLEARER PICTURE, A KINDER NEXT STEP
                  </div>
                  <h1>
                    {reportTab === 'classroom'
                      ? 'Classroom & Group Snapshot'
                      : student
                        ? `${student.name}’s learning story`
                        : 'Big clarity for grown-ups.'}
                  </h1>
                  <p>
                    Understanding first. Confidence follows. Every insight comes
                    from actual attempts.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {family && (
                    <>
                      <button
                        type="button"
                        className={
                          reportTab === 'learner' ? 'primary' : 'secondary'
                        }
                        onClick={() => setReportTab('learner')}
                      >
                        Learner View ({student?.name || 'Explorer'})
                      </button>
                      <button
                        type="button"
                        className={
                          reportTab === 'classroom' ? 'primary' : 'secondary'
                        }
                        onClick={() => setReportTab('classroom')}
                      >
                        Classroom View ({family.students.length} learners)
                      </button>
                    </>
                  )}
                  {(attempts.length > 0 ||
                    (reportTab === 'classroom' &&
                      (family?.students.length || 0) > 0)) && (
                    <button className="secondary" onClick={reportDownload}>
                      <Download size={17} />{' '}
                      {reportTab === 'classroom'
                        ? 'Export classroom CSV'
                        : 'Export report'}
                    </button>
                  )}
                </div>
              </div>

              {!student ? (
                <div className="empty">
                  <ChartNoAxesCombined size={42} />
                  <h2>A little adventure reveals a lot.</h2>
                  <p>
                    Enter an email and learner name, play, and see
                    concept-by-concept insights.
                  </p>
                  <button
                    className="primary"
                    onClick={() => setAuth('signup')}
                  >
                    Set up your family <ArrowRight size={18} />
                  </button>
                </div>
              ) : reportTab === 'classroom' && family && classroom ? (
                <>
                  <section className="learning-journey-note">
                    <span>👩‍🏫</span>
                    <div>
                      <span className="eyebrow">
                        TEACHER & COHORT OVERVIEW · UP TO {MAX_FAMILY_LEARNERS}{' '}
                        LEARNERS PER SECTION
                      </span>
                      <h2>
                        {family.students.length}{' '}
                        {family.students.length === 1 ? 'learner' : 'learners'}{' '}
                        tracked · {classroom.attentionCount} needing targeted
                        concept support
                      </h2>
                      <p>
                        Filter by subject or topic to see which concepts are
                        secure across the group and which learners have two or
                        more recent mistakes on a specific step.
                      </p>
                    </div>
                  </section>

                  <div className="report-metrics">
                    <div>
                      <span>Enrolled learners</span>
                      <b>
                        {family.students.length} / {MAX_FAMILY_LEARNERS}
                      </b>
                      <small>Click any learner below to switch</small>
                    </div>
                    <div>
                      <span>Learners needing help</span>
                      <b>{classroom.attentionCount}</b>
                      <small>≥2 recent mistakes or &lt;60% accuracy</small>
                    </div>
                    <div>
                      <span>Concepts with secure learners</span>
                      <b>
                        {
                          classroom.concepts.filter((c) => c.secureCount > 0)
                            .length
                        }{' '}
                        / {classroom.concepts.length}
                      </b>
                      <small>8+ independent attempts at ≥80%</small>
                    </div>
                    <div>
                      <span>Topic filter</span>
                      <select
                        aria-label="Filter classroom report by topic"
                        value={classroomTopicFilter}
                        onChange={(e) =>
                          setClassroomTopicFilter(
                            e.target.value as TopicId | 'all'
                          )
                        }
                        style={{
                          marginTop: '6px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontWeight: 600,
                        }}
                      >
                        <option value="all">All subjects (37 concepts)</option>
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="report-table">
                    <div className="report-table-head">
                      <h2>Learner roster & intervention alerts</h2>
                      <span>
                        Select a learner to open their individual report or
                        launch practice
                      </span>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Learner</th>
                            <th>Current level</th>
                            <th>Attempts</th>
                            <th>Independent accuracy</th>
                            <th>Secure concepts</th>
                            <th>Intervention focus</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classroom.learners.map((learner, idx) => (
                            <tr key={learner.id}>
                              <td>
                                <b>{learner.name}</b>
                                {idx === family.active ? ' (active)' : ''}
                              </td>
                              <td>
                                Level {learner.topicLevel} of{' '}
                                {learner.totalLevels}
                              </td>
                              <td>{learner.totalAttempts}</td>
                              <td>
                                {learner.independentAccuracy === null
                                  ? '—'
                                  : `${learner.independentAccuracy}%`}
                              </td>
                              <td>
                                {learner.secureSkills} secure ·{' '}
                                {learner.developingSkills} developing
                              </td>
                              <td>
                                {learner.needsAttention ? (
                                  <span className="status developing">
                                    Needs help:{' '}
                                    {learner.focusSkills.slice(0, 2).join(', ')}
                                  </span>
                                ) : learner.totalAttempts > 0 ? (
                                  <span className="status secure">On track</span>
                                ) : (
                                  <span className="status">Not started</span>
                                )}
                              </td>
                              <td>
                                <button
                                  className="textbutton"
                                  onClick={() => {
                                    persist({ ...family, active: idx });
                                    setReportTab('learner');
                                  }}
                                >
                                  Inspect →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="report-table">
                    <div className="report-table-head">
                      <h2>Classroom concept mastery heatmap</h2>
                      <span>
                        Identifies which students need small-group support on
                        each concept
                      </span>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Topic & concept</th>
                            <th>Secure</th>
                            <th>Developing</th>
                            <th>Needs help</th>
                            <th>Not assessed</th>
                            <th>Learners needing support</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classroom.concepts.map((concept) => (
                            <tr key={concept.skillIndex}>
                              <td>
                                <span>{concept.skillIcon}</span>{' '}
                                <small>{concept.topicName} · </small>
                                {concept.skillName}
                              </td>
                              <td>{concept.secureCount}</td>
                              <td>{concept.developingCount}</td>
                              <td>
                                <b
                                  style={{
                                    color:
                                      concept.needsHelpCount > 0
                                        ? '#b42318'
                                        : 'inherit',
                                  }}
                                >
                                  {concept.needsHelpCount}
                                </b>
                              </td>
                              <td>{concept.notAssessedCount}</td>
                              <td>
                                {concept.studentsNeedingHelp.length > 0
                                  ? concept.studentsNeedingHelp.join(', ')
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <ParentLearningReport
                  key={student.id}
                  student={student}
                  onContinue={(topic) => start(topic)}
                  onLesson={(skill) => setHelp(skill)}
                />
              )}
            </>
          )}

          {view === 'videos' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">TURN “I CAN’T” INTO “AHA!”</div>
                  <h1>The learning studio</h1>
                  <p>
                    Visual explanations and carefully chosen lessons. Then
                    straight back to discovery.
                  </p>
                </div>
              </div>
              <div className="video-grid">
                {skills.map((s, i) => (
                  <button
                    className="video-card"
                    onClick={() => setHelp(i)}
                    key={s.name}
                  >
                    <div className={'video-art tone' + (i % 4)}>
                      <span>{s.icon}</span>
                      <span className="video-play">
                        <Play size={24} fill="currentColor" />
                      </span>
                    </div>
                    <div className="video-copy">
                      <span className="eyebrow">
                        {s.vid ? 'GUIDED VIDEO LESSON' : 'TRY AN EXAMPLE'}
                      </span>
                      <h2>{s.name}</h2>
                      <p>{s.sub}</p>
                      <span className="textbutton">
                        Let’s make it click <ArrowRight size={16} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'account' && family && (
            <div className="account whitecard">
              <h1>Your family’s little universe</h1>
              <p>{demo ? 'Demo adventure' : email}</p>
              <p className="micro">
                POC profiles are unverified. Email is an identifier, not proof
                of ownership. Use nicknames and sample emails when testing. No
                emails are sent.
              </p>
              <div className="profiles">
                {family.students.map((s, i) => (
                  <button
                    className={
                      i === family.active ? 'profile selected' : 'profile'
                    }
                    key={s.id}
                    onClick={() => {
                      persist({ ...family, active: i });
                      setQ(null);
                      setView('home');
                    }}
                  >
                    <span className="avatar">{s.name[0]}</span>
                    <b>{s.name}</b>
                    <small>{s.attempts.length} discoveries</small>
                    {i === family.active && <Check size={18} />}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget;
                  const name = String(new FormData(f).get('name')).trim();
                  if (name && family.students.length < MAX_FAMILY_LEARNERS) {
                    persist({
                      ...family,
                      students: [
                        ...family.students,
                        { id: crypto.randomUUID(), name, attempts: [] },
                      ],
                      active: family.students.length,
                    });
                    f.reset();
                  }
                }}
              >
                <label>
                  Add another explorer (up to {MAX_FAMILY_LEARNERS} per classroom
                  or family){' '}
                  <div className="answer-row">
                    <input
                      name="name"
                      maxLength={40}
                      required
                      placeholder="First name or nickname"
                    />
                    <button
                      className="secondary"
                      disabled={family.students.length >= MAX_FAMILY_LEARNERS}
                    >
                      <Plus size={16} /> Add learner
                    </button>
                  </div>
                </label>
              </form>
              <button
                className="textbutton logout"
                onClick={async () => {
                  await saveQueue.current;
                  await fetch('/api/family', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'logout' }),
                  });
                  setFamily(null);
                  setDemo(false);
                  setView('home');
                  setEmail('');
                }}
              >
                <LogOut size={17} /> Sign out
              </button>
            </div>
          )}

          <footer>
            <span>adaptly · Learning at your pace.</span>
            <span>
              {demo
                ? 'Demo · not saved'
                : saveStatus || 'A calmer kind of learning'}
              {saveStatus.includes('retry') && (
                <button
                  onClick={() =>
                    currentFamily.current && persist(currentFamily.current)
                  }
                >
                  Retry save
                </button>
              )}
            </span>
          </footer>
        </main>
      </div>

      {auth && (
        <div className="modal-backdrop">
          <section
            className="modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Parent account"
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => {
                setAuth('');
                setError('');
              }}
            >
              <X />
            </button>
            <div className="auth-icon">✦</div>
            <span className="eyebrow">
              A LITTLE SETUP. A WORLD OF POSSIBILITY.
            </span>
            <h1>Let’s meet your explorer.</h1>
            <p>
              Enter the same email and learner name each time to resume from the
              saved level.
            </p>
            <form onSubmit={(e) => void authenticate(e)}>
              <label>
                Parent email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Learner’s first name or nickname
                <input
                  name="name"
                  maxLength={40}
                  required
                  placeholder="What should Pip call you?"
                  autoComplete="off"
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="primary" disabled={busy || !loaded}>
                {busy ? 'Finding your adventure…' : 'Continue'}{' '}
                <ArrowRight size={18} />
              </button>
            </form>
            {!family && (
              <button
                className="demolink"
                onClick={() => {
                  tryDemo();
                  setAuth('');
                }}
              >
                Take a peek first — try the demo
              </button>
            )}
            <p className="micro">
              POC only: anyone using this email can reopen its pilot history.
              Use a nickname and sample email for testing.
            </p>
          </section>
        </div>
      )}

      {help !== null && (
        <ConceptLesson
          key={`${help}:${view === 'practice' && q?.skill === help ? q.level : 1}`}
          skill={help}
          level={view === 'practice' && q?.skill === help ? q.level : 1}
          activePrompt={view === 'practice' && q?.skill === help ? q.prompt : ''}
          openedVideoIds={openedLessonVideos(student)}
          introductory={lessonIntro}
          recovery={isRecovery}
          onFinish={closeHelp}
        />
      )}
    </div>
  );
}
