'use client';

import React, { useState } from 'react';
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

export default function TactileWorkbenchHome({
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
  const [sandboxRows, setSandboxRows] = useState(4);
  const [sandboxCols, setSandboxCols] = useState(6);
  const [sandboxSplit, setSandboxSplit] = useState(2);

  const currentTopic =
    topics.find((item) => item.id === topicId) ?? topics[0];
  const topicSkills = skillsForTopic(topicId);
  const activeSkill =
    focusSkillIndex >= 0 && skills[focusSkillIndex]?.topic === topicId
      ? focusSkillIndex
      : topicSkills[0];

  const clampedSplit = Math.min(sandboxRows - 1, Math.max(1, sandboxSplit));
  const topProduct = clampedSplit * sandboxCols;
  const bottomProduct = (sandboxRows - clampedSplit) * sandboxCols;
  const totalProduct = sandboxRows * sandboxCols;

  return (
    <section
      className="workbench-home-shell"
      aria-label="Montessori Tactile Workbench"
      data-testid="tactile-workbench-home"
    >
      <header className="workbench-top-strip">
        <div>
          <span className="workbench-blueprint-tag">
            📐 HANDS-ON MATH & GRAMMAR STUDIO · {rank.toUpperCase()} ({percent}
            %)
          </span>
          <h2>Touch, split, and build numbers before you lock them in.</h2>
        </div>
        <div
          className="workbench-topic-tabs"
          role="group"
          aria-label="Workbench subject tabs"
        >
          {topics.map((item) => (
            <button
              key={item.id}
              type="button"
              className="workbench-tab-btn"
              aria-pressed={item.id === topicId}
              data-testid={`workbench-topic-${item.id}`}
              onClick={() => onSelectTopic(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="workbench-two-col">
        <div
          className="workbench-sandbox-card"
          data-testid="workbench-live-sandbox"
        >
          <div className="workbench-card-head">
            <span>🧮 LIVE MANIPULATIVE SANDBOX</span>
            <strong>
              {sandboxRows} × {sandboxCols} = {totalProduct}
            </strong>
          </div>
          <p className="workbench-card-sub">
            Slide the controls to see how a big multiplication block splits into
            two friendly partial products:
          </p>

          <div className="workbench-sliders">
            <label>
              <span>Rows ({sandboxRows})</span>
              <input
                type="range"
                min={2}
                max={8}
                value={sandboxRows}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setSandboxRows(next);
                  if (sandboxSplit >= next) setSandboxSplit(next - 1);
                }}
              />
            </label>
            <label>
              <span>Columns ({sandboxCols})</span>
              <input
                type="range"
                min={2}
                max={9}
                value={sandboxCols}
                onChange={(e) => setSandboxCols(Number(e.target.value))}
              />
            </label>
            <label>
              <span>Split Row ({clampedSplit})</span>
              <input
                type="range"
                min={1}
                max={Math.max(1, sandboxRows - 1)}
                value={clampedSplit}
                onChange={(e) => setSandboxSplit(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="workbench-block-grid" aria-label="Visual block array">
            {Array.from({ length: sandboxRows }, (_, rIdx) => {
              const isTopChunk = rIdx < clampedSplit;
              return (
                <div
                  key={rIdx}
                  className={
                    'workbench-block-row ' +
                    (isTopChunk ? 'chunk-top' : 'chunk-bottom')
                  }
                >
                  <div className="workbench-tiles">
                    {Array.from({ length: sandboxCols }, (_, cIdx) => (
                      <span key={cIdx} className="workbench-tile" />
                    ))}
                  </div>
                  <b className="workbench-row-total">
                    {(rIdx + 1) * sandboxCols}
                  </b>
                </div>
              );
            })}
          </div>

          <div className="workbench-equation-tape">
            <span className="tape-chunk-a">
              Top ({clampedSplit} × {sandboxCols} = {topProduct})
            </span>
            <span>+</span>
            <span className="tape-chunk-b">
              Bottom ({sandboxRows - clampedSplit} × {sandboxCols} ={' '}
              {bottomProduct})
            </span>
            <span>=</span>
            <strong>{totalProduct}</strong>
          </div>
        </div>

        <div className="workbench-launcher-col">
          <div className="workbench-launch-card">
            <span className="workbench-blueprint-tag">
              ACTIVE WORKBENCH · STAGE {level} OF {totalLevels}
            </span>
            <h3>
              {currentTopic.icon} {currentTopic.name} Lab
            </h3>
            <p>
              Practice with an on-screen 3D Arcade Keypad, touchable place-value
              blocks, and 2-step Socratic rescue hints.
            </p>
            <div className="workbench-action-stack">
              <button
                type="button"
                className="workbench-primary-cta"
                data-testid="workbench-launch-practice"
                onClick={() => onStartTopic(topicId)}
              >
                🧱 Open Tactile Lab (Stage {level}) →
              </button>
              <div className="workbench-secondary-row">
                <button
                  type="button"
                  className="workbench-sec-btn"
                  onClick={() => onSprint(topicId)}
                >
                  ⏱️ 60s Lab Sprint
                </button>
                <button
                  type="button"
                  className="workbench-sec-btn"
                  onClick={() => onArena(topicId)}
                >
                  🤝 Multiplayer Lab
                </button>
              </div>
            </div>
          </div>

          <div className="workbench-cartridge-tray">
            <div className="workbench-card-head">
              <span>SKILL CARTRIDGES ({topicSkills.length})</span>
              <button
                type="button"
                className="workbench-link-btn"
                onClick={onDetails}
              >
                Curriculum Guide →
              </button>
            </div>
            <div className="workbench-cartridge-grid">
              {topicSkills.map((skillIdx, i) => {
                const sk = skills[skillIdx];
                const st = stats(attempts, skillIdx);
                const isActive = skillIdx === activeSkill;
                return (
                  <button
                    key={skillIdx}
                    type="button"
                    className={
                      'workbench-cartridge ' +
                      (isActive ? 'is-active ' : '') +
                      (st.mastered ? 'is-mastered' : '')
                    }
                    data-testid={`workbench-skill-${skillIdx}`}
                    onClick={() => onLaunchSkill(skillIdx)}
                  >
                    <span className="cartridge-num">0{i + 1}</span>
                    <span className="cartridge-name">
                      {sk.icon} {sk.name}
                    </span>
                    <span className="cartridge-tier">Lv.{st.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
