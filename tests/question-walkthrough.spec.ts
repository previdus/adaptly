import assert from 'node:assert/strict';
import { it } from 'node:test';
import { questionWalkthrough } from '../lib/question-walkthrough';
import { questionBank } from '../lib/topic-bank';
import { topics } from '../lib/learning';

it('creates captioned visual steps with the answer for all game questions', () => {
  for (const topic of topics) {
    for (const q of questionBank(topic.id)) {
      const lesson = questionWalkthrough(q);
      assert.ok(lesson.steps.length >= 2);
      assert.ok(lesson.steps.every(step => step.text && step.visual));
      assert.ok(lesson.steps.at(-1)?.visual.includes(String(q.answer)));
    }
  }
});
it('shows the changing digits when subtraction borrows through zero', () => {
  const lesson = questionWalkthrough({topicId:'subtraction', a:500, b:276, answer:224, prompt:'500 − 276 = ?'});
  assert.ok(lesson.steps.some(step => step.visual.includes('10 − 6 = 4')));
  assert.ok(lesson.steps.some(step => step.visual.includes('9 − 7 = 2')));
});
