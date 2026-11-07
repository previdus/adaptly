import type { TopicId } from './learning';

export type WalkthroughQuestion = {
  topicId?: TopicId; a: number; b: number; answer: number | string;
  prompt: string; explanation?: string; skill?: number;
};
export type VisualStep = { text: string; visual: string };
export type QuestionLesson = { title: string; steps: VisualStep[] };

const step = (visual: string, text: string): VisualStep => ({visual, text});

function factors(n: number) {
  return Array.from({length: n}, (_, i) => i + 1).filter(value => n % value === 0);
}

function subtraction(q: WalkthroughQuestion) {
  if (q.prompt.includes('□')) return [
    step(`${q.a} − □ = ${q.a - q.b}`, 'The box is the part taken away. Find the difference between the starting amount and the amount left.'),
    step(`${q.a} − ${q.a - q.b} = ${q.b}`, `The missing part is ${q.b}. Check by putting it back into the original subtraction.`)
  ];
  const steps: VisualStep[] = [];
  let borrow = 0;
  const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  for (let column = 0; column < String(q.a).length; column++) {
    const a = Math.floor(q.a / 10 ** column) % 10;
    const b = Math.floor(q.b / 10 ** column) % 10;
    const available = a - borrow;
    const needed = available < b;
    const adjusted = available + (needed ? 10 : 0);
    steps.push(step(`${names[column]}: ${adjusted} − ${b} = ${adjusted - b}`,
      `Work in the ${names[column]} column. ${borrow ? 'One unit was already traded to the column on the right. ' : ''}${needed ? 'Trade one from the next column to add ten here. ' : ''}${adjusted} minus ${b} is ${adjusted - b}.`));
    borrow = Number(needed);
  }
  return steps;
}

function multiplication(q: WalkthroughQuestion) {
  if (q.a < 10 && q.b < 10) return [
    step(Array(q.a).fill(`[${'●'.repeat(q.b)}]`).join(' '), `Count ${q.a} equal groups, with ${q.b} in each.`),
    step(`${Array(q.a).fill(q.b).join(' + ')} = ${q.answer}`, 'Add the same amount once for every group.')
  ];
  const tens = Math.floor(q.a / 10) * 10;
  const ones = q.a % 10;
  return [
    step(`${q.a} = ${tens} + ${ones}`, 'Break the larger number into tens and ones.'),
    step(`${tens} × ${q.b} = ${tens * q.b}`, 'Multiply the tens part first. Keep its place value.'),
    step(`${ones} × ${q.b} = ${ones * q.b}`, 'Multiply the ones part by the same number.'),
    step(`${tens * q.b} + ${ones * q.b} = ${q.answer}`, 'Combine the partial products to find the whole product.')
  ];
}

function division(q: WalkthroughQuestion) {
  const full = Math.floor(q.a / q.b);
  const remainder = q.a % q.b;
  return [
    step(`${q.a} ÷ ${q.b}`, 'Identify the total and the size or number of equal groups.'),
    step(`${q.b} × ${full} = ${full * q.b}`, `We can make ${full} full groups of ${q.b}.`),
    step(`${q.a} − ${full * q.b} = ${remainder}`, `There are ${remainder} left over. ${q.explanation ?? ''}`)
  ];
}

function factorLesson(q: WalkthroughQuestion) {
  if (q.topicId === 'hcf') {
    const left = factors(q.a);
    const right = factors(q.b);
    const common = left.filter(n => right.includes(n));
    return [
      step(`Factors of ${q.a}: ${left.join(', ')}`, 'List the numbers that divide the first number exactly.'),
      step(`Factors of ${q.b}: ${right.join(', ')}`, 'Now list the factors of the second number.'),
      step(`Shared: ${common.join(', ')}`, q.explanation ?? 'Compare the lists and pick the greatest shared factor.')
    ];
  }
  if (q.skill === 26 || q.prompt.includes('jumps')) return [
    step(`Jump size ${q.a} · ${q.b} jumps`, 'Each jump adds the same amount.'),
    step(`${q.a} × ${q.b} = ${q.answer}`, 'Multiply the jump size by the number of jumps.')
  ];
  const answer = Number(q.answer);
  const sequence = (n: number) => {
    const count = answer / n;
    if (count > 20) return `${n}, ${n * 2}, ${n * 3}, …, ${answer}`;
    return Array.from({length: count}, (_, i) => (i + 1) * n).join(', ');
  };
  return [
    step(`Multiples of ${q.a}: ${sequence(q.a)}`, 'Count forward by the first number.'),
    step(`Multiples of ${q.b}: ${sequence(q.b)}`, 'Count forward by the second number.'),
    step(`First shared positive multiple: ${q.answer}`, 'Find the first positive number that appears in both lists.')
  ];
}

export function questionWalkthrough(q: WalkthroughQuestion): QuestionLesson {
  let steps: VisualStep[];
  if (q.topicId?.startsWith('english') || typeof q.answer === 'string') {
    const explanation = q.explanation ?? `The correct answer is ${q.answer}.`;
    const sentences = explanation.split(/(?<=[.!?])\s+/).filter(Boolean);
    steps = [
      step(q.prompt, 'Read the sentence and decide which rule the question asks you to use.'),
      ...sentences.map(text => step(String(q.answer), text))
    ];
  } else if (q.topicId === 'subtraction') steps = subtraction(q);
  else if (q.topicId === 'multiply') steps = multiplication(q);
  else if (q.topicId === 'division') steps = division(q);
  else if (q.topicId === 'hcf' || q.topicId === 'lcm') steps = factorLesson(q);
  else steps = [step(q.prompt, 'Read the question and identify the quantities.'), step(String(q.answer), q.explanation ?? 'Check the answer using the operation in the question.')];
  steps.push(step(`Answer: ${q.answer}`, `The answer is ${q.answer}. Read the question once more and check that this is what it asks for.`));
  return {title: 'Let’s work it out together', steps};
}
