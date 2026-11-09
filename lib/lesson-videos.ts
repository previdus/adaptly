import catalog from './lesson-video-catalog.json' with { type: 'json' };
import { skills, skillsForTopic } from './learning';

export type LessonVideo = (typeof catalog)[number] & { scope: 'concept' | 'foundation' };

function matchesStage(id: string, topic: string, concept: number, level: number) {
  const rules: Record<string, boolean> = {
    '0_932pytnZM': concept === 0 && level === 1,
    'mAvuom42NyY': concept > 0 || level > 1,
    gzFbUZ8VjEg: concept <= 2,
    FJ5qLWP3Fqo: concept >= 3 && concept !== 6,
    RVYwunbpMHA: concept === 6,
    OTTqk5VX3qI: concept <= 1,
    LGqBQrUYua4: concept >= 2,
    T5Qf0qSSJFI: concept === 0,
    'fd-E18EqSVk': concept === 2,
    NYje80asREM: concept === 0,
    XGbOiYhHY2c: concept >= 1,
    cqnYjR46T58: concept <= 1,
    OPz99FFbo7M: concept >= 1,
    CA9XLJpQp3c: concept === 0,
    '5juto2ze8Lg': topic === 'advanced-fractions' || concept === 2,
    KG6ILNOiMgM: concept <= 1,
    kwh4SD1ToFc: topic === 'advanced-decimals' || concept === 2,
    'kOJFSH_Bn9U': concept === 0,
    ptrKThVQwh4: concept === 1,
    xCdxURXMdFY: concept === 1,
    qJwecTgce6c: concept === 2,
    GitPZtwJhz4: concept === 2,
    hi_iy6wHPec: concept !== 1,
    K0AzxyyTfLs: concept === 0,
    hcgThf5mv38: topic === 'advanced-data' || concept <= 1,
    gQsZr8yrsno: concept === 0 && level <= 2,
    IFbwruzo_d0: concept === 0 && level <= 2,
    nxtaLqImKH4: level === 1,
    'DPOm4Z-HpGY': topic === 'english-tenses' || level > 1,
    '0Wrv_ZviMEc': topic === 'english-sentences' || level === 1,
  };
  return rules[id] ?? true;
}

export function videoRecommendations(skillIndex: number, level: number): LessonVideo[] {
  const skill = skills[skillIndex];
  if (!skill) return [];
  const aliases: Record<string, string> = {
    'english-modifiers': level === 3 ? 'english-adverbs' : 'english-adjectives',
    'english-connectives': level === 2 ? 'english-prepositions' : 'english-conjunctions',
  };
  const topic = aliases[skill.topic] || skill.topic;
  const concept = skillsForTopic(skill.topic).indexOf(skillIndex);
  return catalog.filter(video => video.topic === topic && matchesStage(video.id, topic, concept, level))
    .slice(0, 2).map(video => ({ ...video, scope: 'foundation' }));
}
