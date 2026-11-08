export type WorkedStep = { visual: string; text: string };
export type LearningDiagram =
  | { kind: 'line-graph'; values: number[]; labels: string[] }
  | { kind: 'grid'; points: { x: number; y: number; label: string }[]; mirror?: { axis: 'x' | 'y'; value: number } }
  | { kind: 'pie'; numerator: number; denominator: number }
  | { kind: 'number-line'; values: number[] }
  | { kind: 'polygon'; sides: number };
export type CurriculumDraft = {
  prompt: string;
  answer: string;
  distractors?: string[];
  steps: WorkedStep[];
  diagram?: LearningDiagram;
};

export const decimal = (value: number) => String(Math.round(value * 1000000) / 1000000);
export const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

export function rational(n: number, d: number) {
  const factor = gcd(Math.abs(n), d);
  return d / factor === 1 ? String(n / factor) : `${n / factor}/${d / factor}`;
}

export function worked(prompt: string, answer: number | string, visual: string, reason: string, distractors?: string[]): CurriculumDraft {
  const formatted = typeof answer === 'number' ? decimal(answer) : answer;
  return {
    prompt, answer: formatted, distractors,
    steps: [
      { visual, text: reason },
      { visual: `Answer: ${formatted}`, text: `The answer is ${formatted}. Check that it answers the question and uses the requested unit.` }
    ]
  };
}

export function fractional(prompt: string, n: number, d: number, visual: string, reason: string) {
  return worked(prompt, rational(n, d), visual,
    reason + ` Simplify ${n}/${d} by dividing both terms by their greatest common factor.`,
    [rational(n + 1, d), rational(n + 2, d), rational(n + 3, d)]);
}

export const coordinate = (x: number, y: number) => `(${x}, ${y})`;
export function pointQuestion(prompt: string, x: number, y: number, reason: string) {
  return worked(prompt, coordinate(x, y), coordinate(x, y), reason,
    [coordinate(x + 1, y), coordinate(x, y + 1), coordinate(-x - 1, -y - 1)]);
}
