import assert from "node:assert/strict";
import { bankById } from "../lib/arena-engine.ts";

const BASE_URL = (
  process.env.ADAPTLY_URL || "https://d2iq2gh9eiddgi.cloudfront.net"
).replace(/\/$/, "");

const PLAYWRIGHT_CANDIDATES = [
  "playwright",
  "/Users/yamijala/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs",
];

async function loadPlaywright() {
  for (const spec of PLAYWRIGHT_CANDIDATES) {
    try {
      return await import(spec);
    } catch {
      // Try next candidate
    }
  }
  throw new Error("Playwright package not found.");
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE_URL,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `POST ${path} failed (${res.status}): ${JSON.stringify(data)}`,
    );
  }
  return data;
}

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Origin: BASE_URL },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `GET ${path} failed (${res.status}): ${JSON.stringify(data)}`,
    );
  }
  return data;
}

function answerForQuestion(q) {
  const fromBank = bankById.get(q.id);
  if (fromBank) {
    return String(fromBank.answer);
  }
  throw new Error(`Unknown arena question id: ${q.id} (${q.prompt})`);
}

async function waitNextRoundOrFinish(code, token) {
  for (let poll = 0; poll < 20; poll++) {
    const state = (
      await apiGet(
        `/api/arena?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`,
      )
    ).room;
    if (state.status === "finished" || state.question) {
      return state;
    }
    const waitMs =
      state.nextAt > Date.now()
        ? Math.min(4000, Math.max(150, state.nextAt - Date.now() + 150))
        : 300;
    await new Promise((r) => setTimeout(r, waitMs));
  }
  throw new Error(`Timed out waiting for next round in room ${code}`);
}

async function testClassroomMultiplayerMatchHttp() {
  console.log("1. [HTTP Multiplayer] Emulating 3-player Fair Classroom match (10 rounds)...");
  const host = await apiPost("/api/arena", {
    action: "create",
    name: "Ava",
    topicId: "multiply",
    mode: "classroom",
  });
  const code = host.code;
  assert.match(code, /^[A-HJ-NP-Z2-9]{5}$/);
  assert.equal(host.room.mode, "classroom");
  assert.equal(host.room.maxPlayers, 35);
  assert.equal(host.room.totalRounds, 10);

  const leo = await apiPost("/api/arena", {
    action: "join",
    code,
    name: "Leo",
  });
  const mila = await apiPost("/api/arena", {
    action: "join",
    code,
    name: "Mila",
  });
  assert.equal(mila.room.players.length, 3);

  let state = (
    await apiPost("/api/arena", {
      action: "start",
      code,
      token: host.token,
    })
  ).room;
  assert.equal(state.status, "playing");
  assert.equal(state.round, 1);

  for (let round = 1; round <= 10; round++) {
    const q = state.question;
    assert.ok(q, `Expected active question for round ${round}`);
    const correctAns = answerForQuestion(q);
    const wrongAns = correctAns === "99999" ? "88888" : "99999";

    await apiPost("/api/arena", {
      action: "answer",
      code,
      token: host.token,
      value: correctAns,
    });
    await apiPost("/api/arena", {
      action: "answer",
      code,
      token: leo.token,
      value: correctAns,
    });

    const milaPlayer = state.players.find((p) => p.name === "Mila");
    if (milaPlayer?.active) {
      await apiPost("/api/arena", {
        action: "answer",
        code,
        token: mila.token,
        value: round <= 2 ? wrongAns : correctAns,
      });
    }

    // Wait for intermission window (3.6s) to advance to the next round or finish
    state = await waitNextRoundOrFinish(code, host.token);

    if (round === 1) {
      const avaAfterR1 = state.players.find((p) => p.name === "Ava");
      const leoAfterR1 = state.players.find((p) => p.name === "Leo");
      const milaAfterR1 = state.players.find((p) => p.name === "Mila");
      assert.equal(avaAfterR1.lives, 3, "Fastest accurate player keeps 3 hearts");
      assert.ok(
        avaAfterR1.score >= 150,
        `Fastest accurate player gets >=150 (+100 accuracy + 50 leader + speedBonus), got ${avaAfterR1.score}`,
      );
      assert.equal(
        leoAfterR1.lives,
        3,
        "Second accurate player ALSO keeps 3 hearts in classroom mode",
      );
      assert.ok(
        leoAfterR1.score >= 100,
        `Second accurate player gets >=100 (+100 accuracy + speedBonus), got ${leoAfterR1.score}`,
      );
      assert.ok(
        avaAfterR1.score > leoAfterR1.score,
        "Fastest accurate player leads score",
      );
      assert.equal(milaAfterR1.lives, 2, "Wrong answer loses 1 heart");
    }
  }

  assert.equal(state.status, "finished", "Classroom match finishes after 10 rounds");
  const finalAva = state.players.find((p) => p.name === "Ava");
  const finalLeo = state.players.find((p) => p.name === "Leo");
  assert.equal(finalAva.lives, 3);
  assert.equal(finalLeo.lives, 3);
  assert.ok(state.winnerId, "Classroom match crowns a winner");
  console.log(
    `   PASS: Room ${code} completed all 10 rounds. Scores: Ava=${finalAva.score}, Leo=${finalLeo.score}`,
  );
}

