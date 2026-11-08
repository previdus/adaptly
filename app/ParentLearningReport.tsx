'use client';

import { useMemo, useState } from 'react';
import { buildParentReport, type ParentFocus } from '../lib/parent-insights';
import type { Student, TopicId } from '../lib/learning';
import './parent-report.css';

function AnswerEvidence({ focus }: { focus: ParentFocus }) {
  return <div className="parent-evidence">
    {focus.examples.map((attempt, index) => <div key={index}>
      <strong>{attempt.prompt}</strong>
      <span>Answered <b>{attempt.given}</b> · Expected <b>{attempt.answer}</b></span>
    </div>)}
  </div>;
}

const statusLabels = {
  starting: 'Early evidence', building: 'Taking shape', steady: 'Steady at practised steps', revisit: 'Worth revisiting',
};

export default function ParentLearningReport({ student, onContinue, onLesson }: {
  student: Student;
  onContinue: (topic: TopicId) => void;
  onLesson: (skill: number) => void;
}) {
  const report = useMemo(() => buildParentReport(student), [student]);
  const [selected, setSelected] = useState(0);
  const subject = report.subjects[selected];
  const focus = subject.focus;
  const steady = subject.topics.filter(topic => topic.status === 'steady');
  return <div className="parent-report">
    <div className="parent-report-intro">
      <div>
        <p>A subject-by-subject view of what {student.name} can do independently and where a little support may help.</p>
      </div>
      <span className="parent-source">Level Up practice<br />{report.lastPractice ? `Last saved ${new Date(report.lastPractice).toLocaleDateString('en-GB')}` : 'No saved practice yet'}</span>
    </div>
    <div className="parent-subjects" role="group" aria-label="Report subject">
      {report.subjects.map((item, index) => <button key={item.name} aria-pressed={selected === index}
        onClick={() => setSelected(index)} className={selected === index ? 'selected' : ''}>
        <span className="parent-subject-icon" aria-hidden="true">{index === 0 ? '＋' : 'Aa'}</span>
        <span><strong>{item.name}</strong><small>{item.topics.length ? `${item.topics.length} topic${item.topics.length === 1 ? '' : 's'} explored` : 'Not explored yet'}</small></span>
        <span aria-hidden="true">→</span>
      </button>)}
    </div>
    {!subject.topics.length ? <section className="parent-empty"><span aria-hidden="true">🌱</span><h3>A fresh page for {subject.name}.</h3>
      <p>No saved Level Up answers yet. A few questions will begin to reveal a useful picture—there is no score to judge here.</p>
    </section> : <>
      <section className="parent-pulse" aria-label={`${subject.name} overview`}>
        <div><small>INDEPENDENT ANSWERS</small><strong>{subject.correct}<em> / {subject.independent}</em></strong><span>correct across recent distinct questions</span></div>
        <div><small>LOOKING STEADY</small><strong>{steady.length}<em> topic{steady.length === 1 ? '' : 's'}</em></strong><span>at the steps practised so far</span></div>
        <div><small>WITH A LITTLE HELP</small><strong>{subject.hinted}<em> attempts</em></strong><span>hint-supported; counted separately</span></div>
      </section>
      <div className="parent-insight-grid">
        <section className="parent-next">
          <span className="eyebrow">ONE USEFUL NEXT STEP</span>
          <h3>{focus?.title || 'Keep building the picture'}</h3>
          {focus ? <>
            <span className="parent-goal">{focus.goal}</span><p>{focus.summary}</p>
            <details><summary>See the saved answers</summary><AnswerEvidence focus={focus} /></details>
            <div className="parent-conversation"><strong>Try this together</strong><p>{focus.action}</p></div>
            <div className="parent-actions"><button className="primary" onClick={() => onContinue(focus.topicId)}>Continue this topic →</button>
              <button className="secondary" onClick={() => onLesson(focus.skill)}>Open concept lesson</button></div>
          </> : <><p>No repeated difficulty is evident in these saved answers. Continue practice to see how understanding holds as questions become more demanding.</p>
            <button className="primary" onClick={() => onContinue(subject.topics[0].id)}>Continue learning →</button></>}
        </section>
        <aside className="parent-strength">
          <span aria-hidden="true" className="parent-strength-symbol">✦</span><span className="eyebrow">NOTICE THE PROGRESS</span>
          <h3>{steady.length ? 'Something to celebrate' : 'Every answer adds a clue'}</h3>
          {steady.length ? <><p>{student.name} is answering consistently at the practised steps in:</p>
            <ul>{steady.slice(0, 3).map(topic => <li key={topic.id}><strong>{topic.name}</strong><span>{topic.correct}/{topic.independent} independently correct</span></li>)}</ul>
          </> : <p>We wait for at least 8 different independent answers, with 80% correct, before calling a topic’s practised steps steady.</p>}
          <small>This describes observed practice, not mastery of the whole subject.</small>
        </aside>
      </div>
      <section className="parent-topic-section"><div><span className="eyebrow">THE SUBJECT PICTURE</span><h3>Open a topic to see the evidence.</h3></div>
        {subject.topics.map(topic => <details className="parent-topic" key={topic.id}>
          <summary><span aria-hidden="true">{topic.icon}</span><span><strong>{topic.name}</strong><small>{topic.independent} distinct independent questions · {topic.hinted} hint-supported attempts</small></span>
            <span className={`parent-status ${topic.status}`}>{statusLabels[topic.status]}</span><span className="parent-topic-score">{topic.accuracy === null ? '—' : `${topic.correct}/${topic.independent}`}</span></summary>
          <div className="parent-topic-body">
            <p>{topic.independent < 8 ? 'A small sample: treat these results as early clues.' : 'Based on the latest 20 distinct independent questions, or fewer if less practice is saved.'}</p>
            {topic.trend && <p>Recent comparison: <strong>{topic.trend.before}% → {topic.trend.after}%</strong> across two groups of five different questions. Difficulty may also have changed.</p>}
            <div className="parent-goals">{topic.goals.map(goal => <div key={goal.name}><span>{goal.name}</span><strong>{goal.correct}/{goal.total}</strong><meter min="0" max={goal.total} value={goal.correct} aria-label={`${goal.name}: ${goal.correct} of ${goal.total} correct`} /></div>)}</div>
            {topic.focus && <><h4>{topic.focus.title}</h4><p>{topic.focus.summary}</p><AnswerEvidence focus={topic.focus} /></>}
            <button className="secondary" onClick={() => onContinue(topic.id)}>Continue {topic.name} →</button>
          </div>
        </details>)}
      </section>
    </>}
    <details className="parent-method"><summary>How to read this report</summary>
      <p>We use saved Level Up answers, not competitive game scores. Each topic uses up to 20 recent distinct questions without hints; repeated facts and reversed addition or multiplication facts count once. Hint-supported attempts are separate.</p>
      <p>A final answer cannot reliably separate a calculation slip from a misunderstanding. We highlight repeated, recognizable patterns as possibilities and show the evidence. Carrying comparisons require the same digit sizes. This is a practice snapshot, not a formal assessment.</p>
      <p>Speed never lowers these indicators. Only the latest 2,000 attempts are retained. Unpractised topics receive no score. Continue opens the existing adaptive journey; it does not change the child’s level.</p>
    </details>
  </div>;
}
