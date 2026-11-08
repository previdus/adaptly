import assert from 'node:assert/strict';
import { it } from 'node:test';
import { buildParentReport, classifyAnswerPattern, exportParentCsv, getLearningGoal } from '../lib/parent-insights';
import { skills, type Attempt, type Student } from '../lib/learning';

function attempt(prompt: string, answer: number|string, given: string, skill=8, level=1, hinted=false): Attempt {
  return {skill,level,prompt,answer,given,hinted,correct:String(answer)===given,seconds:15,at:1700000000000};
}
const report = (attempts: Attempt[]) => buildParentReport({id:'child',name:'Ava',attempts});

it('groups by subject and keeps unassessed evidence empty', () => {
  const result = report([attempt('23 + 14 = ?',37,'37')]);
  assert.equal(result.subjects[0].topics.length,1);
  assert.equal(result.subjects[1].accuracy,null);
  assert.equal(result.subjects[1].topics.length,0);
});
it('excludes hinted answers and repeated or reversed facts from independent evidence', () => {
  const items = Array.from({length:10},()=>attempt('23 + 14 = ?',37,'37'));
  items.push(attempt('14 + 23 = ?',37,'37'));
  items.push(attempt('31 + 12 = ?',43,'43',8,1,true));
  const result=report(items).subjects[0];
  assert.equal(result.independent,1);
  assert.equal(result.hinted,1);
  assert.notEqual(result.topics[0].status,'steady');
});
it('recognizes repeated missed-carry signatures and supports a matched contrast', () => {
  const baseline = [attempt('23 + 14 = ?',37,'37'),attempt('42 + 25 = ?',67,'67'),attempt('31 + 26 = ?',57,'57'),attempt('12 + 34 = ?',46,'46')];
  const carrying = [attempt('27 + 15 = ?',42,'32'),attempt('38 + 24 = ?',62,'52'),attempt('49 + 26 = ?',75,'65')];
  assert.equal(classifyAnswerPattern(carrying[0])?.code,'carry');
  const focus=report([...baseline,...carrying]).subjects[0].focus;
  assert.equal(focus?.kind,'matched-demand');
  assert.match(focus!.summary,/4\/4/);
  assert.match(focus!.summary,/0\/3/);
  assert.equal(focus!.examples.length,2);
});
it('does not compare different digit widths to infer a carrying gap', () => {
  const small = [attempt('1 + 2 = ?',3,'3'),attempt('2 + 3 = ?',5,'5'),attempt('3 + 4 = ?',7,'7'),attempt('4 + 5 = ?',9,'9')];
  const bigger = [attempt('27 + 15 = ?',42,'32'),attempt('38 + 24 = ?',62,'52'),attempt('49 + 26 = ?',75,'65')];
  assert.notEqual(report([...small,...bigger]).subjects[0].focus?.kind,'matched-demand');
});
it('recognizes borrowing and operation patterns but leaves unknown mistakes unexplained', () => {
  assert.equal(classifyAnswerPattern(attempt('52 − 28 = ?',24,'36',14))?.code,'borrow');
  assert.equal(classifyAnswerPattern(attempt('7 × 8 = ?',56,'15',2))?.code,'operation');
  assert.equal(classifyAnswerPattern(attempt('23 + 14 = ?',37,'99')),undefined);
  assert.equal(classifyAnswerPattern(attempt('27 + 15 = ?',42,'32',8,1,true)),undefined);
});
it('keeps a single unexplained miss separate from a concept gap', () => {
  const items=Array.from({length:8},(_,i)=>attempt(`${20+i} + 11 = ?`,31+i,String(31+i)));
  items.push(attempt('42 + 13 = ?',55,'99'));
  const topic=report(items).subjects[0].topics[0];
  assert.equal(topic.status,'steady');
  assert.equal(topic.focus?.kind,'isolated');
  assert.match(topic.focus!.summary,/cause/);
});
it('uses named grammar goals and separates them from Maths', () => {
  assert.match(getLearningGoal(31,1),/action/i);
  const items=[attempt('Ava ___ a bag yesterday.','packed','packs',31,2),attempt('Leo ___ a box yesterday.','packed','packs',31,2)];
  const focus=report(items).subjects[1].focus;
  assert.ok(focus);
  assert.match(focus!.goal,/past/i);
  assert.equal(report(items).subjects[0].topics.length,0);
});
it('handles an empty learner and invalid legacy skill IDs without invented results', () => {
  const child:Student={id:'old',name:'Ava',attempts:[attempt('Q',1,'2',9999)]};
  assert.ok(buildParentReport(child).subjects.every(subject=>subject.accuracy===null));
  assert.ok(report([]).subjects.every(subject=>subject.focus===undefined));
});
it('does not keep recommending a gap after three fresh successes at that goal', () => {
  const items = [attempt('27 + 15 = ?',42,'32'), attempt('38 + 24 = ?',62,'52'),
    attempt('26 + 17 = ?',43,'43'), attempt('48 + 25 = ?',73,'73'), attempt('59 + 24 = ?',83,'83')];
  assert.equal(report(items).subjects[0].focus,undefined);
});
it('keeps the exported parent report scoped to practised topics', () => {
  const csv=exportParentCsv({id:'child',name:'Ava',attempts:[attempt('23 + 14 = ?',37,'37')]});
  assert.equal(csv.split('\n').length,2);
  assert.match(csv,/Addition/);
  assert.doesNotMatch(csv,/Not assessed/);
});
it('recognizes decimal scaling only in decimal topics and denominator addition only in fraction sums', () => {
  const decimalSkill=skills.findIndex(skill=>skill.topic==='decimals');
  assert.equal(classifyAnswerPattern(attempt('0.4 + 0.2 = ?',.6,'6',decimalSkill))?.code,'decimal-scale');
  assert.equal(classifyAnswerPattern(attempt('0.4 + 0.2 = ?',.6,'6',8)),undefined);
  const fractionSkill=skills.findIndex(skill=>skill.topic==='advanced-fractions');
  assert.equal(classifyAnswerPattern(attempt('1/3 + 1/4 = ?','7/12','2/7',fractionSkill))?.code,'fraction-denominator');
});
it('requires ten distinct answers before presenting a trend', () => {
  const items=Array.from({length:10},(_,i)=>attempt(`${20+i} + 11 = ?`,31+i,i<5?'99':String(31+i)));
  assert.equal(report(items.slice(0,9)).subjects[0].topics[0].trend,undefined);
  assert.deepEqual(report(items).subjects[0].topics[0].trend,{before:0,after:100});
});
