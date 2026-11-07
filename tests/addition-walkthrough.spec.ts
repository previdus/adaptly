import assert from 'node:assert/strict';
import { it } from 'node:test';
import { additionWalkthrough } from '../lib/addition-walkthrough';

it('walks through a carry chain and reveals the final digit', () => {
  const steps = additionWalkthrough(999, 1);
  const columns = steps.filter(step => step.kind === 'column');
  assert.deepEqual(columns.map(step => [step.digit, step.carryOut]), [[0, 1], [0, 1], [0, 1]]);
  assert.equal(columns[1].carryIn, 1);
  assert.equal(steps.at(-1)?.text.includes('1000'), true);
  assert.ok(steps.some(step => step.kind === 'carry' && step.column === 3));
});

it('does not invent carries and explains missing addends', () => {
  assert.ok(additionWalkthrough(23, 14).filter(step => step.kind === 'column').every(step => step.carryOut === 0));
  assert.match(additionWalkthrough(8, 7, true)[0].text, /15 minus 8 is 7/);
});
