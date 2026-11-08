import type { Question } from './learning';
import { curriculumTopics, CURRICULUM_SKILL_START, type CurriculumTopicId } from './curriculum-catalog';
import { curriculumEnglishDraft } from './curriculum-english';
import { parityDraft, romanDraft, factorDraft, primeDraft, divisibilityDraft } from './curriculum-number';
import { signedDraft, operationsDraft, mentalDraft, fractionDraft, decimalDraft } from './curriculum-calculation';
import { linesDraft, symmetryDraft, coordinateDraft, transformationDraft, unitsDraft, scaleDraft } from './curriculum-geometry';
import { algebraDraft, dataDraft, financeDraft, reasoningDraft } from './curriculum-applications';
import { pickPracticeQuestion } from './practice-pool';
import { decimal, type CurriculumDraft } from './curriculum-types';
import { curriculumDiagram } from './curriculum-diagrams';

type DraftBuilder = (concept: number, level: number, index: number) => CurriculumDraft;

const mathsBuilders: Record<string, DraftBuilder> = {
  'odd-even': parityDraft,
  'negative-numbers': (c, l, i) => signedDraft('negative-numbers', c, l, i),
  'temperature': (c, l, i) => signedDraft('temperature', c, l, i),
  'roman-numerals': romanDraft,
  'factors-multiples': factorDraft,
  'prime-numbers': primeDraft,
  'divisibility': divisibilityDraft,
  'order-operations': operationsDraft,
  'mental-maths': mentalDraft,
  'advanced-fractions': fractionDraft,
  'advanced-decimals': decimalDraft,
  'lines': linesDraft,
  'symmetry': symmetryDraft,
  'coordinates': coordinateDraft,
  'transformations': transformationDraft,
  'mixed-units': unitsDraft,
  'scale-drawings': scaleDraft,
  'algebra': algebraDraft,
  'advanced-data': dataDraft,
  'financial-maths': financeDraft,
  'reasoning': reasoningDraft
};

export function curriculumSkillStart(id: CurriculumTopicId) {
  const index = curriculumTopics.findIndex(topic => topic.id === id);
  return CURRICULUM_SKILL_START + curriculumTopics.slice(0, index).reduce((sum, topic) => sum + topic.concepts.length, 0);
}

function optionsFor(draft: CurriculumDraft, index: number) {
  const options = new Set([draft.answer, ...(draft.distractors ?? [])]);
  const numeric = Number(draft.answer);
  if (!Number.isFinite(numeric) && options.size < 4) {
    throw new Error('Provide three distinct distractors for: ' + draft.prompt);
  }
  let delta = 1;
  while (options.size < 4) {
    options.add(decimal(numeric + (delta % 2 ? delta : -delta)));
    delta++;
  }
  const wrong = [...options].filter(option => option !== draft.answer).slice(0, 3);
  wrong.splice(index % 4, 0, draft.answer);
  return wrong;
}

const pools = new Map<string, readonly Question[]>();

export function curriculumPool(id: CurriculumTopicId, concept: number, level: number): readonly Question[] {
  const key = `${id}:${concept}:${level}`;
  const cached = pools.get(key);
  if (cached) return cached;
  const topic = curriculumTopics.find(item => item.id === id)!;
  const goal = topic.concepts[concept].levels[level - 1];
  const seen = new Set<string>();
  const pool: Question[] = [];
  for (let index = 0; index < 1200 && pool.length < 200; index++) {
    const draft = topic.subject === 'english'
      ? curriculumEnglishDraft(id, concept, level, index)
      : mathsBuilders[id](concept, level, index);
    if (seen.has(draft.prompt)) continue;
    seen.add(draft.prompt);
    pool.push({
      skill: curriculumSkillStart(id) + concept,
      topicId: id, level, a: 0, b: 0,
      prompt: draft.prompt, answer: draft.answer,
      options: optionsFor(draft, pool.length),
      explanation: `The answer is ${draft.answer}. ` + draft.steps.map(step => step.text).join(' '),
      learningGoal: goal,
      workedSteps: draft.steps,
      diagram: curriculumDiagram(id, concept, level, index)
    });
  }
  if (!pool.length) throw new Error('Empty question stage: ' + key);
  // A stable shuffle gives game sampling examples from the whole stage range.
  let seed = [...key].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 2147483646, 7) + 1;
  for (let index = pool.length - 1; index > 0; index--) {
    seed = seed * 48271 % 2147483647;
    const other = seed % (index + 1);
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  const frozen = Object.freeze(pool);
  pools.set(key, frozen);
  return frozen;
}

export function curriculumPractice(id: CurriculumTopicId, skill: number, level: number, previous: string[]) {
  const pool = curriculumPool(id, skill - curriculumSkillStart(id), level);
  const question = pickPracticeQuestion(pool, previous);
  return { ...question, options: [...question.options!] };
}
