import type { Student } from "./learning";

export const MAX_FAMILY_LEARNERS = 35;

export interface SavedFamilyState {
  students: Student[];
  active: number;
}

export interface RepairedStateResult {
  state: SavedFamilyState;
  repaired: boolean;
}

function isValidFamilyState(candidate: unknown): candidate is SavedFamilyState {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  const record = candidate as Record<string, unknown>;
  if (!Array.isArray(record.students)) {
    return false;
  }
  return record.students.every(
    (student) =>
      Boolean(student) &&
      typeof student === "object" &&
      Array.isArray((student as Record<string, unknown>).attempts),
  );
}

function collectAttemptBoundaryCommas(prefix: string): number[] {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  const commas: number[] = [];

  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      stack.pop();
    } else if (ch === "," && stack.join("") === "{[{[") {
      commas.push(i);
    }
  }

  return commas;
}

/**
 * Parses saved family/pilot JSON state, repairing bounded data exports that end
 * with a `[truncated` marker by trimming back to the last complete attempt.
 */
export function readSavedState(raw: string): RepairedStateResult {
  try {
    return {
      state: JSON.parse(raw) as SavedFamilyState,
      repaired: false,
    };
  } catch {
    // Proceed to truncated export recovery below.
  }

  const marker = raw.indexOf("[truncated");
  if (marker < 0) {
    throw new Error("Saved learner progress is not valid JSON");
  }

  const prefix = raw.slice(0, marker);
  const commas = collectAttemptBoundaryCommas(prefix);

  for (let i = commas.length - 1; i >= 0; i--) {
    try {
      const candidate = JSON.parse(`${prefix.slice(0, commas[i])}]}]}`);
      if (isValidFamilyState(candidate)) {
        return { state: candidate, repaired: true };
      }
    } catch {
      // Try the previous attempt comma boundary.
    }
  }

  throw new Error("Saved learner progress could not be repaired");
}
