import assert from 'node:assert/strict';
import { it } from 'node:test';
import { extendedMathTopics, extendedQuestion } from '../lib/extended-maths';
import { questionBank } from '../lib/topic-bank';
import { journeyFor } from '../lib/learning';
import { questionWalkthrough } from '../lib/question-walkthrough';

it('provides nine ordered stages and answerable question pools for every new Maths topic', () => {
  assert.equal(extendedMathTopics.length, 16);
  for (const topic of extendedMathTopics) {
    assert.equal(journeyFor(topic.id).length, 9);
    assert.equal(questionBank(topic.id).length, 200);
    for (let concept = 0; concept < 3; concept++) {
      for (let level = 1; level <= 3; level++) {
        const prompts = new Set<string>();
        for (let i = 0; i < 200; i++) {
          const q = extendedQuestion(topic.id, concept, level, i);
          assert.ok(!prompts.has(q.prompt), topic.id + ' repeats a prompt');
          prompts.add(q.prompt);
          assert.ok(q.options?.includes(String(q.answer)));
          assert.equal(new Set(q.options).size, 4);
          assert.ok(q.explanation.includes(String(q.answer)));
          assert.ok(questionWalkthrough(q).steps.length >= 3);
        }
      }
    }
  }
});


it('checks independent arithmetic targets for all new topic families', () => {
  for (let level = 1; level <= 3; level++) {
    for (let index = 0; index < 200; index++) {
      const x = 12 + index % 20;
      const y = 2 + Math.floor(index / 20);
      const expected: Array<[typeof extendedMathTopics[number]['id'], number, number]> = [
        ['place-value',0,(y % 10) * 10],
        ['fractions',1,y * (level + 1)],
        ['decimals',0,(x * 10 + y) / 10 ** Math.min(level,2)],
        ['percentages',1,x * 20 * level * y * 5 / 100],
        ['money',0,x * level + y * 2],
        ['measurement',0,level === 3 ? x + y / 10 : (level === 1 ? x : x + y / 10) * 100 + y],
        ['time',1,x * level],
        ['geometry',2,180 - x * 2 - y * 3 - level],
        ['area-volume',2,x * y * (level + 1)],
        ['data',2,x * level + y],
        ['patterns',2,x],
        ['ratio',1,x * (level + 1)],
        ['profit-loss',0,y * 10],
        ['speed',1,x * level],
        ['interest',0,x * level * y],
        ['probability',0,x * level]
      ];
      for (const [topic, concept, answer] of expected) {
        const q = extendedQuestion(topic, concept, level, index);
        assert.ok(Math.abs(Number(q.answer) - answer) < 0.00001, topic);
      }
    }
  }
});
