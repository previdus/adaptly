import type { Question, TopicId } from './learning';
import { pickPracticeQuestion } from './practice-pool';

type Pair = [number, number];

function borrowCount(a: number, b: number) {
  let borrow = 0;
  let count = 0;
  while (a > 0) {
    borrow = Number(a % 10 - borrow < b % 10);
    count += borrow;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return count;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

function* pairs(aMin: number, aMax: number, bMin: number, bMax: number): Generator<Pair> {
  const width = bMax - bMin + 1;
  const size = (aMax - aMin + 1) * width;
  // Interleave the range diagonally so a short pool covers the whole interval.
  for (let j = 0; j < width; j++) {
    for (let i = 0; i < size / width; i++) {
      yield [aMin + i, bMin + ((i * 17 + j) % width)];
    }
  }
}

function* subtractionPairs(skill: number, level: number): Generator<Pair> {
  const ranges = [[1, 9], [10, 49], [50, 99]];
  const [min, max] = skill === 13 ? ranges[level - 1]
    : skill === 14 ? [[10, 39], [40, 99], [100, 399]][level - 1]
    : [[100, 299], [300, 699], [700, 999]][level - 1];
  const lower = min >= 10 ? 10 : 1;
  for (const [a, b] of pairs(min, max, lower, max - 1)) {
    if (a <= b) continue;
    const borrows = borrowCount(a, b);
    if (skill === 13 && borrows !== 0) continue;
    if (skill === 14 && borrows !== 1) continue;
    if (skill === 15 && (a % 100 >= 10 || borrows !== 2)) continue;
    if (skill >= 16 && borrows !== (level === 1 ? 0 : level - 1)) continue;
    yield [a, b];
  }
}

function* divisionPairs(skill: number, level: number): Generator<Pair> {
  const [minDivisor, maxDivisor, minQuotient, maxQuotient] = (
    skill === 18 ? [[2, 3, 2, 4], [4, 5, 2, 6], [6, 9, 3, 8]]
    : skill === 19 ? [[2, 5, 2, 6], [4, 9, 5, 10], [6, 12, 7, 12]]
    : [[2, 5, 12, 29], [4, 9, 30, 59], [6, 12, 60, 99]]
  )[level - 1];
  for (const [divisor, quotient] of pairs(minDivisor, maxDivisor, minQuotient, maxQuotient)) {
    if (skill === 21 || (skill === 22 && level > 1)) {
      for (let remainder = 1; remainder < divisor; remainder++) {
        yield [divisor * quotient + remainder, divisor];
      }
    } else {
      yield [divisor * quotient, divisor];
    }
  }
}

function* factorPairs(skill: number, level: number): Generator<Pair> {
  if (skill === 23 || skill === 26) {
    const [min, max] = [[2, 5], [6, 12], [13, 30]][level - 1];
    for (const [base, times] of pairs(min, max, 2, 4 + level * 3)) {
      yield skill === 23 ? [base * times, base] : [base, times];
    }
    return;
  }
  const [min, max] = [[4, 24], [12, 52], [24, 96]][level - 1];
  for (const [a, b] of pairs(min, max, min, max)) {
    if (a >= b) continue;
    const coprime = gcd(a, b) === 1;
    const includeHcfOne = skill === 24 && level === 3 && (a + b) % 5 === 0;
    if (coprime && !includeHcfOne) continue;
    if (level > 1 && b % a === 0) continue;
    yield [a, b];
  }
}

function subtraction(skill: number, level: number, a: number, b: number, index: number) {
  const difference = a - b;
  if (skill === 16) {
    return { prompt: `${a} − □ = ${difference}. What goes in the box?`, answer: b,
      explanation: `Subtract the result from the starting amount: ${a} − ${difference} = ${b}.` };
  }
  const stories = [
    `A shop had ${a} pencils and sold ${b}. How many pencils are left?`,
    `One team scored ${a} points and another scored ${b}. How many more points did the first team score?`,
    `A library needs ${a} books for a display. It has collected ${b}. How many more books does it need?`
  ];
  return { prompt: skill === 17 ? stories[(level - 1 + index % 2) % stories.length] : `${a} − ${b} = ?`,
    answer: difference, explanation: `Find the difference: ${a} − ${b} = ${difference}.` };
}

function division(skill: number, level: number, a: number, b: number, index: number) {
  const quotient = Math.floor(a / b);
  const remainder = a % b;
  const objects = ['stickers', 'cards', 'tokens'][index % 3];
  const prompts = [
    `Share ${a} ${objects} equally among ${b} children. How many does each child get?`,
    `${a} ÷ ${b} = ?`,
    `${a} ÷ ${b} = ?`,
    `What is the remainder when ${a} is divided by ${b}?`,
    [
      `A club splits ${a} ${objects} equally into ${b} packs. How many are in each pack?`,
      `Put ${a} ${objects} into packs of ${b}. How many full packs can you make?`,
      `A box holds up to ${b} ${objects}. What is the fewest boxes needed for all ${a} ${objects}?`
    ][level - 1]
  ];
  if (skill === 22 && level === 3) {
    return {
      prompt: prompts[4],
      answer: quotient + 1,
      explanation: `${quotient} full boxes leave ${remainder} ${objects}. Use one more box, for ${quotient + 1} in total.`
    };
  }
  return { prompt: prompts[skill - 18], answer: skill === 21 ? remainder : quotient,
    explanation: `${b} × ${quotient} = ${b * quotient}. There are ${remainder} left over.` };
}

function factors(skill: number, a: number, b: number) {
  const factor = gcd(a, b);
  const multiple = a / factor * b;
  const drafts = [
    { prompt: `${a} ÷ □ = ${a / b}. Which factor goes in the box?`, answer: b,
      explanation: `${b} × ${a / b} = ${a}, so ${b} is a factor.` },
    { prompt: `Find the HCF of ${a} and ${b}.`, answer: factor,
      explanation: `${factor} is the greatest number that divides both ${a} and ${b} exactly.` },
    { prompt: `Two ribbons measure ${a} cm and ${b} cm. Cut both into pieces of the same length with no waste. What is the longest length, in cm?`, answer: factor,
      explanation: `The longest length must divide both ribbon lengths. Their HCF is ${factor}.` },
    { prompt: `Start at zero and count by ${a}. What number do you reach after ${b} jumps?`, answer: a * b,
      explanation: `The ${b}th positive multiple is ${a} × ${b} = ${a * b}.` },
    { prompt: `Find the LCM of ${a} and ${b}.`, answer: multiple,
      explanation: `${multiple} is the first positive number in both lists of multiples.` },
    { prompt: `Two bells ring together now. One rings every ${a} minutes and the other every ${b} minutes. In how many minutes will they next ring together?`, answer: multiple,
      explanation: `Find the first shared positive multiple of the two intervals. It is ${multiple} minutes.` }
  ];
  return drafts[skill - 23];
}

const pools = new Map<string, Question[]>();

function buildPool(skill: number, level: number, topicId: TopicId) {
  const candidates = skill < 18 ? subtractionPairs(skill, level)
    : skill < 23 ? divisionPairs(skill, level) : factorPairs(skill, level);
  const pool: Question[] = [];
  for (const [a, b] of candidates) {
    const index = pool.length;
    const draft = skill < 18 ? subtraction(skill, level, a, b, index)
      : skill < 23 ? division(skill, level, a, b, index) : factors(skill, a, b);
    pool.push({ skill, level, a, b, topicId, ...draft });
    if (pool.length === 200) break;
  }
  return pool;
}

export function arithmeticPractice(skill: number, level: number, topicId: TopicId, previous: string[]) {
  const key = `${skill}:${level}`;
  const pool = pools.get(key) ?? buildPool(skill, level, topicId);
  pools.set(key, pool);
  return { ...pickPracticeQuestion(pool, previous) };
}
