import { env } from "cloudflare:workers";
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
  type ArenaMode,
} from "../../../lib/arena-engine";
import { topics, type TopicId } from "../../../lib/learning";
import { isSameOriginRequest } from "../../../lib/request-origin";

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

const hash = async (input: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)),
    ),
  )
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

let schemaPromise: Promise<void> | undefined;

function ready(): Promise<void> {
  return (schemaPromise ??= (async () => {
    await env
      .DB!.prepare(
        "CREATE TABLE IF NOT EXISTS multiply_arena_matches (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, state TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, expires INTEGER NOT NULL)",
      )
      .run();
    await env
      .DB!.prepare(
        "CREATE INDEX IF NOT EXISTS multiply_arena_expiry ON multiply_arena_matches(expires)",
      )
      .run();
  })());
}

async function current(code: string) {
  await ready();
  return env
    .DB!.prepare(
      "SELECT id, code, state, version, expires FROM multiply_arena_matches WHERE code = ? AND expires > ?",
    )
    .bind(code, Date.now())
    .first<{ id: string; code: string; state: string; version: number; expires: number }>();
}

async function update(
  code: string,
  token: string,
  fn: (
    match: ArenaMatch,
    playerId: string,
    now: number,
  ) => { changed: boolean; error?: string },
) {
  await ready();
  for (let retry = 0; retry < 20; retry++) {
    const row = await current(code);
    if (!row) {
      return { error: "Room not found. Check the code and try again." };
    }
    const match = JSON.parse(row.state) as ArenaMatch;
    const tokenHash = await hash(token);
    const player = match.players.find((item) => item.tokenHash === tokenHash);
    if (!player) {
      return { error: "This player link has expired. Rejoin with the room code." };
    }
    const outcome = fn(match, player.id, Date.now());
    if (outcome.error) {
      return { error: outcome.error };
    }
    if (!outcome.changed) {
      return { state: match, playerId: player.id };
    }
    const saved = await env
      .DB!.prepare(
        "UPDATE multiply_arena_matches SET state = ?, version = version + 1 WHERE id = ? AND version = ?",
      )
      .bind(JSON.stringify(match), row.id, row.version)
      .run();
    if (saved.meta?.changes === 1) {
      return { state: match, playerId: player.id };
    }
  }
  return { error: "The room is busy. Please try again." };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = (url.searchParams.get("code") || "").toUpperCase();
    const token = url.searchParams.get("token") || "";
    if (!ROOM_CODE_REGEX.test(code) || !token) {
      return json({ error: "Enter a room code and join first." }, 400);
    }
    const result = await update(code, token, (match) => {
      const before = JSON.stringify(match);
      advance(match, Date.now());
      return { changed: before !== JSON.stringify(match) };
    });
    if (result.error) {
      return json({ error: result.error }, 404);
    }
    return json({ room: publicState(result.state!, result.playerId!) });
  } catch {
    return json({ error: "The arena is taking a tiny breather. Try again." }, 503);
  }
}

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return json({ error: "Request not allowed" }, 403);
    }
    await ready();
    const body = (await req.json()) as Record<string, unknown>;
    const now = Date.now();

    if (body.action === "create") {
      const name = String(body.name || "").trim().slice(0, 20);
      const topic: TopicId = topics.some((item) => item.id === body.topicId)
        ? (body.topicId as TopicId)
        : "multiply";
      if (!name) {
        return json({ error: "Add a player name to make your room." }, 400);
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        const code = newCode();
        const id = crypto.randomUUID();
        const playerId = crypto.randomUUID();
        const token = crypto.randomUUID() + crypto.randomUUID();
        const mode: ArenaMode =
          body.mode === "showdown" ? "showdown" : "classroom";
        const match: ArenaMatch = {
          id,
          code,
          hostId: playerId,
          topicId: topic,
          mode,
          status: "lobby",
          players: [
            {
              id: playerId,
              tokenHash: await hash(token),
              name,
              lives: 3,
              score: 0,
              joinedAt: now,
            },
          ],
          questionIds: buildMatchQuestionOrder(topic),
          round: -1,
          roundStartedAt: 0,
          roundEndsAt: 0,
          nextAt: 0,
          answers: {},
          history: [],
          winnerId: null,
          createdAt: now,
        };
        try {
          await env
            .DB!.prepare(
              "INSERT INTO multiply_arena_matches(id, code, state, version, expires) VALUES(?, ?, ?, 1, ?)",
            )
            .bind(id, code, JSON.stringify(match), now + 12 * 60 * 60 * 1000)
            .run();
          return json({ code, token, room: publicState(match, playerId) });
        } catch {
          // Retry on rare 5-character room code collision.
        }
      }
      return json({ error: "Could not open a room. Try once more." }, 503);
    }

    if (body.action === "join") {
      const code = String(body.code || "").trim().toUpperCase();
      const name = String(body.name || "").trim().slice(0, 20);
      if (!ROOM_CODE_REGEX.test(code) || !name) {
        return json(
          { error: "Enter a valid five-character room code and player name." },
          400,
        );
      }
      const row = await current(code);
      if (!row) {
        return json({ error: "Room not found. Check the code and try again." }, 404);
      }
      const match = JSON.parse(row.state) as ArenaMatch;
      if (match.status !== "lobby") {
        return json({ error: "This match has already started." }, 409);
      }
      if (match.players.length >= MAX_ARENA_PLAYERS) {
        return json(
          {
            error: `This room is full. Start a new room for up to ${MAX_ARENA_PLAYERS} players.`,
          },
          409,
        );
      }
      if (
        match.players.some(
          (player) => player.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return json(
          { error: "That name is already in this room. Add a nickname." },
          409,
        );
      }
      const token = crypto.randomUUID() + crypto.randomUUID();
      const playerId = crypto.randomUUID();
      match.players.push({
        id: playerId,
        tokenHash: await hash(token),
        name,
        lives: 3,
        score: 0,
        joinedAt: now,
      });
      const saved = await env
        .DB!.prepare(
          "UPDATE multiply_arena_matches SET state = ?, version = version + 1 WHERE id = ? AND version = ?",
        )
        .bind(JSON.stringify(match), row.id, row.version)
        .run();
      if (saved.meta?.changes !== 1) {
        return json(
          { error: "Someone joined at the same time. Tap join again." },
          409,
        );
      }
      return json({ token, code, room: publicState(match, playerId) });
    }

    const code = String(body.code || "").toUpperCase();
    const token = String(body.token || "");
    if (!ROOM_CODE_REGEX.test(code) || token.length < 20) {
      return json(
        { error: "The room link is missing. Rejoin with the room code." },
        400,
      );
    }

    const result = await update(code, token, (match, playerId, timestamp) => {
      advance(match, timestamp);
      const player = match.players.find((item) => item.id === playerId)!;

      if (body.action === "mode") {
        if (match.hostId !== playerId || match.status !== "lobby") {
          return {
            changed: false,
            error: "Only the room host can change rules in the lobby.",
          };
        }
        match.mode = body.mode === "showdown" ? "showdown" : "classroom";
        return { changed: true };
      }

      if (body.action === "start") {
        if (match.hostId !== playerId) {
          return { changed: false, error: "Only the room host can start the match." };
        }
        if (match.status !== "lobby" || match.players.length < 2) {
          return { changed: false, error: "Invite at least one more player first." };
        }
        match.round = 0;
        beginRound(match, timestamp);
        return { changed: true };
      }

      if (body.action === "answer") {
        if (match.status !== "playing" || player.lives <= 0 || match.roundStartedAt <= 0) {
          return { changed: false, error: "This round is not accepting answers now." };
        }
        if (match.answers[playerId]) {
          return { changed: false, error: "Your answer is already locked in." };
        }
        const question = bankById.get(match.questionIds[match.round]);
        if (!question) {
          return { changed: false, error: "Question not found." };
        }
        let value: number | string;
        let correct: boolean;
        if (question.options) {
          if (typeof body.value !== "string" || !question.options.includes(body.value)) {
            return { changed: false, error: "Choose one of the answers." };
          }
          value = body.value;
          correct = value === question.answer;
        } else {
          value = Number(body.value);
          if (!Number.isSafeInteger(value) || value < 0 || value > 100000000) {
            return { changed: false, error: "Enter a whole-number answer." };
          }
          correct = value === question.answer;
        }
        const elapsedMs = Math.max(0, timestamp - match.roundStartedAt);
        match.answers[playerId] = {
          value,
          correct,
          answeredAt: timestamp,
          elapsedMs,
        };
        if (
          match.players
            .filter((item) => item.lives > 0)
            .every((item) => Boolean(match.answers[item.id]))
        ) {
          settle(match, timestamp);
        }
        return { changed: true };
      }

      if (body.action === "leave") {
        if (match.status === "lobby") {
          match.players = match.players.filter((item) => item.id !== playerId);
          if (match.hostId === playerId && match.players[0]) {
            match.hostId = match.players[0].id;
          }
        } else if (match.status === "playing" && player.lives > 0) {
          player.lives = 0;
          const alive = match.players.filter((item) => item.lives > 0);
          if (alive.length <= 1) {
            match.status = "finished";
            match.winnerId = alive[0]?.id ?? null;
          }
        }
        return { changed: true };
      }

      return { changed: false, error: "Action not available." };
    });

    if (result.error) {
      return json({ error: result.error }, 409);
    }
    return json({ room: publicState(result.state!, result.playerId!) });
  } catch {
    return json(
      { error: "We could not update this arena. Please try again." },
      503,
    );
  }
}
