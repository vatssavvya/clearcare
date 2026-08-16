import type { ExtractedPageText } from "@/lib/documents/extract-text";
import { CarePlanSchema, type CarePlan } from "@/lib/schema/care-plan";

export function normalizeWhitespace(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function validateSourceIntegrity(plan: CarePlan, pageText?: ExtractedPageText[]): CarePlan {
  const validated = CarePlanSchema.parse(plan);
  if (!pageText) return validated;
  const textByPage = new Map(pageText.map((page) => [page.pageNumber, normalizeWhitespace(page.text)]));
  const sources = validated.sources.map((source) => {
    const localText = textByPage.get(source.pageNumber) ?? "";
    if (!localText) {
      return source.extractionMethod === "ocr"
        ? { ...source, matchStatus: "unverified" as const, confidence: source.confidence === "high" ? "medium" as const : source.confidence }
        : source;
    }
    const excerpt = normalizeWhitespace(source.excerpt);
    if (localText.includes(excerpt)) {
      return { ...source, normalizedWhitespace: excerpt, matchStatus: "matched" as const };
    }
    const fragments = excerpt.split(/[.;]\s+/).filter((fragment) => fragment.length >= 16);
    const matchingFragments = fragments.filter((fragment) => localText.includes(fragment));
    if (matchingFragments.length > 0) {
      return { ...source, normalizedWhitespace: excerpt, matchStatus: "partially_matched" as const, confidence: "medium" as const };
    }
    return { ...source, normalizedWhitespace: excerpt, matchStatus: "unverified" as const, confidence: "low" as const };
  });
  return CarePlanSchema.parse({ ...validated, sources });
}

export function assertMedicationFidelity(before: CarePlan["medicationReconciliation"], after: CarePlan["medicationReconciliation"]) {
  const beforeById = new Map(before.map((item) => [item.id, item]));
  const protectedFields = ["action", "nameAsWritten", "dose", "unit", "route", "frequency", "duration", "conditionalText", "monitoringText"] as const;
  for (const medication of after) {
    const original = beforeById.get(medication.id);
    if (!original) throw new Error(`Medication ${medication.id} was added during transformation`);
    for (const field of protectedFields) {
      if (original[field] !== medication[field]) throw new Error(`Medication ${medication.id} changed protected field ${field}`);
    }
  }
}
