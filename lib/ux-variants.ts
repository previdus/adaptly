import { isCurriculumTopic } from './curriculum-catalog';
import { isExtendedMathTopic } from './extended-maths';
import { skills, type Question, type TopicId } from "./learning";

export type UXVariantId = "a" | "b" | "c" | "d";

export type UXVariantMeta = {
  id: UXVariantId;
  shortLabel: string;
  name: string;
  tagline: string;
  badge: string;
};

export const UX_VARIANTS: readonly UXVariantMeta[] = [
  {
    id: "a",
    shortLabel: "A · Classic Cards",
    name: "Botanical 3-Card Dashboard",
    tagline: "Warm cream theme, 3-card mode chooser & modal subject pickers",
    badge: "Control",
  },
  {
    id: "b",
    shortLabel: "B · Cosmic Trail",
    name: "Deep-Space Winding Constellation",
    tagline: "Full-bleed cosmic nebula, S-curve star trail & Pip world map",
    badge: "World Map",
  },
  {
    id: "c",
    shortLabel: "C · Tactile Workbench",
    name: "Montessori Blueprint Lab",
    tagline: "Drafting-grid studio, live home manipulative sandbox & 3D keypad",
    badge: "Hands-On Lab",
  },
  {
    id: "d",
    shortLabel: "D · Arcade Stadium",
    name: "Cyber-Arcade Game-Show Stage",
    tagline: "Neon esports jumbotron, instant room pin-pad & Star-Track race bar",
    badge: "Esports Stage",
  },
];

const VARIANT_ALIASES: Record<string, UXVariantId> = {
  a: "a",
  classic: "a",
  control: "a",
  b: "b",
  quest: "b",
  map: "b",
  c: "c",
  tactile: "c",
  lab: "c",
  d: "d",
  stage: "d",
  studio: "d",
  full: "d",
};

export function resolveUxVariant(
  raw?: string | null,
  fallback: UXVariantId = "a",
): UXVariantId {
  if (!raw) return fallback;
  const cleaned = raw.trim().toLowerCase();
  return VARIANT_ALIASES[cleaned] ?? fallback;
}

export type UXHomeLayout =
  | "classic-cards"
  | "constellation-map"
  | "tactile-workbench"
  | "arcade-stadium";

export type UXThemeClass =
  | "ux-theme-classic"
  | "ux-theme-cosmos"
  | "ux-theme-blueprint"
  | "ux-theme-stadium";

export type UXCapabilities = {
  homeLayout: UXHomeLayout;
  themeClass: UXThemeClass;
  useQuestMapHome: boolean;
  useTactileWorkbenchHome: boolean;
  useArcadeStageHome: boolean;
  useTactilePractice: boolean;
  useStarTrackArena: boolean;
};

const CAPABILITIES_BY_VARIANT: Record<UXVariantId, UXCapabilities> = {
  a: {
    homeLayout: "classic-cards",
    themeClass: "ux-theme-classic",
    useQuestMapHome: false,
    useTactileWorkbenchHome: false,
    useArcadeStageHome: false,
    useTactilePractice: false,
    useStarTrackArena: false,
  },
  b: {
    homeLayout: "constellation-map",
    themeClass: "ux-theme-cosmos",
    useQuestMapHome: true,
    useTactileWorkbenchHome: false,
    useArcadeStageHome: false,
    useTactilePractice: false,
    useStarTrackArena: false,
  },
  c: {
    homeLayout: "tactile-workbench",
    themeClass: "ux-theme-blueprint",
    useQuestMapHome: false,
    useTactileWorkbenchHome: true,
    useArcadeStageHome: false,
    useTactilePractice: true,
    useStarTrackArena: false,
  },
  d: {
    homeLayout: "arcade-stadium",
    themeClass: "ux-theme-stadium",
    useQuestMapHome: false,
    useTactileWorkbenchHome: false,
    useArcadeStageHome: true,
    useTactilePractice: true,
    useStarTrackArena: true,
  },
};

export function uxCapabilities(variant: UXVariantId): UXCapabilities {
  return CAPABILITIES_BY_VARIANT[variant] ?? CAPABILITIES_BY_VARIANT.a;
}

export type GuidedHintStep = {
  prompt: string;
  expected: string;
  choices: [string, string, string];
  bridgeNote?: string;
};

