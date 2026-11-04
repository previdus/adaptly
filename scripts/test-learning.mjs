import assert from "node:assert/strict";
import "./ts-loader.mjs";

const {
  generate,
  stats,
  budget,
  selectSkill,
  advanceProgress,
  progressFrom,
  nextConcept,
  stageFor,
  journey,
  questionTime,
} = await import("../lib/learning.ts");

const { celebrations, celebrationFor } = await import("../lib/celebrations.ts");

for (let skill = 0; skill < 8; skill++) {
  for (let level = 1; level <= 3; level++) {
    for (let n = 0; n < 1000; n++) {
      const q = generate(skill, level);
      assert.equal(q.answer, q.a * q.b);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0);
      if (skill === 4) {
        for (const digit of String(q.a)) {
          assert.ok(Number(digit) * q.b < 10, "No-carry question requires a carry");
        }
      }
      if (skill === 5) {
        assert.ok((q.a % 10) * q.b >= 10, "Carry question has no carry");
      }
      if (skill === 6) {
        assert.ok(q.a >= 10 && q.b >= 10);
      }
    }
  }
}

const makeAttempt = (correct, hinted = false, seconds = 10) => ({
  skill: 0,
  level: 1,
  correct,
  hinted,
  seconds,
});

assert.equal(stats(Array.from({ length: 8 }, () => makeAttempt(true, true)), 0).mastered, false);
assert.equal(stats(Array.from({ length: 8 }, () => makeAttempt(true)), 0).mastered, true);
assert.equal(stats([makeAttempt(false)], 0).mastered, false);

const small = { skill: 4, level: 1, a: 12, b: 2, prompt: "12 × 2 = ?" };
const large = { skill: 4, level: 3, a: 2123, b: 3, prompt: "2123 × 3 = ?" };

assert.ok(questionTime(large) > questionTime(small));
assert.ok(
  questionTime({ skill: 5, level: 1, a: 27, b: 3, prompt: "27 × 3" }) >
    questionTime({ ...small, a: 23, b: 3 }),
);
assert.equal(budget([], 4, 1, small), questionTime(small));
assert.ok(budget([makeAttempt(true), makeAttempt(true), makeAttempt(true)], 0, 1) >= 18 * 0.8);

for (let i = 0; i < 8; i++) {
  assert.equal(selectSkill([], i), i);
}

let progress = { stage: 0, run: 0 };
progress = advanceProgress(progress, makeAttempt(true));
assert.deepEqual(progress, { stage: 0, run: 1 });
progress = advanceProgress(progress, makeAttempt(true));
assert.deepEqual(progress, { stage: 0, run: 2 });
progress = advanceProgress(progress, makeAttempt(false));
assert.deepEqual(progress, { stage: 0, run: 0 });
progress = advanceProgress(progress, makeAttempt(true));
progress = advanceProgress(progress, makeAttempt(true, true));
assert.equal(progress.run, 0);

progress = progressFrom([makeAttempt(true), makeAttempt(true), makeAttempt(true)]);
assert.deepEqual(progress, { stage: 1, run: 0 });
assert.deepEqual(
  advanceProgress(progress, makeAttempt(true)),
  progress,
  "Out-of-sequence concepts cannot bypass the pathway",
);

for (let stage = 1; stage < 24; stage++) {
  for (let n = 0; n < 3; n++) {
    progress = advanceProgress(progress, { ...makeAttempt(true), ...stageFor(stage) });
  }
  assert.equal(progress.stage, stage + 1);
}

assert.deepEqual(
  advanceProgress({ stage: 5, run: 2 }, { ...makeAttempt(true), ...stageFor(5) }),
  { stage: 6, run: 0 },
  "Saved streak continues across sessions",
);
assert.equal(
  nextConcept({ stage: 24, run: 0 }, []),
  0,
  "Completing levels without evidence does not falsely claim mastery",
);

const perfect = [];
for (const stage of journey) {
  for (let i = 0; i < 3; i++) {
    perfect.push({ ...makeAttempt(true), skill: stage.skill, level: stage.level });
  }
}
assert.deepEqual(progressFrom(perfect), { stage: 24, run: 0 });
assert.equal(
  nextConcept(progressFrom(perfect), perfect),
  -1,
  "Only completed path plus mastery evidence ends the quest",
);
assert.equal(
  advanceProgress({ stage: 24, run: 2 }, { ...makeAttempt(true), level: 3 }).stage,
  24,
  "The endpoint does not drift into infinite levels",
);

assert.equal(celebrations.length, 50);
assert.equal(
  new Set(Array.from({ length: 50 }, (_, i) => celebrationFor(i + 1).id)).size,
  50,
  "All 50 reward variants appear before repeating",
);

assert.equal(journey.length, 24);
assert.equal(new Set(journey.map((s) => `${s.skill}:${s.level}`)).size, 24);
for (let skill = 0; skill < 8; skill++) {
  const positions = journey.filter((s) => s.skill === skill).map((s) => s.level);
  assert.deepEqual(positions, [1, 2, 3]);
}
assert.ok(
  journey.findIndex((s) => s.skill === 6) >
    journey.findIndex((s) => s.skill === 5 && s.level === 3),
);

let visualSize = 0;
for (const stage of journey.slice(0, 6)) {
  for (let run = 0; run < 3; run++) {
    const q = generate(stage.skill, stage.level, [], run);
    assert.ok(q.answer >= visualSize, "Visual stages never drop back to smaller groups");
    visualSize = q.answer;
  }
}

console.log(
  "PASS: 24,000 questions, carrying rules, adaptive timing, three-answer progression through all 24 stages, mistake/hint resets and saved-session continuity.",
);
