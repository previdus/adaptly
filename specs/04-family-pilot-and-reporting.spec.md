# Specification 04: Family Accounts, Pilot Profiles & Concept Reporting

## 1. Scope & Purpose
Defines parent/family authentication, passwordless school-pilot profiles, truncated JSON state recovery ([`lib/state-repair.ts`](../lib/state-repair.ts), [`app/api/family/route.ts`](../app/api/family/route.ts)), and parent/teacher concept reporting ([`lib/classroom-report.ts`](../lib/classroom-report.ts), [`app/page.tsx`](../app/page.tsx)).

## 2. Functional Requirements

### FR-4.1: Pilot Profiles & Family Authentication (`/api/family`)
- **Pilot Identification (`action: "identify"`)**:
  - Accepts `email` and learner `name` (1–40 chars).
  - Creates or loads a `pilot_profiles` record and issues an `HttpOnly; Secure; SameSite=Lax` cookie (`adaptly_pilot`, 90-day TTL).
  - Supports up to `MAX_FAMILY_LEARNERS = 35` learner profiles per pilot/family email so a teacher or school coordinator can manage a full classroom section under one pilot account.
- **Full Family Auth (`action: "signup" | "login"`)**:
  - Validates email and password (`10–128` characters).
  - Enforces per-email 15-minute rate limiting (`login_limits`, max 10 attempts per 15-minute bucket).
  - Hashes passwords with `PBKDF2` (`SHA-256`, `100,000` iterations, random 16-byte salt).
  - Issues an `HttpOnly; Secure; SameSite=Lax` cookie (`mq_session`, 30-day TTL).

### FR-4.2: Truncated State Recovery (`readSavedState`)
- **Valid JSON**: Returns `{ state, repaired: false }`.
- **Truncated Export Recovery**: If a stored state string was truncated mid-export (contains `[truncated`), `readSavedState` scans backward for the last complete attempt object boundary, closes the JSON array/object brackets (`}]}]}`), validates the resulting structure, and returns `{ state, repaired: true }`.
- **Unrecoverable JSON**: Throws an explicit error so the caller never silently overwrites learner history with empty state.

### FR-4.3: Parent Concept Report & Teacher Classroom Snapshot
- **Individual Learner Report**:
  - Displays total questions explored, hinted count, overall accuracy, secure concept count (`8+` independent recent attempts at `>= 80%`), and highest successful unassisted level.
  - Per-concept table shows independent accuracy, attempt evidence, median correct-answer pace (seconds), learning signal (`Feeling secure`, `Still developing`, `Not assessed`), and one-click practice launch.
- **Teacher Classroom / Group Snapshot (`lib/classroom-report.ts`)**:
  - Aggregates all learners in a family/pilot profile into:
    1. **Learner Roster Summary**: Each learner's total attempts, independent accuracy %, secure skill count, developing skill count, active topic level, and a `needsAttention` flag when any skill has `>= 2` recent mistakes or `< 60%` independent accuracy across `>= 3` attempts.
    2. **Concept Mastery Heatmap**: For every skill in a topic (or across all topics), counts how many learners are `Secure`, `Developing`, `Needs help`, or `Not assessed`, and lists the names of learners who need targeted intervention on that concept.
    3. **CSV Export**: Exports either the individual learner's concept report or the full multi-learner classroom CSV.

## 3. Verification Mapping
- Tested by [`tests/family-pilot-and-reporting.spec.ts`](../tests/family-pilot-and-reporting.spec.ts).
