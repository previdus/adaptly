import type { CurriculumTopicId } from './curriculum-catalog';
import type { LearningDiagram } from './curriculum-types';
import { pieShare } from './curriculum-applications';

export function curriculumDiagram(topic: CurriculumTopicId, concept: number, level: number, index: number): LearningDiagram | undefined {
  const x = 2 + index % 30;
  const y = 2 + Math.floor(index / 30) % 20;
  if (topic === 'advanced-data' && concept === 0) {
    return { kind: 'line-graph', values: [x, x + y, x + 2 * y], labels: ['Mon', 'Tue', 'Wed'] };
  }
  if (topic === 'advanced-data' && concept === 1) {
    const [numerator, denominator] = pieShare(level, index);
    return { kind: 'pie', numerator, denominator };
  }
  if (topic === 'coordinates' || topic === 'transformations' || (topic === 'symmetry' && concept === 1)) {
    const points = [{ x, y, label: 'P' }];
    if (topic === 'coordinates' && concept === 2) {
      if (level === 3) return { kind: 'grid', points: [{ x: 0, y, label: 'A' }, { x: 2 * x, y: y + 2, label: 'B' }] };
      points.push({ x: level === 1 ? x + y : x, y: level === 1 ? y : y + x, label: 'Q' });
    }
    return { kind: 'grid', points, mirror: topic === 'symmetry' ? { axis: level === 2 ? 'y' : 'x', value: level === 3 ? x + y : 0 } : undefined };
  }
  if (topic === 'symmetry' && ((concept === 0 && level === 2) || (concept === 2 && level < 3))) {
    return { kind: 'polygon', sides: 3 + index % 10 };
  }
  if ((topic === 'negative-numbers' || topic === 'temperature') && concept === 0) {
    if (topic === 'negative-numbers' && level === 3) return { kind: 'number-line', values: [-x, 0] };
    const a = topic === 'temperature' && level === 1 ? x : -x;
    const candidate = level === 1 ? (topic === 'temperature' ? y : 0) : level === 2 ? -y : y;
    return { kind: 'number-line', values: [a, candidate === a ? candidate + 1 : candidate] };
  }
  return undefined;
}
