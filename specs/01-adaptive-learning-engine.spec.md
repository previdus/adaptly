# Spec 01: Adaptive Learning Engine (`lib/learning.ts`)

## 1. Purpose & Scope
Defines the multi-subject adaptive learning pathways (`Level Up`), skill progression rules, dynamic time budgets, remediation triggers, and mastery evidence calculations across Maths and English Grammar.

## 2. Supported Topics & Skills
The platform supports 7 topics (`TopicId`) across 37 ordered skills:
- `multiply` (8 skills, 24 stages): Equal groups, Arrays & patterns, Times-table trails, Place-value powers, Multiply without carrying, The carrying bridge, Two-digit mountain, Real-world quests.
- `addition` (5 skills, 15 stages): Add without regrouping, Cross the ten, Hundreds with carrying, Find the missing addend, Addition story problems.
- `subtraction` (5 skills, 15 stages): Subtract without regrouping, Regroup across a ten, Regroup across zero, Find the missing number, Subtraction story problems.
- `division` (5 skills, 15 stages): Share into equal groups, Division fact trail, Bigger equal shares, Remainder rescue, Division story problems.
- `hcf` (3 skills, 9 stages): Factor finder, Greatest shared factor, HCF in a story.
- `lcm` (3 skills, 9 stages): Multiple explorer, Find the first meeting point, LCM in a story.
- `english` (8 skills, 24 stages): Noun Detectives, Pronoun Substitutes, Verb Time Machine, Adjective & Adverb Studio, Subject-Verb Match, Sentence Builder, Capital & Punctuation Crew, Joining Words & Prepositions.

## 3. Functional Requirements & Invariants

### FR-1.1: Three-Answer Unassisted Stage Progression
- Each stage pairs a `skill` index with a difficulty `level` (`1`, `2`, or `3`).
- A learner advances to `stage + 1` (with `run` reset to `0`) only after **3 consecutive correct, unhinted (`hinted === false`) answers** matching the current stage's `skill` and `level`.
- Any wrong answer (`correct === false`) or hinted answer (`hinted === true`) resets `run` to `0` on the current stage.
- Out-of-sequence attempts (where `attempt.skill` or `attempt.level` does not match the current target stage) must not advance the pathway stage.
- Once `stage === totalStages`, the stage index never drifts past `totalStages`.

### FR-1.2: Mastery Evidence & Post-Path Remediation (`stats` & `nextConcept`)
- A skill is marked `mastered: true` in `stats(attempts, skill)` only when the last 10 attempts for that skill contain **at least 8 independent (`!hinted`) attempts** and **independent accuracy is `>= 80%` (`0.8`)**.
- Completing the final stage of a topic (`stage === totalStages`) does not end the quest unless every skill in that topic has `mastered === true` and at least 3 unassisted correct answers at `level === 3`. Otherwise, `nextConcept` returns the first skill in the topic that still lacks mastery evidence.

### FR-1.3: Two-Mistake Remedial Lesson Trigger
- Two consecutive wrong attempts on the same `skill` (`misses[skill] >= 2`) trigger the guided remediation modal (`help = skill`), pausing the question timer and playing the concept's explanation or embedded video lesson before serving a fresh question on that concept.

### FR-1.4: Question Time Budget & Adaptive Pacing (`questionTime` & `budget`)
- `questionTime(q)` computes a baseline thinking guide (`18s` to `180s` for Multiply, `18s` to `100s` for other Maths topics, `25s` to `75s` for English Grammar) scaled by digit count, carry operations, and word count.
- After 3 or more unassisted correct attempts at a given `(skill, level)`, `budget(attempts, skill, level, q)` adapts the baseline time by the learner's median relative pace, bounded between `0.8x` and `2.0x` of `questionTime(q)`.
- Thinking timers act as a pacing guide; answers remain submittable after the countdown reaches `0`, and response speed never reduces mastery accuracy in `stats()`.
