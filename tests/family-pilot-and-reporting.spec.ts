import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  exportClassroomCsv,
  summarizeClassroom,
} from "../lib/classroom-report";
import type { Student } from "../lib/learning";
import { isSameOriginRequest } from "../lib/request-origin";
import { MAX_FAMILY_LEARNERS, readSavedState } from "../lib/state-repair";

describe("Spec 04: Family/Pilot State Repair, Classroom Reporting & Origin Security", () => {
  it("FR-4.1 & FR-4.2: supports 35-learner classroom capacity and parses valid saved family JSON", () => {
    assert.equal(MAX_FAMILY_LEARNERS, 35);
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

  it("FR-4.3: summarizes multi-student classroom mastery heatmap and flags learners needing help", () => {
    const students: Student[] = [
      {
        id: "s1",
        name: "Aarav",
        attempts: Array.from({ length: 8 }, (_, idx) => ({
          skill: 0,
          level: 1,
          correct: true,
          seconds: 6,
          hinted: false,
          at: 1700000000000 + idx * 1000,
          prompt: `Q${idx}`,
          answer: 12,
          given: "12",
        })),
      },
      {
        id: "s2",
        name: "Diya",
        attempts: [
          {
            skill: 0,
            level: 1,
            correct: false,
            seconds: 14,
            hinted: false,
            at: 1700000010000,
            prompt: "3 × 4 = ?",
            answer: 12,
            given: "10",
          },
          {
            skill: 0,
            level: 1,
            correct: false,
            seconds: 16,
            hinted: false,
            at: 1700000020000,
            prompt: "2 × 5 = ?",
            answer: 10,
            given: "8",
          },
          {
            skill: 0,
            level: 1,
            correct: false,
            seconds: 12,
            hinted: false,
            at: 1700000030000,
            prompt: "4 × 3 = ?",
            answer: 12,
            given: "9",
          },
        ],
      },
    ];

    const summary = summarizeClassroom(students, "multiply");
    assert.equal(summary.learners.length, 2);

    const aarav = summary.learners.find((l) => l.name === "Aarav")!;
    assert.equal(aarav.secureSkills, 1);
    assert.equal(aarav.needsAttention, false);

    const diya = summary.learners.find((l) => l.name === "Diya")!;
    assert.equal(diya.needsAttention, true);
    assert.ok(diya.focusSkills.includes("Equal groups"));

    const equalGroupsSkill = summary.concepts.find((c) => c.skillIndex === 0)!;
    assert.equal(equalGroupsSkill.secureCount, 1);
    assert.equal(equalGroupsSkill.needsHelpCount, 1);
    assert.deepEqual(equalGroupsSkill.studentsNeedingHelp, ["Diya"]);

    const csv = exportClassroomCsv(students);
    assert.match(csv, /Learner,Subject,Topic,Concept/);
    assert.match(csv, /Aarav,Maths,Multiply Quest,Equal groups,8,8,100%,Secure/);
    assert.match(csv, /Diya,Maths,Multiply Quest,Equal groups,3,0,0%,Needs help/);
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
