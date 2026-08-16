import "server-only";
import { createHash } from "node:crypto";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResponseInputItem } from "openai/resources/responses/responses";
import { ClearCarePipelineError, mapPipelineError } from "@/lib/ai/errors";
import { EXTRACTION_INSTRUCTIONS, EXTRACTION_REQUEST } from "@/lib/ai/prompts/extraction";
import { TRANSFORMATION_INSTRUCTIONS } from "@/lib/ai/prompts/transformation";
import { responseContainsRefusal } from "@/lib/ai/response-safety";
import { readSyntheticCarePlanCache, writeSyntheticCarePlanCache } from "@/lib/ai/synthetic-cache";
import { appendLedger, assertBudgetAvailable } from "@/lib/ai/token-budget/ledger";
import { estimateCostUsd } from "@/lib/ai/token-budget/pricing";
import { generateTeachBackQuestions } from "@/lib/care-plan/teach-back";
import { extractLocalPageText } from "@/lib/documents/extract-text";
import type { ValidatedDocument } from "@/lib/documents/validation";
import {
  BaseCarePlanSchema,
  CarePlanSchema,
  CarePlanWithoutQuizSchema,
  Pass1ExtractionSchema,
  type CarePlan,
} from "@/lib/schema/care-plan";
import { assertMedicationFidelity, validateSourceIntegrity } from "@/lib/validation/source-integrity";

const MAX_OUTPUT_TOKENS = 12_000;

