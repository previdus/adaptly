import assert from 'node:assert/strict';
import { it } from 'node:test';
import { generate, skills, type Student } from '../lib/learning';
import { buildConceptLesson, lessonKey, shouldIntroduceLesson, recordLessonVisit, lessonVideos } from '../lib/concept-lessons';

it('offers each new stage once without changing learner evidence or progress', () => {
  const child:Student={id:'test',name:'Mira',attempts:[]};
  assert.equal(shouldIntroduceLesson(child,8,1),true);
  const visited=recordLessonVisit(child,8,1,'skipped',[],123);
  assert.equal(shouldIntroduceLesson(visited,8,1),false);
  assert.equal(shouldIntroduceLesson(visited,8,2),true);
  assert.deepEqual(visited.attempts,[]);
  assert.equal(visited.topicProgress,undefined);
  assert.equal(child.lessonVisits,undefined);
  assert.equal(visited.lessonVisits?.[lessonKey(8,1)].outcome,'skipped');
});
it('respects existing stage attempts and keeps shared video records learner-specific', () => {
  const child:Student={id:'test',name:'Mira',attempts:[{skill:8,level:1,prompt:'2 + 3 = ?',answer:5,given:'5',correct:true,hinted:false,seconds:3,at:1}]};
  assert.equal(shouldIntroduceLesson(child,8,1),false);
  const visited=recordLessonVisit(child,8,1,'explored',['abc'],123);
  assert.deepEqual(visited.lessonVisits?.[lessonKey(8,1)].openedVideoIds,['abc']);
  assert.equal(shouldIntroduceLesson({id:'other',name:'Jo',attempts:[]},8,1),true);
});
it('builds a distinct supported example and narrated lesson for every skill and difficulty', () => {
  for(let skill=0;skill<skills.length;skill++) for(let level=1;level<=3;level++) {
    const active=generate(skill,level);
    const lesson=buildConceptLesson(skill,level,active.prompt);
    assert.notEqual(lesson.example.prompt,active.prompt,`${skill}/${level} leaks active example`);
    assert.equal(lesson.example.skill,skill);
    assert.equal(lesson.example.level,level);
    assert.ok(lesson.steps.length>=4);
    assert.ok(lesson.steps.every(step=>step.text.trim() && step.visual.trim()));
    assert.ok(lesson.steps.some(step=>step.visual.includes(String(lesson.example.answer))));
    assert.ok(lesson.takeaway.length>20);
    assert.ok(lesson.steps.every(step=>!step.text.includes('undefined')));
  }
});
it('keeps video options bounded, validated and relevant to the stage', () => {
  for(let skill=0;skill<skills.length;skill++) {
    const videos=lessonVideos(skill,1);
    assert.ok(videos.length<=2);
    for(const video of videos) {
      assert.match(video.id,/^[a-zA-Z0-9_-]{11}$/);
      assert.ok(video.title && video.channel && video.why && video.source);
    }
  }
});
it('introduces adding small groups before carrying or multi-digit column language', () => {
  const lesson=buildConceptLesson(8,1);
  assert.doesNotMatch(lesson.steps.map(step=>step.text).join(' '),/carry|hundreds|column/i);
  assert.ok(lesson.steps.length<=7);
});
it('does not substitute introductory arrays for carrying or adjectives for adverbs', () => {
  assert.ok(lessonVideos(0,1).some(video=>video.id==='gzFbUZ8VjEg'));
  assert.ok(lessonVideos(5,1).some(video=>video.id==='FJ5qLWP3Fqo'));
  assert.ok(!lessonVideos(5,1).some(video=>video.id==='gzFbUZ8VjEg'));
  assert.ok(lessonVideos(6,1).some(video=>video.id==='RVYwunbpMHA'));
  const adverb=skills.findIndex(skill=>skill.topic==='english-adverbs');
  assert.ok(lessonVideos(adverb,1).some(video=>video.id==='2O4ckpd_UjE'));
  assert.ok(!lessonVideos(adverb,1).some(video=>video.id==='4jxXnHSbicY'));
});
