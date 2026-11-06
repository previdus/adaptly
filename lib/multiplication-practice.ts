import type { Question } from './learning';
import { pickPracticeQuestion } from './practice-pool';

const contexts = [
  ['boxes', 'pencils'], ['bags', 'marbles'], ['trays', 'muffins'],
  ['baskets', 'apples'], ['jars', 'buttons'], ['packets', 'seeds'],
  ['shelves', 'books'], ['crates', 'oranges'], ['albums', 'stickers'],
  ['tubs', 'blocks'], ['envelopes', 'cards'], ['bundles', 'straws']
];

type Pair = [number, number];

function* operands(skill: number, level: number): Generator<Pair> {
  if (skill < 2) {
    const visualPairs: Pair[][] = [
      [[2, 2], [2, 3]], [[2, 4], [3, 3]],
      [[3, 4], [3, 5]], [[4, 4], [4, 5]],
      [[4, 6], [5, 5]], [[5, 6], [6, 6]]
    ];
    yield* visualPairs[(level - 1) * 2 + skill];
    return;
  }
  if (skill === 3) {
    const place = level === 3 ? 100 : 10;
    const min = level === 1 ? 1 : 4;
    const max = level === 1 ? 3 : 9;
    for (let a = min; a <= max; a++) {
      for (let b = 2; b <= 9; b++) yield [a * place, b];
    }
    return;
  }

  const limits = [
    [[1, 4, 1, 5], [2, 8, 2, 8], [6, 12, 6, 12]],
    [[10, 99, 2, 4], [100, 999, 2, 4], [1000, 4999, 2, 4]],
    [[10, 99, 2, 4], [100, 999, 3, 6], [1000, 9999, 6, 9]],
    [[10, 39, 10, 19], [40, 69, 20, 49], [70, 99, 50, 99]],
    [[3, 9, 2, 9], [10, 39, 3, 9], [40, 99, 12, 39]]
  ];
  const index = skill === 2 ? 0 : skill - 3;
  const [aMin, aMax, bMin, bMax] = limits[index][level - 1];
  const width = bMax - bMin + 1;
  for (let shift = 0; shift < width; shift++) {
    for (let a = aMin; a <= aMax; a++) {
      const b = bMin + ((a * 13 + shift) % width);
      if (skill === 2 && a > b && a <= bMax && b >= aMin) continue;
      if (skill === 4 && [...String(a)].some(digit => Number(digit) * b >= 10)) continue;
      if (skill === 5 && a % 10 * b < 10) continue;
      yield [a, b];
    }
  }
}

function makeQuestion(skill: number, level: number, a: number, b: number, index: number): Question {
  const [container, object] = contexts[index % contexts.length];
  const answer = a * b;
  let prompt = `${a} × ${b} = ?`;
  if (skill === 0 || skill === 7) {
    prompt = `There are ${a} ${container} with ${b} ${object} in each. How many ${object} altogether?`;
  }
  if (skill === 1) prompt = `An array has ${a} rows of ${b} ${object}. How many ${object} altogether?`;
  const tens = Math.floor(b / 10) * 10;
  let explanation = b >= 10 && a >= 10
    ? `Split ${b} into ${tens} and ${b - tens}. Add ${a * tens} and ${a * (b - tens)} to get ${answer}.`
    : `${a} groups of ${b} give ${a} × ${b} = ${answer}.`;
  if (skill === 4) {
    explanation = `Multiply each place by ${b}, starting with the ones. Each digit product is below ten, so there is nothing to carry. The answer is ${answer}.`;
  }
  if (skill === 5) {
    const ones = a % 10 * b;
    const carry = Math.floor(ones / 10);
    explanation = `Start with ${a % 10} × ${b} = ${ones}. Write ${ones % 10} in the ones place and carry ${carry} to the tens. Continue one place at a time. The answer is ${answer}.`;
  }
  return {
    skill, level, a, b, answer, prompt, explanation, topicId: 'multiply',
    visual: skill === 0 ? 'groups' : skill === 1 ? 'array' : undefined
  };
}

const pools = new Map<string, Question[]>();

export function multiplicationPractice(skill: number, level: number, previous: string[]) {
  const key = `${skill}:${level}`;
  let pool = pools.get(key);
  if (!pool) {
    pool = [];
    for (const [a, b] of operands(skill, level)) {
      const variants = skill < 2 ? contexts.length : 1;
      for (let i = 0; i < variants; i++) {
        pool.push(makeQuestion(skill, level, a, b, pool.length));
      }
      if (pool.length >= 200) break;
    }
    pools.set(key, pool);
  }
  return { ...pickPracticeQuestion(pool, previous) };
}
