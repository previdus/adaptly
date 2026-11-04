import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advanceProgress,
  advanceTopicProgress,
  budget,
  journey,
  journeyFor,
  nextConcept,
  progressFrom,
  progressFromTopic,
  questionTime,
  selectSkill,
  skills,
  skillsForTopic,
  stageFor,
  stageForTopic,
  stats,
  topicInfo,
  topics,
  type Attempt,
} from "../lib/learning";

const makeAttempt = (
  skill: number,
  level: number,
  correct: boolean,
  hinted = false,
  seconds = 12,
): Attempt => ({
  skill,
  level,
  correct,
  hinted,
  seconds,
  at: 1700000000000,
  prompt: "3 × 4 = ?",
  answer: 12,
  given: correct ? "12" : "11",
});

describe("Spec 01: Adaptive Learning Engine (lib/learning.ts)", () => {
  it("exposes all 7 topics and 37 ordered skills across Maths and English Grammar", () => {
    assert.equal(topics.length, 7);
    assert.equal(skills.length, 37);
    for (const topic of topics) {
      const indices = skillsForTopic(topic.id);
      assert.ok(indices.length >= 3, `Topic ${topic.id} should have at least 3 skills`);
      assert.equal(topicInfo(topic.id).id, topic.id);
      const path = journeyFor(topic.id);
      assert.equal(path.length, indices.length * 3);
    }
  });

  it("FR-1.1: advances stage only after 3 consecutive unassisted correct answers on the current stage", () => {
    let progress = { stage: 0, run: 0 };
    const firstStage = stageFor(0);

    progress = advanceProgress(progress, makeAttempt(firstStage.skill, firstStage.level, true));
    assert.deepEqual(progress, { stage: 0, run: 1 });

    progress = advanceProgress(progress, makeAttempt(firstStage.skill, firstStage.level, true));
    assert.deepEqual(progress, { stage: 0, run: 2 });

    // A hinted answer resets run to 0
    progress = advanceProgress(
      progress,
      makeAttempt(firstStage.skill, firstStage.level, true, true),
    );
    assert.deepEqual(progress, { stage: 0, run: 0 });

    // 3 unassisted right answers advance to stage 1
    for (let i = 0; i < 3; i++) {
      progress = advanceProgress(progress, makeAttempt(firstStage.skill, firstStage.level, true));
    }
    assert.deepEqual(progress, { stage: 1, run: 0 });

    // Out-of-sequence attempt does not advance stage 1
    assert.deepEqual(
      advanceProgress(progress, makeAttempt(firstStage.skill, firstStage.level, true)),
      { stage: 1, run: 0 },
    );
  });

  it("FR-1.1: advances topic-specific pathways across non-multiplication topics without drifting past the final stage", () => {
    for (const topic of topics) {
      const path = journeyFor(topic.id);
      const attempts: Attempt[] = [];
      for (const step of path) {
        for (let i = 0; i < 3; i++) {
          attempts.push(makeAttempt(step.skill, step.level, true));
        }
      }
      const completed = progressFromTopic(topic.id, attempts);
      assert.deepEqual(completed, { stage: path.length, run: 0 });

      const lastStep = stageForTopic(topic.id, path.length - 1);
      const afterExtra = advanceTopicProgress(
        topic.id,
        completed,
        makeAttempt(lastStep.skill, lastStep.level, true),
      );
      assert.equal(afterExtra.stage, path.length);
    }
  });

  it("FR-1.2: requires at least 8 independent recent attempts with >=80% accuracy for mastery evidence", () => {
    const sevenCorrect = Array.from({ length: 7 }, () => makeAttempt(0, 1, true));
    assert.equal(stats(sevenCorrect, 0).mastered, false);

    const eightHinted = Array.from({ length: 8 }, () => makeAttempt(0, 1, true, true));
    assert.equal(stats(eightHinted, 0).mastered, false);

    const eightIndependentFourScore = [
      ...Array.from({ length: 7 }, () => makeAttempt(0, 1, true)),
      makeAttempt(0, 1, false),
    ];
    assert.equal(stats(eightIndependentFourScore, 0).mastered, true);

    const belowEightyPercent = [
      ...Array.from({ length: 6 }, () => makeAttempt(0, 1, true)),
      makeAttempt(0, 1, false),
      makeAttempt(0, 1, false),
    ];
    assert.equal(stats(belowEightyPercent, 0).mastered, false);
  });

  it("FR-1.2: nextConcept returns unmastered skills when stages are finished without full mastery evidence", () => {
    assert.equal(nextConcept({ stage: 24, run: 0 }, []), 0);

    const fullMasteryAttempts: Attempt[] = [];
    for (const step of journey) {
      for (let i = 0; i < 3; i++) {
        fullMasteryAttempts.push(makeAttempt(step.skill, step.level, true));
      }
    }
    assert.deepEqual(progressFrom(fullMasteryAttempts), { stage: 24, run: 0 });
    assert.equal(nextConcept({ stage: 24, run: 0 }, fullMasteryAttempts), -1);
  });

  it("FR-1.4: scales questionTime and personalizes budget within [0.8x, 2.0x] bounds", () => {
    const easy = { skill: 4, level: 1, a: 12, b: 2, prompt: "12 × 2 = ?" };
    const hard = { skill: 5, level: 3, a: 487, b: 8, prompt: "487 × 8 = ?" };
    const grammar = {
      skill: 29,
      level: 2,
      a: 0,
      b: 0,
      prompt: "Choose the noun in the sentence below.",
    };

    const baseEasy = questionTime(easy);
    const baseHard = questionTime(hard);
    const baseGrammar = questionTime(grammar);

    assert.ok(baseHard > baseEasy);
    assert.ok(baseGrammar >= 25 && baseGrammar <= 75);

    const fastHistory = Array.from({ length: 5 }, () => makeAttempt(4, 1, true, false, 2));
    const slowHistory = Array.from({ length: 5 }, () => makeAttempt(4, 1, true, false, 180));

    assert.equal(budget(fastHistory, 4, 1, easy as never), Math.round(baseEasy * 0.8));
    assert.equal(budget(slowHistory, 4, 1, easy as never), Math.round(baseEasy * 2));
  });

  it("selectSkill prioritizes unmastered skills after initial index sweep", () => {
    const masteredZero = Array.from({ length: 9 }, () => makeAttempt(0, 2, true));
    const chosen = selectSkill(masteredZero, 10);
    assert.notEqual(chosen, 0);
  });
});
