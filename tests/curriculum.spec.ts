import assert from 'node:assert/strict';
import { it } from 'node:test';
import { curriculumTopics } from '../lib/curriculum-catalog';
import { curriculumPool } from '../lib/curriculum';
import { generate, journeyFor, skillsForTopic, topics } from '../lib/learning';
import { questionBank } from '../lib/topic-bank';
import { questionWalkthrough } from '../lib/question-walkthrough';

it('registers all 33 requested extension topics with an explicit teaching sequence', () => {
  assert.equal(curriculumTopics.length, 33);
  for (const topic of curriculumTopics) {
    assert.ok(topics.some(item => item.id === topic.id));
    assert.ok(topic.prerequisite.length > 10);
    assert.equal(skillsForTopic(topic.id).length, topic.concepts.length);
    const path = journeyFor(topic.id);
    assert.equal(path.length, topic.concepts.length * 3);
    for (const [conceptIndex, concept] of topic.concepts.entries()) {
      assert.equal(new Set(concept.levels).size, 3);
      for (let level = 1; level <= 3; level++) {
        const pool = curriculumPool(topic.id, conceptIndex, level);
        assert.ok(pool.length >= 3 && pool.length <= 200, topic.id + ' invalid pool size');
        assert.equal(new Set(pool.map(q => q.prompt)).size, pool.length);
        for (const q of pool) {
          assert.equal(q.learningGoal, concept.levels[level - 1]);
          assert.ok(q.options?.includes(String(q.answer)));
          assert.equal(new Set(q.options).size, 4);
          assert.ok(q.explanation.includes(String(q.answer)));
          assert.ok(q.workedSteps && q.workedSteps.length >= 2);
          assert.ok(questionWalkthrough(q).steps.at(-1)?.visual.includes(String(q.answer)));
        }
        const stage = path[conceptIndex * 3 + level - 1];
        const previous = pool.map(q => q.prompt);
        assert.equal(generate(stage.skill, level, previous).prompt, previous[0]);
      }
    }
    const bank = questionBank(topic.id);
    assert.equal(bank.length, 200);
    assert.equal(new Set(bank.map(q => q.prompt)).size, 200);
    assert.equal(new Set(bank.map(q => q.step)).size, path.length);
  }
});
