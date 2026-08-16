import { describe, expect, it } from "vitest";
import { isProhibitedSecretFilename, normalizePackagePath, shouldPackage } from "@/lib/release/package-policy";

describe("release package policy", () => {
  it("normalizes Windows paths", () => {
    expect(normalizePackagePath("docs\\judging\\deck.pptx")).toBe("docs/judging/deck.pptx");
  });

  it.each([".env.local", ".env", "node_modules/pkg/index.js", ".clearcare/live-ledger.jsonl", "tsconfig.tsbuildinfo", ".gitignore", "AGENTS.md", "PLAN.md", "PROGRESS.md", "unrelated-metadata.json"])("excludes %s", (value) => {
    expect(shouldPackage(value)).toBe(false);
  });

  it.each([".env.example", "FINAL_HANDOFF.md", "app/page.tsx", "scripts/package.ts", "public/samples/clearcare-comprehensive-sample.pdf"])("includes %s", (value) => {
    expect(shouldPackage(value)).toBe(true);
  });

  it("recognizes prohibited environment files", () => {
    expect(isProhibitedSecretFilename("nested/.env.local")).toBe(true);
    expect(isProhibitedSecretFilename(".env.example")).toBe(false);
  });
});
