import { generate, skills, type Question, type Student } from './learning';
import { getLearningGoal } from './parent-insights';
import { questionWalkthrough, type VisualStep } from './question-walkthrough';
import { additionWalkthrough } from './addition-walkthrough';
import { storySeed } from './lesson-stories';
import { videoRecommendations } from './lesson-videos';

export type ConceptLesson = {
  title: string;
  goal: string;
  icon: string;
  takeaway: string;
  example: Question;
  steps: (VisualStep & { scene: 'discover' | 'example' | 'work' | 'remember' })[];
};

export const lessonKey = (skill: number, level: number) => `${skill}:${level}`;

export function shouldIntroduceLesson(student: Student | null | undefined, skill: number, level: number) {
  if (!student) return false;
  if (student.lessonVisits?.[lessonKey(skill, level)]) return false;
  return !student.attempts.some(attempt => attempt.skill === skill && attempt.level === level);
}

export function recordLessonVisit(
  student: Student, skill: number, level: number,
  outcome: 'explored' | 'skipped', videoIds: string[], at = Date.now(),
): Student {
  const key = lessonKey(skill, level);
  const previous = student.lessonVisits?.[key];
  const openedVideoIds = [...new Set([...(previous?.openedVideoIds || []), ...videoIds])];
  return { ...student, lessonVisits: {
    ...student.lessonVisits,
    [key]: { at, outcome: previous?.outcome === 'explored' ? 'explored' : outcome, openedVideoIds },
  } };
}

export function openedLessonVideos(student: Student | null): string[] {
  return [...new Set(Object.values(student?.lessonVisits || {}).flatMap(visit => visit.openedVideoIds || []))];
}

function exampleWork(example: Question): VisualStep[] {
  if (example.topicId !== 'addition') return questionWalkthrough(example).steps;
  if (example.skill === 8 && example.level === 1) return [
    { visual: `${'● '.repeat(example.a)} + ${'● '.repeat(example.b)}`,
      text: `There are ${example.a} in the first group and ${example.b} in the second. We want to find how many there are altogether.` },
    { visual: `${example.a} + ${example.b} = ${example.answer}`,
      text: `Start with ${example.a}. Count on ${example.b} more. We reach ${example.answer}, so that is our total.` },
  ];
  return additionWalkthrough(example.a, example.b, example.skill === 11).map(step => ({
    text: step.text,
    visual: step.kind === 'finish' ? `${example.prompt}\n${example.answer}` :
      step.kind === 'column' ? `${step.column === 0 ? 'Ones' : step.column === 1 ? 'Tens' : 'Hundreds'} → ${step.digit}` :
      step.kind === 'carry' ? '10 in this place → 1 in the next place' : example.prompt,
  }));
}

function shortSteps(steps: VisualStep[]): VisualStep[] {
  return steps.flatMap(step => {
    const sentences = step.text.split(/(?<=[.!?])\s+(?=[A-Z“])/).filter(Boolean);
    const captions: string[] = [];
    for (const sentence of sentences) {
      const last = captions.at(-1);
      if (last && `${last} ${sentence}`.split(/\s+/).length <= 35) captions[captions.length - 1] += ` ${sentence}`;
      else captions.push(sentence);
    }
    return captions.map(text => ({ visual: step.visual, text }));
  });
}

export function buildConceptLesson(skillIndex: number, level: number, activePrompt = ''): ConceptLesson {
  const skill = skills[skillIndex];
  const story = storySeed(skill.topic);
  if (skillIndex === 8 && level === 1) {
    story.idea = 'Adding joins two groups. We can count everything, or start with one group and count on the other group.';
    story.remember = 'Start with one group. Count on the other group. The number you reach tells how many there are altogether.';
  }
  const example = generate(skillIndex, level, activePrompt ? [activePrompt] : []);
  if (example.prompt === activePrompt) throw new Error('Lesson example must differ from the live question');
  const work = shortSteps(exampleWork(example));
  return {
    title: skill.name, goal: getLearningGoal(skillIndex, level), icon: story.icon,
    takeaway: story.remember, example,
    steps: [
      { scene: 'discover', visual: story.icon, text: story.setting },
      { scene: 'discover', visual: 'One small idea', text: story.idea },
      { scene: 'example', visual: example.prompt, text: 'Let’s explore a practice example together. This is a different example from your game question.' },
      ...work.map(step => ({ ...step, scene: 'work' as const })),
      { scene: 'remember', visual: 'You can take your time.', text: story.remember },
    ],
  };
}

export function lessonVideos(skill: number, level: number) {
  return videoRecommendations(skill, level);
}
