import { z } from "zod";

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export const SourceMatchStatusSchema = z.enum([
  "matched",
  "partially_matched",
  "unverified",
]);

const NullableText = z.string().min(1).nullable();
const Id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);

export const SourceSchema = z.object({
  id: Id,
  pageNumber: z.number().int().positive(),
  sectionName: NullableText,
  excerpt: z.string().min(1),
  normalizedWhitespace: NullableText,
  locator: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().positive().max(1),
      height: z.number().positive().max(1),
    })
    .nullable(),
  extractionMethod: z.enum(["digital_text", "ocr", "fixture"]),
  matchStatus: SourceMatchStatusSchema,
  confidence: ConfidenceSchema,
});

export const PageCoverageSchema = z.object({
  pageNumber: z.number().int().positive(),
  processingStatus: z.enum(["processed", "partially_processed", "unreadable"]),
  detectedSections: z.array(z.string().min(1)),
  evidenceBlockCount: z.number().int().nonnegative(),
  actionableItemsFound: z.boolean(),
  confidence: ConfidenceSchema,
  warnings: z.array(z.string().min(1)),
});

const SourceLinkedFields = {
  id: Id,
  title: z.string().min(1),
  plainLanguageExplanation: z.string().min(1),
  sourceIds: z.array(Id).min(1),
  confidence: ConfidenceSchema,
  sourceMatchStatus: SourceMatchStatusSchema,
  conflictIds: z.array(Id),
};

export const SourceLinkedItemSchema = z.object({
  ...SourceLinkedFields,
  detail: z.string().min(1),
});

export const MedicationActionSchema = z.enum([
  "start",
  "continue",
  "change",
  "hold",
  "stop",
  "resume",
  "temporary",
  "unclear",
]);

export const MedicationSchema = z.object({
  ...SourceLinkedFields,
  action: MedicationActionSchema,
  nameAsWritten: z.string().min(1),
  dose: NullableText,
  unit: NullableText,
  route: NullableText,
  frequency: NullableText,
  duration: NullableText,
  conditionalText: NullableText,
  monitoringText: NullableText,
});

export const TimelineEventSchema = z.object({
  ...SourceLinkedFields,
  bucket: z.enum(["do_now", "today", "next_48_hours", "next_7_days", "later"]),
  timeWindowAsWritten: z.string().min(1),
  category: z.enum([
    "medication",
    "monitoring",
    "follow_up",
    "restriction",
    "pending",
    "service",
  ]),
});

export const MonitoringTaskSchema = z.object({
  ...SourceLinkedFields,
  measurement: z.string().min(1),
  threshold: z
    .object({
      comparison: z.enum(["<", "<=", "=", ">=", ">", "range"]),
      value: z.string().min(1),
      unit: z.string().min(1),
    })
    .nullable(),
  timingAsWritten: NullableText,
  actionAsWritten: z.string().min(1),
});

export const FollowUpSchema = z.object({
  ...SourceLinkedFields,
  specialtyOrService: z.string().min(1),
  timingAsWritten: z.string().min(1),
  schedulingInstruction: NullableText,
});

export const WarningSignSchema = z.object({
  ...SourceLinkedFields,
  signAsWritten: z.string().min(1),
  sourceActionAsWritten: z.string().min(1),
});

export const ConflictSchema = z.object({
  id: Id,
  title: z.string().min(1),
  description: z.string().min(1),
  valuesAsWritten: z.array(z.string().min(1)).min(2),
  sourceIds: z.array(Id).min(2),
  status: z.literal("unresolved"),
});

export const UncertaintySchema = z.object({
  ...SourceLinkedFields,
  detail: z.string().min(1),
  reason: z.enum([
    "missing_attachment",
    "ambiguous_wording",
    "unverified_source",
    "low_confidence_ocr",
    "missing_value",
  ]),
  confirmationPrompt: z.string().min(1),
});

export const TeachBackQuestionSchema = z.object({
  id: Id,
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(3).max(4),
  correctOptionIndex: z.number().int().nonnegative(),
  correction: z.string().min(1),
  sourceIds: z.array(Id).min(1),
  concept: z.enum(["medication", "monitoring", "follow_up", "restriction", "warning"]),
});

export const AnalysisMetadataSchema = z.object({
  mode: z.enum(["deterministic_demo", "live_api"]),
  schemaVersion: z.literal("1.0.0"),
  analyzedAt: z.string().datetime(),
  model: NullableText,
  liveApiUsed: z.boolean(),
  sourceMatchCounts: z.object({
    matched: z.number().int().nonnegative(),
    partiallyMatched: z.number().int().nonnegative(),
    unverified: z.number().int().nonnegative(),
  }),
});

