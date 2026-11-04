import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generate, journey, skills, topics } from "../lib/learning";
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
            if (skill === 8) assert.ok((q.a % 10) + (q.b % 10) < 10);
            if (skill === 9) assert.ok((q.a % 10) + (q.b % 10) >= 10);
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
