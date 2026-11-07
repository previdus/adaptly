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

## Level Up Addition rubric

| Stages | Task | Digits per addend | Exact carries by stage | Seconds |
| --- | --- | --- | --- | --- |
| 1–3 | Basic sums | 1, 1, 2 | 0, 1, 0 | 18, 22, 30 |
| 4–6 | Place value | 2, 2, 3 | 1, 2, 0 | 36, 42, 46 |
| 7–9 | Three-digit regrouping | 3, 3, 3 | 1, 2, 3 | 50, 54, 58 |
| 10–12 | Missing addend | 3, 3, 3 | 1, 2, 3 | 62, 66, 70 |
| 13–15 | Join or combine two amounts in a story | 3, 3, 3 | 1, 2, 3 | 74, 78, 82 |

Count a carry out of the highest column and propagate incoming carries. Stage 6 introduces a new place before combining it with carrying. One carry in stage 4 comes from the ones column. Each stage uses 200 distinct unordered facts when possible. For single-digit stages, exhaust the distinct positive facts before reuse (20 without carrying, 25 with carrying). Choose unseen prompts before recycling, including across resumed sessions when history is available. Preserve existing stage positions and skill IDs. Timings are starting budgets, subject to existing personalization.

## Remaining Level Up rubrics

| Topic | Teaching order | What increases the difficulty |
| --- | --- | --- |
| Multiplication | Equal groups and arrays; facts; tens and hundreds; written products; stories | Larger fact families, more places, then regrouping and partial products. Short stories bridge one-digit and two-digit multipliers. |
| Subtraction | Single-digit take-away; two-digit without borrowing; borrowing; borrowing through zeros; missing parts; stories | Wider numbers, longer borrowing chains, inverse reasoning, then translating take-away and comparison situations. |
| Division | Share equally; inverse facts; larger exact quotients; remainders; stories | Larger divisors and quotients, then distinguishing exact sharing, leftovers, and the number of containers needed. |
| HCF | Recognize a factor; find the greatest shared factor; make equal groups or cuts | Larger candidate factors and less obvious relationships, then choosing HCF from context. |
| LCM | Generate multiples; find the first shared multiple; solve repeating-event stories | Larger intervals, common factors that defeat simply multiplying, then identifying the first simultaneous event. |
| English Grammar | Nouns; pronouns; verbs; modifiers; agreement; sentences; punctuation; joining words | Identify a feature, apply it in a sentence, then edit or choose it in a more demanding context. Distractors must address the same task and leave one defensible answer. |

Retain the existing skill IDs and stage slots. Prefer unseen questions in the current stage. Use up to 200 distinct numeric facts per stage and exhaust intentionally bounded introductory pools before repeating. Grammar variation must change a meaningful part of the sentence; punctuation or name swaps alone do not count as new grammar rules.


### Audit criteria and stage limits

- **Multiplication:** The six visual stages use strictly increasing total bands (4–6, 8–9, 12–15, 16–20, 24–25, 30–36). Each varies both quantities and objects. Fact stages use small, middle, and larger times-table ranges. Place-value stages move from tens to hundreds. Written stages increase the multiplicand width, distinguish no carries from a required ones carry, and finish with partial products and two-digit story problems.
- **Subtraction:** Verify a positive difference. The first stage uses two positive single-digit numbers. The next stages use two-digit numbers, then require one borrow. Across-zero stages require exactly two borrows with a zero in the tens place. Missing-number and story stages progress from no borrow to two borrows.
- **Division:** Exact division stages progress from supported sharing to inverse facts and then larger quotients. Remainder questions always have leftovers smaller than the divisor. Stories progress from exact sharing to counting full packs and finally adding a container for leftovers.
- **HCF:** First recover a factor from a known quotient. Then use ascending number bands 4–24, 12–52, and 24–96 for greatest shared factors. Later bands exclude pairs where one divides the other and include some coprime pairs so learners encounter HCF 1. Story questions transfer the calculation to equal cuts with no waste.
- **LCM:** First count forward in equal jumps. Then find the least positive shared multiple using the same ascending bands, with common factors so multiplying the intervals alone gives the wrong answer. Stories ask when two cycles that start together next coincide.
- **Grammar:** Each concept defines three different tasks, such as subject, object, and possessive pronouns, or singular, plural, and intervening-phrase agreement. Sentence combinations vary the vocabulary and, where appropriate, the answer form. They provide 200 prompts per stage except for the 11 explicitly curated irregular plural forms. Sentence variants practise the same rule in different contexts.

The executable audit exhausts each pool, checks arithmetic and grammar answer invariants, and verifies recycling starts with the least recently seen prompt. Narrow fact ranges intentionally stay below 200 where adding larger numbers would change the skill. Arena and Sprint retain their existing bank generators.

## English Grammar topics

English Grammar opens a topic picker for every game. Existing grammar skill IDs remain stable so past attempts count toward the matching topic.

| Topic | Introduce | Apply | Extend |
| --- | --- | --- | --- |
| Nouns | Identify a thing | Identify a proper place name | Form an irregular plural |
| Pronouns | Replace a subject | Replace an object | Use an independent possessive |
| Verbs | Identify an action | Choose past tense in context | Rewrite in the future tense |
| Adjectives & adverbs | Identify a description | Use an adjective before a noun | Use an adverb to describe an action |
| Subject–verb agreement | Match a singular subject | Match a plural subject | Ignore an intervening plural phrase |
| Sentence structure | Recognize a complete thought | Join alternatives | Join two independent clauses |
| Capitalization & punctuation | Choose an end mark | Capitalize names and sentence starts | Edit a contraction |
| Conjunctions & prepositions | Show contrast | Describe where | Introduce a reason |

Level Up uses the three topic stages and unseen-first practice. Speed Sprint and Last Star Standing use a stable 200-question multiple-choice bank per topic, with a balanced stage mix where the pool permits. Nouns include every curated irregular plural and allocate the remaining questions across the first two stages. Existing mixed Grammar game IDs remain available to resume saved rooms.

Grammar feedback always names the correct answer and explains the rule using the sentence. Level Up waits for Continue after either outcome. Timed games retain an answer review for submitted or completed questions.

All Maths topics provide the answer and worked reasoning after either outcome. Level Up uses Continue for reading time. Sprint retains submitted-answer reviews and Arena reveals completed-round explanations.

Addition Level Up feedback offers an on-demand column walkthrough with captions and optional browser speech. Columns advance from ones, include incoming and outgoing carries, and reveal the final carried digit. Missing-addend examples first explain the missing value, then verify by addition. Replay, pause, manual steps, voice off, and reduced-motion are supported.

Every question exposes a captioned, replayable, optionally narrated worked walkthrough. Steps must correspond to the actual arithmetic or grammar rule. Playback is opt-in, supports manual steps and reduced motion, and cancels voice on close/navigation. Completed-round and submitted-answer reviews expose the same walkthrough.

Voice playback starts from a direct user click, chooses an available English voice, explicitly resumes the speech queue, and reports speech errors or a start timeout. Enabling voice starts narration without requiring a second Play click.
