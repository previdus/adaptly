import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advance,
  bankById,
  beginRound,
  buildMatchQuestionOrder,
  newCode,
  publicState,
  ROOM_CODE_REGEX,
  settle,
  type ArenaMatch,
} from "../lib/arena-engine";
import { celebrationFor, celebrations } from "../lib/celebrations";

function createTestMatch(now = 1700000000000): ArenaMatch {
  const questionIds = buildMatchQuestionOrder("multiply").slice(0, 4);
  return {
    id: "match-1",
    code: "AB23C",
    hostId: "p1",
    topicId: "multiply",
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
  it("FR-3.1: generates valid 5-character room codes without ambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      const code = newCode();
      assert.match(code, ROOM_CODE_REGEX);
    }
  });

  it("FR-3.2: runs match lifecycle from lobby to active rounds, settlement, and elimination finish", () => {
    const now = 1700000000000;
    const match = createTestMatch(now);

    const lobbyView = publicState(match, "p1");
    assert.equal(lobbyView.canStart, true);
    assert.equal(lobbyView.isHost, true);
    assert.equal(lobbyView.question, null);

    match.round = 0;
    beginRound(match, now);
    assert.equal(match.status, "playing");
    assert.ok(match.roundEndsAt > now);

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
    assert.equal(match.history.length, 1);
    assert.equal(match.history[0].safeId, "p1");
    assert.equal(match.nextAt, now + 3200 + 3600);

    // Advance past inter-round pause to start Round 2
    advance(match, match.nextAt);
    assert.equal(match.round, 1);
    assert.ok(match.roundStartedAt > 0);

    // Simulate p2 losing remaining 2 lives to finish the match
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
