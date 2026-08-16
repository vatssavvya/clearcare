"use client";

import {
  AlertTriangle,
  ArrowDownToLine,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileClock,
  FileText,
  Footprints,
  HeartPulse,
  Home,
  Info,
  Link2,
  ListChecks,
  MapPinCheck,
  Pill,
  Printer,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  TestTube2,
  TriangleAlert,
  Utensils,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Brand } from "@/components/brand";
import { SourceDrawer } from "@/components/source-viewer/source-drawer";
import { TeachBack } from "@/components/teach-back/teach-back";
import type { CarePlan, Medication, Source, SourceLinkedItem } from "@/lib/schema/care-plan";

type SourceRequest = {
  title: string;
  interpretation: string;
  sources: Source[];
};

const medicationLabels: Record<Medication["action"], string> = {
  start: "Start",
  continue: "Continue",
  change: "Change",
  hold: "Hold",
  stop: "Stop",
  resume: "Resume",
  temporary: "Temporary",
  unclear: "Unclear",
};

const medicationOrder: Medication["action"][] = ["start", "change", "hold", "stop", "temporary", "continue", "resume", "unclear"];

const medicationTone: Record<Medication["action"], string> = {
  start: "border-[#98c9bd] bg-[#f1faf7] text-[#17665f]",
  continue: "border-[#ccd9d5] bg-white text-[#405765]",
  change: "border-[#e2c878] bg-[#fff9e9] text-[#79581b]",
  hold: "border-[#e3bc75] bg-[#fff4da] text-[#79501a]",
  stop: "border-[#dfaca6] bg-[#fff1ee] text-[#8e3934]",
  resume: "border-[#a7c8dd] bg-[#f0f7fb] text-[#315e7a]",
  temporary: "border-[#b8b8d9] bg-[#f7f5ff] text-[#555281]",
  unclear: "border-[#dfaca6] bg-[#fff1ee] text-[#8e3934]",
};

const sections = [
  ["overview", "At a glance"],
  ["actions", "Next actions"],
  ["medications", "Medications"],
  ["monitoring", "Monitoring"],
  ["follow-up", "Follow-up"],
  ["daily-care", "Daily care"],
  ["uncertainty", "Needs confirmation"],
  ["diagnoses", "Diagnoses"],
  ["teach-back", "Teach-back"],
] as const;

