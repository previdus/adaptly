'use client';

import React, { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { X, Pause, Play, Volume2, VolumeX, Lightbulb, Check, Maximize, Minimize } from 'lucide-react';
import type { Attempt, Question, topics } from '../lib/learning';
import { uxCapabilities, type UXVariantId } from '../lib/ux-variants';
import QuestionDiagram from './QuestionDiagram';
import QuestionWalkthrough from './QuestionWalkthrough';
import './focused-play.css';
import TactilePracticePanel from './ux/TactilePracticePanel';

type TopicView = (typeof topics)[number];

type Props = {
  q: Question;
  topic: TopicView;
  totalLevels: number;
  answer: string;
  result: Attempt | null;
  hint: boolean;
  paused: boolean;
  elapsed: number;
  time: number;
  level: number;
  rank: string;
  percent: number;
  run: number;
  count: number;
  stars: number;
  name: string;
  levelUp: boolean;
  mastered: boolean;
  sound: boolean;
  demo: boolean;
  saveStatus: string;
  uxVariant?: UXVariantId;
  onAnswer: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onExit: () => void;
  onPause: () => void;
  onSound: () => void;
  onHint: () => void;
  onNext: () => void;
};

function Buddy() {
  return (
    <svg
      className="orbit-buddy"
      viewBox="0 0 160 160"
      aria-label="Pip, your animated learning buddy"
      role="img"
    >
      <ellipse cx="81" cy="145" rx="42" ry="8" fill="#0c1837" opacity=".2" />
      <g className="buddy-float">
        <path
          className="buddy-left"
          d="M42 82Q12 66 18 91Q19 108 43 110"
          fill="#a98af5"
          stroke="#6653c0"
          strokeWidth="3"
        />
        <path
          className="buddy-wave"
          d="M119 81Q145 55 145 79Q145 95 120 108"
          fill="#a98af5"
          stroke="#6653c0"
          strokeWidth="3"
        />
        <path
          d="M44 119L39 139Q49 145 60 137L67 118M95 118L103 139Q116 144 124 135L116 116"
          fill="#6653c0"
        />
        <rect
          x="36"
          y="38"
          width="91"
          height="96"
          rx="37"
          fill="#ae90ff"
          stroke="#745bca"
          strokeWidth="3"
        />
        <ellipse cx="82" cy="86" rx="34" ry="37" fill="#f3eaff" />
        <g className="buddy-eyes">
          <ellipse cx="69" cy="79" rx="5" ry="7" fill="#423367" />
          <ellipse cx="96" cy="79" rx="5" ry="7" fill="#423367" />
          <circle cx="70" cy="77" r="1.7" fill="white" />
          <circle cx="97" cy="77" r="1.7" fill="white" />
        </g>
        <ellipse cx="59" cy="93" rx="6" ry="3" fill="#f5a5bc" />
        <ellipse cx="106" cy="93" rx="6" ry="3" fill="#f5a5bc" />
        <path
          d="M73 96Q82 109 92 96"
          fill="#b879ac"
          stroke="#674269"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <path
          d="M40 51Q80 4 121 49L133 54Q83 65 29 55Z"
          fill="#ffd87d"
          stroke="#d49b4c"
          strokeWidth="3"
        />
        <path
          d="m82 112 3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 5-1Z"
          fill="#ffe793"
        />
      </g>
    </svg>
  );
}

export default function PlayArena(p: Props) {
  const root = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [screenMessage, setScreenMessage] = useState('');
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.current?.requestFullscreen();
      setScreenMessage('');
    } catch {
      setScreenMessage('Fullscreen is unavailable here. Try opening Adaptly in your browser.');
    }
  }
  const [height, setHeight] = useState<number | null>(null);
  const [hintPrompt, setHintPrompt] = useState<string | null>(null);
  const hintOpen = hintPrompt === p.q.prompt;
  const useTactile = uxCapabilities(p.uxVariant ?? 'a').useTactilePractice;

  useEffect(() => {
    const update = () =>
      setHeight(Math.round(window.visualViewport?.height || window.innerHeight));
    update();
    window.visualViewport?.addEventListener('resize', update);
    window.addEventListener('resize', update);
    return () => {
      window.visualViewport?.removeEventListener('resize', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const used = Math.min(1, p.elapsed / p.time);
  const urgency =
    used >= 1
      ? 'extra'
      : used >= 0.85
        ? 'urgent'
        : used >= 0.65
          ? 'soon'
          : 'calm';
  const wins = p.levelUp ? 3 : p.run;

  return (
    <section
      ref={root}
      className={`play-viewport focused-play ${p.result ? "reviewing-answer" : ""} clock-${urgency} ${
        p.q.visual ? 'with-picture' : 'without-picture'
      }`}
      style={
        {
          '--game-height': height ? height + 'px' : '100dvh',
          '--rows': p.q.a,
          '--columns': p.q.b,
        } as CSSProperties
      }
      aria-label={`${p.topic.name} game`}
    >
      <div className="space-sprinkles" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i
            key={i}
            style={
              {
                left: ((i * 29) % 100) + '%',
                top: ((i * 37) % 100) + '%',
                animationDelay: i * 0.37 + 's',
              } as CSSProperties
            }
          >
            ✦
          </i>
        ))}
        <span className="tiny-planet planet-cyan" />
        <span className="tiny-planet planet-pink" />
      </div>

      <header className="play-header">
        <button
          className="play-round-button"
          onClick={p.onExit}
          aria-label="Save and exit quiz"
        >
          <X size={21} />
        </button>
        <div className="play-title">
          <span>
            adaptly<span>✦</span>
          </span>
          <h1>{p.topic.name}</h1>
        </div>

        <div className="play-controls">
          <button className="play-round-button" type="button" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
            {fullscreen ? <Minimize size={18}/> : <Maximize size={18}/>}
          </button>
          <button
            className="play-round-button"
            aria-label={p.sound ? 'Mute sound' : 'Enable sound'}
            onClick={p.onSound}
          >
            {p.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="play-round-button"
            disabled={!!p.result?.correct}
            aria-label={p.paused ? 'Resume timer' : 'Pause timer'}
            onClick={p.onPause}
          >
            {p.paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
        </div>
      </header>

      {screenMessage && <p className="fullscreen-message" role="status">{screenMessage}</p>}
      <div className="play-body">
        <div className="answer-trail-rail" role="progressbar"
          aria-label="Correct answers toward the next level" aria-valuemin={0} aria-valuemax={3} aria-valuenow={wins}
          aria-valuetext={`${wins} of 3 consecutive correct answers`}>
          <span className="trail-rail-goal" aria-hidden="true">{wins === 3 ? '🎉' : '🏆'}</span>
          <div className="trail-rail-steps" aria-hidden="true">
            {[0, 1, 2].map(i => <span key={i} className={'trail-rail-step ' + (i < wins ? 'is-earned' : i === wins ? 'is-next' : '')}><b>{i < wins ? '★' : i + 1}</b></span>)}
          </div>
        </div>
        <div className="vertical-clock clock-right" role="progressbar" aria-label="Question time elapsed"
          aria-valuemin={0} aria-valuemax={p.time} aria-valuenow={Math.min(p.time, Math.round(p.elapsed))}>
          <span style={{ height: used * 100 + '%' }} />
        </div>

        <article
          className={
            'play-card ' +
            (p.result && !p.result.correct
              ? 'showing-mistake'
              : hintOpen
                ? 'showing-help'
                : '')
          }
          aria-label="Question and answer"
        >
          <div className="question-level-track" role="progressbar"
            aria-label={`Level ${p.level} of ${p.totalLevels}`}
            aria-valuemin={1} aria-valuemax={p.totalLevels} aria-valuenow={p.level}>
            <span className="question-track-start">Level 1</span>
            <div className="question-track-rail" style={{'--level-position': `${Math.min(100, Math.max(0, (p.level - 1) / Math.max(1, p.totalLevels - 1) * 100))}%`} as CSSProperties}>
              <span className="question-track-fill"/>
              <span className="question-track-marker" aria-hidden="true"><span>🚀</span><b>{p.level}</b></span>
            </div>
            <span className="question-track-finish">🏆<small>Level {p.totalLevels}</small></span>
          </div>
          <div className="card-topline">
            <div className="buddy-chat">
              <Buddy />
              <span>
                {p.paused
                  ? 'A little breather!'
                  : p.run >= 2
                    ? `One more star! Level ${p.level} → ${Math.min(
                        p.totalLevels,
                        p.level + 1
                      )}`
                    : p.run === 1
                      ? 'Two stars to go!'
                      : `Three stars to Level ${Math.min(
                          p.totalLevels,
                          p.level + 1
                        )}!`}
              </span>
            </div>
            <div className="clock-chip" role="timer" aria-label="Time left">
              <span>
                {p.paused ? 'Ⅱ' : Math.max(0, Math.ceil(p.time - p.elapsed))}
              </span>
              <small>
                {p.paused
                  ? 'Paused'
                  : used >= 1
                    ? 'Extra time'
                    : 'seconds'}
              </small>
            </div>
          </div>

          <div className="play-question-content">
            <span className="question-kicker">
              {p.q.learningGoal ?? p.topic.name.toUpperCase()} · QUESTION {p.count + 1}
              {p.demo ? ' · DEMO' : ''}
            </span>
            {p.q.skill === 7 && !p.result && !p.hint && (
              <div className="story-scene" aria-hidden="true">
                <span>
                  {p.q.prompt.includes('cookies')
                    ? '🍪'
                    : p.q.prompt.includes('plants')
                      ? '🪴'
                      : '🪨'}
                </span>
                <i>✦</i>
                <i>✧</i>
              </div>
            )}
            <h2
              className={
                p.q.options
                  ? 'play-story grammar-prompt'
                  : p.q.visual || p.q.skill === 7
                    ? 'play-story'
                    : 'play-equation'
              }
            >
              {p.q.prompt}
            </h2>

            {!useTactile && p.q.diagram && !p.result && !hintOpen && <QuestionDiagram diagram={p.q.diagram}/>}

            {!useTactile && p.q.visual && !hintOpen && !p.result && (
              <div
                className={
                  'play-picture ' +
                  (p.q.visual === 'array' ? 'picture-array' : 'picture-groups')
                }
                role="img"
                aria-label={`${p.q.a} groups of ${p.q.b}`}
                style={
                  {
                    '--rows': p.q.a,
                    '--columns': p.q.b,
                  } as CSSProperties
                }
              >
                {Array.from({ length: p.q.a }, (_, i) => (
                  <div className="picture-row" key={i}>
                    {Array.from({ length: p.q.b }, (_, j) => (
                      <span key={j}>
                        {p.q.visual === 'array' ? '★' : '🍎'}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {!useTactile && p.hint && hintOpen && (
              <div className="play-help" role="status">
                <Lightbulb size={18} />
                <div>
                  <b>A little nudge</b>
                  <p>{p.q.explanation}</p>
                  <small>
                    This is a helped try. We’ll build your next streak together.
                  </small>
                  <button
                    type="button"
                    className="close-play-hint"
                    onClick={() => setHintPrompt(null)}
                  >
                    Got it! <Check size={15} />
                  </button>
                </div>
              </div>
            )}

            {p.result && (
              <div className="play-try-again" role="status">
                <strong>{p.result.correct ? "Correct! Here’s why." : "Let’s work it out."}</strong>
                <p><b>Answer: {p.q.answer}</b></p>
                {p.levelUp && <p>⭐ Level complete! Read the solution, then continue to your next challenge.</p>}
                <QuestionWalkthrough question={p.q} initiallyOpen/>
              </div>
            )}
          </div>

          {p.result ? (
            <div className="play-retry-action">
              <button onClick={p.onNext}>
                Continue <span>→</span>
              </button>
            </div>
          ) : p.paused ? (
            <div className="play-pause-cover">
              <span>🌙</span>
              <h2>Take a little breath.</h2>
              <p>We’ll wait right here.</p>
              <button onClick={p.onPause}>
                <Play size={17} fill="currentColor" /> I’m ready!
              </button>
            </div>
          ) : useTactile ? (
            <TactilePracticePanel
              q={p.q}
              answer={p.answer}
              result={p.result}
              hintOpen={p.hint && hintOpen}
              onAnswer={p.onAnswer}
              onSubmit={p.onSubmit}
              onCloseHint={() => setHintPrompt(null)}
            />
          ) : (
            <form
              className={'play-answer ' + (p.q.options ? 'has-choices' : '')}
              onSubmit={p.onSubmit}
            >
              {p.q.options ? (
                <>
                  <label>Choose your answer</label>
                  <div
                    className="grammar-options"
                    role="radiogroup"
                    aria-label="Answer choices"
                  >
                    {p.q.options.map((option, i) => (
                      <button
                        type="button"
                        role="radio"
                        key={option}
                        className={
                          'grammar-option ' +
                          (p.answer === option ? 'selected' : '') +
                          (p.result && option === p.q.answer
                            ? ' correct-option'
                            : '') +
                          (p.result &&
                          p.answer === option &&
                          !p.result.correct
                            ? ' wrong-option'
                            : '')
                        }
                        onClick={() => p.onAnswer(option)}
                        disabled={!!p.result}
                        aria-checked={p.answer === option}
                      >
                        <span>{String.fromCharCode(65 + i)}</span>
                        {option}
                      </button>
                    ))}
                  </div>
                  <button
                    className="check-answer choice-check"
                    disabled={!!p.result || p.answer.trim() === ''}
                    aria-label="Check selected answer"
                  >
                    <Check size={20} />
                    <span>Check</span>
                  </button>
                </>
              ) : (
                <>
                  <label htmlFor="answer">Your answer</label>
                  <div className="play-answer-controls">
                    <input
                      id="answer"
                      inputMode="numeric"
                      type="number"
                      min="0"
                      step="1"
                      value={p.answer}
                      onChange={(e) => p.onAnswer(e.target.value)}
                      placeholder="?"
                      disabled={!!p.result}
                      required
                      aria-label="Your answer"
                      autoComplete="off"
                    />
                    <button
                      className="check-answer"
                      disabled={!!p.result || p.answer.trim() === ''}
                      aria-label="Submit answer"
                    >
                      <Check size={22} />
                      <span>Check</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <button
            className="play-hint"
            disabled={!!p.result || p.paused}
            onClick={() => {
              setHintPrompt(p.q.prompt);
              p.onHint();
            }}
          >
            <Lightbulb size={16} /> {p.hint ? 'Show my hint' : 'Need a hint?'}
          </button>
        </article>
      </div>




    </section>
  );
}
