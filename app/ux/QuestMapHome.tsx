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

export default function QuestMapHome({
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
      className="quest-map-shell"
      aria-label="Constellation Quest Map"
      data-testid="quest-map-home"
    >
      <div
        className="quest-topic-bar"
        role="group"
        aria-label="One-click subject switcher"
      >
        {topics.map((item) => {
          const isSelected = item.id === topicId;
          return (
            <button
              key={item.id}
              type="button"
              className="quest-topic-pill"
              aria-pressed={isSelected}
              data-testid={`quest-topic-pill-${item.id}`}
              onClick={() => onSelectTopic(item.id)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="quest-hero-banner">
        <div className="quest-hero-copy">
          <span className="ux-lab-pill">
            {currentTopic.icon} {currentTopic.name} · {rank} ({percent}% Mastered)
          </span>
          <h2>
            Constellation Stage {level} of {totalLevels}
          </h2>
          <p>{currentTopic.sub} — tap any star node or launch a live portal.</p>
        </div>
        <div className="quest-hero-Portals">
          <button
            type="button"
            className="quest-portal-btn quest-portal-primary"
            data-testid="quest-portal-levelup"
            onClick={() => onStartTopic(topicId)}
          >
            🚀 Continue Quest (Level {level})
          </button>
          <button
            type="button"
            className="quest-portal-btn quest-portal-sprint"
            data-testid="quest-portal-sprint"
            onClick={() => onSprint(topicId)}
          >
            ⚡ 60s Speed Sprint
          </button>
          <button
            type="button"
            className="quest-portal-btn quest-portal-arena"
            data-testid="quest-portal-arena"
            onClick={() => onArena(topicId)}
          >
            🏆 Last Star Standing
          </button>
        </div>
      </div>

      <div
        className="quest-constellation-grid"
        role="list"
        aria-label={`${currentTopic.name} skill constellation`}
      >
        {topicSkills.map((skillIdx, stepNumber) => {
          const skill = skills[skillIdx];
          const skillStats = stats(attempts, skillIdx);
          const isCurrent = skillIdx === activeSkill;
          const isMastered = skillStats.mastered;

          return (
            <div
              key={skillIdx}
              role="listitem"
              className={
                'quest-node-card ' +
                (isCurrent ? 'is-current ' : '') +
                (isMastered ? 'is-mastered' : '')
              }
              data-testid={`quest-node-${skillIdx}`}
            >
              <div className="quest-node-top">
                <span className="quest-node-step">
                  Star {stepNumber + 1} · Lv.{skillStats.level}
                </span>
                {isCurrent && (
                  <span className="quest-pip-badge" data-testid="quest-pip-here">
                    🦉 Pip is here
                  </span>
                )}
                {!isCurrent && isMastered && (
                  <span className="quest-pip-badge">★ Mastered</span>
                )}
              </div>

              <div>
                <div className="quest-node-title">
                  <span aria-hidden="true">{skill.icon}</span>
                  <span>{skill.name}</span>
                </div>
                <p className="quest-node-sub">{skill.sub}</p>
              </div>

              <button
                type="button"
                className="quest-node-btn"
                data-testid={`quest-launch-skill-${skillIdx}`}
                onClick={() => onLaunchSkill(skillIdx)}
              >
                {isCurrent
                  ? `Play ${skill.name} →`
                  : isMastered
                    ? `Replay ${skill.name}`
                    : `Practice ${skill.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="ux-lab-btn"
          onClick={onDetails}
        >
          How the adaptive path works →
        </button>
      </div>
    </section>
  );
}
