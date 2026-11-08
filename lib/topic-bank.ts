import { curriculumTopics, isCurriculumTopic } from './curriculum-catalog';
import { curriculumPool } from './curriculum';
import type { LearningDiagram } from './curriculum-types';
import { extendedQuestion, isExtendedMathTopic } from './extended-maths';
import { mathsExplanation } from './maths-explanation';
import { grammarPracticePool } from './grammar-practice';
import { MULTIPLY_QUESTION_BANK } from './multiply-bank';
import { ENGLISH_GRAMMAR_QUESTION_BANK } from './grammar-bank';
import {
  generate,
  isGrammarTopic,
  questionTime,
  skills,
  skillsForTopic,
  topics,
  type TopicId,
} from './learning';

export type GameQuestion = {
  id: string;
  topicId: TopicId;
  concept: string;
  prompt: string;
  a: number;
  b: number;
  answer: number | string;
  seconds: number;
  step: number;
  options?: string[];
  explanation?: string;
  learningGoal?: string;
  workedSteps?: {visual: string; text: string}[];
  diagram?: LearningDiagram;
};

const cached = new Map<TopicId, readonly GameQuestion[]>();
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

function expectedAnswer(topic: TopicId, q: GameQuestion) {
  const skill = skills.findIndex(
    (s) => s.topic === topic && s.name === q.concept
  );
  if (topic === 'multiply') return q.a * q.b;
  if (topic === 'addition') return skill === 11 ? q.b : q.a + q.b;
  if (topic === 'subtraction') return skill === 16 ? q.b : q.a - q.b;
  if (topic === 'division') return skill === 21 ? q.a % q.b : q.a / q.b;
  if (topic === 'hcf') return gcd(q.a, q.b);
  return (q.a / gcd(q.a, q.b)) * q.b;
}

/**
 * A validated 200-question playable bank per topic; practice can generate
 * a fresh question after a bank is exhausted.
 */
