'use client';

import React from 'react';
import { buildStarTrackStandings } from '../../lib/ux-variants';

type ArenaPlayerView = {
  id: string;
  name: string;
  lives: number;
  score: number;
  active: boolean;
  answered: boolean;
  isYou: boolean;
};

type Props = {
  players: ArenaPlayerView[];
  round: number;
  totalRounds: number;
  roomCode: string;
  projectorMode: boolean;
  onToggleProjector: () => void;
};

export default function StarTrackRaceBar({
  players,
  round,
  totalRounds,
  roomCode,
  projectorMode,
  onToggleProjector,
}: Props) {
  const racers = buildStarTrackStandings(players, round, totalRounds);

  return (
    <section
      className="star-track-banner"
      aria-label="Live Star-Track Race"
      data-testid="star-track-race"
    >
      <div className="star-track-top">
        <div className="star-track-title">
          <span>🌌 Star-Track Race · Room {roomCode}</span>
          <span>
            Round {round} of {totalRounds}
          </span>
        </div>
        <button
          type="button"
          className="projector-toggle-btn"
          aria-pressed={projectorMode}
          data-testid="projector-mode-toggle"
          onClick={onToggleProjector}
        >
          {projectorMode
            ? '📽️ Smartboard Projector Mode: ON'
            : '📽️ Smartboard Projector Mode'}
        </button>
      </div>

      <div className="star-track-lanes" role="list" aria-label="Racer lanes">
        {racers.map((racer) => (
          <div
            key={racer.id}
            role="listitem"
            className={
              'star-track-lane ' +
              (racer.state === 'charged' ? 'is-charged' : '')
            }
            data-testid={`star-track-racer-${racer.name}`}
            data-racer-state={racer.state}
          >
            <div
              className="star-track-fill"
              style={{ width: `${racer.progressPct}%` }}
            />
            <div className="star-track-racer">
              <span>
                {racer.avatar} {racer.name}
                {racer.isYou ? ' (You)' : ''} · {'♥'.repeat(racer.lives)}
              </span>
              <span className="star-track-status-pill">
                {racer.state === 'charged'
                  ? '⚡ Charged!'
                  : racer.state === 'thinking'
                    ? '⏳ Solving…'
                    : '🎟️ Spectating'}{' '}
                · {racer.score} pts ({racer.progressPct}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
