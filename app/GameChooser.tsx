'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  skills,
  skillsForTopic,
  isGrammarTopic,
  stats,
  topics,
  type Attempt,
  type TopicId,
} from '../lib/learning';
import './game-chooser.css';

type Game = 'level' | 'sprint' | 'arena';

type Props = {
  level: number;
  totalLevels: number;
  topicId: TopicId;
  topicName: string;
  rank: string;
  percent: number;
  mastered: boolean;
  run: number;
  attempts: Attempt[];
  focusSkillIndex: number;
  onLevelUp: (topic: TopicId) => void;
  onSprint: (topic: TopicId) => void;
  onArena: (topic: TopicId) => void;
  onDetails: () => void;
};

const gameNames: Record<Game, string> = {
  level: 'Level Up',
  sprint: 'Speed Sprint',
  arena: 'Last Star Standing',
};

export default function GameChooser({
  level,
  totalLevels,
  topicId,
  topicName,
  rank,
  percent,
  mastered,
  run,
  attempts,
  focusSkillIndex,
  onLevelUp,
  onSprint,
  onArena,
  onDetails,
}: Props) {
  const [intro, setIntro] = useState<Game | null>(null);
  const [pickGame, setPickGame] = useState<Game | null>(null);
  const [subjectLevel, setSubjectLevel] = useState<'subjects' | 'maths-topics' | 'grammar-topics'>(
    'subjects'
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const mathTopics = topics.filter((topic) => !isGrammarTopic(topic.id));
  const grammarTopics = topics.filter((topic) => topic.id.startsWith('english-'));
  const englishTopic = topics.find((topic) => topic.id === 'english')!;
  const returnFocus = useRef<HTMLElement | null>(null);

  function openIntro(game: Game) {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIntro(game);
  }

  function chooseGame(game: Game) {
    setSubjectLevel('subjects');
    setPickGame(game);
  }

  function chooseTopic(topic: TopicId) {
    const game = pickGame;
    setPickGame(null);
    setSubjectLevel('subjects');
    if (game === 'level') onLevelUp(topic);
    else if (game === 'sprint') onSprint(topic);
    else if (game === 'arena') onArena(topic);
  }

  function closeIntro() {
    setIntro(null);
    requestAnimationFrame(() =>
      returnFocus.current?.focus({ preventScroll: true })
    );
  }

  useEffect(() => {
    if (!intro) return;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function keydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeIntro();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [
        ...document.querySelectorAll<HTMLElement>(
          '.game-intro-dialog button:not([disabled])'
        ),
      ];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener('keydown', keydown);
    };
  }, [intro]);

  useEffect(() => {
    if (!pickGame) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusTimer = window.setTimeout(
      () => document.querySelector<HTMLElement>('.topic-pick-card')?.focus(),
      0
    );

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setPickGame(null);
        requestAnimationFrame(() => previous?.focus({ preventScroll: true }));
        return;
      }
      if (e.key === 'Tab') {
        const items = [
          ...document.querySelectorAll<HTMLElement>(
            '.topic-pick-dialog button:not([disabled])'
          ),
        ];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pickGame]);

  const topicSkillIds = skillsForTopic(topicId);
  const snapshots = topicSkillIds.map((index) => ({
    skill: skills[index],
    index,
    ...stats(attempts, index),
  }));
  const secureCount = snapshots.filter((x) => x.mastered).length;
  const recent = attempts
    .filter((x) => skills[x.skill]?.topic === topicId && !x.hinted)
    .slice(-10);
  const recentAccuracy = recent.length
    ? Math.round((recent.filter((x) => x.correct).length / recent.length) * 100)
    : null;

  const sampleMap: Partial<Record<TopicId, string[]>> = {
    multiply: ['3 × 4', '23 × 3', '27 × 3'],
    addition: ['14 + 3', '34 + 28', '248 + 175'],
    subtraction: ['74 − 32', '52 − 28', '500 − 276'],
    division: ['24 ÷ 4', '144 ÷ 12', '29 ÷ 5'],
    hcf: ['HCF of 12 & 18', 'HCF of 24 & 36', 'HCF of 84 & 126'],
    lcm: ['LCM of 4 & 6', 'LCM of 8 & 12', 'LCM of 15 & 20'],
    'english-nouns': ['Find the noun', 'Name a place', 'One mouse, two ___'],
    'english-pronouns': ['Choose we or they', 'Choose us or them', 'Is it ours or theirs?'],
    'english-verbs': ['Spot the action', 'Choose the past tense', 'Rewrite in the future tense'],
    'english-modifiers': ['Spot the adjective', 'Describe a noun', 'Tell how an action happens'],
    'english-agreement': ['The cat sits', 'The cats sit', 'The pile of books rests'],
    'english-sentences': ['Find the complete thought', 'Join alternatives', 'Join two complete ideas'],
    'english-punctuation': ['Choose an end mark', 'Fix the capitals', 'Shorten “did not”'],
    'english-connectives': ['Show contrast', 'Tell where', 'Explain why'],
    english: [
      'Find the noun',
      'Choose the right tense',
      'Build a complete sentence',
    ],
  };
  const sampleQuestions = sampleMap[topicId] ?? [topicName, 'Choose the correct answer', 'Apply the rule'];

  const launch: Record<Game, () => void> = {
    level: () => chooseGame('level'),
    sprint: () => chooseGame('sprint'),
    arena: () => chooseGame('arena'),
  };

  const cards: [Game, string, string, string, string][] = [
    [
      'level',
      '🌱',
      'MASTER A SKILL',
      'Find your level',
      mastered ? 'Mastered' : `${topicName} · Level ${level} of ${totalLevels}`,
    ],
    [
      'sprint',
      '🚀',
      'BUILD SPEED & ACCURACY',
      'Race against time',
      '60-second challenge',
    ],
    ['arena', '⚡', 'COMPETE WITH PEERS', 'Compete with friends', '3 hearts each'],
  ];

  return (
    <section className="game-chooser" aria-labelledby="multiply-quest-title">
      <header className="game-chooser-heading">
        <span className="game-chooser-kicker">
          ✦ ADAPTLY · YOUR LEARNING ARCADE ✦
        </span>
        <h1 id="multiply-quest-title">
          Learn at your pace. Race when you’re ready.
        </h1>
        <p>Pick a way to play, then choose a subject to explore.</p>
      </header>

      <div className="game-chooser-grid">
        {cards.map(([game, emoji, label, subtitle, meta]) => (
          <article key={game} className={`chooser-card chooser-${game}`}>
            <button
              type="button"
              className="chooser-play"
              onClick={launch[game]}
              aria-label={`Play ${gameNames[game]}`}
            >
              <span className="chooser-label">{label}</span>
              <span className="chooser-art">
                <span className={`chooser-hero-emoji ${game}`}>{emoji}</span>
                {game === 'level' ? (
                  <>
                    <span className="chooser-spark">✦</span>
                    <span className="chooser-multiply">×</span>
                  </>
                ) : game === 'sprint' ? (
                  <>
                    <span className="chooser-clock">60s</span>
                    <span className="chooser-multiply">★</span>
                  </>
                ) : (
                  <>
                    <span className="chooser-hearts">♥ ♥ ♥</span>
                    <span className="chooser-multiply">×</span>
                  </>
                )}
              </span>
              <strong>{gameNames[game]}</strong>
              <em>{subtitle}</em>
              {game === 'level' ? (
                <>
                  <span className="chooser-progress-label">
                    {meta} <i>· {rank}</i>
                  </span>
                  <span
                    className="chooser-track"
                    role="progressbar"
                    aria-label={`Progress through ${topicName}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(percent)}
                  >
                    <i style={{ width: `${percent}%` }} />
                  </span>
                </>
              ) : (
                <span className="chooser-short-copy">
                  {game === 'sprint'
                    ? 'How many can you solve in one minute?'
                    : 'Fastest correct keeps a heart.'}
                </span>
              )}
              <span className="chooser-cta">
                {game === 'level'
                  ? 'Continue your journey'
                  : game === 'sprint'
                    ? 'Start a sprint'
                    : 'Enter the arena'}{' '}
                <ArrowRight size={16} />
              </span>
            </button>
            <button
              type="button"
              className="chooser-about"
              onClick={() => openIntro(game)}
              aria-label={`How ${gameNames[game]} helps`}
            >
              <CircleHelp size={14} />
              <span>How it helps</span>
            </button>
          </article>
        ))}
      </div>

      <button className="chooser-details" onClick={onDetails}>
        Grown-up guide · All subjects <ChevronRight size={15} />
      </button>

      {mounted &&
        intro &&
        createPortal(
          <div
            className={`game-intro-backdrop intro-${intro}`}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeIntro();
            }}
          >
            <section
              className="game-intro-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-intro-title"
              aria-describedby="game-intro-copy"
            >
              <div className="game-intro-top">
                <div className="intro-brand">
                  <span>{topics.find((t) => t.id === topicId)?.icon}</span>{' '}
                  ADAPTLY · {topicName.toUpperCase()}
                </div>
                <button
                  className="intro-close"
                  onClick={closeIntro}
                  aria-label="Close introduction"
                  autoFocus
                >
                  <X size={20} />
                  <span>Close</span>
                </button>
              </div>
              <div className="game-intro-content">
                <div className="intro-main">
                  <span className="intro-eyebrow">
                    <Sparkles size={15} /> A GAME THAT BUILDS LEARNING
                    CONFIDENCE
                  </span>
                  <div className="intro-title-row">
                    <span className="intro-game-icon" aria-hidden="true">
                      {intro === 'level'
                        ? '🌱'
                        : intro === 'sprint'
                          ? '🚀'
                          : '⚡'}
                    </span>
                    <div>
                      <small>
                        {intro === 'level'
                          ? 'YOUR PERSONAL LEARNING PATH'
                          : intro === 'sprint'
                            ? 'YOUR ONE-MINUTE CHALLENGE'
                            : 'THE FRIENDS SHOWDOWN'}
                      </small>
                      <h1 id="game-intro-title">{gameNames[intro]}</h1>
                    </div>
                  </div>
                  <p id="game-intro-copy" className="intro-copy">
                    {intro === 'level'
                      ? 'Every child starts somewhere different. The questions follow what they show they know: three confident answers open the next step; a tricky answer brings more practice on this concept.'
                      : intro === 'sprint'
                        ? `A playful one-minute ${topicName.toLowerCase()} round builds quick recall. Accurate answers and streaks grow the score, and every round gives the child a personal best to chase.`
                        : `Friends or classmates race to answer the same ${topicName.toLowerCase()} question. In Fair Classroom mode, every accurate answer protects your heart and the fastest correct thinker wins bonus points.`}
                  </p>
                  {intro === 'level' ? (
                    <div
                      className="intro-live-stats"
                      aria-label="Current learning progress"
                    >
                      <div>
                        <span>YOUR LEVEL</span>
                        <b>
                          {mastered
                            ? `${totalLevels} / ${totalLevels}`
                            : `${level} / ${totalLevels}`}
                        </b>
                        <small>
                          {mastered ? 'Mastery evidence achieved' : rank}
                        </small>
                      </div>
                      <div>
                        <span>NEXT STEP</span>
                        <b>
                          {run} <i>/ 3</i>
                        </b>
                        <small>independent correct answers</small>
                      </div>
                      <div>
                        <span>SKILLS WITH EVIDENCE</span>
                        <b>
                          {secureCount} <i>/ {topicSkillIds.length}</i>
                        </b>
                        <small>shown secure in recent practice</small>
                      </div>
                      <div>
                        <span>RECENT ACCURACY</span>
                        <b>
                          {recentAccuracy === null
                            ? '—'
                            : `${recentAccuracy}%`}
                        </b>
                        <small>
                          {recent.length
                            ? `last ${recent.length} independent answers`
                            : 'appears after practice'}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="intro-live-stats"
                      aria-label="Game rules and round stats"
                    >
                      {intro === 'sprint' ? (
                        <>
                          <div>
                            <span>ROUND</span>
                            <b>
                              60 <i>sec</i>
                            </b>
                            <small>race the clock</small>
                          </div>
                          <div>
                            <span>CORRECT</span>
                            <b>
                              +10 <i>pts</i>
                            </b>
                            <small>plus time bonus</small>
                          </div>
                          <div>
                            <span>STREAK</span>
                            <b>
                              +20 <i>max</i>
                            </b>
                            <small>bonus points</small>
                          </div>
                          <div>
                            <span>TRACK</span>
                            <b>Score</b>
                            <small>right answers · streak</small>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span>RACERS</span>
                            <b>2–35</b>
                            <small>classmates or friends</small>
                          </div>
                          <div>
                            <span>START WITH</span>
                            <b>
                              3 <i>♥</i>
                            </b>
                            <small>lives for each player</small>
                          </div>
                          <div>
                            <span>ROUND</span>
                            <b>Shared</b>
                            <small>one question · one timer</small>
                          </div>
                          <div>
                            <span>AFTER ELIMINATION</span>
                            <b>Watch</b>
                            <small>stay for the showdown</small>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="intro-actions">
                    <button
                      className="intro-play"
                      onClick={() => {
                        closeIntro();
                        launch[intro]();
                      }}
                    >
                      {intro === 'level'
                        ? 'Start my path'
                        : intro === 'sprint'
                          ? 'Start my sprint'
                          : 'Play with friends'}{' '}
                      <ArrowRight size={19} />
                    </button>
                    <span>
                      <ShieldCheck size={15} />{' '}
                      {intro === 'level'
                        ? 'Your progress is saved as you learn'
                        : 'Practice stays playful and low pressure'}
                    </span>
                  </div>
                </div>

                <div className="intro-visual-column">
                  {intro === 'level' ? (
                    <div
                      className="intro-path-visual"
                      aria-label={`Answers shape the next ${topicName} learning step`}
                    >
                      <div className="path-visual-head">
                        <span>ONE STEP AT A TIME</span>
                        <b>YOUR PATH</b>
                      </div>
                      <div className="path-question">
                        <span className="path-bubble">
                          {topics.find((t) => t.id === topicId)?.icon}
                        </span>
                        <strong>{sampleQuestions[0]}</strong>
                        <small>
                          Then {sampleQuestions[1]} · next {sampleQuestions[2]}
                        </small>
                      </div>
                      <div className="path-split">
                        <i />
                        <i />
                      </div>
                      <div className="path-branches">
                        <div className="path-branch ready">
                          <span>✨</span>
                          <b>3 right in a row</b>
                          <small>Meet the next challenge</small>
                          <ArrowRight size={17} />
                        </div>
                        <div className="path-branch practice">
                          <span>🌱</span>
                          <b>Need another try?</b>
                          <small>Practise this idea again</small>
                          <BookOpen size={17} />
                        </div>
                      </div>
                      <div className="path-foot">
                        <span>📚</span>
                        <b>
                          {topicSkillIds.length} {topicName} skills
                        </b>
                        <small>questions step up with understanding</small>
                      </div>
                    </div>
                  ) : intro === 'sprint' ? (
                    <div className="intro-sprint-visual">
                      <div className="sprint-visual-stars">
                        <span>✦</span>
                        <span>★</span>
                        <span>✧</span>
                        <span>✦</span>
                      </div>
                      <div className="sprint-big-timer">
                        <Timer size={26} />
                        <b>60</b>
                        <small>SECONDS</small>
                      </div>
                      <div className="sprint-equation">
                        <span>{sampleQuestions[1]}</span>
                        <i>?</i>
                        <span>GO!</span>
                      </div>
                      <div className="sprint-result-cards">
                        <div>
                          <Zap size={17} />
                          <b>Quick</b>
                          <small>time bonus</small>
                        </div>
                        <div>
                          <TrendingUp size={17} />
                          <b>On a roll</b>
                          <small>streak bonus</small>
                        </div>
                        <div>
                          <Medal size={17} />
                          <b>New best?</b>
                          <small>beat your score</small>
                        </div>
                      </div>
                      <div className="sprint-visual-ribbon">
                        YOUR SCORE · RIGHT ANSWERS · BEST STREAK
                      </div>
                    </div>
                  ) : (
                    <div className="intro-arena-visual">
                      <div className="arena-visual-title">
                        <span>ROUND 04</span>
                        <b>WHO&apos;S STILL IN?</b>
                      </div>
                      <div className="arena-racers">
                        <div>
                          <span>👧</span>
                          <small>YOU</small>
                          <b>♥ ♥ ♥</b>
                        </div>
                        <div>
                          <span>🧑‍🚀</span>
                          <small>FRIEND</small>
                          <b>♥ ♥</b>
                        </div>
                        <div>
                          <span>🦊</span>
                          <small>RACER</small>
                          <b>♥</b>
                        </div>
                      </div>
                      <div className="arena-visual-question">
                        <span>FIRST TO SOLVE</span>
                        <b>
                          {sampleQuestions[1]} <i>= ?</i>
                        </b>
                        <div className="arena-race-line">
                          <span />
                          <i>⚡</i>
                          <span />
                        </div>
                      </div>
                      <div className="arena-visual-winner">
                        ⚡ Fast + correct keeps your heart
                      </div>
                      <div className="arena-visual-spectator">
                        🎟️ OUT? Grab a front-row seat and watch!
                      </div>
                    </div>
                  )}

                  <div className="intro-skills">
                    <h2>
                      <Target size={17} />{' '}
                      {intro === 'level'
                        ? `A growing ${topicName} toolkit`
                        : 'Skills this game lets kids practise'}
                    </h2>
                    {intro === 'level' ? (
                      <div className="intro-skill-list">
                        {snapshots.map(
                          ({ skill, index, acc, total, mastered: secure }) => {
                            const focus = index === focusSkillIndex && !mastered;
                            return (
                              <div
                                className={`intro-skill ${focus ? 'is-focus' : ''}`}
                                key={skill.name}
                              >
                                <span className="intro-skill-icon">
                                  {skill.icon}
                                </span>
                                <span className="intro-skill-name">
                                  {skill.name}
                                  <small>
                                    {focus
                                      ? 'Up next'
                                      : total === 0
                                        ? 'Not explored yet'
                                        : secure
                                          ? 'Secure evidence'
                                          : `${Math.round(acc * 100)}% recent accuracy`}
                                  </small>
                                </span>
                                <span
                                  className={`skill-state ${
                                    focus
                                      ? 'focus'
                                      : secure
                                        ? 'secure'
                                        : total
                                          ? 'growing'
                                          : 'new'
                                  }`}
                                >
                                  {focus
                                    ? '→'
                                    : secure
                                      ? '✓'
                                      : total
                                        ? '↗'
                                        : '·'}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="intro-skill-chips">
                        {(intro === 'sprint'
                          ? [
                              '⚡ Quick recall',
                              '🎯 Accurate answers',
                              '🔥 Build a streak',
                              '🧠 Focus under time',
                            ]
                          : [
                              '🧠 Quick recall',
                              '🎯 Accuracy under pressure',
                              '⚡ Quick thinking',
                              '🤝 Friendly competition',
                            ]
                        ).map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    )}
                    {intro === 'level' && (
                      <p className="intro-evidence-note">
                        <BarChart3 size={14} /> Recent accuracy uses independent
                        answers only. “Secure” needs repeated evidence; new
                        skills stay “Not explored.”
                      </p>
                    )}
                    {intro !== 'level' && (
                      <p className="intro-evidence-note">
                        <BarChart3 size={14} /> After each round, see the score,
                        correct answers and streak—or the lives and standings.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>,
          document.body
        )}

      {mounted &&
        pickGame &&
        createPortal(
          <div
            className="topic-pick-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setPickGame(null);
                setSubjectLevel('subjects');
              }
            }}
          >
            <section
              className="topic-pick-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="topic-pick-title"
            >
              <button
                type="button"
                className="topic-pick-close"
                onClick={() => {
                  setPickGame(null);
                  setSubjectLevel('subjects');
                }}
                aria-label="Close subject picker"
              >
                <X size={19} />
              </button>
              <span className="topic-pick-kicker">
                {pickGame === 'level'
                  ? 'YOUR PERSONAL LEARNING PATH'
                  : pickGame === 'sprint'
                    ? 'A QUICK RACE AGAINST YOU'
                    : 'INVITE YOUR FRIENDS TO RACE'}
              </span>
              <h2 id="topic-pick-title">
                {subjectLevel === 'subjects'
                  ? 'Choose a subject'
                  : subjectLevel === 'grammar-topics' ? 'Choose an English Grammar topic' : 'Choose a Maths topic'}
              </h2>
              <p>
                {subjectLevel === 'subjects'
                  ? 'Choose a subject, then pick what you want to practise.'
                  : 'Choose the topic you want to explore.'}
              </p>
              <div className="topic-pick-grid">
                {subjectLevel === 'subjects' ? (
                  <>
                    <button
                      type="button"
                      className="topic-pick-card topic-maths subject-family-card"
                      onClick={() => setSubjectLevel('maths-topics')}
                    >
                      <span className="topic-pick-icon">🧮</span>
                      <span className="topic-pick-copy">
                        <strong>Maths</strong>
                        <small>
                          Multiply · Add · Subtract · Divide · HCF · LCM
                        </small>
                        <em>{mathTopics.length} topics · choose a skill area</em>
                      </span>
                      <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      className={`topic-pick-card topic-${englishTopic.color}`}
                      onClick={() => setSubjectLevel('grammar-topics')}
                    >
                      <span className="topic-pick-icon">
                        {englishTopic.icon}
                      </span>
                      <span className="topic-pick-copy">
                        <strong>{englishTopic.name}</strong>
                        <small>{englishTopic.sub}</small>
                        <em>{grammarTopics.length} topics · choose a skill area</em>
                      </span>
                      <ArrowRight size={18} />
                    </button>
                  </>
                ) : (
                  (subjectLevel === 'grammar-topics' ? grammarTopics : mathTopics).map((topic) => {
                    const indices = skillsForTopic(topic.id);
                    const count = indices.reduce(
                      (n, i) =>
                        n + attempts.filter((a) => a.skill === i).length,
                      0
                    );
                    const solid = indices.filter(
                      (i) => stats(attempts, i).mastered
                    ).length;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        className={`topic-pick-card topic-${topic.color}`}
                        onClick={() => chooseTopic(topic.id)}
                      >
                        <span className="topic-pick-icon">{topic.icon}</span>
                        <span className="topic-pick-copy">
                          <strong>{topic.name}</strong>
                          <small>{topic.sub}</small>
                          <em>
                            {count
                              ? `${count} questions · ${solid}/${indices.length} skills feeling secure`
                              : 'A fresh adventure'}
                          </em>
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    );
                  })
                )}
              </div>
              <button
                type="button"
                className="topic-pick-back"
                onClick={() =>
                  subjectLevel !== 'subjects'
                    ? setSubjectLevel('subjects')
                    : setPickGame(null)
                }
              >
                {subjectLevel !== 'subjects'
                  ? '← All subjects'
                  : 'Back to game choices'}
              </button>
            </section>
          </div>,
          document.body
        )}
    </section>
  );
}
