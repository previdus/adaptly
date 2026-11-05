# Specification 05: Pluggable A/B/C/D UX Variants & Tactile Learning Models

## 1. Overview
Adaptly separates pure educational and multiplayer domain logic from dynamic user-interface skins so UX concepts can be deployed side by side, switched via URL query parameter (`?ux=a|b|c|d`) or an in-app UX Lab switcher, verified with automated Playwright substance tests, and retired cleanly by removing isolated view adapters.

## 2. Functional Requirements

### FR-5.1: UX Variant Registry & Capability Flags (`lib/ux-variants.ts`)
- Supported variants (`UXVariantId`):
  - `"a"` (alias `"classic"`): Baseline Engineer UI (3-card `GameChooser`, modal subject/topic pickers, standard form inputs, table-based Arena standings).
  - `"b"` (alias `"quest"`): **Constellation Quest Map** home experience with top-level subject pills, an 8-node winding skill trail, companion position indicator, and 1-click mode portals (zero nested modals).
  - `"c"` (alias `"tactile"`): **Tactile Manipulative Lab** practice experience featuring a 3D on-screen Arcade Keypad (`0–9`, `⌫`, `Lock In`), interactive math manipulatives, and **2-Step Guided Rescue Hints**.
  - `"d"` (aliases `"stage"`, `"studio"`): **Unified Next-Gen Experience** combining the Constellation Quest Map (`"b"`), Tactile Manipulative Lab (`"c"`), and **Live Star-Track Race Arena** with a **Teacher Smartboard Projector Mode**.
- `resolveUxVariant(input, fallback)` normalizes query parameters and stored preferences case-insensitively and returns a valid `UXVariantId`.
- `uxCapabilities(variant)` returns deterministic feature flags (`useQuestMapHome`, `useTactilePractice`, `useStarTrackArena`).

### FR-5.2: Interactive 2-Step Guided Rescue Hint Engine (`buildGuidedHintSteps`)
- `buildGuidedHintSteps(question)` returns a 2-step Socratic scaffold (`[step1, step2]`) for any Maths or English Grammar `Question`.
- Each step includes:
  - `prompt`: A short, child-friendly micro-question.
  - `expected`: The exact string answer for that step.
  - `choices`: 3 distinct tap-friendly options that include `expected`.
  - `Carry/Bridge note`: Optional visual note showing how Step 1 feeds into Step 2.
- Step 2's `expected` value must always equal `String(question.answer)`.

### FR-5.3: Tactile Manipulative Data Models (`buildManipulativeModel`)
- `buildManipulativeModel(question)` produces a pure, serializable manipulative model for the active question:
  - `"array-splitter"`: For visual/table multiplication (`rows`, `cols`, `rowTotals` cumulative skip-counts, default `splitRow` decomposition).
  - `"column-carry"`: For multi-digit multiplication, addition, and subtraction (`a`, `b`, `operator`, `onesStep`, `carryValue`, `tensStep`).
  - `"number-track"`: For division, HCF, and LCM (`jumpA`, `jumpB`, `stopsA`, `stopsB`, `meetingPoint`).
  - `"word-chips"`: For English Grammar (`tokens`, `options`, `answer`).

### FR-5.4: Live Star-Track Race Projection (`buildStarTrackStandings`)
- `buildStarTrackStandings(players, round, totalRounds)` maps multiplayer arena players onto a `0..100` horizontal race track coordinate (`progressPct`), assigns a deterministic cosmic racer icon, and labels each racer's live energy state (`"charged"`, `"thinking"`, or `"spectating"`).
