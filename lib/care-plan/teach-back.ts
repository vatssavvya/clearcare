import type { CarePlan, TeachBackQuestion } from "@/lib/schema/care-plan";

type QuizInput = Omit<CarePlan, "teachBackQuestions" | "analysisMetadata">;

function otherWindows(plan: QuizInput, correct: string) {
  const windows = plan.followUps.map((followUp) => followUp.timingAsWritten).filter((window) => window !== correct);
  return [windows[0] ?? "No time window is stated", windows[1] ?? "At a specific clock time"];
}

export function generateTeachBackQuestions(plan: QuizInput): TeachBackQuestion[] {
  const questions: TeachBackQuestion[] = [];
  const thresholdTask = plan.monitoringTasks.find((task) => task.threshold !== null);
  if (thresholdTask?.threshold) {
    const correct = `${thresholdTask.threshold.comparison} ${thresholdTask.threshold.value}${thresholdTask.threshold.value.toLowerCase().includes(thresholdTask.threshold.unit.toLowerCase()) ? "" : ` ${thresholdTask.threshold.unit}`}`;
    questions.push({
      id: "quiz-monitoring-threshold",
      prompt: `Which ${thresholdTask.measurement} threshold is written in the document?`,
      options: [correct, "No threshold is stated", "A threshold inferred by ClearCare"],
      correctOptionIndex: 0,
      correction: `The source lists ${correct}.`,
      sourceIds: thresholdTask.sourceIds,
      concept: "monitoring",
    });
  }
  const followUp = plan.followUps[0];
  if (followUp) {
    questions.push({
      id: "quiz-follow-up-window",
      prompt: `What time window does the document give for ${followUp.specialtyOrService}?`,
      options: [followUp.timingAsWritten, ...otherWindows(plan, followUp.timingAsWritten)],
      correctOptionIndex: 0,
      correction: `The source says ${followUp.timingAsWritten}.`,
      sourceIds: followUp.sourceIds,
      concept: "follow_up",
    });
  }
  const restriction = plan.restrictions[0];
  if (restriction) {
    questions.push({
      id: "quiz-restriction",
      prompt: "Which restriction is explicitly written in the document?",
      options: [restriction.detail, "A restriction selected from general medical knowledge", "No restriction is shown"],
      correctOptionIndex: 0,
      correction: `The source says: ${restriction.detail}`,
      sourceIds: restriction.sourceIds,
      concept: "restriction",
    });
  }
  const medication = plan.medicationReconciliation.find((item) => item.frequency !== null && item.conflictIds.length === 0);
  if (questions.length < 3 && medication) {
    questions.push({
      id: "quiz-medication-frequency",
      prompt: `What frequency is written for ${medication.nameAsWritten}?`,
      options: [medication.frequency!, "A specific clock time chosen by ClearCare", "No frequency is stated"],
      correctOptionIndex: 0,
      correction: `The source lists ${medication.frequency}.`,
      sourceIds: medication.sourceIds,
      concept: "medication",
    });
  }
  const warning = plan.warningSigns[0];
  if (questions.length < 3 && warning) {
    questions.push({
      id: "quiz-warning-source",
      prompt: "Which warning instruction is stated by the document?",
      options: [warning.sourceActionAsWritten, "Let ClearCare decide whether this is an emergency", "Wait for ClearCare to recommend treatment"],
      correctOptionIndex: 0,
      correction: `The source says: ${warning.sourceActionAsWritten}`,
      sourceIds: warning.sourceIds,
      concept: "warning",
    });
  }
  while (questions.length < 3) {
    const fallbackId = `quiz-source-check-${questions.length + 1}`;
    questions.push({
      id: fallbackId,
      prompt: "Which statement is supported by the source-linked care plan?",
      options: [plan.plainLanguageSummary.body, "ClearCare added a treatment recommendation", "ClearCare resolved a missing value"],
      correctOptionIndex: 0,
      correction: "The supported statement is the one linked to the original source.",
      sourceIds: plan.plainLanguageSummary.sourceIds,
      concept: "warning",
    });
  }
  return questions.slice(0, 4);
}
