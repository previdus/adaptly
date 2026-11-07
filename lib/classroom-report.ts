import {
  isGrammarTopic,
  progressFromTopic,
  skills,
  skillsForTopic,
  stageForTopic,
  stats,
  topicInfo,
  type Student,
  type TopicId,
} from "./learning";

export interface LearnerClassroomSummary {
  id: string;
  name: string;
  totalAttempts: number;
  independentAccuracy: number | null;
  secureSkills: number;
  developingSkills: number;
  topicLevel: number;
  totalLevels: number;
  needsAttention: boolean;
  focusSkills: string[];
}

export interface ConceptClassroomCell {
  skillIndex: number;
  skillName: string;
  skillIcon: string;
  topicId: TopicId;
  topicName: string;
  secureCount: number;
  developingCount: number;
  needsHelpCount: number;
  notAssessedCount: number;
  studentsNeedingHelp: string[];
}

export interface ClassroomSummary {
  topicId: TopicId | "all";
  learners: LearnerClassroomSummary[];
  concepts: ConceptClassroomCell[];
  attentionCount: number;
}

function isSkillNeedingHelp(student: Student, skillIndex: number): boolean {
  const skillAttempts = student.attempts.filter(
    (attempt) => attempt.skill === skillIndex && !attempt.hinted,
  );
  if (skillAttempts.length < 2) {
    return false;
  }
  const recentTwo = skillAttempts.slice(-2);
  if (recentTwo.length === 2 && recentTwo.every((attempt) => !attempt.correct)) {
    return true;
  }
  const recentWindow = skillAttempts.slice(-10);
  const correctCount = recentWindow.filter((attempt) => attempt.correct).length;
  return (
    recentWindow.length >= 3 && correctCount / recentWindow.length < 0.6
  );
}

function summarizeSingleLearner(
  student: Student,
  targetSkills: number[],
  activeTopic: TopicId,
): LearnerClassroomSummary {
  const topicAttempts = student.attempts.filter((attempt) =>
    targetSkills.includes(attempt.skill),
  );
  const independentAttempts = topicAttempts.filter(
    (attempt) => !attempt.hinted,
  );
  const independentCorrect = independentAttempts.filter(
    (attempt) => attempt.correct,
  ).length;
  const independentAccuracy = independentAttempts.length
    ? Math.round((independentCorrect / independentAttempts.length) * 100)
    : null;

  let secureSkills = 0;
  let developingSkills = 0;
  const focusSkills: string[] = [];

  for (const skillIndex of targetSkills) {
    const skillStats = stats(student.attempts, skillIndex);
    if (skillStats.mastered) {
      secureSkills++;
    } else if (skillStats.total > 0) {
      developingSkills++;
    }
    if (isSkillNeedingHelp(student, skillIndex)) {
      focusSkills.push(skills[skillIndex].name);
    }
  }

  const totalLevels = stageForTopic(activeTopic, 100000).stage + 1;
  const savedProgress =
    student.topicProgress?.[activeTopic] ??
    (activeTopic === "multiply" && student.progress
      ? student.progress
      : progressFromTopic(activeTopic, student.attempts));

  return {
    id: student.id,
    name: student.name,
    totalAttempts: topicAttempts.length,
    independentAccuracy,
    secureSkills,
    developingSkills,
    topicLevel: Math.min(totalLevels, savedProgress.stage + 1),
    totalLevels,
    needsAttention: focusSkills.length > 0,
    focusSkills,
  };
}

export function summarizeClassroom(
  students: Student[],
  topicFilter: TopicId | "all" = "multiply",
): ClassroomSummary {
  const activeTopic: TopicId =
    topicFilter === "all" ? "multiply" : topicFilter;
  const targetSkills =
    topicFilter === "all"
      ? skills.map((_, index) => index)
      : skillsForTopic(topicFilter);

  const learners = students.map((student) =>
    summarizeSingleLearner(student, targetSkills, activeTopic),
  );

  const concepts: ConceptClassroomCell[] = targetSkills.map((skillIndex) => {
    const skill = skills[skillIndex];
    let secureCount = 0;
    let developingCount = 0;
    let needsHelpCount = 0;
    let notAssessedCount = 0;
    const studentsNeedingHelp: string[] = [];

    for (const student of students) {
      const skillStats = stats(student.attempts, skillIndex);
      if (skillStats.mastered) {
        secureCount++;
      } else if (isSkillNeedingHelp(student, skillIndex)) {
        needsHelpCount++;
        studentsNeedingHelp.push(student.name);
      } else if (skillStats.total > 0) {
        developingCount++;
      } else {
        notAssessedCount++;
      }
    }

    return {
      skillIndex,
      skillName: skill.name,
      skillIcon: skill.icon,
      topicId: skill.topic,
      topicName: topicInfo(skill.topic).name,
      secureCount,
      developingCount,
      needsHelpCount,
      notAssessedCount,
      studentsNeedingHelp,
    };
  });

  return {
    topicId: topicFilter,
    learners,
    concepts,
    attentionCount: learners.filter((learner) => learner.needsAttention).length,
  };
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportClassroomCsv(students: Student[]): string {
  const header =
    "Learner,Subject,Topic,Concept,Attempts,Correct,Independent accuracy,Status";
  const rows: string[] = [header];

  for (const student of students) {
    for (let index = 0; index < skills.length; index++) {
      const skill = skills[index];
      const skillStats = stats(student.attempts, index);
      const subject =
        isGrammarTopic(skill.topic) ? "English Grammar" : "Maths";
      const topicName = topicInfo(skill.topic).name;
      const accuracyText = skillStats.total
        ? `${Math.round(skillStats.acc * 100)}%`
        : "Not assessed";
      const statusText = skillStats.mastered
        ? "Secure"
        : isSkillNeedingHelp(student, index)
          ? "Needs help"
          : skillStats.total
            ? "Developing"
            : "Not assessed";

      rows.push(
        [
          escapeCsvCell(student.name),
          escapeCsvCell(subject),
          escapeCsvCell(topicName),
          escapeCsvCell(skill.name),
          skillStats.total,
          skillStats.correct,
          escapeCsvCell(accuracyText),
          escapeCsvCell(statusText),
        ].join(","),
      );
    }
  }

  return rows.join("\n");
}
