import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generate, journey, journeyFor, questionTime, skills, topics } from "../lib/learning";
import { questionBank, topicLabel } from "../lib/topic-bank";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

describe("Spec 02: Question Banks & Procedural Generators", () => {
  it("FR-2.1: provides a validated 200-question bank with unique IDs and prompts for all 7 topics", () => {
    for (const topic of topics) {
      const bank = questionBank(topic.id);
      assert.equal(bank.length, 200, `Expected 200 questions for ${topic.id}`);
      assert.equal(
        new Set(bank.map((q) => q.id)).size,
        200,
        `Duplicate IDs in ${topic.id} bank`,
      );
      assert.equal(
        new Set(bank.map((q) => q.prompt)).size,
        200,
        `Duplicate prompts in ${topic.id} bank`,
      );
      assert.equal(topicLabel(topic.id), topic.name);
    }
  });

  it("FR-2.2: enforces multiplication carry, no-carry, two-digit, and visual monotonicity invariants", () => {
    for (let skill = 0; skill < 8; skill++) {
      for (let level = 1; level <= 3; level++) {
        for (let sample = 0; sample < 60; sample++) {
          const q = generate(skill, level);
          assert.equal(q.answer, q.a * q.b);
          if (skill === 4) {
            for (const digit of String(q.a)) {
              assert.ok(Number(digit) * q.b < 10);
            }
          }
          if (skill === 5) {
            assert.ok((q.a % 10) * q.b >= 10);
          }
          if (skill === 6) {
            assert.ok(q.a >= 10 && q.b >= 10);
          }
        }
      }
    }

    let previousVisualTotal = 0;
    for (const stage of journey.slice(0, 6)) {
      for (let run = 0; run < 3; run++) {
        const q = generate(stage.skill, stage.level, [], run);
        assert.ok(Number(q.answer) >= previousVisualTotal);
        previousVisualTotal = Number(q.answer);
      }
    }
  });

  it("FR-2.2: enforces arithmetic correctness across addition, subtraction, division, HCF, and LCM generators", () => {
    for (let skill = 8; skill <= 28; skill++) {
      const topic = skills[skill].topic;
      for (let level = 1; level <= 3; level++) {
        const seen: string[] = [];
        for (let step = 0; step < 10; step++) {
          const q = generate(skill, level, seen, step);
          seen.push(q.prompt);
          assert.equal(typeof q.answer, "number");
          assert.ok(Number.isSafeInteger(q.answer) && Number(q.answer) >= 0);

          if (topic === "addition") {
            const expected = skill === 11 ? q.b : q.a + q.b;
            assert.equal(q.answer, expected);
          } else if (topic === "subtraction") {
            const expected = skill === 16 ? q.b : q.a - q.b;
            assert.equal(q.answer, expected);
          } else if (topic === "division") {
            const expected = skill === 21 ? q.a % q.b : q.a / q.b;
            assert.equal(q.answer, expected);
            if (skill === 21) assert.ok(Number(q.answer) >= 1 && Number(q.answer) < q.b);
          } else if (topic === "hcf") {
            assert.equal(q.answer, gcd(q.a, q.b));
          } else if (topic === "lcm") {
            assert.equal(q.answer, lcm(q.a, q.b));
          }
        }
      }
    }
  });

  it("FR-2.3: enforces English Grammar option uniqueness and valid answer inclusion", () => {
    const bank = questionBank("english");
    for (const q of bank) {
      assert.ok(Array.isArray(q.options));
      assert.ok(q.options.length >= 3 && q.options.length <= 4);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.ok(q.options.includes(String(q.answer)));
    }

    for (let skill = 29; skill < skills.length; skill++) {
      for (let level = 1; level <= 3; level++) {
        const q = generate(skill, level, [], 0);
        assert.ok(Array.isArray(q.options));
        assert.ok(q.options!.includes(String(q.answer)));
      }
    }
  });
});

it("follows the Addition rubric and exhausts distinct facts before repeating", () => {
  const widths = [1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
  const carries = [0, 1, 0, 1, 2, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3];
  let previousBudget = 0;
  const path = journeyFor("addition");
  assert.equal(path.length, widths.length);
  for (const { skill, level, stage } of path) {
    const seen: string[] = [];
    const facts = new Set<string>();
    const count = stage === 0 ? 20 : stage === 1 ? 25 : 200;
    let seconds = 0;
    for (let i = 0; i < count; i++) {
      const q = generate(skill, level, seen, i % 3);
      assert.equal(String(q.a).length, widths[stage]);
      assert.equal(String(q.b).length, widths[stage]);
      let incoming = 0;
      let total = 0;
      for (let place = 1; place < 10 ** widths[stage]; place *= 10) {
        incoming = Math.floor(((Math.floor(q.a / place) % 10) +
          (Math.floor(q.b / place) % 10) + incoming) / 10);
        total += incoming;
        if (stage === 3 && place === 1) assert.equal(incoming, 1);
      }
      assert.equal(total, carries[stage]);
      assert.equal(q.answer, skill === 11 ? q.b : q.a + q.b);
      assert.ok(!seen.includes(q.prompt));
      assert.ok(!facts.has([q.a, q.b].sort().join(",")));
      if (stage >= 12) assert.match(q.prompt, /How many/);
      facts.add([q.a, q.b].sort().join(","));
      seen.push(q.prompt);
      seconds = questionTime(q);
      assert.ok(seconds > previousBudget);
    }
    previousBudget = seconds;
    assert.ok(seen.includes(generate(skill, level, seen).prompt));
  }
});
