import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advance,
  bankById,
  beginRound,
  buildMatchQuestionOrder,
  CLASSROOM_MATCH_ROUNDS,
  MAX_ARENA_PLAYERS,
  newCode,
  publicState,
  ROOM_CODE_REGEX,
  settle,
  type ArenaMatch,
} from "../lib/arena-engine";
import { celebrationFor, celebrations } from "../lib/celebrations";

function createTestMatch(
  now = 1700000000000,
  mode: "classroom" | "showdown" = "classroom",
  questionCount = 200,
): ArenaMatch {
  const questionIds = buildMatchQuestionOrder("multiply").slice(0, questionCount);
  return {
    id: "match-1",
    code: "AB23C",
    hostId: "p1",
    topicId: "multiply",
    mode,
    status: "lobby",
    players: [
      {
        id: "p1",
        tokenHash: "hash-1",
        name: "Aarav",
        lives: 3,
        score: 0,
        joinedAt: now,
      },
      {
        id: "p2",
        tokenHash: "hash-2",
        name: "Diya",
        lives: 3,
        score: 0,
        joinedAt: now + 10,
      },
      {
        id: "p3",
        tokenHash: "hash-3",
        name: "Kabir",
        lives: 3,
        score: 0,
        joinedAt: now + 20,
      },
    ],
    questionIds,
    round: -1,
    roundStartedAt: 0,
    roundEndsAt: 0,
    nextAt: 0,
    answers: {},
    history: [],
    winnerId: null,
    createdAt: now,
  };
}

describe("Spec 03: Multiplayer Arena & Celebrations", () => {
  it("FR-3.1: generates valid 5-character room codes and supports 35-player classroom capacity", () => {
    assert.equal(MAX_ARENA_PLAYERS, 35);
    assert.equal(CLASSROOM_MATCH_ROUNDS, 10);
    for (let i = 0; i < 200; i++) {
      const code = newCode();
      assert.match(code, ROOM_CODE_REGEX);
    }
  });

  it("FR-3.2: buildMatchQuestionOrder interleaves ascending difficulty steps across the first 10 rounds while preserving all 200 unique questions", () => {
    const order = buildMatchQuestionOrder("multiply");
    assert.equal(order.length, 200);
    assert.equal(new Set(order).size, 200);

    const firstTenSteps = order
      .slice(0, 10)
      .map((id) => bankById.get(id)!.step);
    for (let i = 1; i < firstTenSteps.length; i++) {
      assert.ok(
        firstTenSteps[i] >= firstTenSteps[i - 1],
        `Expected non-decreasing steps in first 10 rounds, got ${firstTenSteps.join(",")}`,
      );
    }
    assert.ok(
      firstTenSteps[9] > firstTenSteps[0],
      `Expected round 10 step (${firstTenSteps[9]}) > round 1 step (${firstTenSteps[0]})`,
    );
  });

  it("FR-3.2: classroom mode (default) protects hearts for all accurate answers, penalizes wrong answers, and completes after 10 rounds", () => {
    let now = 1700000000000;
    const match = createTestMatch(now, "classroom", 200);

    const lobbyView = publicState(match, "p1");
    assert.equal(lobbyView.canStart, true);
    assert.equal(lobbyView.isHost, true);
    assert.equal(lobbyView.mode, "classroom");
    assert.equal(lobbyView.maxPlayers, 35);
    assert.equal(lobbyView.totalRounds, 10);

    match.round = 0;
    beginRound(match, now);

    // Emulate all 10 rounds of a Classroom match where p1 is fastest accurate, p2 is slower accurate, and p3 misses Round 1
    for (let r = 0; r < CLASSROOM_MATCH_ROUNDS; r++) {
      const q = bankById.get(match.questionIds[match.round])!;
      match.answers.p1 = {
        value: q.answer,
        correct: true,
        answeredAt: now + 1200,
        elapsedMs: 1200,
      };
      match.answers.p2 = {
        value: q.answer,
        correct: true,
        answeredAt: now + 4500,
        elapsedMs: 4500,
      };
      match.answers.p3 = {
        value: r === 0 ? 999999 : q.answer,
        correct: r !== 0,
        answeredAt: now + 3000,
        elapsedMs: 3000,
      };

      advance(match, now + 4500);

      if (r === 0) {
        assert.equal(match.players[0].lives, 3);
        assert.equal(match.players[1].lives, 3);
        assert.equal(match.players[2].lives, 2);
        assert.deepEqual(match.history[0].lostIds, ["p3"]);
      }

      if (r < CLASSROOM_MATCH_ROUNDS - 1) {
        assert.equal(match.status, "playing");
        now = match.nextAt;
        advance(match, now);
      }
    }

    assert.equal(match.status, "finished");
    assert.equal(match.players[0].lives, 3);
    assert.equal(match.players[1].lives, 3);
    assert.equal(match.players[2].lives, 2);
    assert.ok(match.players[0].score > match.players[1].score);
    assert.equal(match.winnerId, "p1");
  });

  it("FR-3.2: showdown mode runs classic sudden-death elimination where only fastest correct keeps a heart", () => {
    const now = 1700000000000;
    const match = createTestMatch(now, "showdown", 4);
    match.players = match.players.slice(0, 2);

    match.round = 0;
    beginRound(match, now);

    const currentQuestion = bankById.get(match.questionIds[0])!;
    match.answers.p1 = {
      value: currentQuestion.answer,
      correct: true,
      answeredAt: now + 1500,
      elapsedMs: 1500,
    };
    match.answers.p2 = {
      value: currentQuestion.answer,
      correct: true,
      answeredAt: now + 3200,
      elapsedMs: 3200,
    };

    advance(match, now + 3200);
    assert.equal(match.players[0].lives, 3);
    assert.equal(match.players[1].lives, 2);
    assert.ok(match.players[0].score > 100);
    assert.equal(match.players[1].score, 40);
    assert.equal(match.history.length, 1);
    assert.equal(match.history[0].safeId, "p1");
    assert.equal(match.nextAt, now + 3200 + 3600);

    // Advance past inter-round pause to start Round 2
    advance(match, match.nextAt);
    assert.equal(match.round, 1);
    assert.ok(match.roundStartedAt > 0);

    // Simulate p2 losing last life to finish the match
    match.players[1].lives = 1;
    const round2Question = bankById.get(match.questionIds[1])!;
    match.answers.p1 = {
      value: round2Question.answer,
      correct: true,
      answeredAt: match.roundStartedAt + 1000,
      elapsedMs: 1000,
    };
    settle(match, match.roundStartedAt + 2000);
    assert.equal(match.status, "finished");
    assert.equal(match.winnerId, "p1");
  });

  it("cycles through all 50 celebration variants without repeating", () => {
    assert.equal(celebrations.length, 50);
    const ids = new Set(Array.from({ length: 50 }, (_, i) => celebrationFor(i + 1).id));
    assert.equal(ids.size, 50);
  });
});


it("includes given diagrams without leaking live-question answers or explanations", () => {
  const match = createTestMatch();
  match.topicId = "coordinates";
  match.questionIds = buildMatchQuestionOrder("coordinates");
  match.round = 0;
  beginRound(match);
  const room = publicState(match, "p1");
  assert.ok(room.question?.diagram);
  assert.ok(!("answer" in room.question));
  assert.ok(!("explanation" in room.question));
  assert.ok(!("workedSteps" in room.question));
});
