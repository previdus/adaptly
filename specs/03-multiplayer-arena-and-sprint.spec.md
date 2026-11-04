# Spec 03: Speed Sprint & Multiplayer Arena (`app/MathSprint.tsx`, `app/ArenaHub.tsx`, `app/api/arena/route.ts`)

## 1. Purpose & Scope
Defines the rules and API contracts for the two arcade modes:
1. **`Speed Sprint`**: 60-second solo personal-best challenge.
2. **`Last Star Standing`**: Live multiplayer survival arena (`POST /api/arena` and `GET /api/arena`).

## 2. Speed Sprint Requirements (`app/MathSprint.tsx`)
- Runs a strict 60-second countdown (`ROUND_SECONDS = 60`) drawing from the selected topic's 200-question bank ordered by `step` buckets (shuffled within each bucket).
- **Scoring**:
  - Correct answer: `+10` base points + time bonus `max(5, ceil(remainingSeconds / 6))` + streak bonus `min(20, streak * 2)`.
  - Wrong answer: `-5` points (floored at `0`), resets `streak` to `0`, and displays the correct answer for `1150ms`.
- Personal best is persisted per `(topicId, identity)` in `localStorage`.

## 3. Last Star Standing Multiplayer Requirements (`/api/arena`)

### FR-3.1: Room Creation & Joining
- Rooms are identified by a 5-character code drawn from unambiguous uppercase characters `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (`/^[A-HJ-NP-Z2-9]{5}$/`).
- No student email or PII is required; players join with a display nickname (`1` to `20` chars, case-insensitively unique within the room).
- Each player receives a secret session `token`; only `SHA-256(token)` is stored in `multiply_arena_matches.state`.
- Rooms expire after 12 hours (`expires = now + 12 * 3600 * 1000`).

### FR-3.2: Round Lifecycle & Settlement
- Host can start the match once at least 2 players have joined (`status: 'lobby' -> 'playing'`).
- Each player starts with `3` lives (`♥ ♥ ♥`).
- When a round ends (either `now >= roundEndsAt` or all active players with `lives > 0` have locked in an answer), the round settles and schedules the next round after `3600ms` (`nextAt = now + 3600`).
- Eliminated players (`lives === 0`) remain connected in spectator mode and can view live questions and standings.
- Match finishes (`status: 'finished'`) when `<= 1` player has `lives > 0` or all rounds in the bank are completed.

### FR-3.3: Concurrency & Origin Protection
- All state mutations on `multiply_arena_matches` use optimistic concurrency control (`UPDATE ... SET state=?, version=version+1 WHERE id=? AND version=?`) with bounded retries.
- `POST /api/arena` enforces `isSameOriginRequest(req)` (`403 Forbidden` on cross-origin mutations).