export function questionBank(topic: TopicId): readonly GameQuestion[] {
  const ready = cached.get(topic);
  if (ready) return ready;

  if (isCurriculumTopic(topic)) {
    const definition = curriculumTopics.find(item => item.id === topic)!;
    const stagePools = definition.concepts.flatMap((_, concept) => [1, 2, 3].map(level => curriculumPool(topic, concept, level)));
    const bank: GameQuestion[] = [];
    const seen = new Set<string>();
    const cursors = stagePools.map(() => 0);
    while (bank.length < 200) {
      let added = false;
      for (const [index, pool] of stagePools.entries()) {
        while (cursors[index] < pool.length && seen.has(pool[cursors[index]].prompt)) cursors[index]++;
        const q = pool[cursors[index]++];
        if (!q) continue;
        seen.add(q.prompt);
        bank.push({...q, id: `${topic}-${bank.length + 1}`, topicId: topic,
          concept: skills[q.skill].name, step: index + 1, seconds: questionTime(q)});
        added = true;
        if (bank.length === 200) break;
      }
      if (!added) throw new Error('Not enough distinct game questions for ' + topic);
    }
    bank.sort((a, b) => a.step - b.step);
    cached.set(topic, Object.freeze(bank));
    return bank;
  }

  if (isExtendedMathTopic(topic)) {
    const bank: GameQuestion[] = [];
    const seen = new Set<string>();
    for (let stage = 0; stage < 9; stage++) {
      const concept = Math.floor(stage / 3);
      const level = stage % 3 + 1;
      const count = 22 + Number(stage < 2);
      const pool = Array.from({length:200}, (_, i) => extendedQuestion(topic, concept, level, i));
      const available = pool.filter(q => !seen.has(q.prompt));
      for (let i = 0; i < count; i++) {
        const q = available[Math.floor(i * available.length / count)];
        seen.add(q.prompt);
        bank.push({...q, id: `${topic}-${bank.length + 1}`, topicId: topic,
          concept: skills[q.skill].name, step: stage + 1, seconds: questionTime(q)});
      }
    }
    cached.set(topic, Object.freeze(bank));
    return bank;
  }

  if (topic === 'multiply') {
    const bank = MULTIPLY_QUESTION_BANK.map((q) => ({
      ...q,
      topicId: 'multiply' as const,
      explanation: mathsExplanation('multiply', q),
    }));
    cached.set(topic, bank);
    return bank;
  }

  if (topic === 'english') {
    const bank = ENGLISH_GRAMMAR_QUESTION_BANK.map((q) => ({
      id: q.id,
      topicId: 'english' as const,
      concept: q.concept,
      prompt: q.prompt,
      a: 0,
      b: 0,
      answer: q.answer,
      explanation: `The correct answer is “${q.answer}”. ${q.explanation} Read the sentence again and check how this choice fits the rule described above.`,
      seconds: q.seconds,
      step: q.step,
      options: [...q.options],
    }));
    const hasInvalidOption = bank.some(
      (q) =>
        !q.options ||
        q.options.length < 3 ||
        q.options.length > 4 ||
        !q.options.includes(String(q.answer)) ||
        new Set(q.options).size !== q.options.length
    );
    if (
      bank.length !== 200 ||
      new Set(bank.map((q) => q.prompt)).size !== 200 ||
      hasInvalidOption
    ) {
      throw new Error(
        'The English Grammar question bank needs 200 unique, answerable questions.'
      );
    }
    const frozen = Object.freeze(bank);
    cached.set(topic, frozen);
    return frozen;
  }

  if (isGrammarTopic(topic)) {
    const [skill] = skillsForTopic(topic);
    const advanced = grammarPracticePool(skill, 3);
    const lastCount = Math.min(66, advanced.length);
    const firstCount = Math.ceil((200 - lastCount) / 2);
    const counts = [firstCount, 200 - firstCount - lastCount, lastCount];
    const bank = [1, 2, 3].flatMap(level => {
      const pool = grammarPracticePool(skill, level);
      const count = counts[level - 1];
      return Array.from({ length: count }, (_, i): GameQuestion => {
        const draft = pool[Math.floor(i * pool.length / count)];
        return {
          ...draft,
          id: `${topic}-${level}-${i + 1}`,
          topicId: topic,
          concept: skills[skill].name,
          a: 0,
          b: 0,
          step: level,
          options: [...draft.options!],
          seconds: questionTime({ ...draft, skill, level, a: 0, b: 0 })
        };
      });
    });
    cached.set(topic, Object.freeze(bank));
    return bank;
  }

  const indices = skillsForTopic(topic);
  const bank: GameQuestion[] = [];
  const seen: string[] = [];
  const perBucket = Math.floor(200 / (indices.length * 3));
  const remainder = 200 - perBucket * indices.length * 3;

  for (const [conceptIndex, skill] of indices.entries()) {
    for (let level = 1; level <= 3; level++) {
      const bucketIndex = conceptIndex * 3 + level - 1;
      const count = perBucket + (bucketIndex < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const q = generate(skill, level, seen, bucketIndex % 3, 'game');
        seen.push(q.prompt);
        bank.push({
          id: `${topic}-${String(bank.length + 1).padStart(3, '0')}`,
          topicId: topic,
          concept: skills[skill].name,
          prompt: q.prompt,
          a: q.a,
          b: q.b,
          answer: q.answer,
          explanation: mathsExplanation(topic, { ...q, skill }),
          seconds: questionTime(q, 'game'),
          step: bucketIndex + 1,
        });
      }
    }
  }

  if (
    bank.length !== 200 ||
    new Set(bank.map((q) => q.id)).size !== 200 ||
    new Set(bank.map((q) => q.prompt)).size !== 200
  ) {
    throw new Error(
      `The ${topic} question bank needs 200 unique, valid questions.`
    );
  }

  const hasInvalidMath = bank.some(
    (q) =>
      typeof q.answer !== 'number' ||
      !Number.isSafeInteger(q.answer) ||
      q.answer < 0 ||
      q.answer !== expectedAnswer(topic, q) ||
      !q.prompt.trim() ||
      q.seconds < 18
  );
  if (hasInvalidMath) {
    throw new Error(`The ${topic} question bank contains an invalid question.`);
  }

  const frozen = Object.freeze(bank);
  cached.set(topic, frozen);
  return frozen;
}

export function topicLabel(topic: TopicId) {
  return topics.find((t) => t.id === topic)?.name ?? 'Maths';
}
