'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Flame,
  Heart,
  Hourglass,
  Medal,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { topicLabel } from '../lib/topic-bank';
import type { TopicId } from '../lib/learning';
import './arena-hub.css';

type Player = {
  id: string;
  name: string;
  lives: number;
  score: number;
  active: boolean;
  answered: boolean;
  isYou: boolean;
};

type RoomHistoryEntry = {
  round: number;
  questionId: string;
  safeId: string | null;
  safeName: string | null;
  lostIds: string[];
  correctCount: number;
  message: string;
};

type RoomQuestion = {
  id: string;
  concept: string;
  prompt: string;
  seconds: number;
  step: number;
  options?: string[];
};

type Room = {
  code: string;
  topicId?: TopicId;
  topicLabel?: string;
  status: 'lobby' | 'playing' | 'finished';
  round: number;
  totalRounds: number;
  roundStartedAt: number;
  roundEndsAt: number;
  nextAt: number;
  question: RoomQuestion | null;
  players: Player[];
  history: RoomHistoryEntry[];
  winnerId: string | null;
  playerId: string;
  canStart: boolean;
  isHost: boolean;
  hasAnswered: boolean;
  myLife: number;
  myAnswerCorrect: boolean | null;
};

type ArenaApiResponse = {
  room: Room;
  token?: string;
  code?: string;
  error?: string;
};

type Props = {
  name?: string;
  topicId: TopicId;
  onBack: () => void;
  onSwitchSprint: (topic: TopicId) => void;
};

const initialRoom = (
  sessionStorageSafe: Storage | null,
  code: string
): { token: string; code: string } | null => {
  if (!sessionStorageSafe) return null;
  try {
    const raw = sessionStorageSafe.getItem('mq-arena:' + code);
    return raw ? (JSON.parse(raw) as { token: string; code: string }) : null;
  } catch {
    return null;
  }
};

