import { env } from "cloudflare:workers";
import { isSameOriginRequest } from "../../../lib/request-origin";
import { readSavedState } from "../../../lib/state-repair";

const response = (data: unknown, status = 200, cookie?: string) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
  });

const hash = async (input: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)),
    ),
  )
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

async function passwordHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function family(req: Request) {
  const token = req.headers.get("cookie")?.match(/mq_session=([^;]+)/)?.[1];
  if (!token) {
    return null;
  }
  return env
    .DB!.prepare("SELECT * FROM families WHERE session = ? AND expires > ?")
    .bind(await hash(token), Date.now())
    .first<Record<string, unknown>>();
}

async function pilot(req: Request) {
  const token = req.headers.get("cookie")?.match(/adaptly_pilot=([^;]+)/)?.[1];
  if (!token) {
    return null;
  }
  return env
    .DB!.prepare(
      "SELECT p.* FROM pilot_profiles p JOIN pilot_sessions s ON p.id = s.profile_id WHERE s.token = ? AND s.expires > ?",
    )
    .bind(await hash(token), Date.now())
    .first<Record<string, unknown>>();
}

export async function GET(req: Request) {
  try {
    const pilotRecord = await pilot(req);
    const activeRecord = pilotRecord ?? (await family(req));
    if (!activeRecord) {
      return response({ state: null });
    }
    const saved = readSavedState(String(activeRecord.state));
    if (saved.repaired) {
      const table = pilotRecord ? "pilot_profiles" : "families";
      await env
        .DB!.prepare(`UPDATE ${table} SET state = ? WHERE id = ?`)
        .bind(JSON.stringify(saved.state), activeRecord.id)
        .run();
    }
    return response({
      state: saved.state,
      email: activeRecord.email,
      pilot: Boolean(pilotRecord),
    });
  } catch {
    return response(
      { error: "Your saved adventure is temporarily unavailable. Please try again." },
      503,
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return response({ error: "Request not allowed" }, 403);
    }
    const body = (await req.json()) as Record<string, unknown>;

    if (body.action === "identify") {
      const email = String(body.email || "").trim().toLowerCase();
      const name = String(body.name || "").trim().slice(0, 40);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !name) {
        return response(
          { error: "Enter an email and the learner’s name or nickname." },
          400,
        );
      }
      const id = crypto.randomUUID();
      const legacy = await family(req);
      const initial =
        legacy?.email === email
          ? JSON.parse(String(legacy.state))
          : { students: [{ id: crypto.randomUUID(), name, attempts: [] }], active: 0 };

      await env
        .DB!.prepare(
          "INSERT INTO pilot_profiles(id, email, state) VALUES(?, ?, ?) ON CONFLICT(email) DO NOTHING",
        )
        .bind(id, email, JSON.stringify(initial))
        .run();

      const profile = await env
        .DB!.prepare("SELECT * FROM pilot_profiles WHERE email = ?")
        .bind(email)
        .first<Record<string, unknown>>();
      const saved = readSavedState(String(profile!.state));
      const state = saved.state;
      let active = state.students.findIndex(
        (student) => student.name.trim().toLowerCase() === name.toLowerCase(),
      );
      if (active < 0) {
        if (state.students.length >= 10) {
          return response(
            {
              error:
                "This pilot email already has 10 learner profiles. Use an existing learner name.",
            },
            400,
          );
        }
        active = state.students.length;
        state.students.push({ id: crypto.randomUUID(), name, attempts: [] });
      }
      state.active = active;
      await env
        .DB!.prepare("UPDATE pilot_profiles SET state = ? WHERE id = ?")
        .bind(JSON.stringify(state), profile!.id)
        .run();

      const token = crypto.randomUUID() + crypto.randomUUID();
      await env
        .DB!.prepare(
          "INSERT INTO pilot_sessions(token, profile_id, expires) VALUES(?, ?, ?)",
        )
        .bind(await hash(token), profile!.id, Date.now() + 90 * 86400000)
        .run();

      return response(
        { state, email, pilot: true },
        200,
        `adaptly_pilot=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7776000`,
      );
    }

    if (body.action === "logout") {
      const pilotRecord = await pilot(req);
      if (pilotRecord) {
        const token = req.headers.get("cookie")?.match(/adaptly_pilot=([^;]+)/)?.[1];
        await env
          .DB!.prepare("DELETE FROM pilot_sessions WHERE token = ?")
          .bind(await hash(token!))
          .run();
        return response(
          { ok: true },
          200,
          "adaptly_pilot=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
        );
      }
    }

    if (body.action === "save") {
      const pilotRecord = await pilot(req);
      if (pilotRecord) {
        const candidateState = body.state as { students?: unknown[] } | undefined;
        if (
          JSON.stringify(body.state).length > 800000 ||
          !Array.isArray(candidateState?.students) ||
          candidateState.students.length > 10
        ) {
          return response({ error: "Invalid progress data" }, 400);
        }
        await env
          .DB!.prepare("UPDATE pilot_profiles SET state = ? WHERE id = ?")
          .bind(JSON.stringify(body.state), pilotRecord.id)
          .run();
        return response({ ok: true });
      }
    }

    if (body.action === "logout") {
      const familyRecord = await family(req);
      if (familyRecord) {
        await env
          .DB!.prepare("UPDATE families SET session = NULL, expires = NULL WHERE id = ?")
          .bind(familyRecord.id)
          .run();
      }
      return response(
        { ok: true },
        200,
        "mq_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      );
    }

    if (body.action === "save") {
      const familyRecord = await family(req);
      if (!familyRecord) {
        return response({ error: "Please sign in again to save." }, 401);
      }
      const candidateState = body.state as { students?: unknown[] } | undefined;
      if (
        JSON.stringify(body.state).length > 800000 ||
        !Array.isArray(candidateState?.students) ||
        candidateState.students.length > 10
      ) {
        return response({ error: "Invalid progress data" }, 400);
      }
      await env
        .DB!.prepare("UPDATE families SET state = ? WHERE id = ?")
        .bind(JSON.stringify(body.state), familyRecord.id)
        .run();
      return response({ ok: true });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      password.length < 10 ||
      password.length > 128
    ) {
      return response(
        { error: "Use a valid parent email and a password of 10–128 characters." },
        400,
      );
    }

    const bucket = Math.floor(Date.now() / 900000);
    const limitId = await hash(`${email}:${bucket}`);
    await env
      .DB!.prepare(
        "INSERT INTO login_limits(id, count, bucket) VALUES(?, 1, ?) ON CONFLICT(id) DO UPDATE SET count = count + 1",
      )
      .bind(limitId, bucket)
      .run();
    const limit = await env
      .DB!.prepare("SELECT count FROM login_limits WHERE id = ?")
      .bind(limitId)
      .first<{ count: number }>();
    if (limit && limit.count > 12) {
      return response(
        { error: "Too many sign-in attempts. Please wait 15 minutes and try again." },
        429,
      );
    }
    await env
      .DB!.prepare("DELETE FROM login_limits WHERE bucket < ?")
      .bind(bucket - 4)
      .run();

    let familyRecord = await env
      .DB!.prepare("SELECT * FROM families WHERE email = ?")
      .bind(email)
      .first<Record<string, unknown>>();

    if (body.action === "signup") {
      if (familyRecord) {
        return response({ error: "An account already exists. Please sign in." }, 409);
      }
      const name = String(body.name || "").trim().slice(0, 40);
      if (!name) {
        return response({ error: "Enter your learner’s first name." }, 400);
      }
      const salt = crypto.randomUUID();
      const state = {
        students: [{ id: crypto.randomUUID(), name, attempts: [] }],
        active: 0,
      };
      await env
        .DB!.prepare(
          "INSERT INTO families(id, email, salt, password, state) VALUES(?, ?, ?, ?, ?)",
        )
        .bind(
          crypto.randomUUID(),
          email,
          salt,
          await passwordHash(password, salt),
          JSON.stringify(state),
        )
        .run();
      familyRecord = await env
        .DB!.prepare("SELECT * FROM families WHERE email = ?")
        .bind(email)
        .first<Record<string, unknown>>();
    } else if (
      body.action !== "login" ||
      !familyRecord ||
      (await passwordHash(password, String(familyRecord.salt))) !== familyRecord.password
    ) {
      return response({ error: "Email or password is incorrect." }, 401);
    }

    if (!familyRecord) {
      return response({ error: "Email or password is incorrect." }, 401);
    }

    const token = crypto.randomUUID() + crypto.randomUUID();
    await env
      .DB!.prepare("UPDATE families SET session = ?, expires = ? WHERE id = ?")
      .bind(await hash(token), Date.now() + 30 * 86400000, familyRecord.id)
      .run();

    return response(
      { state: JSON.parse(String(familyRecord.state)), email },
      200,
      `mq_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
    );
  } catch {
    return response(
      { error: "We could not save or load your account. Please try again." },
      503,
    );
  }
}
