import { isGrammarTopic, skills, topicInfo, type Attempt, type Student, type TopicId } from './learning';
import { curriculumTopics } from './curriculum-catalog';

type Pattern = { code: string; title: string; action: string };
export type ParentFocus = {
  kind: 'matched-demand' | 'pattern' | 'revisit' | 'isolated';
  title: string;
  summary: string;
  goal: string;
  action: string;
  examples: Attempt[];
  skill: number;
};
export type ParentTopic = {
  id: TopicId;
  name: string;
  icon: string;
  independent: number;
  correct: number;
  hinted: number;
  accuracy: number | null;
  status: 'starting' | 'building' | 'steady' | 'revisit';
  focus?: ParentFocus;
  goals: { name: string; correct: number; total: number }[];
  trend?: { before: number; after: number };
};

export function getLearningGoal(skillIndex: number, level: number): string {
  const skill = skills[skillIndex];
  if (!skill) return 'Unknown saved concept';
  const topic = curriculumTopics.find(topic => topic.id === skill.topic);
  const concept = topic?.concepts.find(concept => concept.name === skill.name);
  if (concept) return concept.levels[Math.max(0, Math.min(2, level - 1))];
  if (skillIndex >= 8 && skillIndex <= 12) return [
    'Single-digit addition without carrying', 'Single-digit addition with carrying', 'Two-digit addition without carrying',
    'Two-digit addition with one carry', 'Two-digit addition with two carries', 'Three-digit addition without carrying',
    'Three-digit addition with one carry', 'Three-digit addition with two carries', 'Three-digit addition with three carries',
    'Missing addend with one carry', 'Missing addend with two carries', 'Missing addend with three carries',
    'Addition stories with one carry', 'Addition stories with two carries', 'Addition stories with three carries',
  ][(skillIndex - 8) * 3 + level - 1] || skill.name;
  if (skillIndex >= 29 && skillIndex <= 36) return [
    'Identify a common noun', 'Identify a proper place noun', 'Form irregular plurals',
    'Choose a subject pronoun', 'Choose an object pronoun', 'Show ownership with a pronoun',
    'Identify an action verb', 'Use the past tense', 'Use the future tense',
    'Identify an adjective', 'Choose an adjective before a noun', 'Describe an action with an adverb',
    'Match a singular subject and verb', 'Match a plural subject and verb', 'Find the subject before matching the verb',
    'Recognize a complete sentence', 'Form a question', 'Join complete sentences',
    'Capitalize names and sentence beginnings', 'Choose an end mark', 'Use an apostrophe in a contraction',
    'Join contrasting ideas', 'Choose a preposition of place', 'Connect a reason with because',
  ][(skillIndex - 29) * 3 + level - 1] || skill.name;
  return `${skill.name} · step ${level}`;
}

function equation(attempt: Attempt) {
  const match = attempt.prompt.match(/^\s*(\d+)\s*([+×x*−-])\s*(\d+)\s*=\s*\?\s*$/);
  return match ? { a: Number(match[1]), op: match[2], b: Number(match[3]) } : undefined;
}