function contentHash(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function documentInput(document: ValidatedDocument): ResponseInputItem[] {
  const data = Buffer.from(document.bytes).toString("base64");
  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_file"; filename: string; file_data: string; detail: "high" }
    | { type: "input_image"; image_url: string; detail: "original" }
  > = [{ type: "input_text", text: EXTRACTION_REQUEST }];
  if (document.mimeType === "application/pdf") {
    content.unshift({
      type: "input_file",
      filename: document.safeFilename,
      file_data: `data:${document.mimeType};base64,${data}`,
      detail: "high",
    });
  } else {
    content.unshift({
      type: "input_image",
      image_url: `data:${document.mimeType};base64,${data}`,
      detail: "original",
    });
  }
  return [{ type: "message", role: "user", content }];
}

function resultCategory(error: unknown) {
  const mapped = mapPipelineError(error);
  if (mapped === "authentication") return "authentication" as const;
  if (mapped === "billing_or_permission") return "permission" as const;
  if (mapped === "rate_limit") return "rate_limit" as const;
  if (mapped === "timeout") return "timeout" as const;
  if (mapped === "refusal") return "refusal" as const;
  if (mapped === "structured_output") return "schema" as const;
  if (mapped === "budget_guard") return "budget_guard" as const;
  return "unknown" as const;
}

async function runPass<T>({
  client,
  model,
  input,
  instructions,
  format,
  pass,
  hash,
}: {
  client: OpenAI;
  model: string;
  input: ResponseInputItem[];
  instructions: string;
  format: ReturnType<typeof zodTextFormat>;
  pass: 1 | 2;
  hash: string;
}): Promise<T> {
  const countPayload = {
    model,
    instructions,
    input,
    text: { format },
    reasoning: { effort: "low" as const },
  };
  let tokenCount: { input_tokens: number };
  try {
    tokenCount = await client.responses.inputTokens.count(countPayload);
  } catch (error) {
    await appendLedger({
      timestamp: new Date().toISOString(),
      fixtureHash: hash,
      model,
      pass,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      result: resultCategory(error),
    });
    throw error;
  }
  try {
    await assertBudgetAvailable(model, tokenCount.input_tokens, MAX_OUTPUT_TOKENS, { enforceRunLimits: pass === 1 });
  } catch (error) {
    await appendLedger({
      timestamp: new Date().toISOString(),
      fixtureHash: hash,
      model,
      pass,
      inputTokens: tokenCount.input_tokens,
      outputTokens: 0,
      estimatedCostUsd: 0,
      result: resultCategory(error),
    });
    throw error;
  }
  await appendLedger({
    timestamp: new Date().toISOString(),
    fixtureHash: hash,
    model,
    pass,
    inputTokens: tokenCount.input_tokens,
    outputTokens: 0,
    estimatedCostUsd: estimateCostUsd(model, tokenCount.input_tokens, MAX_OUTPUT_TOKENS),
    result: "preflight",
  });

  try {
    const response = await client.responses.parse({
      model,
      instructions,
      input,
      text: { format },
      reasoning: { effort: "low" },
      max_output_tokens: MAX_OUTPUT_TOKENS,
      service_tier: "default",
      store: false,
    });
    if (!response.output_parsed) {
      if (responseContainsRefusal(response.output)) throw new ClearCarePipelineError("refusal");
      throw new ClearCarePipelineError("structured_output");
    }
    const usage = response.usage;
    await appendLedger({
      timestamp: new Date().toISOString(),
      fixtureHash: hash,
      model,
      pass,
      inputTokens: usage?.input_tokens ?? tokenCount.input_tokens,
      outputTokens: usage?.output_tokens ?? 0,
      estimatedCostUsd: estimateCostUsd(model, usage?.input_tokens ?? tokenCount.input_tokens, usage?.output_tokens ?? 0),
      result: "success",
    });
    return response.output_parsed as T;
  } catch (error) {
    await appendLedger({
      timestamp: new Date().toISOString(),
      fixtureHash: hash,
      model,
      pass,
      inputTokens: tokenCount.input_tokens,
      outputTokens: 0,
      estimatedCostUsd: 0,
      result: resultCategory(error),
    });
    throw error;
  }
}

export async function analyzeDocument(
  document: ValidatedDocument,
  options: { model?: string; analyzedAt?: string } = {},
): Promise<CarePlan> {
  if (process.env.CLEARCARE_ENABLE_LIVE_API !== "true" || !process.env.OPENAI_API_KEY) {
    throw new ClearCarePipelineError("live_disabled");
  }
  const model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6-terra";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120_000, maxRetries: 0 });
  const hash = contentHash(document.bytes);
  const cached = await readSyntheticCarePlanCache(hash, model);
  if (cached) {
    await appendLedger({
      timestamp: new Date().toISOString(),
      fixtureHash: hash,
      model,
      pass: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      result: "cache_hit",
    });
    return cached;
  }
  const pageText = await extractLocalPageText(document);

  const pass1 = await runPass<unknown>({
    client,
    model,
    input: documentInput(document),
    instructions: EXTRACTION_INSTRUCTIONS,
    format: zodTextFormat(Pass1ExtractionSchema, "clearcare_evidence_extraction"),
    pass: 1,
    hash,
  });
  const extraction = Pass1ExtractionSchema.parse(pass1);
  if (extraction.extractedCarePlan.documentMetadata.pageCount !== document.pageCount) {
    throw new ClearCarePipelineError("structured_output");
  }

  const pass2Input: ResponseInputItem[] = [
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Transform this validated extraction only. Do not add facts:\n${JSON.stringify(extraction.extractedCarePlan)}`,
        },
      ],
    },
  ];
  const pass2 = await runPass<unknown>({
    client,
    model,
    input: pass2Input,
    instructions: TRANSFORMATION_INSTRUCTIONS,
    format: zodTextFormat(CarePlanWithoutQuizSchema, "clearcare_care_plan"),
    pass: 2,
    hash,
  });
  const transformed = CarePlanWithoutQuizSchema.parse(pass2);
  assertMedicationFidelity(
    extraction.extractedCarePlan.medicationReconciliation,
    transformed.medicationReconciliation,
  );
  const questions = generateTeachBackQuestions(transformed);
  const provisional = BaseCarePlanSchema.parse({
    ...transformed,
    teachBackQuestions: questions,
    analysisMetadata: {
      mode: "live_api",
      schemaVersion: "1.0.0",
      analyzedAt: options.analyzedAt ?? new Date().toISOString(),
      model,
      liveApiUsed: true,
      sourceMatchCounts: { matched: 0, partiallyMatched: 0, unverified: 0 },
    },
  });
  const locallyVerified = validateSourceIntegrity(CarePlanSchema.parse(provisional), pageText);
  const counts = locallyVerified.sources.reduce(
    (accumulator, source) => {
      if (source.matchStatus === "matched") accumulator.matched += 1;
      else if (source.matchStatus === "partially_matched") accumulator.partiallyMatched += 1;
      else accumulator.unverified += 1;
      return accumulator;
    },
    { matched: 0, partiallyMatched: 0, unverified: 0 },
  );
  const result = CarePlanSchema.parse({
    ...locallyVerified,
    analysisMetadata: { ...locallyVerified.analysisMetadata, sourceMatchCounts: counts },
  });
  await writeSyntheticCarePlanCache(hash, model, result);
  return result;
}