async function testShowdownMultiplayerMatchHttp() {
  console.log("2. [HTTP Multiplayer] Emulating 2-player Sudden-Death Showdown match...");
  const host = await apiPost("/api/arena", {
    action: "create",
    name: "Noah",
    topicId: "addition",
    mode: "showdown",
  });
  const code = host.code;
  assert.equal(host.room.mode, "showdown");
  assert.equal(host.room.totalRounds, 200);

  const zoe = await apiPost("/api/arena", {
    action: "join",
    code,
    name: "Zoe",
  });

  let state = (
    await apiPost("/api/arena", {
      action: "start",
      code,
      token: host.token,
    })
  ).room;

  for (let round = 1; round <= 3; round++) {
    const q = state.question;
    const correctAns = answerForQuestion(q);
    await apiPost("/api/arena", {
      action: "answer",
      code,
      token: host.token,
      value: correctAns,
    });
    await apiPost("/api/arena", {
      action: "answer",
      code,
      token: zoe.token,
      value: correctAns,
    });
    state = await waitNextRoundOrFinish(code, host.token);
  }

  assert.equal(state.status, "finished", "Showdown match ends when opponent loses 3 hearts");
  const noahPlayer = state.players.find((p) => p.name === "Noah");
  const zoePlayer = state.players.find((p) => p.name === "Zoe");
  assert.equal(noahPlayer.lives, 3);
  assert.equal(zoePlayer.lives, 0);
  assert.equal(state.winnerId, noahPlayer.id);
  console.log(`   PASS: Room ${code} crowned Noah (${noahPlayer.score} pts) after 3 sudden-death rounds.`);
}

async function testClassroomPilotFamilyHttp() {
  console.log("3. [HTTP Classroom Pilot] Emulating multi-student classroom section on /api/family...");
  const pilotEmail = `class5b.${Date.now().toString(36).slice(-5)}@berlin-pilot.edu`;
  const learners = ["Lukas", "Hannah", "Emil"];
  let lastState = null;

  for (const name of learners) {
    const res = await apiPost("/api/family", {
      action: "identify",
      email: pilotEmail,
      name,
    });
    lastState = res.state;
  }

  assert.equal(lastState.students.length, 3);
  console.log(
    `   PASS: Classroom pilot "${pilotEmail}" persisted ${lastState.students.length} learners.`,
  );
}

