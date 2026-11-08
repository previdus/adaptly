import assert from 'node:assert/strict';
import { it } from 'node:test';
import { curriculumTopics } from '../lib/curriculum-catalog';
import { curriculumPool } from '../lib/curriculum';
import { roman, isPrime } from '../lib/curriculum-number';
import { signedDraft, fractionDraft, decimalDraft, operationsDraft } from '../lib/curriculum-calculation';
import { coordinateDraft, transformationDraft, scaleDraft } from '../lib/curriculum-geometry';
import { financeDraft, dataDraft } from '../lib/curriculum-applications';

function readRoman(text: string) {
  const values: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  return [...text].reduce((sum, letter, index) => sum + (values[letter] < (values[text[index+1]] ?? 0) ? -values[letter] : values[letter]), 0);
}

it('checks every Roman numeral through 1000 with an independent decoder', () => {
  for (let n = 1; n <= 1000; n++) assert.equal(readRoman(roman(n)), n);
  const upperStage = curriculumPool('roman-numerals', 0, 3);
  for (const value of [400, 500, 900, 1000]) assert.ok(upperStage.some(q => q.answer === String(value)));
});

it('checks all parity, prime-classification and divisibility answers independently', () => {
  for (const topic of ['odd-even', 'prime-numbers', 'divisibility'] as const) {
    const definition = curriculumTopics.find(item => item.id === topic)!;
    for (let concept = 0; concept < definition.concepts.length; concept++) {
      for (let level = 1; level <= 3; level++) {
        for (const q of curriculumPool(topic, concept, level)) {
          const numbers = q.prompt.match(/\d+/g)!.map(Number);
          if (topic === 'odd-even') {
            const result = q.prompt.includes('×') ? numbers[0] * numbers[1]
              : q.prompt.includes('+') ? numbers[0] + numbers[1] : numbers[0];
            assert.equal(q.answer, result % 2 === 0 ? 'Even' : 'Odd');
          }
          if (topic === 'prime-numbers' && concept === 0) {
            const n = numbers[0];
            const divisorCount = Array.from({length:n}, (_, i) => i+1).filter(d => n%d === 0).length;
            assert.equal(q.answer, divisorCount === 1 ? 'Neither prime nor composite' : divisorCount === 2 ? 'Prime' : 'Composite');
          }
          if (topic === 'prime-numbers' && concept === 1 && level === 2) {
            const valid = q.options!.filter(choice => isPrime(Number(choice)) && numbers[0] % Number(choice) === 0);
            assert.deepEqual(valid, [q.answer]);
          }
          if (topic === 'divisibility' && !(concept === 1 && level === 3)) {
            assert.equal(q.answer, numbers[0] % numbers[1] === 0 ? 'Yes' : 'No');
          }
        }
      }
    }
  }
});

it('checks unlike-fraction arithmetic, reciprocals, and decimal placement', () => {
  const expected = [
    ['2', '1/3', '7'],
    ['5/6', '13/12', '5/12'],
    ['2/3', '1/15', '2/15'],
    ['6', '1/6', '1/3']
  ];
  for (let concept = 0; concept < 4; concept++) {
    for (let level = 1; level <= 3; level++) assert.equal(fractionDraft(concept, level, 0).answer, expected[concept][level-1]);
  }
  assert.equal(decimalDraft(0, 1, 0).answer, '0.4');
  assert.equal(decimalDraft(0, 2, 0).answer, '0.04');
  assert.equal(decimalDraft(0, 3, 0).answer, '0.04');
  for (let level = 1; level <= 3; level++) assert.equal(decimalDraft(1, level, 0).answer, '0.2');
  assert.equal(decimalDraft(2, 3, 5).answer, 'Recurring');
  assert.equal(decimalDraft(2, 3, 3).answer, 'Terminating');
});

it('checks signed moves, transformations, scale and compound growth boundary examples', () => {
  assert.equal(signedDraft('negative-numbers', 1, 3, 0).answer, '-2');
  assert.equal(signedDraft('temperature', 1, 2, 0).answer, '2');
  assert.equal(signedDraft('temperature', 2, 3, 0).answer, '4');
  assert.equal(transformationDraft(2, 1, 0).answer, '(-2, -2)');
  assert.equal(transformationDraft(2, 2, 0).answer, '(-2, 2)');
  assert.equal(transformationDraft(2, 3, 0).answer, '(2, -2)');
  assert.equal(coordinateDraft(2, 3, 0).answer, '(2, 3)');
  assert.equal(scaleDraft(2, 3, 0).answer, '24');
  assert.equal(financeDraft(3, 2, 0).answer, '208.08');
  assert.equal(financeDraft(3, 3, 0).answer, '0.08');
  assert.equal(dataDraft(2, 3, 0).answer, '5');
  assert.equal(operationsDraft(2, 2, 0).answer, '4');
});

it('does not reward always choosing the lowest or first value for the mode', () => {
  for (let index = 0; index < 200; index++) {
    const q = dataDraft(3, 3, index);
    const values = q.prompt.match(/\d+/g)!.map(Number);
    const counts = new Map<number, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    const expected = [...counts].sort((a,b) => b[1] - a[1])[0][0];
    assert.equal(Number(q.answer), expected);
  }
});

it('contains no broken template values, missing options or repeated answers', () => {
  for (const topic of curriculumTopics) {
    for (let concept = 0; concept < topic.concepts.length; concept++) {
      for (let level = 1; level <= 3; level++) {
        for (const q of curriculumPool(topic.id, concept, level)) {
          assert.doesNotMatch(q.prompt + q.explanation, /undefined|NaN|Infinity/);
          assert.equal(q.options!.filter(option => option === q.answer).length, 1);
          assert.ok(q.workedSteps!.every(step => step.visual.trim() && step.text.length > 15));
        }
      }
    }
  }
});
