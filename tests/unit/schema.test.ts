import { describe, expect, it } from "vitest";
import fixture from "@/tests/fixtures/comprehensive-care-plan.json";
import { CarePlanSchema, type CarePlan } from "@/lib/schema/care-plan";

const clone = () => structuredClone(fixture) as CarePlan;

describe("canonical care-plan schema", () => {
  it("accepts the comprehensive fixture", () => {
    const plan = CarePlanSchema.parse(fixture);
    expect(plan.documentMetadata.pageCount).toBe(4);
    expect(plan.analysisMetadata.liveApiUsed).toBe(false);
  });

  it("rejects invalid required fields", () => {
    const candidate = clone();
    candidate.documentMetadata.title = "";
    expect(() => CarePlanSchema.parse(candidate)).toThrow();
  });

  it("keeps missing optional medication fields null", () => {
    const plan = CarePlanSchema.parse(fixture);
    const ibuprofen = plan.medicationReconciliation.find((item) => item.id === "med-ibuprofen");
    expect(ibuprofen?.frequency).toBeNull();
    expect(ibuprofen?.route).toBeNull();
    expect(ibuprofen?.duration).toBeNull();
  });

  it("rejects duplicate stable IDs", () => {
    const candidate = clone();
    candidate.sources[1]!.id = candidate.sources[0]!.id;
    expect(() => CarePlanSchema.parse(candidate)).toThrow(/Duplicate stable IDs/);
  });

  it("rejects broken source links", () => {
    const candidate = clone();
    candidate.followUps[0]!.sourceIds = ["source-does-not-exist"];
    expect(() => CarePlanSchema.parse(candidate)).toThrow(/Broken source link/);
  });

  it("requires one coverage record for every page", () => {
    const candidate = clone();
    candidate.pageCoverage.pop();
    expect(() => CarePlanSchema.parse(candidate)).toThrow(/Every page/);
  });

  it("keeps hospital-course narrative out of actionable events", () => {
    const plan = CarePlanSchema.parse(fixture);
    expect(plan.timelineEvents.some((item) => item.sourceIds.includes("s-hospital-course"))).toBe(false);
    expect(plan.hospitalCourseSummary?.sourceIds).toEqual(["s-hospital-course"]);
  });

  it("preserves cross-page medication evidence", () => {
    const plan = CarePlanSchema.parse(fixture);
    const potassium = plan.medicationReconciliation.find((item) => item.id === "med-potassium");
    expect(potassium?.sourceIds).toEqual(["s-med-potassium-a", "s-med-potassium-b"]);
    expect(potassium?.dose).toBe("20 then 10");
    expect(potassium?.unit).toBe("mEq");
  });

  it("keeps numeric thresholds and relative windows exact", () => {
    const plan = CarePlanSchema.parse(fixture);
    expect(plan.monitoringTasks[0]?.threshold).toEqual({
      comparison: ">",
      value: "2 lb in 24 hours or > 5 lb in 7 days",
      unit: "lb",
    });
    expect(plan.followUps.map((item) => item.timingAsWritten)).toEqual([
      "within 5-7 days",
      "within 7 days",
      "in 2-4 weeks",
    ]);
  });

  it("leaves conflicting values visible and unresolved", () => {
    const plan = CarePlanSchema.parse(fixture);
    expect(plan.conflicts[0]?.valuesAsWritten).toEqual([
      "8 units under the skin nightly",
      "10 units under the skin nightly",
    ]);
    expect(plan.medicationReconciliation.find((item) => item.id === "med-insulin")?.dose).toBeNull();
  });

  it("keeps absent sections absent", () => {
    const candidate = clone();
    candidate.codeStatus = null;
    expect(CarePlanSchema.parse(candidate).codeStatus).toBeNull();
  });
});
