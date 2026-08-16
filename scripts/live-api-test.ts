import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { CarePlanSchema } from "../lib/schema/care-plan";

nextEnv.loadEnvConfig(process.cwd());

if (process.env.RUN_LIVE_API_TESTS !== "true") {
  throw new Error("Live API test is opt-in. Set RUN_LIVE_API_TESTS=true.");
}
if (process.env.CLEARCARE_ENABLE_LIVE_API !== "true" || !process.env.OPENAI_API_KEY) {
  throw new Error("Live analysis is not configured. Check .env.local without printing its values.");
}

const baseUrl = process.env.CLEARCARE_BASE_URL ?? "http://127.0.0.1:3000";
const samplePath = path.join(process.cwd(), "public", "samples", "clearcare-comprehensive-sample.pdf");
const bytes = await readFile(samplePath);
const body = new FormData();
body.append("document", new Blob([bytes], { type: "application/pdf" }), "clearcare-comprehensive-sample.pdf");

const response = await fetch(`${baseUrl}/api/analyze`, { method: "POST", body, signal: AbortSignal.timeout(300_000) });
const payload = await response.json() as { carePlan?: unknown; error?: { code?: string } };
if (!response.ok) {
  throw new Error(`Live API pipeline failed safely with HTTP ${response.status} (${payload.error?.code ?? "unknown"}).`);
}

const plan = CarePlanSchema.parse(payload.carePlan);
if (!plan.analysisMetadata.liveApiUsed || plan.analysisMetadata.mode !== "live_api") {
  throw new Error("The endpoint returned a non-live result.");
}
if (plan.documentMetadata.pageCount !== 4 || plan.pageCoverage.length !== 4) {
  throw new Error("The live result did not preserve complete four-page coverage.");
}
if (plan.medicationReconciliation.length === 0 || plan.sources.length === 0 || plan.teachBackQuestions.length < 3) {
  throw new Error("The live result is missing required structured sections.");
}

const ledgerPath = path.join(process.cwd(), ".clearcare", "live-ledger.jsonl");
const ledgerText = await readFile(ledgerPath, "utf8");
const entries = ledgerText.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as {
  pass: number;
  result: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  model: string;
});
const successes = entries.filter((entry) => entry.result === "success");
const summary = {
  status: "passed",
  model: plan.analysisMetadata.model,
  pages: plan.documentMetadata.pageCount,
  medications: plan.medicationReconciliation.length,
  sources: plan.sources.length,
  matchedSources: plan.analysisMetadata.sourceMatchCounts.matched,
  questions: plan.teachBackQuestions.length,
  successfulPasses: successes.length,
  inputTokens: successes.reduce((total, entry) => total + entry.inputTokens, 0),
  outputTokens: successes.reduce((total, entry) => total + entry.outputTokens, 0),
  estimatedCostUsd: Number(successes.reduce((total, entry) => total + entry.estimatedCostUsd, 0).toFixed(4)),
};

console.log(JSON.stringify(summary, null, 2));
