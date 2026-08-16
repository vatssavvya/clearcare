export type ModelPrice = {
  inputPerMillion: number;
  outputPerMillion: number;
};

// Snapshot checked against official OpenAI model/pricing documentation on 2026-08-15.
// Re-check before production use; API prices can change.
export const PRICING_SNAPSHOT = {
  checkedAt: "2026-08-15",
  source: "https://developers.openai.com/api/docs/pricing",
  models: {
    "gpt-5.6-terra": { inputPerMillion: 2.5, outputPerMillion: 15 },
    "gpt-5.6": { inputPerMillion: 5, outputPerMillion: 30 },
    "gpt-5.6-sol": { inputPerMillion: 5, outputPerMillion: 30 },
  } satisfies Record<string, ModelPrice>,
};

export function getModelPrice(model: string): ModelPrice {
  const price = PRICING_SNAPSHOT.models[model as keyof typeof PRICING_SNAPSHOT.models];
  if (!price) throw new Error(`No reviewed pricing snapshot for model ${model}`);
  return price;
}

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const price = getModelPrice(model);
  return (inputTokens / 1_000_000) * price.inputPerMillion + (outputTokens / 1_000_000) * price.outputPerMillion;
}

export function isSolModel(model: string) {
  return model === "gpt-5.6" || model.toLowerCase().includes("sol");
}

export function budgetAllows({
  pipelineRuns,
  solRuns,
  spent,
  projected,
  model,
  maxRuns = 15,
  maxSolRuns = 3,
  softStop = 8,
  enforceRunLimits = true,
}: {
  pipelineRuns: number;
  solRuns: number;
  spent: number;
  projected: number;
  model: string;
  maxRuns?: number;
  maxSolRuns?: number;
  softStop?: number;
  enforceRunLimits?: boolean;
}) {
  const runsAvailable = !enforceRunLimits || (pipelineRuns < maxRuns && (!isSolModel(model) || solRuns < maxSolRuns));
  return runsAvailable && spent + projected < softStop;
}
