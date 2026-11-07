'use client';
import { useEffect, useRef, useState } from 'react';
import AdditionWalkthrough from './AdditionWalkthrough';
import { questionWalkthrough, type WalkthroughQuestion } from '../lib/question-walkthrough';

export default function QuestionWalkthrough({ question, initiallyOpen = false }: { question: WalkthroughQuestion; initiallyOpen?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(initiallyOpen);
  useEffect(() => {
    const details = root.current?.closest('details');
    if (!details) return;
    const close = () => { if (!details.open) setVisible(false); };
    details.addEventListener('toggle', close);
    return () => details.removeEventListener('toggle', close);
  }, []);
  const isAddition = question.topicId === 'addition';
  return <div ref={root}>
    {!initiallyOpen && <button type="button" onClick={() => setVisible(value => !value)}
      style={{minHeight:44, padding:'10px 16px', borderRadius:12, cursor:'pointer'}}
      aria-expanded={visible}>
      {visible ? 'Close walkthrough' : '▶ Watch the worked explanation'}
    </button>}
    {visible && <AdditionWalkthrough
    key={question.prompt}
    a={question.a}
    b={question.b}
    missing={question.skill === 11 || question.prompt.includes('□')}
    lesson={isAddition ? undefined : questionWalkthrough(question)}
  />}</div>;
}