function buildNumericChoices(expectedNum: number, delta = 2): [string, string, string] {
  const safeExpected = Number.isFinite(expectedNum) ? Math.round(expectedNum) : 1;
  const step = Math.max(1, Math.abs(delta));
  const low = Math.max(0, safeExpected - step);
  const candidates = new Set<string>([String(safeExpected)]);
  const offsets = [low !== safeExpected ? low : safeExpected + step, safeExpected + step, safeExpected + step * 2, safeExpected + 1, safeExpected + 3];
  for (const val of offsets) {
    if (candidates.size >= 3) break;
    candidates.add(String(val));
  }
  const list = Array.from(candidates).slice(0, 3);
  list.sort((x, y) => Number(x) - Number(y));
  return [list[0], list[1], list[2]];
}

function buildTextChoices(expected: string, pool: string[]): [string, string, string] {
  const unique = new Set<string>([expected]);
  for (const item of pool) {
    if (unique.size >= 3) break;
    if (item && item.trim() && item !== expected) {
      unique.add(item);
    }
  }
  const fallbacks = ["Keep checking", "Look at the subject", "Check the clue"];
  for (const item of fallbacks) {
    if (unique.size >= 3) break;
    unique.add(item);
  }
  const arr = Array.from(unique).slice(0, 3);
  return [arr[0], arr[1], arr[2]];
}

function inferTopic(q: Question): TopicId {
  if (q.topicId) return q.topicId;
  return skills[q.skill]?.topic ?? "multiply";
}

function buildMultiplyGuidedHint(q: Question): [GuidedHintStep, GuidedHintStep] {
  const ans = Number(q.answer);
  const a = Math.max(1, q.a || 2);
  const b = Math.max(1, q.b || 2);

  if (q.skill === 5 || (a >= 12 && b <= 9 && (a % 10) * b >= 10)) {
    const ones = (a % 10) * b;
    const carry = Math.floor(ones / 10);
    return [
      {
        prompt: `Step 1: Multiply the ones first: ${a % 10} × ${b} = ?`,
        expected: String(ones),
        choices: buildNumericChoices(ones, b),
        bridgeNote: `Write ${ones % 10} in the ones place and carry +${carry} ten.`,
      },
      {
        prompt: `Step 2: Now combine the tens (${Math.floor(a / 10)} × ${b} + ${carry} tens) with ${ones % 10} ones:`,
        expected: String(ans),
        choices: buildNumericChoices(ans, b),
      },
    ];
  }

  if (a >= 10 && b >= 10) {
    const tensPart = a * Math.floor(b / 10) * 10;
    const onesPart = a * (b % 10);
    return [
      {
        prompt: `Step 1: Multiply by the tens row first: ${a} × ${Math.floor(b / 10) * 10} = ?`,
        expected: String(tensPart),
        choices: buildNumericChoices(tensPart, a),
        bridgeNote: `Next, add the ones row (${a} × ${b % 10} = ${onesPart}).`,
      },
      {
        prompt: `Step 2: Add both parts together: ${tensPart} + ${onesPart} = ?`,
        expected: String(ans),
        choices: buildNumericChoices(ans, a),
      },
    ];
  }

  const splitA = Math.max(1, Math.floor(a / 2));
  const part1 = splitA * b;
  const part2 = ans - part1;
  return [
    {
      prompt: `Step 1: Start with a friendly chunk: ${splitA} groups of ${b} is:`,
      expected: String(part1),
      choices: buildNumericChoices(part1, b),
      bridgeNote: `Now add the remaining ${a - splitA} group(s) (${part2}).`,
    },
    {
      prompt: `Step 2: Put the chunks together: ${part1} + ${part2} = ?`,
      expected: String(ans),
      choices: buildNumericChoices(ans, b),
    },
  ];
}

