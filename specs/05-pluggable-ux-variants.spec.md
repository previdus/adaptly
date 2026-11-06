# Specification 05: Pluggable A/B/C/D UX Variants & Tactile Learning Models

## 1. Overview
Adaptly separates pure educational and multiplayer domain logic from dynamic user-interface skins so four visually and structurally distinct UX paradigms (`A`, `B`, `C`, `D`) can be deployed side by side, switched via URL query parameter (`?ux=a|b|c|d`) or an in-app UX Lab switcher, verified with automated Playwright substance tests, and retired cleanly by removing isolated view adapters.

## 2. Functional Requirements

### FR-5.1: UX Variant Registry & Distinct Capability Flags (`lib/ux-variants.ts`)
- Supported variants (`UXVariantId`), each with a distinct full-page theme (`themeClass`) and distinct home screen architecture (`homeLayout`):
  - `"a"` (alias `"classic"`): **Baseline Botanical Cards** (`homeLayout: "classic-cards"`, `themeClass: "ux-theme-classic"`). Uses the 3-card `GameChooser`, modal subject/topic pickers, standard form inputs, and table-based Arena standings.
  - `"b"` (alias `"quest"`): **Cosmic Constellation Trail** (`homeLayout: "constellation-map"`, `themeClass: "ux-theme-cosmos"`). Full-bleed midnight-space theme with a winding S-curve constellation trail, SVG star connectors, Pip perched on the active star node, and 1-click subject pills.
  - `"c"` (alias `"tactile"`): **Montessori Tactile Workbench** (`homeLayout: "tactile-workbench"`, `themeClass: "ux-theme-blueprint"`). Full-bleed blueprint/graph-paper studio theme featuring an interactive manipulative sandbox directly on the Home screen, physical skill cartridges, a 3D on-screen Arcade Keypad (`0–9`, `⌫`, `Lock In`), and **2-Step Guided Rescue Hints**.
  - `"d"` (aliases `"stage"`, `"studio"`): **Cyber-Arcade Game-Show Stage** (`homeLayout: "arcade-stadium"`, `themeClass: "ux-theme-stadium"`). Full-bleed neon esports broadcast stadium with a Live Multiplayer Jumbotron, instant room-code pin pad, championship belt progression ladder, tactile keypad practice, and **Live Star-Track Race Arena** with **Teacher Smartboard Projector Mode**.
- `resolveUxVariant(input, fallback)` normalizes query parameters and stored preferences case-insensitively and returns a valid `UXVariantId`.
- `uxCapabilities(variant)` returns deterministic feature flags (`homeLayout`, `themeClass`, `useQuestMapHome`, `useTactileWorkbenchHome`, `useArcadeStageHome`, `useTactilePractice`, `useStarTrackArena`) where all 4 variants have pairwise-distinct `homeLayout` and `themeClass` values.

### FR-5.2: Interactive 2-Step Guided Rescue Hint Engine (`buildGuidedHintSteps`)
- `buildGuidedHintSteps(question)` returns a 2-step Socratic scaffold (`[step1, step2]`) for any Maths or English Grammar `Question`.
- Each step includes:
  - `prompt`: A short, child-friendly micro-question.
  - `expected`: The exact string answer for that step.
  - `choices`: 3 distinct tap-friendly options that include `expected`.
  - `bridgeNote`: Optional visual note showing how Step 1 feeds into Step 2.
- Step 2's `expected` value must always equal `String(question.answer)`.

### FR-5.3: Tactile Manipulative Data Models (`buildManipulativeModel`)
- `buildManipulativeModel(question)` produces a pure, serializable manipulative model for the active question:
  - `"array-splitter"`: For visual/table multiplication (`rows`, `cols`, `rowTotals` cumulative skip-counts, default `splitRow` decomposition).
  - `"column-carry"`: For multi-digit multiplication, addition, and subtraction (`a`, `b`, `operator`, `onesProductOrSum`, `onesDigit`, `carryValue`, `tensStepLabel`).
  - `"number-track"`: For division, HCF, and LCM (`jumpA`, `jumpB`, `stopsA`, `stopsB`, `meetingPoint`).
  - `"word-chips"`: For English Grammar (`tokens`, `options`, `answer`).

### FR-5.4: Live Star-Track Race Projection (`buildStarTrackStandings`)
- `buildStarTrackStandings(players, round, totalRounds)` maps multiplayer arena players onto a `0..100` horizontal race track coordinate (`progressPct`), assigns a deterministic cosmic racer icon, and labels each racer's live energy state (`"charged"`, `"thinking"`, or `"spectating"`).

The header theme icon opens the UX Lab controls on demand. Selecting a variant closes the panel.
