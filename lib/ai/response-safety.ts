export function responseContainsRefusal(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(responseContainsRefusal);
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.type === "refusal") return true;
  return [record.output, record.content].some(responseContainsRefusal);
}