function buildAddSubGuidedHint(
  q: Question,
  topic: "addition" | "subtraction",
): [GuidedHintStep, GuidedHintStep] {
  const ans = Number(q.answer);
  const a = q.a || 10;
  const b = q.b || 5;

  if (topic === "addition") {
    const onesSum = (a % 10) + (b % 10);
    const carry = Math.floor(onesSum / 10);
    return [
      {
        prompt: `Step 1: Add the ones column first: ${a % 10} + ${b % 10} = ?`,
        expected: String(onesSum),
        choices: buildNumericChoices(onesSum, 2),
        bridgeNote:
          carry > 0
            ? `Write ${onesSum % 10} in the ones place and carry +${carry} ten.`
            : `No carry needed! Keep ${onesSum} in the ones place.`,
      },
      {
        prompt: `Step 2: Now finish the full sum to get the final answer:`,
        expected: String(ans),
        choices: buildNumericChoices(ans, 10),
      },
    ];
  }

  const stepOne = Math.max(1, b % 10 || 5);
  const intermediate = Math.max(0, a - stepOne);
  return [
    {
      prompt: `Step 1: Hop back by the ones part first: ${a} − ${stepOne} = ?`,
      expected: String(intermediate),
      choices: buildNumericChoices(intermediate, 3),
      bridgeNote: `Now finish hopping to find the target difference.`,
    },
    {
      prompt: `Step 2: Complete the subtraction to lock in the final answer:`,
      expected: String(ans),
      choices: buildNumericChoices(ans, 5),
    },
  ];
}

function buildDivHcfLcmGuidedHint(
  q: Question,
  topic: "division" | "hcf" | "lcm",
): [GuidedHintStep, GuidedHintStep] {
  const ans = Number(q.answer);
  const a = Math.max(2, q.a || 6);
  const b = Math.max(2, q.b || 3);

  if (topic === "division") {
    const divisor = Math.max(2, Math.min(a, b));
    const halfQ = Math.max(1, Math.floor(ans / 2));
    return [
      {
        prompt: `Step 1: Test a friendly multiple of ${divisor}: ${divisor} × ${halfQ} = ?`,
        expected: String(divisor * halfQ),
        choices: buildNumericChoices(divisor * halfQ, divisor),
        bridgeNote: `Keep counting in steps of ${divisor} to reach the target.`,
      },
      {
        prompt: `Step 2: What is the exact answer for this division challenge?`,
        expected: String(ans),
        choices: buildNumericChoices(ans, 1),
      },
    ];
  }

  if (topic === "hcf") {
    const smaller = Math.min(a, b);
    return [
      {
        prompt: `Step 1: The greatest shared factor cannot be bigger than the smaller number. Which number is smaller?`,
        expected: String(smaller),
        choices: buildNumericChoices(smaller, 2),
        bridgeNote: `Test factors of ${smaller} that also divide ${Math.max(a, b)} evenly.`,
      },
      {
        prompt: `Step 2: Pick the greatest factor that divides both ${a} and ${b}:`,
        expected: String(ans),
        choices: buildNumericChoices(ans, 2),
      },
    ];
  }

  const bigger = Math.max(a, b);
  return [
    {
      prompt: `Step 1: Start with the first multiple of the larger number (${bigger} × 1):`,
      expected: String(bigger),
      choices: buildNumericChoices(bigger, 2),
      bridgeNote: `Step through ${bigger}, ${bigger * 2}, ${bigger * 3}... until both tracks land together.`,
    },
    {
      prompt: `Step 2: Which is the first common multiple where ${a} and ${b} meet?`,
      expected: String(ans),
      choices: buildNumericChoices(ans, Math.min(a, b)),
    },
  ];
}

function buildEnglishGuidedHint(q: Question): [GuidedHintStep, GuidedHintStep] {
  const ans = String(q.answer);
  const skillHelp = skills[q.skill]?.help ?? "Read the sentence carefully.";
  const firstClause = skillHelp.split(".")[0]?.trim() || "Use the sentence clue";
  const stepOneExpected =
    firstClause.length > 48 ? `${firstClause.slice(0, 45)}...` : firstClause;

  return [
    {
      prompt: "Step 1: Which grammar rule unlocks this sentence?",
      expected: stepOneExpected,
      choices: buildTextChoices(stepOneExpected, [
        "Ignore the subject and guess",
        "Pick the longest word in the list",
      ]),
      bridgeNote: skillHelp,
    },
    {
      prompt: "Step 2: Apply that rule and choose the matching answer:",
      expected: ans,
      choices: buildTextChoices(ans, q.options ?? ["Option A", "Option B"]),
    },
  ];
}

