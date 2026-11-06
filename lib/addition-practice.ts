import type { Question } from './learning';

const stages = [
  [1, 0, 18], [1, 1, 22], [2, 0, 30],
  [2, 1, 36], [2, 2, 42], [3, 0, 46],
  [3, 1, 50], [3, 2, 54], [3, 3, 58],
  [3, 1, 62], [3, 2, 66], [3, 3, 70],
  [3, 1, 74], [3, 2, 78], [3, 3, 82]
] as const;

const stageIndex = (skill: number, level: number) => (skill - 8) * 3 + level - 1;

export function additionTime(skill: number, level: number) {
  return stages[stageIndex(skill, level)][2];
}

function carryCount(a: number, b: number, digits: number) {
  let carry = 0;
  let count = 0;
  for (let column = 0; column < digits; column++) {
    carry = Math.floor((a % 10 + b % 10 + carry) / 10);
    count += carry;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return count;
}

const stories = [
  (a: number, b: number) => `A library has ${a} storybooks and ${b} fact books. How many books are there altogether?`,
  (a: number, b: number) => `A school collected ${a} cans on Monday and ${b} on Tuesday. How many cans did it collect in all?`,
  (a: number, b: number) => `A stadium sold ${a} tickets in the morning and ${b} more in the afternoon. How many tickets were sold?`,
  (a: number, b: number) => `There were ${a} beads in a box. A teacher added ${b} more. How many beads are in the box now?`,
  (a: number, b: number) => `One team earned ${a} points and another earned ${b} points. How many points did they earn together?`
];

function makeQuestion(skill: number, level: number, a: number, b: number, index: number): Question {
  const total = a + b;
  const missing = skill === 11;
  let prompt = `${a} + ${b} = ?`;
  if (missing) prompt = `${a} + □ = ${total}. What goes in the box?`;
  if (skill === 12) prompt = stories[index % stories.length](a, b);
  const explanation = missing
    ? `Subtract the known part from the total: ${total} − ${a} = ${b}.`
    : `Add the amounts from right to left. Carry into the next place whenever a column reaches ten. ${a} + ${b} = ${total}.`;
  return { skill, level, a, b, prompt, answer: missing ? b : total, explanation, topicId: 'addition' };
}

const pools = new Map<number, Question[]>();

function buildPool(skill: number, level: number, stage: number) {
  const [digits, carries] = stages[stage];
  const min = 10 ** (digits - 1);
  const width = 9 * min;
  const size = width ** 2;
  const pool: Question[] = [];

  // Visit every ordered pair once. The stride is coprime to each square size.
  for (let i = 0; i < size && pool.length < 200; i++) {
    const position = (i * 7919 + stage * 107) % size;
    const a = min + Math.floor(position / width);
    const b = min + position % width;
    if (a > b || carryCount(a, b, digits) !== carries) continue;
    if (stage === 3 && a % 10 + b % 10 < 10) continue;
    pool.push(makeQuestion(skill, level, a, b, pool.length));
  }
  return pool;
}

export function additionQuestion(skill: number, level: number, previous: string[]): Question {
  const stage = stageIndex(skill, level);
  const pool = pools.get(stage) ?? buildPool(skill, level, stage);
  pools.set(stage, pool);
  const lastSeen = new Map(previous.map((prompt, index) => [prompt, index]));
  const unseen = pool.filter(q => !lastSeen.has(q.prompt));
  if (unseen.length) return { ...unseen[Math.floor(Math.random() * unseen.length)] };

  // Once the pool is exhausted, repeat the least recently seen fact first.
  const oldest = pool.reduce((first, q) =>
    lastSeen.get(q.prompt)! < lastSeen.get(first.prompt)! ? q : first
  );
  return { ...oldest };
}
