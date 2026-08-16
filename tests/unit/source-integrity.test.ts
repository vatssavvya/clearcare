import { describe, expect, it } from "vitest";
import fixture from "@/tests/fixtures/comprehensive-care-plan.json";
import { CarePlanSchema } from "@/lib/schema/care-plan";
import { assertMedicationFidelity, normalizeWhitespace, validateSourceIntegrity } from "@/lib/validation/source-integrity";

describe("source and transformation integrity", () => {
  it("normalizes whitespace only for matching", () => {
    expect(normalizeWhitespace(" A\n\t  value  ")).toBe("A value");
  });

  it("marks an unmatched excerpt unverified", () => {
    const plan = CarePlanSchema.parse(fixture);
    const checked = validateSourceIntegrity(plan, [
      { pageNumber: 1, text: "unrelated page text" },
      { pageNumber: 2, text: "" },
      { pageNumber: 3, text: "" },
      { pageNumber: 4, text: "" },
    ]);
    expect(checked.sources.find((source) => source.id === "s-reason")?.matchStatus).toBe("unverified");
  });

  it("rejects changed medication values after transformation", () => {
    const plan = CarePlanSchema.parse(fixture);
    const changed = structuredClone(plan.medicationReconciliation);
    changed[0]!.dose = "999";
    expect(() => assertMedicationFidelity(plan.medicationReconciliation, changed)).toThrow(/changed protected field dose/);
  });

  it("accepts medication explanations that leave protected fields unchanged", () => {
    const plan = CarePlanSchema.parse(fixture);
    const transformed = structuredClone(plan.medicationReconciliation);
    transformed[0]!.plainLanguageExplanation = "A clearer sourced explanation.";
    expect(() => assertMedicationFidelity(plan.medicationReconciliation, transformed)).not.toThrow();
  });
});
