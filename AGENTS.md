# Adaptly / Mastery League: Unified Engineering & Agent Governance (`AGENTS.md`)

This file is the Single Source of Truth for human engineers and coding agents (OpenAI Codex, Google Antigravity, Claude Code) working in this repository. Every change to this codebase must follow these rules.

## 1. Spec-Driven Development (SDD) & Living Specifications

Specifications in `specs/` and executable tests in `tests/*.spec.ts` define the system contract.

1. **Feature Addition**: Add or update the markdown spec in `specs/` and write a failing test in `tests/*.spec.ts` before writing implementation code.
2. **Feature Modification**: Update the specification in `specs/` and the corresponding `.spec.ts` test first, then update the implementation.
3. **Bug Fix Protocol**: Write a failing test in `tests/*.spec.ts` that reproduces the bug before modifying production code.
4. **API Contract**: Any change to `/api/arena` or `/api/family` must keep [`specs/openapi.yaml`](specs/openapi.yaml) synchronized with the route implementation.

### Specification Index
- [`specs/01-adaptive-learning-engine.spec.md`](specs/01-adaptive-learning-engine.spec.md): Ordered topic journeys, 3-streak advancement, hint/mistake resets, adaptive time budgets, 2-mistake remediation lessons, and mastery evidence rules.
- [`specs/02-question-banks-and-generators.spec.md`](specs/02-question-banks-and-generators.spec.md): 200-question validated banks per topic (Maths and English Grammar), carry/no-carry arithmetic invariants, and visual group/array rules.
- [`specs/03-multiplayer-arena-and-sprint.spec.md`](specs/03-multiplayer-arena-and-sprint.spec.md): `Speed Sprint` (60s solo) and `Last Star Standing` (multiplayer rooms, 5-letter room codes, optimistic concurrency, and fair-play classroom rules).
- [`specs/04-family-pilot-and-reporting.spec.md`](specs/04-family-pilot-and-reporting.spec.md): Family PBKDF2 authentication, passwordless pilot profiles, truncated JSON state recovery, and Parent/Classroom concept reports.
- [`specs/05-pluggable-ux-variants.spec.md`](specs/05-pluggable-ux-variants.spec.md): Pluggable A/B/C/D UX variant registry (`?ux=a|b|c|d`), Constellation Quest Map, Tactile Manipulative Lab, 2-Step Guided Rescue Hints, and Live Star-Track Race Arena.
- [`specs/openapi.yaml`](specs/openapi.yaml): OpenAPI 3.1 contract for `/api/arena` and `/api/family`.

## 2. Test-Driven Development (TDD) & Quality Gates

- **Mandatory Test Execution**: Run `npm test` before and after every change. Never push a commit that breaks `npm test`, `npx tsc --noEmit`, `npm run lint`, or `npm run build`.
- **Coverage Target**: Maintain at least 80% test coverage across domain and application modules in `lib/`.
- **Deterministic Tests**: Question bank and generator tests must validate mathematical and grammatical invariants across all skills and difficulty levels without flaky timing assumptions.

## 3. Code Craftsmanship & Formatting Standards (Strict Anti-Minification Rule)

- **Ban Single-Line Compressed Code**: Never pack multiple statements, functions, types, or JSX elements onto single 500+ character lines. Always format TypeScript and TSX files across readable, multi-line blocks with standard 2-space indentation.
- **Low Cyclomatic Complexity**: Keep domain and helper functions small, flat, and single-purpose. Target cyclomatic complexity of 3 or lower for new and refactored domain functions by extracting named helper functions and lookup tables.
- **Architectural Separation**:
  - `lib/`: Pure domain logic, adaptive progression, question banks, and state repair functions (zero React or DOM dependencies).
  - `db/`: Database schema (`drizzle-orm`) and connection helpers.
  - `app/api/`: Thin HTTP route adapters (`route.ts`) that validate requests, invoke domain/storage helpers, and return JSON responses.
  - `app/`: React client components and UI views.

## 4. Pre-Commit & Deployment Checklist

Pushes to `main` trigger `.github/workflows/deploy-aws.yml`, which builds and deploys the application to the AWS CloudFront/EC2 proof-of-concept host. Before merging or pushing to `main`, verify all four checks pass locally:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```


## Question feature contract

Every new or revised question must ship with a verified answer, a child-friendly worked explanation, and a replayable animated walkthrough with synchronized optional voice and readable captions. Provide Play/Pause, Replay, Back/Next step, voice off, and reduced-motion support. Use the shared QuestionWalkthrough player and add topic-specific worked steps in lib/question-walkthrough.ts when needed.

Show feedback after correct and incorrect submissions. Level Up must allow reading time before Continue. Sprint must retain submitted-answer reviews. Arena may reveal answers and explanations only for completed rounds. Stop speech and timers when a walkthrough closes or the learner navigates away.

Document the teaching rubric before generating questions. Check progressive difficulty, mathematical/grammatical correctness, unambiguous wording, meaningful variety, and unseen-first recycling. Test worked steps against actual operands, including carry/borrow chains, remainders, missing values, and grammar distractors. Browser speech availability varies; keep the complete explanation usable through captions.
