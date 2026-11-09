import assert from 'node:assert/strict';
import { it } from 'node:test';
import { teachingStages, topicOrder, teachingStage } from '../lib/topic-order';
import { topics, skills, isGrammarTopic } from '../lib/learning';
import { buildParentReport } from '../lib/parent-insights';

it('covers each visible subject topic exactly once', () => {
  const ids=teachingStages.flatMap(stage=>stage.topics);
  assert.equal(new Set(ids).size,ids.length);
  const visible=topics.filter(topic=>!['english','english-modifiers','english-connectives'].includes(topic.id));
  assert.deepEqual([...ids].sort(),visible.map(topic=>topic.id).sort());
  for(const topic of visible) assert.equal(teachingStage(topic.id)?.subject,isGrammarTopic(topic.id)?'english':'maths');
});
it('orders prerequisite introductions before dependent topics', () => {
  for(const [before,after] of [
    ['place-value','addition'],['addition','multiply'],['multiply','division'],
    ['factors-multiples','hcf'],['fractions','advanced-fractions'],['decimals','percentages'],
    ['ratio','scale-drawings'],['negative-numbers','transformations'],['coordinates','symmetry'],
    ['english-nouns','english-pronouns'],['english-verbs','english-adverbs'],
    ['english-sentences','english-subject-predicate'],['english-subject-predicate','english-agreement'],
    ['english-punctuation','english-sentence-types'],['english-punctuation','english-direct-speech'],
    ['english-conjunctions','english-editing'],
  ]) assert.ok(topicOrder(before)<topicOrder(after),`${before} before ${after}`);
});
it('orders all topic surfaces consistently without changing saved skill identity', () => {
  assert.deepEqual(topics.map(topic=>topicOrder(topic.id)),topics.map(topic=>topicOrder(topic.id)).sort((a,b)=>a-b));
  assert.equal(skills[8].topic,'addition');
  assert.equal(skills[29].topic,'english-nouns');
  assert.equal(skills[85].topic,'odd-even');
  assert.ok(topicOrder('new-topic')>topicOrder('english-editing'));
});
it('uses teaching order in parent topic details rather than the order of first practice', () => {
  const attempts = [2,8].map(skill => ({skill,level:1,prompt:'Q',answer:1,given:'1',correct:true,seconds:5,hinted:false,at:1}));
  const report=buildParentReport({id:'test',name:'Test',attempts});
  assert.deepEqual(report.subjects[0].topics.map(topic=>topic.id),['addition','multiply']);
});
