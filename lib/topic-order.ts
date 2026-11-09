// Display order only. Never use this sequence to assign numeric skill IDs.
export const teachingStages: {
  subject: 'maths' | 'english';
  name: string;
  topics: string[];
}[] = [
  { subject: 'maths', name: '1 · Number foundations', topics: [
    'place-value', 'odd-even', 'addition', 'subtraction', 'multiply', 'division',
    'mental-maths', 'roman-numerals', 'patterns',
  ] },
  { subject: 'maths', name: '2 · Everyday maths', topics: [
    'money', 'measurement', 'time', 'geometry', 'lines', 'data',
  ] },
  { subject: 'maths', name: '3 · Number relationships', topics: [
    'factors-multiples', 'prime-numbers', 'divisibility', 'hcf', 'lcm',
    'fractions', 'advanced-fractions', 'decimals', 'advanced-decimals',
    'negative-numbers', 'temperature', 'order-operations',
  ] },
  { subject: 'maths', name: '4 · Proportion & spatial thinking', topics: [
    'percentages', 'ratio', 'mixed-units', 'coordinates', 'symmetry',
    'transformations', 'area-volume', 'scale-drawings',
  ] },
  { subject: 'maths', name: '5 · Real-world applications', topics: [
    'profit-loss', 'interest', 'financial-maths', 'speed',
  ] },
  { subject: 'maths', name: '6 · Data, algebra & reasoning', topics: [
    'advanced-data', 'probability', 'algebra', 'reasoning',
  ] },
  { subject: 'english', name: '1 · Meet the word classes', topics: [
    'english-nouns', 'english-articles', 'english-pronouns', 'english-verbs',
    'english-adjectives', 'english-prepositions',
  ] },
  { subject: 'english', name: '2 · Build & refine sentences', topics: [
    'english-sentences', 'english-subject-predicate', 'english-agreement',
    'english-adverbs', 'english-tenses', 'english-determiners', 'english-possessives',
  ] },
  { subject: 'english', name: '3 · Punctuate, connect & edit', topics: [
    'english-punctuation', 'english-sentence-types', 'english-conjunctions',
    'english-direct-speech', 'english-editing',
  ] },
];

const order = new Map(teachingStages.flatMap(stage => stage.topics).map((id, index) => [id, index]));

export function topicOrder(id: string): number {
  return order.get(id) ?? Number.MAX_SAFE_INTEGER;
}

export function teachingStage(id: string) {
  return teachingStages.find(stage => stage.topics.includes(id));
}