async function testPlaywrightMultiBrowserSubstance() {
  console.log("4. [Playwright Substance] Launching 2 concurrent Chrome contexts against", BASE_URL);
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    // 4a. Verify Home Arcade, Demo initialization, Parent Report & Classroom View, and Level Up + Hint
    await hostPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await hostPage.waitForSelector("#multiply-quest-title", { timeout: 15000 });

    // Initialize Demo family via Family account button -> Take a peek first — try the demo
    await hostPage.click("button[aria-label='Family account']");
    await hostPage.waitForSelector("button.demolink", { timeout: 10000 });
    await hostPage.click("button.demolink");
    await hostPage.waitForSelector(".demo-banner", { timeout: 10000 });

    // Check Parent Report & Classroom View cohort heatmap
    await hostPage.click("button[aria-label='Parent report']");
    await hostPage.waitForSelector("button:has-text('Classroom View')", {
      timeout: 10000,
    });
    await hostPage.click("button:has-text('Classroom View')");
    await hostPage.waitForSelector("text=Classroom concept mastery heatmap", {
      timeout: 10000,
    });
    await hostPage.waitForSelector("button:has-text('Export classroom CSV')", {
      timeout: 10000,
    });
    console.log(
      "   PASS: Parent Report -> Classroom View cohort heatmap & CSV export verified.",
    );

    // Check Level Up adaptive question + teaching hint
    await hostPage.click("button[aria-label='Adaptly home']");
    await hostPage.waitForSelector("#multiply-quest-title", { timeout: 10000 });
    await hostPage.click("button[aria-label='Play Level Up']");
    await hostPage.waitForSelector(".topic-pick-dialog", { timeout: 10000 });
    await hostPage.click(".topic-pick-dialog button:has-text('Maths')");
    await hostPage.click(".topic-pick-dialog button:has-text('Multiply Quest')");
    await hostPage.waitForSelector("button.play-hint", { timeout: 10000 });
    await hostPage.click("button.play-hint");
    await hostPage.waitForSelector(".play-help", { timeout: 10000 });
    console.log("   PASS: Level Up adaptive workspace & visual hint drawer verified.");

    // Navigate both HostPage and GuestPage to Last Star Standing
    await hostPage.click("button[aria-label='Save and exit quiz']");
    await hostPage.waitForSelector("#multiply-quest-title", { timeout: 10000 });
    await hostPage.click("button[aria-label='Play Last Star Standing']");
    await hostPage.waitForSelector(".topic-pick-dialog", { timeout: 10000 });
    await hostPage.click(".topic-pick-dialog button:has-text('Maths')");
    await hostPage.click(".topic-pick-dialog button:has-text('Multiply Quest')");
    await hostPage.waitForSelector(".arena-entry-card", { timeout: 10000 });

    await guestPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await guestPage.waitForSelector("#multiply-quest-title", { timeout: 15000 });
    await guestPage.click("button[aria-label='Play Last Star Standing']");
    await guestPage.waitForSelector(".topic-pick-dialog", { timeout: 10000 });
    await guestPage.click(".topic-pick-dialog button:has-text('Maths')");
    await guestPage.click(".topic-pick-dialog button:has-text('Multiply Quest')");
    await guestPage.waitForSelector(".arena-entry-card", { timeout: 10000 });

    // Host creates a Fair Classroom room in UI
    await hostPage.waitForSelector(".arena-open-rooms", { timeout: 10000 });
    await hostPage.fill("input[placeholder='Your name']", "Clara");
    await hostPage.selectOption("select[aria-label='Room rule mode']", "classroom");
    await hostPage.click("button:has-text('Create a room')");
    await hostPage.waitForSelector(".arena-code-ticket b", { timeout: 10000 });
    await hostPage.waitForSelector("text=Last Star call", { timeout: 10000 });
    const roomCode = (
      await hostPage.textContent(".arena-code-ticket b")
    )?.trim();
    assert.match(roomCode, /^[A-HJ-NP-Z2-9]{5}$/);

    // Verify 1/35 PLAYERS badge in lobby
    const lobbyKicker1 = await hostPage.textContent(".arena-lobby-title .arena-kicker");
    assert.ok(
      lobbyKicker1?.includes("1/35 PLAYERS"),
      `Expected 1/35 PLAYERS in lobby kicker, got: ${lobbyKicker1}`,
    );

    // Guest joins using the 5-letter room code in UI
    await guestPage.fill("input[placeholder='Your name']", "Felix");
    await guestPage.fill(".room-code-input", roomCode);
    await guestPage.click("button:has-text('Join the room')");
    await guestPage.waitForSelector(".arena-code-ticket b", { timeout: 10000 });

    // Wait for Host lobby to poll and see 2/35 PLAYERS
    await hostPage.waitForFunction(
      () =>
        document
          .querySelector(".arena-lobby-title .arena-kicker")
          ?.textContent?.includes("2/35 PLAYERS"),
      { timeout: 10000 },
    );

    // Host clicks Start the match!
    await hostPage.click("button:has-text('Start the match!')");
    await hostPage.waitForSelector("text=LIVE ROUND 1", { timeout: 10000 });
    await guestPage.waitForSelector("text=LIVE ROUND 1", { timeout: 10000 });

    // Read the live question prompt in the browser and look up its answer
    const promptText = (
      await hostPage.textContent(".arena-question-copy h2")
    )?.trim();
    const matchingQuestion = Array.from(bankById.values()).find(
      (item) => item.prompt === promptText,
    );
    assert.ok(
      matchingQuestion,
      `Could not find question in bank for prompt: ${promptText}`,
    );
    const liveAnswer = String(matchingQuestion.answer);

    // Both players submit the accurate answer in their browser tabs
    await hostPage.fill(".arena-answer-form input", liveAnswer);
    await hostPage.click(".arena-answer-form button");
    await guestPage.fill(".arena-answer-form input", liveAnswer);
    await guestPage.click(".arena-answer-form button");

    // Both browser tabs advance to LIVE ROUND 2 with all 3 hearts intact
    await hostPage.waitForSelector("text=LIVE ROUND 2", { timeout: 10000 });
    await guestPage.waitForSelector("text=LIVE ROUND 2", { timeout: 10000 });

    const hostHearts = (
      await hostPage.textContent(".arena-heart-count b")
    )?.replace(/\s+/g, " ")
      .trim();
    const guestHearts = (
      await guestPage.textContent(".arena-heart-count b")
    )?.replace(/\s+/g, " ")
      .trim();
    assert.equal(hostHearts, "3 / 3");
    assert.equal(guestHearts, "3 / 3");
    console.log(
      `   PASS: 2-browser live match in room ${roomCode} advanced to Round 2 with both players keeping 3/3 hearts.`,
    );
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(`=== Adaptly Production & Multiplayer Substance Suite (${BASE_URL}) ===`);
  await testClassroomMultiplayerMatchHttp();
  await testShowdownMultiplayerMatchHttp();
  await testClassroomPilotFamilyHttp();
  await testPlaywrightMultiBrowserSubstance();
  console.log("=== ALL PRODUCTION & MULTIPLAYER SUBSTANCE CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("E2E SUBSTANCE TEST FAILED:", err);
  process.exit(1);
});