export const BaseCarePlanSchema = z.object({
  documentMetadata: z.object({
    title: z.string().min(1),
    documentType: z.string().min(1),
    pageCount: z.number().int().positive().max(25),
    synthetic: z.boolean(),
  }),
  encounterMetadata: z
    .object({
      facility: z.string().min(1),
      admissionDate: NullableText,
      dischargeDate: NullableText,
      encounterId: NullableText,
    })
    .nullable(),
  patientContext: z
    .object({
      displayName: NullableText,
      ageRange: NullableText,
      preferredLanguage: NullableText,
    })
    .nullable(),
  reasonForAdmission: SourceLinkedItemSchema.nullable(),
  disposition: SourceLinkedItemSchema.nullable(),
  codeStatus: SourceLinkedItemSchema.nullable(),
  allergies: z.array(SourceLinkedItemSchema),
  plainLanguageSummary: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    sourceIds: z.array(Id).min(1),
  }),
  primaryDiagnoses: z.array(SourceLinkedItemSchema),
  secondaryDiagnoses: z.array(SourceLinkedItemSchema),
  hospitalCourseSummary: SourceLinkedItemSchema.nullable(),
  procedures: z.array(SourceLinkedItemSchema),
  consultations: z.array(SourceLinkedItemSchema),
  medicationReconciliation: z.array(MedicationSchema),
  timelineEvents: z.array(TimelineEventSchema),
  monitoringTasks: z.array(MonitoringTaskSchema),
  followUps: z.array(FollowUpSchema),
  dietAndFluidInstructions: z.array(SourceLinkedItemSchema),
  restrictions: z.array(SourceLinkedItemSchema),
  homeServices: z.array(SourceLinkedItemSchema),
  equipment: z.array(SourceLinkedItemSchema),
  pendingTests: z.array(SourceLinkedItemSchema),
  patientEducation: z.array(SourceLinkedItemSchema),
  warningSigns: z.array(WarningSignSchema),
  glossaryTerms: z.array(
    z.object({
      term: z.string().min(1),
      explanation: z.string().min(1),
      sourceIds: z.array(Id).min(1),
    }),
  ),
  uncertainties: z.array(UncertaintySchema),
  conflicts: z.array(ConflictSchema),
  sources: z.array(SourceSchema).min(1),
  pageCoverage: z.array(PageCoverageSchema).min(1),
  teachBackQuestions: z.array(TeachBackQuestionSchema).min(3),
  analysisMetadata: AnalysisMetadataSchema,
});

type RefinementContext = z.RefinementCtx;

function addIntegrityIssues(plan: z.infer<typeof BaseCarePlanSchema>, ctx: RefinementContext) {
  const allIds = new Set<string>();
  const duplicateIds = new Set<string>();
  const register = (id: string) => {
    if (allIds.has(id)) duplicateIds.add(id);
    allIds.add(id);
  };

  plan.sources.forEach((item) => register(item.id));
  plan.conflicts.forEach((item) => register(item.id));
  const linkedCollections = [
    plan.allergies,
    plan.primaryDiagnoses,
    plan.secondaryDiagnoses,
    plan.procedures,
    plan.consultations,
    plan.medicationReconciliation,
    plan.timelineEvents,
    plan.monitoringTasks,
    plan.followUps,
    plan.dietAndFluidInstructions,
    plan.restrictions,
    plan.homeServices,
    plan.equipment,
    plan.pendingTests,
    plan.patientEducation,
    plan.warningSigns,
    plan.uncertainties,
  ];
  linkedCollections.flat().forEach((item) => register(item.id));
  [plan.reasonForAdmission, plan.disposition, plan.codeStatus, plan.hospitalCourseSummary]
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .forEach((item) => register(item.id));
  plan.teachBackQuestions.forEach((item) => register(item.id));

  if (duplicateIds.size > 0) {
    ctx.addIssue({
      code: "custom",
      path: ["sources"],
      message: `Duplicate stable IDs: ${Array.from(duplicateIds).join(", ")}`,
    });
  }

  const sourceIds = new Set(plan.sources.map((source) => source.id));
  const conflictIds = new Set(plan.conflicts.map((conflict) => conflict.id));
  const sourceLinked = linkedCollections.flat().concat(
    [plan.reasonForAdmission, plan.disposition, plan.codeStatus, plan.hospitalCourseSummary].filter(
      (item): item is NonNullable<typeof item> => item !== null,
    ),
  );

  sourceLinked.forEach((item) => {
    item.sourceIds.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) {
        ctx.addIssue({ code: "custom", message: `Broken source link ${sourceId} on ${item.id}` });
      }
    });
    item.conflictIds.forEach((conflictId) => {
      if (!conflictIds.has(conflictId)) {
        ctx.addIssue({ code: "custom", message: `Broken conflict link ${conflictId} on ${item.id}` });
      }
    });
  });
  plan.teachBackQuestions.forEach((question) => {
    if (question.correctOptionIndex >= question.options.length) {
      ctx.addIssue({ code: "custom", message: `Invalid answer index on ${question.id}` });
    }
    question.sourceIds.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) {
        ctx.addIssue({ code: "custom", message: `Broken quiz source link ${sourceId}` });
      }
    });
  });

  const pages = [...plan.pageCoverage.map((coverage) => coverage.pageNumber)].sort((a, b) => a - b);
  const expectedPages = Array.from({ length: plan.documentMetadata.pageCount }, (_, index) => index + 1);
  if (pages.join(",") !== expectedPages.join(",")) {
    ctx.addIssue({ code: "custom", path: ["pageCoverage"], message: "Every page must have one coverage record" });
  }
  if (plan.sources.some((source) => source.pageNumber > plan.documentMetadata.pageCount)) {
    ctx.addIssue({ code: "custom", path: ["sources"], message: "Source page exceeds document page count" });
  }
}

export const CarePlanSchema = BaseCarePlanSchema.superRefine(addIntegrityIssues);

export const CarePlanWithoutQuizSchema = BaseCarePlanSchema.omit({
  teachBackQuestions: true,
  analysisMetadata: true,
});

export const Pass1ExtractionSchema = z.object({
  extractedCarePlan: BaseCarePlanSchema.omit({
    teachBackQuestions: true,
    analysisMetadata: true,
  }),
});

export type CarePlan = z.infer<typeof BaseCarePlanSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type SourceLinkedItem = z.infer<typeof SourceLinkedItemSchema>;
export type Medication = z.infer<typeof MedicationSchema>;
export type TeachBackQuestion = z.infer<typeof TeachBackQuestionSchema>;