export function buildGuidedHintSteps(q: Question): [GuidedHintStep, GuidedHintStep] {
  const topic = inferTopic(q);
  if (isExtendedMathTopic(topic) || isCurriculumTopic(topic)) {
    const firstStep = q.explanation.split('. ').slice(1)[0] || skills[q.skill].help;
    return [
      { prompt: 'Which worked step helps solve this problem?', expected: firstStep,
        choices: buildTextChoices(firstStep, ['Use a different unit without converting', 'Choose a number without checking the question']) },
      { prompt: 'Apply that method. Which answer fits the requested unit?', expected: String(q.answer),
        choices: buildTextChoices(String(q.answer), q.options ?? []) }
    ];
  }
  if (topic === "english" || typeof q.answer === "string") {
    return buildEnglishGuidedHint(q);
  }
  if (topic === "addition" || topic === "subtraction") {
    return buildAddSubGuidedHint(q, topic);
  }
  if (topic === "division" || topic === "hcf" || topic === "lcm") {
    return buildDivHcfLcmGuidedHint(q, topic);
  }
  return buildMultiplyGuidedHint(q);
}

export type ArraySplitterModel = {
  kind: "array-splitter";
  rows: number;
  cols: number;
  icon: string;
  rowTotals: number[];
  splitRow: number;
  answer: number;
};

export type ColumnCarryModel = {
  kind: "column-carry";
  a: number;
  b: number;
  operator: "×" | "+" | "−";
  onesProductOrSum: number;
  onesDigit: number;
  carryValue: number;
  tensStepLabel: string;
  answer: number;
};

export type NumberTrackModel = {
  kind: "number-track";
  mode: "division" | "hcf" | "lcm";
  jumpA: number;
  jumpB: number;
  stopsA: number[];
  stopsB: number[];
  meetingPoint: number;
};

export type WordChipsModel = {
  kind: "word-chips";
  tokens: string[];
  options: string[];
  answer: string;
};

export type ManipulativeModel =
  | ArraySplitterModel
  | ColumnCarryModel
  | NumberTrackModel
  | WordChipsModel;

function buildArraySplitter(q: Question): ArraySplitterModel {
  const rows = Math.max(2, Math.min(10, q.a || 3));
  const cols = Math.max(2, Math.min(10, q.b || 4));
  const rowTotals = Array.from({ length: rows }, (_, idx) => (idx + 1) * cols);
  return {
    kind: "array-splitter",
    rows,
    cols,
    icon: q.visual || skills[q.skill]?.icon || "⭐",
    rowTotals,
    splitRow: Math.max(1, Math.floor(rows / 2)),
    answer: Number(q.answer),
  };
}

function buildColumnCarry(
  q: Question,
  operator: "×" | "+" | "−",
): ColumnCarryModel {
  const a = Math.max(1, q.a || 24);
  const b = Math.max(1, q.b || 3);
  const aOnes = a % 10;
  const bOnes = b % 10;

  if (operator === "×") {
    const onesProd = aOnes * bOnes;
    const carry = Math.floor(onesProd / 10);
    const aTens = Math.floor(a / 10);
    return {
      kind: "column-carry",
      a,
      b,
      operator: "×",
      onesProductOrSum: onesProd,
      onesDigit: onesProd % 10,
      carryValue: carry,
      tensStepLabel: `${aTens} × ${b} + ${carry} = ${aTens * b + carry} tens`,
      answer: Number(q.answer),
    };
  }

  if (operator === "+") {
    const onesSum = aOnes + bOnes;
    const carry = Math.floor(onesSum / 10);
    return {
      kind: "column-carry",
      a,
      b,
      operator: "+",
      onesProductOrSum: onesSum,
      onesDigit: onesSum % 10,
      carryValue: carry,
      tensStepLabel:
        carry > 0
          ? `Bundle 10 ones into +${carry} ten`
          : `Add the tens column straight down`,
      answer: Number(q.answer),
    };
  }

  const needsBorrow = aOnes < bOnes;
  return {
    kind: "column-carry",
    a,
    b,
    operator: "−",
    onesProductOrSum: needsBorrow ? aOnes + 10 - bOnes : aOnes - bOnes,
    onesDigit: Math.abs(Number(q.answer)) % 10,
    carryValue: needsBorrow ? 1 : 0,
    tensStepLabel: needsBorrow
      ? `Trade 1 ten for 10 ones (${aOnes + 10} − ${bOnes})`
      : `Subtract ones (${aOnes} − ${bOnes}), then tens`,
    answer: Number(q.answer),
  };
}

