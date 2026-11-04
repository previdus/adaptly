'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Play,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { questionBank, topicLabel } from '../lib/topic-bank';
import type { TopicId } from '../lib/learning';
import './math-sprint.css';

type Props = {
  name: string;
  identity: string;
  topicId: TopicId;
  onBack: () => void;
};

const ROUND_SECONDS = 60;

export default function MathSprint({ name, identity, topicId, onBack }: Props) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [right, setRight] = useState(0);
  const [miss, setMiss] = useState(0);
  const [notice, setNotice] = useState('');

  const began = useRef(0);
  const bank = questionBank(topicId);
  const label = topicLabel(topicId);
  const key = `adaptly-${topicId}-sprint:${identity}`;
  const defaultSequence = useMemo(() => bank.map((_, i) => i), [bank]);
  const [sequence, setSequence] = useState<number[] | null>(null);
  const activeSequence = sequence ?? defaultSequence;

  const storedBest = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return Number(localStorage.getItem(key) || 0);
      } catch {
        return 0;
      }
    },
    () => 0
  );
  const best = Math.max(storedBest, phase === 'done' ? score : 0);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const left = Math.max(
        0,
        ROUND_SECONDS - (Date.now() - began.current) / 1000
      );
      setSeconds(left);
      if (left <= 0) setPhase('done');
    }, 75);
    return () => clearInterval(id);
  }, [phase]);

  const question = bank[activeSequence[index] ?? 0];
  const pct = (seconds / ROUND_SECONDS) * 100;

  function start() {
    if (!bank.length) return;
    const levels = [...new Set(bank.map((q) => q.step))].sort((a, b) => a - b);
    const ids = levels.flatMap((level) => {
      const bucket = bank
        .map((q, i) => ({ q, i }))
        .filter((x) => x.q.step === level)
        .map((x) => x.i);
      for (let i = bucket.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bucket[i], bucket[j]] = [bucket[j], bucket[i]];
      }
      return bucket;
    });
    setSequence(ids);
    setPhase('playing');
    setSeconds(ROUND_SECONDS);
    setScore(0);
    setRight(0);
    setMiss(0);
    setStreak(0);
    setIndex(0);
    setInput('');
    setNotice('');
    began.current = Date.now();
  }

  function next() {
    setIndex((i) => (i + 1) % activeSequence.length);
    setInput('');
  }

  function submitAnswer(value: string) {
    if (phase !== 'playing' || !question || !value.trim() || notice) return;
    if (seconds <= 0) {
      setSeconds(0);
      setPhase('done');
      return;
    }
    const correct =
      typeof question.answer === 'number'
        ? Number(value) === question.answer
        : value.trim().toLocaleLowerCase() ===
          question.answer.toLocaleLowerCase();
    const remaining = seconds;

    if (correct) {
      const bonus =
        Math.max(5, Math.ceil(remaining / 6)) + Math.min(20, streak * 2);
      setScore((s) => s + 10 + bonus);
      setRight((x) => x + 1);
      setStreak((s) => s + 1);
      setNotice(
        ['Nailed it!', 'Zap! Correct!', 'You’re on fire!', 'Brilliant brain!'][
          right % 4
        ]
      );
    } else {
      setScore((s) => Math.max(0, s - 5));
      setStreak(0);
      setMiss((m) => m + 1);
      setNotice(
        `Not quite — the answer is ${question.answer}. Keep flying!`
      );
    }

    setTimeout(
      () => {
        setNotice('');
        next();
      },
      correct ? 480 : 1150
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    submitAnswer(input);
  }

  useEffect(() => {
    if (phase === 'done') {
      try {
        const current = Number(localStorage.getItem(key) || 0);
        if (score > current) {
          localStorage.setItem(key, String(score));
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [phase, score, key]);

  const difficulty = useMemo(
    () => question?.concept || 'Ready for take-off',
    [question]
  );

  return (
    <div className="sprint-shell">
      <header className="sprint-head">
        <button onClick={onBack}>
          <ArrowLeft size={16} /> All games
        </button>
        <span>
          <span className="sprint-logo">⚡</span> {label.toUpperCase()} SPRINT
        </span>
        <div>
          <Trophy size={15} /> BEST <b>{best}</b>
        </div>
      </header>

      {phase === 'ready' && (
        <section className="sprint-ready">
          <div className="sprint-sunburst" aria-hidden="true">
            <span>＋</span>
            <i>✦</i>
            <i>✧</i>
            <b>GO!</b>
          </div>
          <div className="sprint-ready-copy">
            <span className="sprint-kicker">60 SECONDS · ALL YOU</span>
            <h1>
              Ready for a<br />
              <em>brain sprint?</em>
            </h1>
            <p>
              Solve as many {label.toLowerCase()} questions as you can. Quick
              correct answers earn bonus points. A tiny slip just costs five
              points — bounce back and keep going!
            </p>
            <div className="sprint-mini-stats">
              <span>
                <b>+10</b> correct answer
              </span>
              <span>
                <b>+20</b> streak bonus
              </span>
              <span>
                <b>−5</b> oops buffer
              </span>
            </div>
            <button
              className="sprint-start"
              onClick={start}
              disabled={!activeSequence.length}
            >
              <Play size={19} fill="currentColor" />{' '}
              {activeSequence.length ? 'Start my sprint' : 'Getting ready…'}{' '}
              <ArrowRight size={18} />
            </button>
            <small>
              Questions move from warm-up facts to bigger challenges. You’ve got
              this, {name}!
            </small>
          </div>
        </section>
      )}

      {phase === 'playing' && (
        <section className="sprint-game">
          <div className="sprint-live-bar">
            <span>
              <Zap size={16} /> QUESTION {index + 1}
            </span>
            <div className="sprint-clock">
              <b>{Math.ceil(seconds)}</b>
              <small>SECONDS</small>
            </div>
            <span>
              <Flame size={17} /> {streak} streak
            </span>
          </div>
          <div className="sprint-timer">
            <span
              className={pct < 25 ? 'sprint-urgent' : ''}
              style={{ width: pct + '%' }}
            />
          </div>
          <div className="sprint-game-grid">
            <section className="sprint-question-card">
              <div className="sprint-difficulty">
                <span>{difficulty}</span>
                <span>
                  <Star size={14} fill="currentColor" /> {score} pts
                </span>
              </div>
              <div className="sprint-swoosh" aria-hidden="true">
                ✦　✧
              </div>
              <div className="sprint-prompt" key={question?.id}>
                <span className="sprint-qbadge">{label.toUpperCase()}</span>
                <h1>{question?.prompt}</h1>
              </div>
              {notice && (
                <div
                  className={
                    'sprint-feedback ' +
                    (notice.startsWith('Not') ? 'oops' : 'yay')
                  }
                  role="status"
                >
                  {notice.startsWith('Not') ? '💡' : '✨'} {notice}
                </div>
              )}
              {question?.options ? (
                <div
                  className="sprint-grammar-options"
                  aria-label="Choose an answer"
                >
                  {question.options.map((option, i) => (
                    <button
                      key={option}
                      type="button"
                      disabled={!!notice}
                      onClick={() => submitAnswer(option)}
                    >
                      <b>{String.fromCharCode(65 + i)}</b>
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <form className="sprint-answer" onSubmit={submit}>
                  <label htmlFor="sprint-answer">YOUR ANSWER</label>
                  <div>
                    <input
                      id="sprint-answer"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={input}
                      onChange={(e) =>
                        setInput(e.target.value.replace(/\D/g, '').slice(0, 9))
                      }
                      placeholder="?"
                      autoFocus
                    />
                    <button disabled={!input.trim()}>
                      Answer <ArrowRight size={17} />
                    </button>
                  </div>
                </form>
              )}
              <div className="sprint-hint">
                One question at a time. Focus on your own best score 🌟
              </div>
            </section>

            <aside className="sprint-scorecard">
              <div className="sprint-score-top">
                <span>YOUR SCORE</span>
                <Sparkles size={18} />
              </div>
              <strong>{score}</strong>
              <div className="sprint-score-line" />
              <div className="sprint-stats">
                <div>
                  <b>{right}</b>
                  <span>correct</span>
                </div>
                <div>
                  <b>{miss}</b>
                  <span>try again</span>
                </div>
              </div>
              <div className="sprint-player-chip">
                <span>{name[0]?.toUpperCase() || '✦'}</span>
                {name}
                <small>RUNNER</small>
              </div>
              <div className="sprint-score-mascot">🚀</div>
            </aside>
          </div>
        </section>
      )}

      {phase === 'done' && (
        <section className="sprint-result">
          <div className="sprint-result-stars">✦　✧　✦</div>
          <span className="sprint-kicker">TIME’S UP, SUPERSTAR!</span>
          <div className="sprint-trophy">{score > best ? '🏆' : '🚀'}</div>
          <h1>{score > best ? 'New personal best!' : 'What a sprint!'}</h1>
          <p>Nice flying, {name}. Your best score stays on this device.</p>
          <div className="sprint-result-score">
            <span>THIS RUN</span>
            <b>{score}</b>
            <small>points</small>
          </div>
          <div className="sprint-result-stats">
            <span>
              <b>{right}</b> correct
            </span>
            <span>
              <b>{miss}</b> try-agains
            </span>
            <span>
              <b>{best}</b> personal best
            </span>
          </div>
          <button className="sprint-start" onClick={start}>
            <RefreshCw size={17} /> Run it back <ArrowRight size={18} />
          </button>
          <button className="sprint-back" onClick={onBack}>
            Choose another game
          </button>
        </section>
      )}
    </div>
  );
}
