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

const WINDING_OFFSETS = ['0%', '-18%', '0%', '18%', '0%', '-16%', '14%', '0%'];

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
            🌌 WORLD MAP · {currentTopic.icon} {currentTopic.name} · {rank} (
            {percent}%)
          </span>
          <h2>
            Star Sector {level} of {totalLevels}
          </h2>
          <p>
            Follow the winding star trail with Pip. Tap any planetary node to
            jump straight in.
          </p>
        </div>
        <div className="quest-hero-Portals">
          <button
            type="button"
            className="quest-portal-btn quest-portal-primary"
            data-testid="quest-portal-levelup"
            onClick={() => onStartTopic(topicId)}
          >
            🪐 Launch Active Star (Lv.{level})
          </button>
          <button
            type="button"
            className="quest-portal-btn quest-portal-sprint"
            data-testid="quest-portal-sprint"
            onClick={() => onSprint(topicId)}
          >
            ☄️ 60s Meteor Sprint
          </button>
          <button
            type="button"
            className="quest-portal-btn quest-portal-arena"
            data-testid="quest-portal-arena"
            onClick={() => onArena(topicId)}
          >
            🛸 Multiplayer Star Arena
          </button>
        </div>
      </div>

      <div
        className="quest-winding-trail"
        role="list"
        aria-label={`${currentTopic.name} winding constellation path`}
      >
        {topicSkills.map((skillIdx, stepNumber) => {
          const skill = skills[skillIdx];
          const skillStats = stats(attempts, skillIdx);
          const isCurrent = skillIdx === activeSkill;
          const isMastered = skillStats.mastered;
          const offset = WINDING_OFFSETS[stepNumber % WINDING_OFFSETS.length];

          return (
            <div
              key={skillIdx}
              role="listitem"
              className="quest-stepping-row"
              style={{ '--step-offset': offset } as React.CSSProperties}
              data-testid={`quest-node-${skillIdx}`}
            >
              {stepNumber > 0 && (
                <div className="quest-trail-connector" aria-hidden="true" />
              )}
              <div
                className={
                  'quest-planet-node ' +
                  (isCurrent ? 'is-current ' : '') +
                  (isMastered ? 'is-mastered' : '')
                }
              >
                <div className="quest-planet-orb">
                  <span className="quest-planet-icon" aria-hidden="true">
                    {skill.icon}
                  </span>
                  <span className="quest-planet-number">
                    ★ {stepNumber + 1}
                  </span>
                </div>

                <div className="quest-planet-info">
                  <div className="quest-node-top">
                    <span className="quest-node-step">
                      ORBIT {stepNumber + 1} · TIER {skillStats.level}/3
                    </span>
                    {isCurrent && (
                      <span
                        className="quest-pip-badge"
                        data-testid="quest-pip-here"
                      >
                        🧑‍🚀 Pip is docked here
                      </span>
                    )}
                    {!isCurrent && isMastered && (
                      <span className="quest-pip-badge">✨ Mastered</span>
                    )}
                  </div>
                  <div className="quest-node-title">{skill.name}</div>
                  <p className="quest-node-sub">{skill.sub}</p>
                </div>

                <button
                  type="button"
                  className="quest-node-btn"
                  data-testid={`quest-launch-skill-${skillIdx}`}
                  onClick={() => onLaunchSkill(skillIdx)}
                >
                  {isCurrent
                    ? `Fly to ${skill.name} →`
                    : isMastered
                      ? 'Replay Orbit'
                      : 'Explore Node'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="button" className="ux-lab-btn" onClick={onDetails}>
          Inspect star-chart curriculum guide →
        </button>
      </div>
    </section>
  );
}
