# Specification 03: Multiplayer Arena (`Last Star Standing`) & Solo `Speed Sprint`

## 1. Scope & Purpose
Defines the solo 60-second fluency sprint ([`app/MathSprint.tsx`](../app/MathSprint.tsx)) and the real-time multiplayer survival arena ([`lib/arena-engine.ts`](../lib/arena-engine.ts), [`app/api/arena/route.ts`](../app/api/arena/route.ts), [`app/ArenaHub.tsx`](../app/ArenaHub.tsx)).

## 2. Functional Requirements

### FR-3.1: Room Creation, Codes & Classroom Capacity (`/api/arena`)
- **Room Code Format**: 5 characters drawn from the unambiguous uppercase alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (`^[A-HJ-NP-Z2-9]{5}$`, excluding `I`, `O`, `0`, `1`).
- **Player Capacity**: Minimum `2` players to start; maximum `MAX_ARENA_PLAYERS = 35` players per room to support full classroom sections (25 to 35 students) as well as small peer groups.
- **Unique Nicknames**: Duplicate player names (case-insensitive) within the same room are rejected with HTTP `409`.
- **Starting State**: Each player starts with `lives = 3` and `score = 0`.
- **Arena Rule Modes (`mode: 'classroom' | 'showdown'`)**:
  - Rooms default to `'classroom'` mode (`Fair Hearts · Accuracy Safe`) and can be created with or toggled by the host in the lobby between `'classroom'` and `'showdown'`.

### FR-3.2: Round Lifecycle & Settlement (`classroom` vs `showdown`)
- **Question Ordering**: Questions are grouped by ascending `step`, shuffled within each `step` via Fisher-Yates, and interleaved in 2-question passes across ascending `step` buckets so every 10-round match progresses from warm-up facts (`step 1`) to challenge problems (`step 5+`) while preserving all 200 unique questions.
- **Round Timer**: Each round runs for `question.seconds * 1000` ms (`roundStartedAt` to `roundEndsAt`).
- **Settlement Trigger**: A round settles when `now >= roundEndsAt` OR when all active players (`lives > 0`) have locked in an answer.
- **Heart & Score Settlement Rules**:
  1. **`classroom` Mode (Default — Accuracy-Safe Classroom Rules)**:
     - Match length is `CLASSROOM_MATCH_ROUNDS = 10` rounds (or fewer if `<= 1` player has hearts remaining).
     - Every active player who submits a **correct** answer within the round timer keeps their heart (`lives` unchanged) and earns `100` base accuracy points plus a speed bonus (`Math.max(0, Math.floor((roundEndsAt - answeredAt) / 200))`).
     - The **fastest** correct player (`safeId` / `safeName`) earns an additional `+50` speed-leader bonus (`150` base + speed bonus).
     - Only active players who submit an **incorrect** answer or **fail to answer before time expires** lose `1` heart (`lives = Math.max(0, lives - 1)`).
  2. **`showdown` Mode (Classic Sudden-Death Rules)**:
     - Only the single fastest player with a correct answer (`safeId`) keeps their heart and earns `100 + Math.max(0, Math.floor((roundEndsAt - answeredAt) / 100))` points.
     - All other active players lose `1` heart (`lives = Math.max(0, lives - 1)`). Other players who answered correctly still earn `40` accuracy points toward tie-breakers.
- **Inter-Round Pause**: After settlement, if the match is not finished, `nextAt = now + 3600` ms gives players a 3.6-second intermission before the next round starts.
- **Match Termination**:
  - The match finishes (`status = "finished"`) when `<= 1` player has `lives > 0` or when `round + 1 >= totalRounds` (`10` in `classroom` mode, `200` in `showdown` mode).
  - When multiple players survive or tie on lives, `winnerId` is resolved by highest `lives`, then highest `score`.

### FR-3.3: Concurrency & Security
- **Optimistic Locking**: Room state updates in D1 (`multiply_arena_matches`) use `WHERE id = ? AND version = ?` with up to 6 retries on concurrent player actions.
- **Origin Protection**: All `POST /api/arena` mutations verify `validateSameOrigin(req)`.

### FR-3.4: Solo `Speed Sprint` (`app/MathSprint.tsx`)
- **Duration**: Fixed 60-second countdown (`ROUND_SECONDS = 60`).
- **Scoring**:
  - Correct answer: `+10` base points + time bonus `Math.max(5, Math.ceil(remainingSeconds / 6))` + streak bonus `Math.min(20, streak * 2)`.
  - Wrong answer: `-5` points (floored at `0`), resets `streak = 0`, and displays the correct answer for `1150ms`.
- **Personal Best**: Stored in `localStorage` under `adaptly-${topicId}-sprint:${identity}`.

## 3. Verification Mapping
- Tested by [`tests/multiplayer-arena-and-sprint.spec.ts`](../tests/multiplayer-arena-and-sprint.spec.ts).
