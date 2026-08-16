import sampleData from "@/tests/fixtures/comprehensive-care-plan.json";
import { CarePlanSchema, type CarePlan } from "@/lib/schema/care-plan";

let validatedSample: CarePlan | undefined;

export function getComprehensiveSample(): CarePlan {
  validatedSample ??= CarePlanSchema.parse(sampleData);
  return validatedSample;
}
