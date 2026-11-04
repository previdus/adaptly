import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSameOriginRequest } from "../lib/request-origin";
import { readSavedState } from "../lib/state-repair";

describe("Spec 04: Family/Pilot State Repair & Request Origin Security", () => {
  it("FR-4.2: parses valid saved family JSON without marking it repaired", () => {
    const validState = {
      students: [
        {
          id: "s1",
          name: "Maya",
          attempts: [
            {
              skill: 0,
              level: 1,
              correct: true,
              seconds: 8,
              hinted: false,
              at: 1700000000000,
              prompt: "3 × 4 = ?",
              answer: 12,
              given: "12",
            },
          ],
        },
      ],
      active: 0,
    };

    const result = readSavedState(JSON.stringify(validState));
    assert.equal(result.repaired, false);
    assert.equal(result.state.students.length, 1);
    assert.equal(result.state.students[0].attempts.length, 1);
  });

  it("FR-4.2: repairs truncated JSON learner exports ending mid-attempt", () => {
    const completeState = {
      students: [
        {
          id: "s1",
          name: "Maya",
          attempts: [
            {
              skill: 0,
              level: 1,
              correct: true,
              seconds: 8,
              hinted: false,
              at: 1700000000000,
              prompt: "3 × 4 = ?",
              answer: 12,
              given: "12",
            },
            {
              skill: 0,
              level: 1,
              correct: false,
              seconds: 11,
              hinted: false,
              at: 1700000005000,
              prompt: "5 × 4 = ?",
              answer: 20,
              given: "19",
            },
          ],
        },
      ],
      active: 0,
    };

    const serialized = JSON.stringify(completeState);
    const cutIndex = serialized.lastIndexOf('{"skill":0,"level":1,"correct":false');
    const truncated = `${serialized.slice(0, cutIndex + 18)}[truncated 128 bytes]`;

    const repaired = readSavedState(truncated);
    assert.equal(repaired.repaired, true);
    assert.equal(repaired.state.students[0].name, "Maya");
    assert.equal(repaired.state.students[0].attempts.length, 1);
    assert.equal(repaired.state.students[0].attempts[0].answer, 12);
  });

  it("FR-4.2: throws an explicit error when corrupted JSON has no [truncated marker", () => {
    assert.throws(
      () => readSavedState("{not-valid-json"),
      /Saved learner progress is not valid JSON/,
    );
  });

  it("validates same-origin requests and blocks cross-origin mutations", () => {
    const sameOriginReq = new Request("https://adaptly.example/api/arena", {
      method: "POST",
      headers: {
        host: "adaptly.example",
        origin: "https://adaptly.example",
      },
    });
    assert.equal(isSameOriginRequest(sameOriginReq), true);

    const crossOriginReq = new Request("https://adaptly.example/api/arena", {
      method: "POST",
      headers: {
        host: "adaptly.example",
        origin: "https://evil.example",
      },
    });
    assert.equal(isSameOriginRequest(crossOriginReq), false);
  });
});
