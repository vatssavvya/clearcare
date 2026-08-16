import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ClearCarePipelineError } from "@/lib/ai/errors";
import { budgetAllows, estimateCostUsd, isSolModel } from "@/lib/ai/token-budget/pricing";

const LEDGER_DIR = path.join(process.cwd(), ".clearcare");
const LEDGER_PATH = path.join(LEDGER_DIR, "live-ledger.jsonl");

export type LedgerEntry = {
  timestamp: string;
  fixtureHash: string;
  model: string;
  pass: 0 | 1 | 2;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  result: "preflight" | "success" | "cache_hit" | "authentication" | "permission" | "rate_limit" | "refusal" | "schema" | "timeout" | "budget_guard" | "unknown";
};

export async function readLedger(): Promise<LedgerEntry[]> {
  try {
    const contents = await readFile(LEDGER_PATH, "utf8");
    return contents.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as LedgerEntry);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function appendLedger(entry: LedgerEntry) {
  await mkdir(LEDGER_DIR, { recursive: true });
  await appendFile(LEDGER_PATH, `${JSON.stringify(entry)}\n`, { encoding: "utf8", mode: 0o600 });
}

export async function assertBudgetAvailable(model: string, preflightInputTokens: number, plannedOutputTokens: number, options: { enforceRunLimits?: boolean } = {}) {
  const ledger = await readLedger();
  const maxRuns = Number(process.env.CLEARCARE_MAX_LIVE_PIPELINE_RUNS ?? "15");
  const maxSolRuns = Number(process.env.CLEARCARE_MAX_SOL_PIPELINE_RUNS ?? "3");
  const softStop = Number(process.env.CLEARCARE_BUDGET_SOFT_STOP_USD ?? "8");
  const pipelineRuns = ledger.filter((entry) => entry.pass === 1 && entry.result === "preflight").length;
  const solRuns = ledger.filter((entry) => entry.pass === 1 && entry.result === "preflight" && isSolModel(entry.model)).length;
  const spent = ledger.filter((entry) => entry.result === "success").reduce((total, entry) => total + entry.estimatedCostUsd, 0);
  const projected = estimateCostUsd(model, preflightInputTokens, plannedOutputTokens);
  if (!budgetAllows({ pipelineRuns, solRuns, spent, projected, model, maxRuns, maxSolRuns, softStop, enforceRunLimits: options.enforceRunLimits ?? true })) {
    throw new ClearCarePipelineError("budget_guard");
  }
  return { pipelineRuns, solRuns, spent, projected, softStop };
}

export async function sanitizedLedgerSummary() {
  const ledger = await readLedger();
  return {
    pipelineRuns: ledger.filter((entry) => entry.pass === 1 && entry.result === "preflight").length,
    solPipelineRuns: ledger.filter((entry) => entry.pass === 1 && entry.result === "preflight" && isSolModel(entry.model)).length,
    inputTokens: ledger.filter((entry) => entry.result === "success").reduce((total, entry) => total + entry.inputTokens, 0),
    outputTokens: ledger.filter((entry) => entry.result === "success").reduce((total, entry) => total + entry.outputTokens, 0),
    estimatedCostUsd: ledger.filter((entry) => entry.result === "success").reduce((total, entry) => total + entry.estimatedCostUsd, 0),
  };
}
