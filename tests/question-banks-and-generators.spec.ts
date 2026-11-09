import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generate, journey, journeyFor, progressFromTopic, questionTime, skills, topics } from "../lib/learning";
import { questionBank, topicLabel } from "../lib/topic-bank";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

describe("Spec 02: Question Banks & Procedural Generators", () => {
  it("FR-2.1: provides a validated 200-question bank with unique IDs and prompts for all registered topics", () => {
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

    let previousMax = 0;
    for (const stage of journey.slice(0, 6)) {
      const seen: string[] = [];
      const totals = new Set<number>();
      for (let i = 0; i < 24; i++) {
        const q = generate(stage.skill, stage.level, seen);
        totals.add(Number(q.answer));
        seen.push(q.prompt);
      }
      assert.ok(totals.size > 1, "Students must count different quantities");
      assert.ok(Math.min(...totals) > previousMax);
      previousMax = Math.max(...totals);
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
            const expected = skill === 21 ? q.a % q.b
              : skill === 22 && level === 3 ? Math.ceil(q.a / q.b)
              : Math.floor(q.a / q.b);
            assert.equal(q.answer, expected);
            if (skill === 21) assert.ok(Number(q.answer) >= 1 && Number(q.answer) < q.b);
          } else if (topic === "hcf") {
            assert.equal(q.answer, skill === 23 ? q.b : gcd(q.a, q.b));
          } else if (topic === "lcm") {
            assert.equal(q.answer, skill === 26 ? q.a * q.b : lcm(q.a, q.b));
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

    for (let skill = 29; skill < 37; skill++) {
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


const expectedPracticeSizes = {
  multiply: [24,24,24,24,24,24,14,28,28,24,48,48,38,166,200,162,200,200,56,200,200,200,200,200],
  subtraction: [36,200,200,135,200,200,200,200,200,200,200,200,200,200,200],
  division: [6,10,24,20,36,42,72,180,200,180,200,200,72,200,200],
  hcf: [24,63,200,79,200,200,79,200,200],
  lcm: [24,63,200,79,200,200,79,200,200],
  english: [200,200,11,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200],
} as const;

function checkPracticeFact(q: ReturnType<typeof generate>) {
  const { skill, level, a, b, answer, topicId } = q;
  if (topicId?.startsWith("english")) {
    assert.ok(q.options?.includes(String(answer)));
    assert.equal(new Set(q.options).size, q.options?.length);
    assert.ok(q.options && q.options.length >= 2 && q.options.length <= 4);
    return;
  }
  if (topicId === "multiply") {
    assert.equal(answer, a * b);
    if (skill === 4) assert.ok([...String(a)].every(digit => Number(digit) * b < 10));
    if (skill === 5) assert.ok(a % 10 * b >= 10);
    if (skill === 6) assert.ok(a >= 10 && b >= 10);
  }
  if (topicId === "subtraction") {
    assert.ok(a > b && b > 0);
    assert.equal(answer, skill === 16 ? b : a - b);
    if (skill === 13 && level === 1) assert.ok(a < 10);
    if (skill === 15) assert.equal(Math.floor(a / 10) % 10, 0);
    if (skill === 13 || skill === 14 || skill === 15) {
      let borrow = 0;
      let borrows = 0;
      for (let place = 1; place <= a; place *= 10) {
        borrow = Number(Math.floor(a / place) % 10 - borrow < Math.floor(b / place) % 10);
        borrows += borrow;
      }
      assert.equal(borrows, skill - 13);
    }
  }
  if (topicId === "division") {
    assert.ok(b >= 2 && a >= b);
    if (skill <= 20) assert.equal(a % b, 0);
    if (skill === 21) assert.ok(a % b > 0);
    assert.equal(answer, skill === 21 ? a % b
      : skill === 22 && level === 3 ? Math.ceil(a / b) : Math.floor(a / b));
  }
  if (topicId === "hcf") {
    assert.equal(answer, skill === 23 ? b : gcd(a, b));
    assert.equal(a % Number(answer), 0);
    assert.equal(b % Number(answer), 0);
  }
  if (topicId === "lcm") {
    assert.equal(answer, skill === 26 ? a * b : lcm(a, b));
    assert.equal(Number(answer) % a, 0);
  }
}

for (const topic of Object.keys(expectedPracticeSizes) as (keyof typeof expectedPracticeSizes)[]) {
  it(`audits the full ${topic} practice sequence against its stage pool sizes and answer rules`, () => {
    const path = journeyFor(topic);
    const counts = expectedPracticeSizes[topic];
    assert.equal(path.length, counts.length);
    for (const { skill, level, stage } of path) {
      const seen: string[] = [];
      for (let i = 0; i < counts[stage]; i++) {
        const q = generate(skill, level, seen);
        assert.ok(!seen.includes(q.prompt), `Repeated ${topic} stage ${stage + 1} after ${i} questions`);
        checkPracticeFact(q);
        seen.push(q.prompt);
      }
      assert.equal(generate(skill, level, seen).prompt, seen[0]);
    }
  });
}


it("teaches that the HCF of two numbers can be one", () => {
  const seen: string[] = [];
  const answers = new Set<number>();
  for (let i = 0; i < 200; i++) {
    const q = generate(24, 3, seen);
    answers.add(Number(q.answer));
    seen.push(q.prompt);
  }
  assert.ok(answers.has(1));
  assert.ok(answers.size > 1);
});

it("offers each existing grammar skill as a separate three-stage game topic", () => {
  const grammar = topics.filter(topic => topic.id.startsWith("english-") && journeyFor(topic.id).length === 3);
  assert.equal(grammar.length, 8);
  for (const topic of grammar) {
    const originalSkill = ["english-nouns", "english-pronouns", "english-verbs", "english-modifiers", "english-agreement", "english-sentences", "english-punctuation", "english-connectives"].indexOf(topic.id) + 29;
    assert.deepEqual(journeyFor(topic.id).map(stage => [stage.skill, stage.level]),
      [1, 2, 3].map(level => [originalSkill, level]));
    const bank = questionBank(topic.id);
    assert.equal(bank.length, 200);
    assert.deepEqual([...new Set(bank.map(q => q.step))], [1, 2, 3]);
    assert.ok(bank.every(q => q.topicId === topic.id && q.options?.includes(String(q.answer))));
  }
});


it("uses old grammar attempts to resume the corresponding new topic", () => {
  const history = Array.from({ length: 3 }, () => ({
    skill: 30, level: 1, correct: true, seconds: 12, hinted: false,
    prompt: "A prior pronoun question", answer: "we", given: "we", at: 1
  }));
  assert.deepEqual(progressFromTopic("english-pronouns", history), { stage: 1, run: 0 });
  assert.deepEqual(progressFromTopic("english-nouns", history), { stage: 0, run: 0 });
});

it("includes a specific explanation and answer for each grammar game question", () => {
  for (const topic of topics.filter(t => t.id.startsWith("english"))) {
    for (const q of questionBank(topic.id)) {
      assert.ok(q.explanation && q.explanation.length > 100);
      assert.ok(q.explanation.includes(String(q.answer)));
    }
  }
});

it("includes worked explanations throughout every Maths game bank", () => {
  for (const topic of topics.filter(t => !t.id.startsWith("english"))) {
    for (const q of questionBank(topic.id)) {
      assert.ok(q.explanation && q.explanation.includes(String(q.answer)));
      assert.ok(q.explanation.length > 60);
    }
  }
});
