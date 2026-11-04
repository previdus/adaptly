import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advance,
  bankById,
  beginRound,
  buildMatchQuestionOrder,
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
): ArenaMatch {
  const questionIds = buildMatchQuestionOrder("multiply").slice(0, 4);
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
    for (let i = 0; i < 200; i++) {
      const code = newCode();
      assert.match(code, ROOM_CODE_REGEX);
    }
  });

  it("FR-3.2: classroom mode (default) protects hearts for all accurate answers and only penalizes wrong or missing answers", () => {
    const now = 1700000000000;
    const match = createTestMatch(now, "classroom");

    const lobbyView = publicState(match, "p1");
    assert.equal(lobbyView.canStart, true);
    assert.equal(lobbyView.isHost, true);
    assert.equal(lobbyView.mode, "classroom");
    assert.equal(lobbyView.maxPlayers, 35);

    match.round = 0;
    beginRound(match, now);
    assert.equal(match.status, "playing");

    const currentQuestion = bankById.get(match.questionIds[0])!;
    // p1 answers fastest and accurately
    match.answers.p1 = {
      value: currentQuestion.answer,
      correct: true,
      answeredAt: now + 1200,
      elapsedMs: 1200,
    };
    // p2 answers slower (4.5s) but accurately
    match.answers.p2 = {
      value: currentQuestion.answer,
      correct: true,
      answeredAt: now + 4500,
      elapsedMs: 4500,
    };
    // p3 answers inaccurately
    match.answers.p3 = {
      value: 999999,
      correct: false,
      answeredAt: now + 3000,
      elapsedMs: 3000,
    };

    advance(match, now + 4500);

    // Both p1 and p2 keep all 3 hearts in classroom mode!
    assert.equal(match.players[0].lives, 3);
    assert.equal(match.players[1].lives, 3);
    // Only p3 (wrong answer) loses a heart
    assert.equal(match.players[2].lives, 2);
    assert.deepEqual(match.history[0].lostIds, ["p3"]);
    assert.equal(match.history[0].safeId, "p1");
    assert.equal(match.history[0].correctCount, 2);
    // Fastest correct player earns a higher score than slower correct player, and both earn > 100
    assert.ok(match.players[0].score > match.players[1].score);
    assert.ok(match.players[1].score >= 100);
  });

  it("FR-3.2: showdown mode runs classic sudden-death elimination where only fastest correct keeps a heart", () => {
    const now = 1700000000000;
    const match = createTestMatch(now, "showdown");
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
