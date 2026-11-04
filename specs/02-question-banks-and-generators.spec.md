# Spec 02: Question Banks & Procedural Generators (`lib/topic-bank.ts`, `lib/multiply-bank.ts`, `lib/grammar-bank.ts`)

## 1. Purpose & Scope
Defines the structural, mathematical, and grammatical invariants for the 200-question validated banks per topic and the procedural fallback generators.

## 2. Functional Requirements & Invariants

### FR-2.1: 200-Question Bank Invariants (`questionBank(topicId)`)
- For every `TopicId` (`multiply`, `addition`, `subtraction`, `division`, `hcf`, `lcm`, `english`), `questionBank(topicId)` must return a frozen or read-only array of **exactly 200 questions**.
- All 200 question `id` values and all 200 `prompt` strings within a topic bank must be **100% unique**.
- Every question must specify a positive `seconds` budget (`>= 18` for Maths) and a valid `step` progression index.

### FR-2.2: Mathematical Correctness & Carry Invariants
- **Multiplication (`multiply`)**:
  - Every generated and banked question must satisfy `q.answer === q.a * q.b` with non-negative safe integers.
  - Skill 0 (`Equal groups`) and Skill 1 (`Arrays & patterns`) across stages 0 to 5 must never decrease total group/array size (`q.answer`) as stage and run increase.
  - Skill 4 (`Multiply without carrying`) must guarantee that every digit of `q.a` multiplied by `q.b` is `< 10` (zero carry required).
  - Skill 5 (`The carrying bridge`) must guarantee that the ones digit `(q.a % 10) * q.b >= 10` (requires carrying).
  - Skill 6 (`Two-digit mountain`) must guarantee `q.a >= 10` and `q.b >= 10`.
- **Addition (`addition`)**:
  - Skill 8 (`Add without regrouping`) must guarantee `(q.a % 10) + (q.b % 10) < 10`.
  - Skill 9 (`Cross the ten`) must guarantee `(q.a % 10) + (q.b % 10) >= 10`.
  - Skill 11 (`Find the missing addend`) must satisfy `q.a + q.answer === total`.
- **Subtraction (`subtraction`)**:
  - All answers must be non-negative integers (`q.answer >= 0`).
  - Skill 13 (`Subtract without regrouping`) requires no ones borrowing; Skill 14 (`Regroup across a ten`) requires ones borrowing.
- **Division, HCF & LCM (`division`, `hcf`, `lcm`)**:
  - Exact division skills (`18, 19, 20, 22`) must satisfy `q.a === q.b * q.answer` with zero remainder.
  - Skill 21 (`Remainder rescue`) must satisfy `q.answer === q.a % q.b` with `1 <= q.answer < q.b`.
  - HCF questions (`23, 24, 25`) must satisfy `q.answer === gcd(q.a, q.b)`.
  - LCM questions (`26, 27, 28`) must satisfy `q.answer === lcm(q.a, q.b)`.

### FR-2.3: English Grammar Option Invariants (`english`)
- Every question in `questionBank('english')` and `grammarQuestionFor(...)` must include an `options` array of 3 to 4 distinct non-empty strings.
- `String(q.answer)` must be present in `q.options`.