function hasCarry(a: number, b: number): boolean {
  while (a || b) {
    if (a % 10 + b % 10 >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function columnAnswer(a: number, b: number, subtract: boolean): number {
  let answer = 0;
  let place = 1;
  while (a || b) {
    const digit = subtract ? (a % 10 - b % 10 + 10) % 10 : (a % 10 + b % 10) % 10;
    answer += digit * place;
    place *= 10;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return answer;
}

function absoluteColumnDifference(a: number, b: number): number {
  const width = Math.max(String(a).length, String(b).length);
  const left = String(a).padStart(width, '0');
  const right = String(b).padStart(width, '0');
  return Number([...left].map((digit, index) => Math.abs(Number(digit) - Number(right[index]))).join(''));
}

function topicSpecificPattern(attempt: Attempt): Pattern | undefined {
  const topic = skills[attempt.skill]?.topic || '';
  if (topic.includes('decimals')) {
    const expected = Number(attempt.answer);
    const given = Number(attempt.given);
    if (Number.isFinite(expected) && Number.isFinite(given) && expected !== 0 &&
      [10, 100, .1, .01].some(scale => Math.abs(given - expected * scale) < 1e-9)) {
      return { code: 'decimal-scale', title: 'Keeping decimal place value in view',
        action: 'Write the answer in a place-value chart. Ask how many ones, tenths and hundredths it represents.' };
    }
  }
  if (topic.includes('fractions')) {
    const sum = attempt.prompt.match(/^\s*(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)\s*=\s*\?\s*$/);
    const given = attempt.given.trim().match(/^(\d+)\/(\d+)$/);
    if (sum && given && Number(given[2]) > 0) {
      const numerator = Number(sum[1]) + Number(sum[3]);
      const denominator = Number(sum[2]) + Number(sum[4]);
      if (Number(given[1]) * denominator === Number(given[2]) * numerator) {
        return { code: 'fraction-denominator', title: 'Adding fractions with equal-sized parts',
          action: 'Draw the fractions as equal-sized pieces. Find a common denominator before counting the pieces together.' };
      }
    }
  }
}

export function classifyAnswerPattern(attempt: Attempt): Pattern | undefined {
  if (attempt.correct || attempt.hinted || !attempt.given.trim()) return;
  const eq = equation(attempt);
  if (!eq) return topicSpecificPattern(attempt);
  const given = Number(attempt.given);
  if (!Number.isFinite(given)) return;
  const { a, b, op } = eq;
  if (op === '+' && Number(attempt.answer) === a + b && hasCarry(a, b) && given === columnAnswer(a, b, false)) {
    return { code: 'carry', title: 'Moving an extra ten', action: 'Ask: “Where does the extra ten go?” Replay a regrouping example, then try fresh questions.' };
  }
  if ((op === '−' || op === '-') && a >= b && Number(attempt.answer) === a - b &&
    [columnAnswer(a, b, true), absoluteColumnDifference(a, b)].includes(given)) {
    return { code: 'borrow', title: 'Regrouping when subtracting', action: 'Use tens and ones to exchange one ten. Ask what changes in both columns.' };
  }
  if (['×', 'x', '*'].includes(op) && Number(attempt.answer) === a * b && given === a + b) {
    return { code: 'operation', title: 'Connecting groups to multiplication', action: 'Draw equal groups. Compare the number of groups with the number in each group.' };
  }
}

function evidenceKey(attempt: Attempt): string {
  const eq = equation(attempt);
  if (eq && ['+', '×', 'x', '*'].includes(eq.op)) {
    return `${attempt.skill}:${eq.op}:${Math.min(eq.a, eq.b)}:${Math.max(eq.a, eq.b)}`;
  }
  return `${attempt.skill}:${attempt.prompt.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

function distinctIndependent(attempts: Attempt[]): Attempt[] {
  const seen = new Map<string, Attempt>();
  for (const attempt of attempts) {
    if (attempt.hinted) continue;
    const key = evidenceKey(attempt);
    seen.delete(key);
    seen.set(key, attempt);
  }
  return [...seen.values()].slice(-20);
}

const goalFor = (attempt: Attempt) => attempt.learningGoal || getLearningGoal(attempt.skill, attempt.level);
const solved = (attempts: Attempt[]) => attempts.filter(attempt => attempt.correct).length;
const ratio = (attempts: Attempt[]) => attempts.length ? solved(attempts) / attempts.length : 0;

function matchedCarry(attempts: Attempt[]): ParentFocus | undefined {
  const groups = new Map<string, { plain: Attempt[]; carry: Attempt[] }>();
  for (const attempt of attempts) {
    const eq = equation(attempt);
    if (!eq || eq.op !== '+') continue;
    const widths = [String(eq.a).length, String(eq.b).length].sort().join(':');
    const group = groups.get(widths) || { plain: [], carry: [] };
    group[hasCarry(eq.a, eq.b) ? 'carry' : 'plain'].push(attempt);
    groups.set(widths, group);
  }
  for (const { plain, carry } of groups.values()) {
    if (plain.length < 4 || carry.length < 3 || ratio(plain) < .8 || ratio(carry) >= .6) continue;
    const misses = carry.filter(attempt => !attempt.correct);
    return {
      kind: 'matched-demand', title: 'A useful next step: carrying',
      summary: `${solved(plain)}/${plain.length} correct without carrying; ${solved(carry)}/${carry.length} with carrying, using the same digit sizes. This suggests regrouping deserves a closer look.`,
      goal: 'Addition with carrying', action: 'Ask your child to show where the extra ten goes. Watch one worked example together, then continue their practice.',
      examples: misses.slice(-2), skill: misses[0].skill,
    };
  }
}

function focusFor(attempts: Attempt[]): ParentFocus | undefined {
  const unresolved = attempts.filter(attempt => {
    if (attempt.correct) return true;
    const atGoal = attempts.filter(item => goalFor(item) === goalFor(attempt));
    return !atGoal.slice(-3).every(item => item.correct) || atGoal.length < 3;
  });
  const contrast = matchedCarry(unresolved);
  if (contrast) return contrast;
  const wrong = unresolved.filter(attempt => !attempt.correct);
  if (!wrong.length) return;
  const latest = wrong[wrong.length - 1];
  const patterns = new Map<string, { pattern: Pattern; attempts: Attempt[] }>();
  for (const attempt of wrong) {
    const pattern = classifyAnswerPattern(attempt);
    if (!pattern) continue;
    const group = patterns.get(pattern.code) || { pattern, attempts: [] };
    group.attempts.push(attempt);
    patterns.set(pattern.code, group);
  }
  const repeated = [...patterns.values()].find(group => group.attempts.length >= 2);
  if (repeated) return {
    kind: 'pattern', title: repeated.pattern.title,
    summary: `${repeated.attempts.length} different answers match this error pattern. It is a clue to explore, not a diagnosis.`,
    goal: goalFor(repeated.attempts[0]), action: repeated.pattern.action,
    examples: repeated.attempts.slice(-2), skill: repeated.attempts[0].skill,
  };
  const sameGoal = wrong.filter(attempt => goalFor(attempt) === goalFor(latest));
  const isolated = wrong.length === 1;
  return {
    kind: isolated ? 'isolated' : 'revisit',
    title: isolated ? 'One answer to talk through' : 'A step worth revisiting',
    summary: isolated
      ? 'One missed answer does not establish a gap. Its cause is unclear from the final answer alone.'
      : `${sameGoal.length} missed answer${sameGoal.length === 1 ? '' : 's'} at this step. Ask your child to explain their thinking before deciding what support they need.`,
    goal: goalFor(latest), action: 'Ask: “Can you show me how you worked it out?” Compare with the worked explanation, then continue at their pace.',
    examples: sameGoal.slice(-2), skill: latest.skill,
  };
}

function topicSummary(id: TopicId, all: Attempt[]): ParentTopic {
  const independent = distinctIndependent(all);
  const correct = solved(independent);
  const accuracy = independent.length ? Math.round(correct / independent.length * 100) : null;
  const focus = focusFor(independent);
  const goals = new Map<string, { name: string; correct: number; total: number }>();
  for (const attempt of independent) {
    const name = goalFor(attempt);
    const goal = goals.get(name) || { name, correct: 0, total: 0 };
    goal.total++;
    goal.correct += Number(attempt.correct);
    goals.set(name, goal);
  }
  const recent = independent.slice(-10);
  const before = Math.round(ratio(recent.slice(0, 5)) * 100);
  const after = Math.round(ratio(recent.slice(5)) * 100);
  const trend = recent.length === 10 && Math.abs(after - before) >= 20 ? { before, after } : undefined;
  let status: ParentTopic['status'] = 'building';
  if (independent.length < 4) status = 'starting';
  else if (independent.length >= 8 && accuracy! >= 80) status = 'steady';
  else if (focus && focus.kind !== 'isolated') status = 'revisit';
  return { id, name: topicInfo(id).name, icon: topicInfo(id).icon,
    independent: independent.length, correct, accuracy, status, focus, trend,
    hinted: all.filter(attempt => attempt.hinted).length, goals: [...goals.values()] };
}

export function buildParentReport(student: Student) {
  const valid = student.attempts.filter(attempt => Boolean(skills[attempt.skill]));
  const subjects = ['Maths', 'English Grammar'].map((name, index) => {
    const attempts = valid.filter(attempt => Number(isGrammarTopic(skills[attempt.skill].topic)) === index);
    const ids = [...new Set(attempts.map(attempt => skills[attempt.skill].topic))];
    const topics = ids.map(id => topicSummary(id, attempts.filter(attempt => skills[attempt.skill].topic === id)));
    const independent = topics.reduce((sum, topic) => sum + topic.independent, 0);
    const correct = topics.reduce((sum, topic) => sum + topic.correct, 0);
    const priority = { 'matched-demand': 0, pattern: 1, revisit: 2, isolated: 3 };
    const focuses = topics.flatMap(topic => topic.focus ? [{ ...topic.focus, topicId: topic.id }] : []);
    focuses.sort((a, b) => priority[a.kind] - priority[b.kind]);
    return { name, topics, independent, correct,
      accuracy: independent ? Math.round(correct / independent * 100) : null,
      hinted: topics.reduce((sum, topic) => sum + topic.hinted, 0), focus: focuses[0] };
  });
  return { subjects, lastPractice: valid.length ? Math.max(...valid.map(attempt => attempt.at)) : null };
}

export function exportParentCsv(student: Student): string {
  const rows: (string | number)[][] = [['Subject', 'Topic', 'Distinct independent questions', 'Correct', 'Accuracy', 'Evidence status', 'Hint-supported attempts', 'Next focus']];
  for (const subject of buildParentReport(student).subjects) {
    for (const topic of subject.topics) rows.push([subject.name, topic.name, topic.independent, topic.correct,
      topic.accuracy === null ? 'Not assessed' : `${topic.accuracy}%`, topic.status, topic.hinted, topic.focus?.goal || '']);
  }
  return rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
}
