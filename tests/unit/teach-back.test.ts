import { describe, expect, it } from "vitest";
import fixture from "@/tests/fixtures/comprehensive-care-plan.json";
import { generateTeachBackQuestions } from "@/lib/care-plan/teach-back";
import { CarePlanSchema, type CarePlan } from "@/lib/schema/care-plan";

function withoutGeneratedFields(plan: CarePlan) {
  const { teachBackQuestions, analysisMetadata, ...input } = plan;
  void teachBackQuestions;
  void analysisMetadata;
  return input;
}

describe("teach-back generation", () => {
  it("generates at least three deterministic source-linked questions", () => {
    const plan = CarePlanSchema.parse(fixture);
    const input = withoutGeneratedFields(plan);
    const first = generateTeachBackQuestions(input);
    const second = generateTeachBackQuestions(input);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(3);
    expect(first.every((question) => question.sourceIds.length > 0)).toBe(true);
  });

  it("uses local answer indexes that always point to an option", () => {
    const plan = CarePlanSchema.parse(fixture);
    for (const question of plan.teachBackQuestions) {
      expect(question.options[question.correctOptionIndex]).toBeTruthy();
    }
  });
});