async function post(body: Record<string, unknown>): Promise<ArenaApiResponse> {
  const r = await fetch('/api/arena', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = (await r.json()) as ArenaApiResponse;
  if (!r.ok) {
    throw new Error(d.error || 'Could not join the arena.');
  }
  return d;
}

function Pip({ size = 36 }: { size?: number }) {
  return (
    <span
      className="arena-pip"
      style={{ width: size, height: size, fontSize: size * 0.52 }}
      aria-hidden="true"
    >
      ✦
    </span>
  );
}

export default function ArenaHub({
  name = 'Explorer',
  topicId,
  onBack,
  onSwitchSprint,
}: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [playerName, setPlayerName] = useState(name);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);

  const label = topicLabel(room?.topicId || topicId);
  const roomCode = room?.code || '';

  const load = useCallback(async (c: string, t: string, syncSession = false) => {
    if (!c || !t) return;
    try {
      const r = await fetch(
        `/api/arena?code=${encodeURIComponent(c)}&token=${encodeURIComponent(t)}`,
        { cache: 'no-store' }
      );
      const d = (await r.json()) as ArenaApiResponse;
      if (!r.ok) {
        throw new Error(d.error || 'The room is no longer available.');
      }
      if (syncSession) {
        setCode(c);
        setToken(t);
      }
      setRoom(d.room);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The room is no longer available.');
    }
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!roomCode || !token) return;
    const id = setInterval(() => {
      void load(roomCode, token);
    }, 700);
    return () => clearInterval(id);
  }, [roomCode, token, load]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const last = sessionStorage.getItem('mq-arena-last');
        if (last) {
          const saved = initialRoom(sessionStorage, last);
          if (saved) {
            void load(saved.code, saved.token, true);
          }
        }
      } catch {
        // Ignore sessionStorage errors in restricted browsing modes
      }
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  const active = room?.players.filter((p) => p.active) || [];
  const you = room?.players.find((p) => p.isYou);
  const winner = room?.players.find((p) => p.id === room.winnerId);
  const timeLeft =
    room?.question && now > 0 ? Math.max(0, (room.roundEndsAt - now) / 1000) : 0;
  const pct = room?.question
    ? Math.max(0, Math.min(100, (timeLeft / room.question.seconds) * 100))
    : 0;
  const elapsed = room?.question ? Math.max(0, Math.min(100, 100 - pct)) : 0;

  async function enter(actionKind: 'create' | 'join') {
    setBusy(true);
    setError('');
    try {
      const d = await post(
        actionKind === 'create'
          ? { action: actionKind, name: playerName.trim(), topicId }
          : { action: actionKind, code: code.trim(), name: playerName.trim() }
      );
      setRoom(d.room);
      if (d.token && d.code) {
        setToken(d.token);
        setCode(d.code);
        sessionStorage.setItem(
          'mq-arena:' + d.code,
          JSON.stringify({ code: d.code, token: d.token })
        );
        sessionStorage.setItem('mq-arena-last', d.code);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not join the arena.');
    } finally {
      setBusy(false);
    }
  }

  async function action(kind: string, extra: Record<string, unknown> = {}) {
    if (!room) return;
    setBusy(true);
    setError('');
    try {
      const d = await post({ action: kind, code: room.code, token, ...extra });
      setRoom(d.room);
      if (kind === 'answer') setAnswer('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(room?.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Your room code is ' + room?.code);
    }
  }

  function backToLobby() {
    if (!room) return;
    sessionStorage.removeItem('mq-arena:' + room.code);
    sessionStorage.removeItem('mq-arena-last');
    setRoom(null);
    setToken('');
    setError('');
  }

  return (
    <div className="arena-hub">
      <div className="arena-head">
        <button
          className="arena-back"
          onClick={() => {
            if (room?.status === 'lobby') {
              void action('leave').finally(backToLobby);
            } else if (room?.status === 'playing') {
              void action('leave').finally(() => {
                backToLobby();
                onBack();
              });
            } else {
              onBack();
            }
          }}
        >
          <ArrowLeft size={17} />{' '}
          {room?.status === 'lobby'
            ? 'Leave room'
            : room?.status === 'playing'
              ? 'Leave game'
              : 'All games'}
        </button>
        <span className="arena-brand">
          <span className="arena-brand-mark">A</span> {label.toUpperCase()} ARENA
        </span>
        <button
          className="arena-switch"
          onClick={() => onSwitchSprint(room?.topicId || topicId)}
        >
          <Zap size={15} /> Sprint
        </button>
      </div>

      {error && (
        <div className="arena-alert" role="alert">
          {error}
          <button onClick={() => setError('')} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {!room && (
        <section className="arena-portal">
          <div className="arena-hero-copy">
            <span className="arena-kicker">
              <Users size={14} /> THE FASTEST-MINDS GAME
            </span>
            <h1>
              Ready, set,
              <br />
              <em>{label.toLowerCase()}!</em>
            </h1>
            <p>
              Race your friends. Be the quickest with a correct answer to keep
              your hearts. Last player standing takes the crown.
            </p>
            <div className="arena-hero-meta">
              <span>
                <Heart fill="currentColor" size={16} /> 3 lives each
              </span>
              <span>
                <Hourglass size={16} /> One shared timer
              </span>
              <span>
                <Trophy size={16} /> 2–8 players
              </span>
            </div>
            <div className="arena-orbit-scene" aria-hidden="true">
              <span className="arena-moon">×</span>
              <span className="arena-float-star star1">✦</span>
              <span className="arena-float-star star2">✧</span>
              <span className="arena-sat sat1">7</span>
              <span className="arena-sat sat2">×</span>
              <span className="arena-float-emoji">🚀</span>
              <span className="arena-orbit-label">
                LEARNING · BUT MAKE IT A RACE
              </span>
            </div>
          </div>

          <div className="arena-entry-card">
            <Pip size={42} />
            <span className="arena-kicker">JOIN THE QUEST</span>
            <h2>Who’s playing today?</h2>
            <label>
              Player name
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                maxLength={20}
                placeholder="Your name"
              />
            </label>
            <button
              className="arena-create"
              disabled={busy || !playerName.trim()}
              onClick={() => void enter('create')}
            >
              <Sparkles size={17} /> Create a room <ArrowRight size={17} />
            </button>
            <div className="arena-divider">
              <span>OR JOIN A FRIEND</span>
            </div>
            <label>
              5-letter room code
              <input
                className="room-code-input"
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-HJ-NP-Z2-9]/g, '')
                      .slice(0, 5)
                  )
                }
                maxLength={5}
                placeholder="A2B4C"
                autoCapitalize="characters"
              />
            </label>
            <button
              className="arena-join"
              disabled={busy || code.length !== 5 || !playerName.trim()}
              onClick={() => void enter('join')}
            >
              {busy ? 'Joining…' : 'Join the room'} <ChevronRight size={17} />
            </button>
            <p className="arena-safe-note">
              <Shield size={13} /> Pick a nickname. No personal details needed.
            </p>
          </div>
        </section>
      )}

      {room?.status === 'lobby' && (
        <section className="arena-room-lobby">
          <div className="arena-lobby-title">
            <div>
              <span className="arena-kicker">
                ROOM IS READY · {room.players.length}/8 PLAYERS
              </span>
              <h1>Call your crew!</h1>
              <p>Share the code. The countdown starts when the host is ready.</p>
            </div>
            <div className="arena-code-ticket">
              <span>ROOM CODE</span>
              <b>{room.code}</b>
              <button onClick={() => void copyCode()}>
                {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
                {copied ? 'Copied' : 'Copy code'}
              </button>
            </div>
          </div>

          <div className="arena-lobby-grid">
            <section className="arena-player-list">
              <div className="arena-panel-head">
                <h2>
                  <Users size={18} /> Your players
                </h2>
                <span>{room.players.length} joined</span>
              </div>
              {room.players.map((p, i) => (
                <div className="arena-lobby-player" key={p.id}>
                  <span className={'arena-player-avatar av' + i}>
                    {' '}
                    {['🚀', '🦊', '🐸', '🦄', '🐼', '🐙', '🐯', '🐝'][i]}
                  </span>
                  <div>
                    <b>
                      {p.name}
                      {p.isYou ? ' (you)' : ''}
                    </b>
                    <small>{i === 0 ? 'ROOM HOST' : 'READY TO RACE'}</small>
                  </div>
                  {i === 0 && <Medal size={19} className="arena-host-medal" />}
                  <span className="arena-ready-dot" />
                </div>
              ))}
              {room.players.length < 2 && (
                <div className="arena-empty-seat">
                  <span>✧</span>
                  <p>Waiting for another player…</p>
                </div>
              )}
              <div className="arena-invite">
                <span>↗</span> Send the room code to friends or family
              </div>
            </section>

            <section className="arena-rules">
              <div className="arena-rule-number">01</div>
              <h2>How to win</h2>
              <div className="arena-rule">
                <span className="rule-heart">♥ ♥ ♥</span>
                <p>
                  Everyone starts with <b>3 lives</b>.
                </p>
              </div>
              <div className="arena-rule">
                <span className="rule-bolt">⚡</span>
                <p>
                  The <b>fastest correct answer</b> stays safe.
                </p>
              </div>
              <div className="arena-rule">
                <span className="rule-crack">💔</span>
                <p>
                  Everyone else loses a life. Zero lives? Watch and cheer!
                </p>
              </div>
              <div className="arena-rule">
                <span className="rule-crown">👑</span>
                <p>Last player standing wins the crown.</p>
              </div>
              {room.isHost ? (
                <button
                  className="arena-start"
                  disabled={!room.canStart || busy}
                  onClick={() => void action('start')}
                >
                  <Play size={18} fill="currentColor" />{' '}
                  {room.players.length < 2
                    ? 'Waiting for players…'
                    : 'Start the match!'}
                </button>
              ) : (
                <div className="arena-wait-host">
                  <Hourglass size={18} /> Waiting for {room.players[0]?.name} to
                  start…
                </div>
              )}
              <small className="arena-bank-note">
                {room.totalRounds} {room.topicLabel || label} questions · 2–8
                players · Timer grows with the challenge
              </small>
            </section>
          </div>
        </section>
      )}

      {room?.status === 'playing' && (
        <section className="arena-live">
          <div className="arena-live-heading">
            <div>
              <span className="arena-kicker">
                <span className="arena-live-dot" /> LIVE ROUND {room.round}
              </span>
              <h1>
                {room.myLife > 0
                  ? 'Keep your hearts!'
                  : 'You’re watching the showdown!'}
              </h1>
            </div>
            <div
              className="arena-heart-count"
              aria-label={`${room.myLife} lives remaining`}
            >
              <span>
                {Array.from({ length: 3 }, (_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    fill={i < room.myLife ? 'currentColor' : 'transparent'}
                    className={i < room.myLife ? 'heart-on' : 'heart-off'}
                  />
                ))}
              </span>
              <b>
                {room.myLife}
                <small> / 3</small>
              </b>
            </div>
          </div>

          <div className="arena-live-layout">
            <section className="arena-question-panel">
              <div className="arena-question-top">
                <span>
                  QUESTION {room.round} <i>·</i> {room.question?.concept}
                </span>
                <span className={pct < 25 ? 'timer-hot' : ''}>
                  <Hourglass size={15} /> {Math.ceil(timeLeft)}
                  <small>s</small>
                </span>
              </div>
              <div className="arena-timer-track">
                <span
                  className={pct < 25 ? 'timer-hot' : ''}
                  style={{ width: pct + '%' }}
                />
              </div>
              <div
                className="arena-countdown-ring"
                style={{ '--progress': `${elapsed}%` } as CSSProperties}
              >
                <div>
                  <b>{Math.ceil(timeLeft)}</b>
                  <small>SECONDS</small>
                </div>
              </div>
              <div className="arena-question-copy">
                {room.question ? (
                  <>
                    <span className="arena-question-kicker">
                      ⚡ FIRST CORRECT ANSWER WINS SAFETY
                    </span>
                    <h2>{room.question.prompt}</h2>
                  </>
                ) : (
                  <>
                    <span className="arena-question-kicker">ROUND COMPLETE</span>
                    <h2>The next question is loading…</h2>
                  </>
                )}
              </div>

              {you?.active &&
                room.question &&
                !room.hasAnswered &&
                (room.question.options ? (
                  <div
                    className="arena-choice-grid"
                    role="group"
                    aria-label="Choose an answer"
                  >
                    {room.question.options.map((option, i) => (
                      <button
                        key={option}
                        disabled={busy}
                        onClick={() => void action('answer', { value: option })}
                      >
                        <b>{String.fromCharCode(65 + i)}</b>
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <form
                    className="arena-answer-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (answer.trim()) {
                        void action('answer', { value: answer });
                      }
                    }}
                  >
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={answer}
                      onChange={(e) =>
                        setAnswer(e.target.value.replace(/\D/g, '').slice(0, 9))
                      }
                      placeholder="Your answer"
                      aria-label="Your answer"
                      disabled={busy || room.hasAnswered}
                      autoFocus
                    />
                    <button
                      disabled={busy || room.hasAnswered || !answer.trim()}
                    >
                      {room.hasAnswered ? 'Locked in!' : 'Lock it in'}{' '}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ))}

              {you?.active && room.hasAnswered && room.question && (
                <div className="arena-locked">
                  <Check size={17} /> Answer locked. Stay sharp — lives update
                  when the round ends.
                </div>
              )}

              {you && !you.active && (
                <div className="arena-spectator-note">
                  <span>🎟️</span>
                  <div>
                    <b>Front-row spectator!</b>
                    <small>
                      Your race is over, but you can still watch every round.
                    </small>
                  </div>
                </div>
              )}

              {room.nextAt > now && (
                <div className="arena-round-result">
                  <Sparkles size={18} />
                  <span>
                    {room.history.at(-1)?.safeId === room.playerId ? (
                      <>You were fastest correct — hearts safe!</>
                    ) : room.history.at(-1)?.lostIds.includes(room.playerId) ? (
                      room.hasAnswered && room.myAnswerCorrect ? (
                        <>Correct, but another racer was quicker.</>
                      ) : (
                        <>Try again next round.</>
                      )
                    ) : (
                      room.history.at(-1)?.message
                    )}
                  </span>
                  <small>Next round loading…</small>
                </div>
              )}

              <div className="arena-wait-players">
                {active.filter((p) => p.answered).length} of {active.length}{' '}
                racers locked in{' '}
                <span>
                  {active
                    .filter((p) => p.answered)
                    .map(() => '✓')
                    .join(' ') || '…'}
                </span>
              </div>
            </section>

            <aside className="arena-scoreboard">
              <div className="arena-score-head">
                <h2>
                  <Trophy size={18} /> Live standings
                </h2>
                <span>{active.length} IN</span>
              </div>
              {room.players.map((p, i) => (
                <div
                  key={p.id}
                  className={
                    'arena-score-player ' +
                    (!p.active ? 'is-out ' : '') +
                    (p.isYou ? 'is-you' : '')
                  }
                >
                  <span className="arena-rank-number">
                    {i === 0 && p.active ? '👑' : `${i + 1}`}
                  </span>
                  <div className="arena-score-name">
                    <b>
                      {p.name}
                      {p.isYou ? ' · YOU' : ''}
                    </b>
                    <small>
                      {p.active
                        ? p.answered
                          ? 'ANSWER LOCKED'
                          : 'THINKING…'
                        : 'SPECTATING'}
                    </small>
                  </div>
                  <span
                    className="arena-score-lives"
                    aria-label={`${p.lives} lives`}
                  >
                    {Array.from({ length: 3 }, (_, j) => (
                      <i key={j} className={j < p.lives ? '' : 'spent'} />
                    ))}
                  </span>
                  <b className="arena-score-points">{p.score}</b>
                </div>
              ))}
              <div className="arena-score-foot">
                <Flame size={15} /> Top score breaks a final tie
              </div>
            </aside>
          </div>
        </section>
      )}

      {room?.status === 'finished' && (
        <section className="arena-finish">
          <div className="arena-fireworks" aria-hidden="true">
            ✦　✧　✹　✦
          </div>
          <span className="arena-kicker">THE LAST ONE STANDING</span>
          <div className="arena-winner-medal">{winner ? '🏆' : '✨'}</div>
          <h1>{winner ? `${winner.name} takes the crown!` : 'What a race!'}</h1>
          <p>
            {winner?.id === room.playerId
              ? 'You outlasted everyone. That was brilliant!'
              : winner
                ? `${winner.name} was the last player with a heart.`
                : 'Every racer gave it their all.'}
          </p>
          <div className="arena-final-board">
            {room.players
              .toSorted((a, b) => b.lives - a.lives || b.score - a.score)
              .map((p, i) => (
                <div
                  className={'arena-final-row ' + (i === 0 ? 'champion' : '')}
                  key={p.id}
                >
                  <span>{['🥇', '🥈', '🥉'][i] || `#${i + 1}`}</span>
                  <b>
                    {p.name}
                    {p.isYou ? ' (you)' : ''}
                  </b>
                  <span>{p.lives} ♥</span>
                  <strong>{p.score} pts</strong>
                </div>
              ))}
          </div>
          <div className="arena-finish-actions">
            <button className="arena-create" onClick={backToLobby}>
              <RefreshCw size={17} /> Race again
            </button>
            <button className="arena-join" onClick={onBack}>
              Back to games <ArrowRight size={17} />
            </button>
          </div>
          <p className="arena-bank-note">
            The arena keeps a 200-question bank ready for your next match.
          </p>
        </section>
      )}
    </div>
  );
}