function buildNumberTrack(
  q: Question,
  mode: "division" | "hcf" | "lcm",
): NumberTrackModel {
  const ans = Number(q.answer);
  const a = Math.max(2, q.a || 6);
  const b = Math.max(2, q.b || 4);

  if (mode === "lcm") {
    const countA = Math.min(8, Math.max(3, Math.ceil(ans / a)));
    const countB = Math.min(8, Math.max(3, Math.ceil(ans / b)));
    return {
      kind: "number-track",
      mode: "lcm",
      jumpA: a,
      jumpB: b,
      stopsA: Array.from({ length: countA }, (_, i) => (i + 1) * a),
      stopsB: Array.from({ length: countB }, (_, i) => (i + 1) * b),
      meetingPoint: ans,
    };
  }

  if (mode === "hcf") {
    const factorsOf = (n: number) =>
      Array.from({ length: n }, (_, i) => i + 1).filter((f) => n % f === 0);
    return {
      kind: "number-track",
      mode: "hcf",
      jumpA: a,
      jumpB: b,
      stopsA: factorsOf(a).slice(0, 8),
      stopsB: factorsOf(b).slice(0, 8),
      meetingPoint: ans,
    };
  }

  const step = Math.max(2, Math.min(a, b));
  const jumps = Math.min(10, Math.max(2, Math.floor(Math.max(a, b) / step)));
  return {
    kind: "number-track",
    mode: "division",
    jumpA: step,
    jumpB: Math.max(a, b),
    stopsA: Array.from({ length: jumps }, (_, i) => (i + 1) * step),
    stopsB: [Math.max(a, b)],
    meetingPoint: ans,
  };
}

export function buildManipulativeModel(q: Question): ManipulativeModel {
  const topic = inferTopic(q);
  if (topic === "english" || typeof q.answer === "string") {
    const cleaned = q.prompt.replace(/\n+/g, " ").trim();
    return {
      kind: "word-chips",
      tokens: cleaned.split(/\s+/).slice(0, 14),
      options: q.options ?? [String(q.answer)],
      answer: String(q.answer),
    };
  }
  if (topic === "multiply") {
    if (q.skill <= 2 && q.a <= 10 && q.b <= 10) {
      return buildArraySplitter(q);
    }
    return buildColumnCarry(q, "×");
  }
  if (topic === "addition") {
    return buildColumnCarry(q, "+");
  }
  if (topic === "subtraction") {
    return buildColumnCarry(q, "−");
  }
  if (topic === "division" || topic === "hcf" || topic === "lcm") {
    return buildNumberTrack(q, topic);
  }
  return buildArraySplitter(q);
}

export type StarTrackRacer = {
  id: string;
  name: string;
  avatar: string;
  lives: number;
  score: number;
  isYou: boolean;
  state: "charged" | "thinking" | "spectating";
  progressPct: number;
};

const RACER_ICONS = ["🚀", "🛸", "☄️", "🛰️", "🌟", "⚡", "🦊", "🐼"];

export function buildStarTrackStandings(
  players: {
    id: string;
    name: string;
    lives: number;
    score: number;
    active: boolean;
    answered: boolean;
    isYou: boolean;
  }[],
  round: number,
  totalRounds: number,
): StarTrackRacer[] {
  const maxScore = Math.max(100, ...players.map((p) => p.score));
  const roundProgress =
    totalRounds > 0 ? Math.min(1, Math.max(0.1, round / totalRounds)) : 0.25;

  const sorted = [...players].sort(
    (a, b) =>
      Number(b.active) - Number(a.active) ||
      b.score - a.score ||
      b.lives - a.lives,
  );

  return sorted.map((player, idx) => {
    const scoreRatio = Math.min(1, Math.max(0, player.score / maxScore));
    const rawPct = Math.round(12 + roundProgress * 36 + scoreRatio * 50);
    const progressPct = Math.min(100, Math.max(10, rawPct));
    const state = !player.active
      ? "spectating"
      : player.answered
        ? "charged"
        : "thinking";
    const iconIdx =
      Math.abs(
        player.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), idx),
      ) % RACER_ICONS.length;

    return {
      id: player.id,
      name: player.name,
      avatar: RACER_ICONS[iconIdx],
      lives: player.lives,
      score: player.score,
      isYou: player.isYou,
      state,
      progressPct,
    };
  });
}
