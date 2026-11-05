import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generate, skills, topics } from "../lib/learning";
import {
  buildGuidedHintSteps,
  buildManipulativeModel,
  buildStarTrackStandings,
  resolveUxVariant,
  UX_VARIANTS,
  uxCapabilities,
} from "../lib/ux-variants";

describe("Spec 05: Pluggable A/B/C/D UX Variants & Tactile Learning Models", () => {
  it("FR-5.1: resolves UX variants and assigns 4 pairwise-distinct home layouts and themes", () => {
    assert.equal(UX_VARIANTS.length, 4);
    assert.equal(resolveUxVariant("a"), "a");
    assert.equal(resolveUxVariant("classic"), "a");
    assert.equal(resolveUxVariant("B"), "b");
    assert.equal(resolveUxVariant("quest"), "b");
    assert.equal(resolveUxVariant("c"), "c");
    assert.equal(resolveUxVariant("tactile"), "c");
    assert.equal(resolveUxVariant("d"), "d");
    assert.equal(resolveUxVariant("stage"), "d");
    assert.equal(resolveUxVariant("studio"), "d");
    assert.equal(resolveUxVariant("unknown-flag", "a"), "a");
    assert.equal(resolveUxVariant(null, "d"), "d");

    const capA = uxCapabilities("a");
    const capB = uxCapabilities("b");
    const capC = uxCapabilities("c");
    const capD = uxCapabilities("d");

    // Every variant must have a completely distinct homeLayout and themeClass
    const homeLayouts = new Set([
      capA.homeLayout,
      capB.homeLayout,
      capC.homeLayout,
      capD.homeLayout,
    ]);
    const themeClasses = new Set([
      capA.themeClass,
      capB.themeClass,
      capC.themeClass,
      capD.themeClass,
    ]);
    assert.equal(homeLayouts.size, 4, "All 4 variants must have distinct home layouts");
    assert.equal(themeClasses.size, 4, "All 4 variants must have distinct full-page theme classes");

    assert.equal(capA.homeLayout, "classic-cards");
    assert.equal(capB.homeLayout, "constellation-map");
    assert.equal(capC.homeLayout, "tactile-workbench");
    assert.equal(capD.homeLayout, "arcade-stadium");

    assert.equal(capA.useTactilePractice, false);
    assert.equal(capB.useTactilePractice, false);
    assert.equal(capC.useTactilePractice, true);
    assert.equal(capD.useTactilePractice, true);

    assert.equal(capA.useStarTrackArena, false);
    assert.equal(capB.useStarTrackArena, false);
    assert.equal(capC.useStarTrackArena, false);
    assert.equal(capD.useStarTrackArena, true);
  });

  it("FR-5.2: buildGuidedHintSteps generates valid 2-step Socratic rescue steps across all 37 skills", () => {
    for (let skillIndex = 0; skillIndex < skills.length; skillIndex++) {
      const q = generate(skillIndex, 2, [], 1);
      const steps = buildGuidedHintSteps(q);
      assert.equal(
        steps.length,
        2,
        `Skill ${skillIndex} (${skills[skillIndex].name}) should produce 2 hint steps`,
      );
      for (const step of steps) {
        assert.ok(step.prompt.length > 5);
        assert.equal(step.choices.length, 3);
        assert.ok(
          step.choices.includes(step.expected),
          `Expected "${step.expected}" in choices ${JSON.stringify(step.choices)} for skill ${skillIndex}`,
        );
        assert.equal(
          new Set(step.choices).size,
          3,
          `Choices must be unique for skill ${skillIndex}: ${JSON.stringify(step.choices)}`,
        );
      }
      assert.equal(
        steps[1].expected,
        String(q.answer),
        `Step 2 expected answer must match question answer for skill ${skillIndex}`,
      );
    }
  });

  it("FR-5.3: buildManipulativeModel produces interactive models across all 7 topics", () => {
    const seenKinds = new Set<string>();
    for (const topic of topics) {
      const firstSkill = skills.findIndex((s) => s.topic === topic.id);
      const q = generate(firstSkill, 1, [], 0);
      const model = buildManipulativeModel(q);
      assert.ok(model.kind);
      seenKinds.add(model.kind);
      if (model.kind === "array-splitter") {
        assert.equal(model.rowTotals.length, model.rows);
        assert.equal(model.rowTotals.at(-1), model.rows * model.cols);
      }
    }
    assert.ok(seenKinds.has("array-splitter"));
    assert.ok(seenKinds.has("word-chips"));

    // Check carrying model on skill 5 (The carrying bridge)
    const carryQ = generate(5, 1, [], 0);
    const carryModel = buildManipulativeModel(carryQ);
    assert.equal(carryModel.kind, "column-carry");
    if (carryModel.kind === "column-carry") {
      assert.ok(carryModel.carryValue >= 1);
    }

    // Check LCM number-track model on skill 26
    const lcmQ = generate(26, 1, [], 0);
    const lcmModel = buildManipulativeModel(lcmQ);
    assert.equal(lcmModel.kind, "number-track");
    if (lcmModel.kind === "number-track") {
      assert.equal(lcmModel.meetingPoint, Number(lcmQ.answer));
    }
  });

  it("FR-5.4: buildStarTrackStandings projects players onto a 0..100 star race track", () => {
    const track = buildStarTrackStandings(
      [
        {
          id: "p1",
          name: "Clara",
          lives: 3,
          score: 450,
          active: true,
          answered: true,
          isYou: true,
        },
        {
          id: "p2",
          name: "Felix",
          lives: 2,
          score: 300,
          active: true,
          answered: false,
          isYou: false,
        },
        {
          id: "p3",
          name: "Mila",
          lives: 0,
          score: 100,
          active: false,
          answered: false,
          isYou: false,
        },
      ],
      3,
      10,
    );

    assert.equal(track.length, 3);
    assert.equal(track[0].state, "charged");
    assert.equal(track[1].state, "thinking");
    assert.equal(track[2].state, "spectating");
    assert.ok(track[0].progressPct > track[1].progressPct);
    assert.ok(track[0].progressPct <= 100 && track[0].progressPct >= 10);
  });
});