function SectionHeading({ eyebrow, title, body, icon: Icon }: { eyebrow: string; title: string; body?: string; icon: React.ComponentType<{ size?: number; className?: string }>; }) {
  return (
    <div className="mb-6 flex items-start gap-4 border-t border-[#cad8d3] pt-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#dceee8] text-[#16746f] shadow-[inset_0_0_0_1px_rgba(22,116,111,.08)]"><Icon aria-hidden="true" size={22} /></span>
      <div className="min-w-0 flex-1">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-face mt-1 text-2xl font-semibold text-[#0e2338] sm:text-3xl">{title}</h2>
        {body && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6b75]">{body}</p>}
      </div>
    </div>
  );
}

function SourceButton({ onClick, pages }: { onClick: () => void; pages?: number[] }) {
  return (
    <>
      <button className="source-link mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#b9cbc6] bg-white px-3.5 py-2 text-xs font-extrabold text-[#176760] hover:border-[#16746f] hover:bg-[#f3faf8]" type="button" onClick={onClick}>
      <Link2 aria-hidden="true" size={14} /> View source{pages?.length ? ` · p. ${pages.join(", ")}` : ""}
      </button>
      {pages?.length ? <span className="print-only source-print-ref">Source {pages.length > 1 ? "pages" : "page"}: {pages.join(", ")}</span> : null}
    </>
  );
}

function ItemCard({ item, onSource, pages, icon: Icon = CheckCircle2 }: { item: SourceLinkedItem; onSource: (item: SourceLinkedItem) => void; pages: number[]; icon?: React.ComponentType<{ size?: number; className?: string }>; }) {
  return (
    <article className="care-card print-card rounded-2xl border border-[#d6dfdc] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-[#16746f]" size={19} />
        <div>
          <h3 className="font-bold leading-6 text-[#1c3549]">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#53636f]">{item.detail}</p>
          <SourceButton onClick={() => onSource(item)} pages={pages} />
        </div>
      </div>
    </article>
  );
}

export function CarePlanDashboard({ plan, onReset, documentPreview }: { plan: CarePlan; onReset: () => void; documentPreview?: { url: string; mimeType: string } | null }) {
  const [sourceRequest, setSourceRequest] = useState<SourceRequest | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const sourcesById = useMemo(() => new Map(plan.sources.map((source) => [source.id, source])), [plan.sources]);
  const pageNumbers = (sourceIds: string[]) => Array.from(new Set(sourceIds.map((id) => sourcesById.get(id)?.pageNumber).filter((page): page is number => page !== undefined)));
  const openSource = (title: string, interpretation: string, sourceIds: string[]) => {
    const sources = sourceIds.map((id) => sourcesById.get(id)).filter((source): source is Source => source !== undefined);
    if (sources.length === 0) return;
    setSourceIndex(0);
    setSourceRequest({ title, interpretation, sources });
  };
  const openItem = (item: SourceLinkedItem) => openSource(item.title, item.plainLanguageExplanation, item.sourceIds);

  const groupedMeds = useMemo(
    () => medicationOrder.map((action) => [action, plan.medicationReconciliation.filter((medication) => medication.action === action)] as const).filter(([, items]) => items.length > 0),
    [plan.medicationReconciliation],
  );
  const stayContextItems = [
    plan.reasonForAdmission,
    plan.disposition,
    plan.codeStatus,
    ...plan.allergies,
    plan.hospitalCourseSummary,
    ...plan.procedures,
    ...plan.consultations,
  ].filter((item): item is SourceLinkedItem => item !== null);

  return (
    <div className="care-plan-canvas min-h-screen bg-[#f7f5ef]">
      <div className="print-only">
        <h1 className="text-2xl font-bold">ClearCare care plan</h1>
        <p>Source-linked summary of the uploaded discharge instructions</p>
        <p className="mt-3 font-bold">ClearCare organizes and explains your uploaded instructions. It does not provide medical advice or replace your healthcare professional.</p>
      </div>
      <header className="no-print sticky top-0 z-40 border-b border-[#cbd9d4] bg-[#f9f8f3]/92 shadow-[0_3px_20px_rgba(14,35,56,.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
          <Brand compact />
          <div className="flex items-center gap-1 sm:gap-2">
            <button aria-label="Print care plan" className="button-quiet" type="button" onClick={() => window.print()} data-testid="print-control"><Printer aria-hidden="true" size={17} /> <span className="hidden sm:inline">Print plan</span></button>
            <button aria-label="Reset and clear" className="button-secondary" type="button" onClick={onReset}><RotateCcw aria-hidden="true" size={17} /> <span className="hidden sm:inline">Reset</span></button>
          </div>
        </div>
      </header>

      <div className="no-print border-b border-[#c8d9d3] bg-[#e2f1ec]">
        <div className="mx-auto flex max-w-[1380px] items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#315b54] sm:px-7">
          <CheckCircle2 size={15} />
          {plan.analysisMetadata.mode === "deterministic_demo" ? "Comprehensive fictional sample · deterministic demo · no live AI call" : "Live document analysis · verify every item against its source"}
        </div>
      </div>

      <nav className="no-print sticky top-[71px] z-30 overflow-x-auto border-b border-[#dbe2df] bg-white/95 lg:hidden" aria-label="Care plan sections">
        <div className="flex min-w-max gap-1 px-3 py-2">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full px-3 py-2 text-xs font-bold text-[#53636e] hover:bg-[#e8f3ef] hover:text-[#176760]">{label}</a>)}
        </div>
      </nav>

      <main className="print-root mx-auto grid max-w-[1380px] gap-8 px-4 py-7 sm:px-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-10 xl:grid-cols-[230px_minmax(0,920px)_190px]">
        <aside className="no-print hidden lg:block">
          <nav className="sticky top-28 overflow-hidden rounded-2xl border border-[#cbd9d4] bg-white p-3 shadow-[0_12px_34px_rgba(14,35,56,.07)]" aria-label="Care plan sections">
            <div className="-mx-3 -mt-3 mb-3 bg-[#0e2338] px-6 py-5 text-white"><p className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#82d2c4]">Source-linked</p><p className="mt-1 text-sm font-bold">Your care plan</p></div>
            {sections.map(([id, label], index) => (
              <a key={id} href={`#${id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#53636e] hover:bg-[#eef6f3] hover:text-[#176760]">
                <span className="grid size-6 place-items-center rounded-full bg-[#edf1ef] text-[0.65rem] font-extrabold">{index + 1}</span>{label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-9">
          <section id="overview" className="plan-overview section-shell overflow-hidden rounded-[2rem] bg-[#0e2338] text-white shadow-[0_22px_60px_rgba(14,35,56,.18)]">
            <div className="grid gap-8 p-6 sm:p-9 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#8fd0c4]"><CheckCircle2 size={15} /> Discharge at a glance</p>
                <h1 className="display-face mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">{plan.plainLanguageSummary.title}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-[#d4e1e5] sm:text-base">{plan.plainLanguageSummary.body}</p>
                <button className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/10" type="button" onClick={() => openSource("Discharge at a glance", plan.plainLanguageSummary.body, plan.plainLanguageSummary.sourceIds)}><Link2 size={14} /> Review supporting sources</button>
                <span className="print-only source-print-ref">Source pages: {pageNumbers(plan.plainLanguageSummary.sourceIds).join(", ")}</span>
              </div>
              <div className="relative grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/8 px-3 py-4"><span className="clinical-number block text-2xl font-bold">{plan.documentMetadata.pageCount}</span><span className="mt-1 block text-[0.65rem] uppercase tracking-wider text-[#b8ccd2]">Pages</span></div>
                <div className="rounded-2xl bg-white/8 px-3 py-4"><span className="clinical-number block text-2xl font-bold">{plan.medicationReconciliation.length}</span><span className="mt-1 block text-[0.65rem] uppercase tracking-wider text-[#b8ccd2]">Meds</span></div>
                <div className="rounded-2xl bg-white/8 px-3 py-4"><span className="clinical-number block text-2xl font-bold">{plan.conflicts.length + plan.uncertainties.length}</span><span className="mt-1 block text-[0.65rem] uppercase tracking-wider text-[#b8ccd2]">Confirm</span></div>
              </div>
            </div>
            <div className="grid border-t border-white/10 bg-white/5 text-sm sm:grid-cols-3">
              <div className="p-4 sm:px-6"><span className="block text-xs text-[#9fb8c0]">Patient</span><span className="mt-1 block font-semibold">{plan.patientContext?.displayName ?? "Not found"}</span></div>
              <div className="border-white/10 p-4 sm:border-l sm:px-6"><span className="block text-xs text-[#9fb8c0]">Facility</span><span className="mt-1 block font-semibold">{plan.encounterMetadata?.facility ?? "Not found"}</span></div>
              <div className="border-white/10 p-4 sm:border-l sm:px-6"><span className="block text-xs text-[#9fb8c0]">Discharge date</span><span className="mt-1 block font-semibold">{plan.encounterMetadata?.dischargeDate ?? "Not found"}</span></div>
            </div>
          </section>

          <section id="actions" className="section-shell">
            <SectionHeading eyebrow="Explicit timing" title="What the document says happens next" body="These groups reflect only time windows stated in the source. They are not medical urgency rankings." icon={Clock3} />
            <div className="grid gap-4 md:grid-cols-2">
              {plan.timelineEvents.map((event) => (
                <article key={event.id} className="print-card rounded-2xl border border-[#d6dfdc] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-[#e3f0ec] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#176760]">{event.bucket.replaceAll("_", " ")}</span>
                    <span className="clinical-number text-xs font-bold text-[#6a7881]">{event.timeWindowAsWritten}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#1b3549]">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#596873]">{event.plainLanguageExplanation}</p>
                  <SourceButton onClick={() => openSource(event.title, event.plainLanguageExplanation, event.sourceIds)} pages={pageNumbers(event.sourceIds)} />
                </article>
              ))}
            </div>
          </section>

          <section id="medications" className="section-shell">
            <SectionHeading eyebrow="Medication reconciliation" title="What changed with medications" body="Actions, names, doses, units, routes, frequency, and duration are shown only as written. Conflicts stay unresolved." icon={Pill} />
            <div className="space-y-6">
              {groupedMeds.map(([action, medications]) => (
                <div key={action}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.11em] text-[#30495a]">{medicationLabels[action]}</h3>
                    <span className="rounded-full bg-[#e8edeb] px-2.5 py-1 text-xs font-bold text-[#63717a]">{medications.length}</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {medications.map((medication) => (
                      <article key={medication.id} className={`print-card rounded-2xl border p-5 ${medicationTone[medication.action]}`} data-medication-action={medication.action}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em]">{medicationLabels[medication.action]}</p>
                            <h4 className="mt-2 text-lg font-extrabold text-[#183247]">{medication.nameAsWritten}</h4>
                          </div>
                          {medication.conflictIds.length > 0 && <span className="flex items-center gap-1 rounded-full bg-[#9b2f2f] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase text-white"><TriangleAlert size={12} /> Conflict</span>}
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                          {[ ["Dose", medication.dose && `${medication.dose}${medication.unit ? ` ${medication.unit}` : ""}`], ["Route", medication.route], ["Frequency", medication.frequency], ["Duration", medication.duration] ].map(([label, value]) => (
                            <div key={label}><dt className="text-xs font-semibold opacity-70">{label}</dt><dd className="clinical-number mt-0.5 font-bold text-[#233d4f]">{value ?? "Not stated"}</dd></div>
                          ))}
                        </dl>
                        {medication.conditionalText && <p className="mt-4 rounded-xl bg-white/70 p-3 text-xs font-semibold leading-5 text-[#465664]">{medication.conditionalText}</p>}
                        <SourceButton onClick={() => openSource(medication.title, medication.plainLanguageExplanation, medication.sourceIds)} pages={pageNumbers(medication.sourceIds)} />
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="monitoring" className="section-shell">
            <SectionHeading eyebrow="Exact measures" title="Monitoring and thresholds" body="Comparison signs, numbers, units, and relative time windows are preserved exactly." icon={HeartPulse} />
            <div className="grid gap-4 md:grid-cols-2">
              {plan.monitoringTasks.map((task) => (
                <article key={task.id} className="print-card rounded-3xl border border-[#cfdcd8] bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4"><h3 className="text-lg font-bold text-[#173349]">{task.title}</h3><span className="rounded-full bg-[#e3f0ec] px-3 py-1 text-xs font-bold text-[#176760]">{task.timingAsWritten ?? "Timing not stated"}</span></div>
                  {task.threshold && <div className="clinical-number mt-5 rounded-2xl bg-[#0e2338] p-5 text-white"><span className="block text-xs uppercase tracking-wider text-[#a9c0c7]">Document threshold</span><span className="mt-2 block text-2xl font-bold">{task.threshold.comparison} {task.threshold.value}{task.threshold.value.toLowerCase().includes(task.threshold.unit.toLowerCase()) ? "" : ` ${task.threshold.unit}`}</span></div>}
                  <p className="mt-4 text-sm leading-6 text-[#566671]">{task.actionAsWritten}</p>
                  <SourceButton onClick={() => openSource(task.title, task.plainLanguageExplanation, task.sourceIds)} pages={pageNumbers(task.sourceIds)} />
                </article>
              ))}
            </div>
          </section>

          <section id="follow-up" className="section-shell">
            <SectionHeading eyebrow="Scheduling checklist" title="Follow-up" body="Relative windows remain relative; ClearCare does not turn them into calendar dates." icon={CalendarClock} />
            <div className="overflow-hidden rounded-3xl border border-[#d4dedb] bg-white shadow-sm">
              {plan.followUps.map((followUp, index) => (
                <article key={followUp.id} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${index > 0 ? "border-t border-[#e0e6e3]" : ""}`}>
                  <div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f3ef] text-[#16746f]"><Stethoscope size={19} /></span><div><h3 className="font-bold text-[#183349]">{followUp.specialtyOrService}</h3><p className="clinical-number mt-1 text-sm font-semibold text-[#5b6973]">{followUp.timingAsWritten}</p></div></div>
                  <SourceButton onClick={() => openSource(followUp.title, followUp.plainLanguageExplanation, followUp.sourceIds)} pages={pageNumbers(followUp.sourceIds)} />
                </article>
              ))}
            </div>
          </section>

          <section id="daily-care" className="section-shell">
            <SectionHeading eyebrow="At home" title="Diet, activity, services, and pending items" icon={Home} />
            <div className="grid gap-4 md:grid-cols-2">
              {plan.dietAndFluidInstructions.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={Utensils} />)}
              {plan.restrictions.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={Footprints} />)}
              {plan.homeServices.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={Home} />)}
              {plan.equipment.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={MapPinCheck} />)}
              {plan.pendingTests.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={TestTube2} />)}
              {plan.patientEducation.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={ClipboardCheck} />)}
            </div>
          </section>

          <section className="section-shell">
            <SectionHeading eyebrow="From the document" title="Important warning signs" body="These signs and actions are copied or conservatively simplified from the source. ClearCare does not decide whether a symptom is an emergency." icon={AlertTriangle} />
            <div className="space-y-3">
              {plan.warningSigns.map((warning) => (
                <article key={warning.id} className="print-card rounded-2xl border border-[#e1b2ad] bg-[#fff2ef] p-5 sm:p-6">
                  <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-[#9b2f2f]" size={21} /><div><h3 className="font-bold text-[#6f2e2b]">{warning.title}</h3><p className="mt-2 text-sm leading-6 text-[#664643]">{warning.signAsWritten}</p><p className="mt-3 text-sm font-bold text-[#7f302d]">{warning.sourceActionAsWritten}</p><SourceButton onClick={() => openSource(warning.title, warning.plainLanguageExplanation, warning.sourceIds)} pages={pageNumbers(warning.sourceIds)} /></div></div>
                </article>
              ))}
            </div>
            <p className="mt-4 rounded-2xl border border-[#d7dfdc] bg-white p-4 text-sm leading-6 text-[#4f606b]">If you believe you are experiencing an emergency, contact local emergency services. ClearCare does not decide whether a particular symptom qualifies.</p>
          </section>

          <section id="uncertainty" className="section-shell">
            <SectionHeading eyebrow="Do not guess" title="Unclear or conflicting instructions" body="These items need confirmation. ClearCare keeps the uncertainty visible instead of choosing a value or filling in missing content." icon={ShieldAlert} />
            <div className="space-y-4">
              {plan.conflicts.map((conflict) => (
                <article key={conflict.id} className="print-card rounded-3xl border border-[#dfaba5] bg-[#fff3f0] p-6" data-testid="conflict-card">
                  <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f5d9d5] text-[#9b2f2f]"><TriangleAlert size={22} /></span><div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#9b2f2f]">Unresolved conflict</p><h3 className="mt-2 text-lg font-bold text-[#602d2a]">{conflict.title}</h3><p className="mt-2 text-sm leading-6 text-[#6d504d]">{conflict.description}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{conflict.valuesAsWritten.map((value) => <div key={value} className="clinical-number rounded-xl border border-[#e0b8b3] bg-white p-3 text-sm font-bold text-[#5a3735]">{value}</div>)}</div><SourceButton onClick={() => openSource(conflict.title, conflict.description, conflict.sourceIds)} pages={pageNumbers(conflict.sourceIds)} /></div></div>
                </article>
              ))}
              {plan.uncertainties.map((item) => (
                <article key={item.id} className="print-card rounded-3xl border border-[#e4c97e] bg-[#fff7df] p-6">
                  <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f9e7b3] text-[#8b6018]"><CircleHelp size={22} /></span><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8b6018]">{item.reason.replaceAll("_", " ")}</p><h3 className="mt-2 text-lg font-bold text-[#594519]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#6a5d3f]">{item.detail}</p><p className="mt-3 text-sm font-bold text-[#6a501d]">{item.confirmationPrompt}</p><SourceButton onClick={() => openSource(item.title, item.plainLanguageExplanation, item.sourceIds)} pages={pageNumbers(item.sourceIds)} /></div></div>
                </article>
              ))}
            </div>
          </section>

          {(plan.primaryDiagnoses.length > 0 || plan.secondaryDiagnoses.length > 0) && (
            <section id="diagnoses" className="section-shell">
              <SectionHeading eyebrow="Copied from the document" title="Diagnoses" body="These terms are background context copied from the source. ClearCare does not interpret or diagnose them." icon={Stethoscope} />
              {plan.primaryDiagnoses.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.11em] text-[#30495a]">Primary diagnoses</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.primaryDiagnoses.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={Stethoscope} />)}
                  </div>
                </div>
              )}
              {plan.secondaryDiagnoses.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.11em] text-[#30495a]">Secondary and comorbid diagnoses</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {plan.secondaryDiagnoses.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={FileText} />)}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="section-shell">
            <details className="no-print rounded-3xl border border-[#d6dfdc] bg-white p-6 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4"><span className="flex items-center gap-3"><Info className="text-[#16746f]" size={22} /><span><span className="eyebrow block">Background context</span><span className="mt-1 block text-xl font-bold text-[#173349]">About the hospital stay</span></span></span><ChevronDown size={21} /></summary>
              <div className="mt-6 border-t border-[#e0e6e3] pt-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {plan.reasonForAdmission && <ItemCard item={plan.reasonForAdmission} onSource={openItem} pages={pageNumbers(plan.reasonForAdmission.sourceIds)} icon={FileText} />}
                  {plan.disposition && <ItemCard item={plan.disposition} onSource={openItem} pages={pageNumbers(plan.disposition.sourceIds)} icon={Home} />}
                  {plan.codeStatus && <ItemCard item={plan.codeStatus} onSource={openItem} pages={pageNumbers(plan.codeStatus.sourceIds)} icon={ShieldAlert} />}
                  {plan.allergies.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={AlertTriangle} />)}
                </div>
                {plan.hospitalCourseSummary && <div className="mt-6"><p className="leading-7 text-[#52636e]">{plan.hospitalCourseSummary.detail}</p><SourceButton onClick={() => openItem(plan.hospitalCourseSummary!)} pages={pageNumbers(plan.hospitalCourseSummary.sourceIds)} /></div>}
                <div className="mt-6 grid gap-3 md:grid-cols-2">{plan.procedures.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={FileClock} />)}{plan.consultations.map((item) => <ItemCard key={item.id} item={item} onSource={openItem} pages={pageNumbers(item.sourceIds)} icon={Stethoscope} />)}</div>
              </div>
            </details>
            <div className="print-only">
              <h2 className="text-xl font-bold">About the hospital stay</h2>
              <p className="mt-1 text-sm">Background copied from the discharge document; these are not new instructions for home.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {stayContextItems.map((item) => (
                  <article key={item.id} className="print-card rounded-2xl border border-[#d6dfdc] p-4">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm">{item.detail}</p>
                    <span className="source-print-ref">Source {pageNumbers(item.sourceIds).length > 1 ? "pages" : "page"}: {pageNumbers(item.sourceIds).join(", ")}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section-shell">
            <SectionHeading eyebrow="Terms in this document" title="Difficult terms explained" body="Definitions are limited to the synthetic document’s own glossary." icon={FileText} />
            <dl className="grid gap-3 md:grid-cols-3">
              {plan.glossaryTerms.map((term) => <div key={term.term} className="print-card rounded-2xl border border-[#d6dfdc] bg-white p-5"><dt className="font-bold text-[#173349]">{term.term}</dt><dd className="mt-2 text-sm leading-6 text-[#596873]">{term.explanation}</dd><SourceButton onClick={() => openSource(term.term, term.explanation, term.sourceIds)} pages={pageNumbers(term.sourceIds)} /></div>)}
            </dl>
          </section>

          <section id="teach-back" className="section-shell pb-12" data-print-hidden="true">
            <SectionHeading eyebrow="Check understanding" title="A short teach-back" body="Questions are generated deterministically from validated care-plan fields and scored only in your browser." icon={ListChecks} />
            <TeachBack questions={plan.teachBackQuestions} onOpenSource={openSource} />
          </section>
        </div>

        <aside className="no-print hidden xl:block">
          <div className="sticky top-28 space-y-3">
            <div className="overflow-hidden rounded-2xl border border-[#cbd9d4] bg-white shadow-[0_10px_30px_rgba(14,35,56,.06)]"><div className="bg-[#0e2338] p-4 text-white"><ArrowDownToLine className="mb-3 text-[#82d2c4]" size={20} /><span className="block text-xs font-bold">Every page checked</span></div><span className="block p-4 text-xs leading-5 text-[#5b6a74]">{plan.pageCoverage.length} of {plan.documentMetadata.pageCount} pages have coverage records.</span></div>
            <div className="rounded-2xl border border-[#e3cf9e] bg-[#fff5dc] p-4 text-xs leading-5 text-[#66583d]"><ShieldAlert className="mb-3 text-[#8b6018]" size={20} /><span className="font-bold text-[#594519]">Always verify</span><span className="mt-1 block">Check important instructions against the source and your healthcare professional.</span></div>
          </div>
        </aside>
      </main>

      <footer className="no-print border-t border-[#d7dfdc] bg-white px-5 py-8 text-xs leading-5 text-[#667580]">
        <div className="mx-auto max-w-[1120px]">ClearCare organizes and explains your uploaded instructions. It does not provide medical advice or replace your healthcare professional.</div>
      </footer>

      {sourceRequest && (
        <SourceDrawer
          title={sourceRequest.title}
          interpretation={sourceRequest.interpretation}
          sources={sourceRequest.sources}
          activeIndex={sourceIndex}
          synthetic={plan.documentMetadata.synthetic}
          documentPreview={documentPreview}
          onIndexChange={setSourceIndex}
          onClose={() => setSourceRequest(null)}
        />
      )}
    </div>
  );
}
