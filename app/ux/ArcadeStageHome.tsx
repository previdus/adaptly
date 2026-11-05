'use client';

import React from 'react';
import {
  skills,
  skillsForTopic,
  stats,
  topics,
  type Attempt,
  type TopicId,
} from '../../lib/learning';

type Props = {
  topicId: TopicId;
  level: number;
  totalLevels: number;
  rank: string;
  percent: number;
  focusSkillIndex: number;
  attempts: Attempt[];
  onSelectTopic: (topic: TopicId) => void;
  onLaunchSkill: (skillIndex: number) => void;
  onStartTopic: (topic: TopicId) => void;
  onSprint: (topic: TopicId) => void;
  onArena: (topic: TopicId) => void;
  onDetails: () => void;
};

export default function ArcadeStageHome({
  topicId,
  level,
  totalLevels,
  rank,
  percent,
  focusSkillIndex,
  attempts,
  onSelectTopic,
  onLaunchSkill,
  onStartTopic,
  onSprint,
  onArena,
  onDetails,
}: Props) {
  const currentTopic =
    topics.find((item) => item.id === topicId) ?? topics[0];
  const topicSkills = skillsForTopic(topicId);
  const activeSkill =
    focusSkillIndex >= 0 && skills[focusSkillIndex]?.topic === topicId
      ? focusSkillIndex
      : topicSkills[0];

  return (
    <section
      className="stadium-home-shell"
      aria-label="Cyber-Arcade Game-Show Stage"
      data-testid="arcade-stage-home"
    >
      <div
        className="stadium-subject-marquee"
        role="group"
        aria-label="Game-show channel selector"
      >
        {topics.map((item) => (
          <button
            key={item.id}
            type="button"
            className="stadium-channel-pill"
            aria-pressed={item.id === topicId}
            data-testid={`stadium-topic-${item.id}`}
            onClick={() => onSelectTopic(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      <div className="stadium-jumbotron">
        <div className="stadium-jumbotron-left">
          <div className="stadium-live-badges">
            <span className="stadium-live-pill">● LIVE CLASSROOM STAGE</span>
            <span className="stadium-spec-pill">UP TO 35 RACERS</span>
            <span className="stadium-spec-pill">STAR-TRACK RACE BAR</span>
            <span className="stadium-spec-pill">PROJECTOR MODE</span>
          </div>
          <h2>
            {currentTopic.icon} {currentTopic.name}: Last Star Standing
          </h2>
          <p>
            Host a 10-round classroom showdown on the smartboard or race friends
            live with cosmic rockets and video call.
          </p>
        </div>
        <div className="stadium-jumbotron-cta">
          <button
            type="button"
            className="stadium-mega-btn"
            data-testid="quest-portal-arena"
            onClick={() => onArena(topicId)}
          >
            🏆 ENTER MULTIPLAYER ARENA →
          </button>
        </div>
      </div>

      <div className="stadium-cabinets-row">
        <div className="stadium-cabinet cabinet-campaign">
          <div className="cabinet-header">
            <span>👑 SOLO CHAMPIONSHIP BELT</span>
            <span>
              STAGE {level}/{totalLevels} · {rank.toUpperCase()} ({percent}%)
            </span>
          </div>
          <h3>Tactile 3D Keypad + Adaptive Mastery</h3>
          <p>
            Build a 3-star streak with interactive manipulatives and 2-step
            guided rescue hints.
          </p>
          <button
            type="button"
            className="cabinet-play-btn"
            data-testid="stadium-launch-campaign"
            onClick={() => onStartTopic(topicId)}
          >
            🎮 Play Solo Campaign (Lv.{level}) →
          </button>
        </div>

        <div className="stadium-cabinet cabinet-sprint">
          <div className="cabinet-header">
            <span>⚡ 60-SECOND TURBO SPRINT</span>
            <span>HIGH-SCORE ARCADE</span>
          </div>
          <h3>Beat the 60-Second Clock</h3>
          <p>
            Chain rapid-fire combos in {currentTopic.name} to climb the personal
            best leaderboard.
          </p>
          <button
            type="button"
            className="cabinet-play-btn cabinet-sprint-btn"
            data-testid="stadium-launch-sprint"
            onClick={() => onSprint(topicId)}
          >
            ⚡ Start 60s Turbo Sprint →
          </button>
        </div>
      </div>

      <div className="stadium-ladder-strip">
        <div className="cabinet-header">
          <span>🔥 ARENA SKILL ROSTER ({currentTopic.name.toUpperCase()})</span>
          <button
            type="button"
            className="ux-lab-btn"
            onClick={onDetails}
          >
            Teacher & Parent Guide →
          </button>
        </div>
        <div className="stadium-skill-chips">
          {topicSkills.map((skillIdx, i) => {
            const sk = skills[skillIdx];
            const st = stats(attempts, skillIdx);
            const isCurrent = skillIdx === activeSkill;
            return (
              <button
                key={skillIdx}
                type="button"
                className={
                  'stadium-skill-chip ' +
                  (isCurrent ? 'is-current ' : '') +
                  (st.mastered ? 'is-mastered' : '')
                }
                data-testid={`stadium-skill-${skillIdx}`}
                onClick={() => onLaunchSkill(skillIdx)}
              >
                <span>#{i + 1}</span>
                <span>
                  {sk.icon} {sk.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
