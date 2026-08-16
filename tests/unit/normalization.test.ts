import { describe, expect, it } from "vitest";
import { joinContiguousPageFragments, reconcileInstructions, splitSemicolonItems } from "@/lib/care-plan/normalization";

describe("deterministic extraction helpers", () => {
  it("splits dense semicolon-delimited medication text faithfully", () => {
    expect(splitSemicolonItems("START A 10 mg; HOLD B if < 100 mmHg; STOP C")).toEqual([
      "START A 10 mg",
      "HOLD B if < 100 mmHg",
      "STOP C",
    ]);
  });

  it("joins only contiguous page-boundary fragments and keeps both sources", () => {
    const joined = joinContiguousPageFragments(
      { pageNumber: 2, sourceId: "s-a", text: "Take 20 mEq by mouth", readingOrder: Number.MAX_SAFE_INTEGER },
      { pageNumber: 3, sourceId: "s-b", text: "once daily for 5 days.", readingOrder: 0 },
    );
    expect(joined).toEqual({
      text: "Take 20 mEq by mouth once daily for 5 days.",
      sourceIds: ["s-a", "s-b"],
      confidence: "medium",
    });
  });

  it("never joins noncontiguous fragments", () => {
    expect(joinContiguousPageFragments(
      { pageNumber: 1, sourceId: "s-a", text: "Take 20 mEq", readingOrder: 4 },
      { pageNumber: 3, sourceId: "s-b", text: "once daily.", readingOrder: 0 },
    )).toBeNull();
  });

  it("deduplicates agreeing facts while retaining all sources", () => {
    const result = reconcileInstructions([
      { id: "a", identity: "weight", action: "call", value: "> 2 lb", sourceIds: ["s1"] },
      { id: "b", identity: "weight", action: "call", value: "> 2 lb", sourceIds: ["s2"] },
    ]);
    expect(result.displayed).toHaveLength(1);
    expect(result.displayed[0]?.sourceIds).toEqual(["s1", "s2"]);
    expect(result.conflicts).toHaveLength(0);
  });

  it("creates a conflict instead of choosing differing values", () => {
    const result = reconcileInstructions([
      { id: "a", identity: "insulin", action: "continue", value: "8 units", sourceIds: ["s1"] },
      { id: "b", identity: "insulin", action: "continue", value: "10 units", sourceIds: ["s2"] },
    ]);
    expect(result.conflicts).toEqual([{ identity: "insulin", itemIds: ["a", "b"], sourceIds: ["s1", "s2"] }]);
  });
});
