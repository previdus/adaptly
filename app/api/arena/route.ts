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
    await env
      .DB!.prepare(
        "CREATE TABLE IF NOT EXISTS multiply_arena_signals (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, from_player TEXT NOT NULL, to_player TEXT NOT NULL, payload TEXT NOT NULL, created_at INTEGER NOT NULL)",
      )
      .run();
    await env
      .DB!.prepare(
        "CREATE INDEX IF NOT EXISTS multiply_arena_signal_poll ON multiply_arena_signals(code, to_player, id)",
      )
      .run();
    await env
      .DB!.prepare(
        "CREATE TABLE IF NOT EXISTS multiply_arena_media (code TEXT NOT NULL, player_id TEXT NOT NULL, session_id TEXT NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY(code, player_id))",
      )
      .run();
    await env
      .DB!.prepare(
        "CREATE INDEX IF NOT EXISTS multiply_arena_media_alive ON multiply_arena_media(code, last_seen)",
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
    .first<{
      id: string;
      code: string;
      state: string;
      version: number;
      expires: number;
    }>();
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
      return {
        error: "This player link has expired. Rejoin with the room code.",
      };
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

    if (url.searchParams.get("rooms") === "1") {
      const topic = url.searchParams.get("topic");
      if (!topics.some((t) => t.id === topic)) {
        return json({ error: "Choose a topic first." }, 400);
      }
      await ready();
      const rows = await env
        .DB!.prepare(
          "SELECT state FROM multiply_arena_matches WHERE expires > ? ORDER BY expires DESC LIMIT 100",
        )
        .bind(Date.now())
        .all<{ state: string }>();
      const rooms = (rows.results || [])
        .map((row) => JSON.parse(row.state) as ArenaMatch)
        .filter(
          (m) =>
            m.status === "lobby" &&
            (m.topicId || "multiply") === topic &&
            m.players.length > 0 &&
            m.players.length < MAX_ARENA_PLAYERS &&
            m.createdAt > Date.now() - 2 * 60 * 60 * 1000,
        )
        .map((m) => ({
          code: m.code,
          players: m.players.length,
          capacity: MAX_ARENA_PLAYERS,
        }));
      return json({ rooms });
    }

    if (!ROOM_CODE_REGEX.test(code) || !token) {
      return json({ error: "Enter a room code and join first." }, 400);
    }

    if (url.searchParams.get("signals") === "1") {
      await ready();
      const row = await current(code);
      if (!row) {
        return json(
          { error: "Room not found. Check the code and try again." },
          404,
        );
      }
      const match = JSON.parse(row.state) as ArenaMatch;
      const tokenHash = await hash(token);
      const player = match.players.find((p) => p.tokenHash === tokenHash);
      if (!player) {
        return json(
          { error: "This player link has expired. Rejoin with the room code." },
          404,
        );
      }
      const sessionId = url.searchParams.get("sessionId") || "";
      const media = await env
        .DB!.prepare(
          "SELECT session_id FROM multiply_arena_media WHERE code = ? AND player_id = ? AND session_id = ? AND last_seen > ?",
        )
        .bind(code, player.id, sessionId, Date.now() - 25_000)
        .first<{ session_id: string }>();
      if (!media) {
        return json(
          { error: "Reconnect your camera and mic to rejoin the call." },
          409,
        );
      }
      const since = Math.max(0, Number(url.searchParams.get("since")) || 0);
      const signals = await env
        .DB!.prepare(
          "SELECT id, from_player, payload FROM multiply_arena_signals WHERE code = ? AND to_player = ? AND id > ? AND created_at > ? ORDER BY id LIMIT 100",
        )
        .bind(code, player.id, since, Date.now() - 5 * 60_000)
        .all<{ id: number; from_player: string; payload: string }>();
      const participants = await env
        .DB!.prepare(
          "SELECT player_id, session_id FROM multiply_arena_media WHERE code = ? AND last_seen > ?",
        )
        .bind(code, Date.now() - 25_000)
        .all<{ player_id: string; session_id: string }>();
      return json({
        signals: (signals.results || []).map((s) => ({
          id: s.id,
          fromPlayer: s.from_player,
          payload: JSON.parse(s.payload) as unknown,
        })),
        participants: (participants.results || []).map((p) => ({
          playerId: p.player_id,
          sessionId: p.session_id,
        })),
      });
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
    return json(
      { error: "The arena is taking a tiny breather. Try again." },
      503,
    );
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
    const actionName = String(body.action || "");

    if (["media-join", "media-ping", "media-leave"].includes(actionName)) {
      const code = String(body.code || "").trim().toUpperCase();
      const token = String(body.token || "");
      const sessionId = String(body.sessionId || "");
      if (
        !ROOM_CODE_REGEX.test(code) ||
        token.length < 20 ||
        !/^[-a-f0-9]{36}$/i.test(sessionId)
      ) {
        return json(
          { error: "Reconnect to the game before joining video chat." },
          400,
        );
      }
      const row = await current(code);
      if (!row) {
        return json(
          { error: "Room not found. Check the code and try again." },
          404,
        );
      }
      const match = JSON.parse(row.state) as ArenaMatch;
      const tokenHash = await hash(token);
      const player = match.players.find((p) => p.tokenHash === tokenHash);
      if (!player) {
        return json(
          { error: "This player link has expired. Rejoin with the room code." },
          404,
        );
      }
      if (match.status === "finished" && actionName !== "media-leave") {
        return json({ error: "This game room has ended." }, 409);
      }
      if (actionName === "media-join") {
        await env
          .DB!.prepare(
            "DELETE FROM multiply_arena_media WHERE code = ? AND last_seen < ?",
          )
          .bind(code, now - 25_000)
          .run();
        const existing = await env
          .DB!.prepare(
            "SELECT session_id FROM multiply_arena_media WHERE code = ? AND player_id = ?",
          )
          .bind(code, player.id)
          .first<{ session_id: string }>();
        if (existing && existing.session_id !== sessionId) {
          return json(
            {
              error:
                "This player already has a video chat open on another device.",
            },
            409,
          );
        }
        const count = await env
          .DB!.prepare(
            "SELECT COUNT(*) AS count FROM multiply_arena_media WHERE code = ? AND last_seen > ?",
          )
          .bind(code, now - 25_000)
          .first<{ count: number }>();
        if (!existing && Number(count?.count || 0) >= 4) {
          return json(
            {
              error:
                "This game has four video spots. You can still race and cheer with your avatar.",
            },
            409,
          );
        }
        await env
          .DB!.prepare(
            "INSERT INTO multiply_arena_media(code, player_id, session_id, last_seen) VALUES(?, ?, ?, ?) ON CONFLICT(code, player_id) DO UPDATE SET session_id = excluded.session_id, last_seen = excluded.last_seen",
          )
          .bind(code, player.id, sessionId, now)
          .run();
        return json({ ok: true });
      }
      if (actionName === "media-ping") {
        const saved = await env
          .DB!.prepare(
            "UPDATE multiply_arena_media SET last_seen = ? WHERE code = ? AND player_id = ? AND session_id = ?",
          )
          .bind(now, code, player.id, sessionId)
          .run();
        if (saved.meta?.changes !== 1) {
          return json(
            { error: "Your video chat spot has expired. Please rejoin." },
            409,
          );
        }
        return json({ ok: true });
      }
      await env
        .DB!.prepare(
          "DELETE FROM multiply_arena_media WHERE code = ? AND player_id = ? AND session_id = ?",
        )
        .bind(code, player.id, sessionId)
        .run();
      await env
        .DB!.prepare(
          "DELETE FROM multiply_arena_signals WHERE code = ? AND (from_player = ? OR to_player = ?)",
        )
        .bind(code, player.id, player.id)
        .run();
      return json({ ok: true });
    }

    if (actionName === "signal") {
      const code = String(body.code || "").trim().toUpperCase();
      const token = String(body.token || "");
      const target = String(body.target || "");
      const payload = body.payload as
        | {
            type?: string;
            fromSession?: string;
            toSession?: string;
          }
        | undefined;
      if (
        !ROOM_CODE_REGEX.test(code) ||
        token.length < 20 ||
        !target ||
        !["hello", "offer", "answer", "ice", "bye", "media"].includes(
          String(payload?.type || ""),
        ) ||
        !/^[-a-f0-9]{36}$/i.test(String(payload?.fromSession || "")) ||
        !/^[-a-f0-9]{36}$/i.test(String(payload?.toSession || "")) ||
        JSON.stringify(payload).length > 16000
      ) {
        return json({ error: "This video-chat signal is not valid." }, 400);
      }
      const row = await current(code);
      if (!row) {
        return json(
          { error: "Room not found. Check the code and try again." },
          404,
        );
      }
      const match = JSON.parse(row.state) as ArenaMatch;
      const tokenHash = await hash(token);
      const sender = match.players.find((p) => p.tokenHash === tokenHash);
      if (
        !sender ||
        !match.players.some((p) => p.id === target && p.id !== sender.id)
      ) {
        return json(
          { error: "You can only call someone in this game room." },
          403,
        );
      }
      if (match.status === "finished") {
        return json({ error: "This game room has ended." }, 409);
      }
      const [sourceSession, targetSession] = await Promise.all([
        env
          .DB!.prepare(
            "SELECT session_id FROM multiply_arena_media WHERE code = ? AND player_id = ? AND session_id = ? AND last_seen > ?",
          )
          .bind(code, sender.id, String(payload?.fromSession || ""), now - 25_000)
          .first<{ session_id: string }>(),
        env
          .DB!.prepare(
            "SELECT session_id FROM multiply_arena_media WHERE code = ? AND player_id = ? AND session_id = ? AND last_seen > ?",
          )
          .bind(code, target, String(payload?.toSession || ""), now - 25_000)
          .first<{ session_id: string }>(),
      ]);
      if (!sourceSession || !targetSession) {
        return json(
          { error: "That player is no longer in video chat." },
          409,
        );
      }
      await env
        .DB!.prepare(
          "DELETE FROM multiply_arena_signals WHERE created_at < ?",
        )
        .bind(now - 5 * 60_000)
        .run();
      await env
        .DB!.prepare(
          "INSERT INTO multiply_arena_signals(code, from_player, to_player, payload, created_at) VALUES(?, ?, ?, ?, ?)",
        )
        .bind(code, sender.id, target, JSON.stringify(payload), now)
        .run();
      return json({ ok: true });
    }

    if (actionName === "create") {
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

    if (actionName === "join") {
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
        return json(
          { error: "Room not found. Check the code and try again." },
          404,
        );
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

      if (actionName === "mode") {
        if (match.hostId !== playerId || match.status !== "lobby") {
          return {
            changed: false,
            error: "Only the room host can change rules in the lobby.",
          };
        }
        match.mode = body.mode === "showdown" ? "showdown" : "classroom";
        return { changed: true };
      }

      if (actionName === "start") {
        if (match.hostId !== playerId) {
          return {
            changed: false,
            error: "Only the room host can start the match.",
          };
        }
        if (match.status !== "lobby" || match.players.length < 2) {
          return {
            changed: false,
            error: "Invite at least one more player first.",
          };
        }
        match.round = 0;
        beginRound(match, timestamp);
        return { changed: true };
      }

      if (actionName === "answer") {
        if (
          match.status !== "playing" ||
          player.lives <= 0 ||
          match.roundStartedAt <= 0
        ) {
          return {
            changed: false,
            error: "This round is not accepting answers now.",
          };
        }
        if (match.answers[playerId]) {
          return {
            changed: false,
            error: "Your answer is already locked in.",
          };
        }
        const question = bankById.get(match.questionIds[match.round]);
        if (!question) {
          return { changed: false, error: "Question not found." };
        }
        let value: number | string;
        let correct: boolean;
        if (question.options) {
          if (
            typeof body.value !== "string" ||
            !question.options.includes(body.value)
          ) {
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

      if (actionName === "leave") {
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
