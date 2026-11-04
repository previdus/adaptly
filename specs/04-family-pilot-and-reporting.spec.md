# Spec 04: Family Accounts, Pilot Profiles & Mastery Reporting (`app/api/family/route.ts`)

## 1. Purpose & Scope
Defines authentication, session persistence, corrupted/truncated state recovery, and parent/teacher concept reporting for `Adaptly / Mastery League`.

## 2. Functional Requirements & Invariants

### FR-4.1: Dual Account Modes (`/api/family`)
1. **POC Pilot Mode (`action: 'identify'`)**:
   - Accepts `{ action: 'identify', email, name }` without a password for frictionless classroom and family pilot onboarding.
   - Upserts a `pilot_profiles` record by email, selects or creates the learner profile (up to 10 learners per pilot email), creates a 90-day `pilot_sessions` token (`SHA-256` hashed in DB), and sets the `HttpOnly; Secure; SameSite=Lax` cookie `adaptly_pilot`.
2. **Full Family Account Mode (`action: 'signup' | 'login'`)**:
   - Validates email format and password length (`10` to `128` characters).
   - Enforces rate limiting via `login_limits` (`max 12 attempts` per email per 15-minute bucket, returning `429 Too Many Requests` when exceeded).
   - Hashes passwords with `PBKDF2-SHA256` (`100,000` iterations) and a unique per-family UUID salt.

### FR-4.2: Truncated State Auto-Repair (`readSavedState`)
- If a stored JSON state string in `families.state` or `pilot_profiles.state` was truncated during a bounded data export (containing `[truncated`), `readSavedState(raw)` must locate the last complete attempt object, close the JSON arrays/objects (`]}]} `), verify that `state.students` is a valid array of learners with `attempts` arrays, and persist the repaired JSON back to the database on `GET /api/family`.

### FR-4.3: Mastery Report & CSV Export
- Parent and educator reports separate **game rank** (`Beginner`, `Explorer`, `Pro`, `Genius` based on stage progression) from **independent mastery evidence** (`stats(attempts, skill).mastered`, which requires `>= 8` unhinted attempts in the last 10 tries with `>= 80%` accuracy).
- Learners can store up to 2,000 recent attempts (`attempts.slice(-2000)`), and the report can be exported to CSV (`adaptly-learning-report.csv`) covering Subject, Topic, Concept, Attempts, Correct, Independent Accuracy, and Status (`Secure`, `Developing`, `Not assessed`).
