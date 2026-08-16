"use client";

import { Check, FileSearch, Link2, ListChecks, LoaderCircle, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export const ANALYSIS_STAGES = [
  { label: "Reading pages", detail: "Preserving page boundaries and source text", icon: FileSearch },
  { label: "Checking instructions", detail: "Keeping numbers, timing, and medication actions exact", icon: ShieldCheck },
  { label: "Linking sources", detail: "Connecting each important item to its evidence", icon: Link2 },
  { label: "Building your care plan", detail: "Organizing only the actions the document states", icon: ListChecks },
] as const;

export function AnalysisProgress({ activeStage, mode, onCancel }: { activeStage: number; mode: "demo" | "live"; onCancel: () => void }) {
  return (
    <main className="analysis-canvas min-h-screen px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between"><Brand /><span className="hidden text-xs font-extrabold uppercase tracking-[0.14em] text-[#6a7b84] sm:block">Evidence-first analysis</span></div>
      <div className="mx-auto mt-8 grid max-w-[1120px] overflow-hidden rounded-[2.4rem] border border-[#c8d8d2] bg-white shadow-[0_35px_100px_rgba(14,35,56,.15)] lg:grid-cols-[.82fr_1.18fr]">
        <div className="relative overflow-hidden bg-[#0e2338] p-7 text-white sm:p-10 lg:min-h-[640px] lg:p-12">
          <div className="analysis-orbit" aria-hidden="true" />
          <p className="relative text-xs font-extrabold uppercase tracking-[0.14em] text-[#83d2c5]">Document → verified plan</p>
          <h1 className="display-face relative mt-5 max-w-md text-4xl font-semibold leading-[1.05] sm:text-5xl">Turning the document into a careful plan.</h1>
          <p className="relative mt-6 max-w-sm leading-7 text-[#c9dade]">ClearCare moves one evidence checkpoint at a time. Nothing is hidden behind a made-up percentage.</p>
          <div className="relative mt-10 hidden lg:block">
            <div className="h-px bg-gradient-to-r from-[#79cabe] via-[#79cabe] to-transparent" />
            <div className="mt-4 flex justify-between pr-8 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-[#9fb8c0]"><span>Pages</span><span>Checks</span><span>Sources</span><span>Plan</span></div>
          </div>
          <div className="relative mt-10 rounded-2xl border border-white/12 bg-white/7 p-4 text-sm leading-6 text-[#d9e6e8]" role="status" aria-live="polite">
            {mode === "demo" ? "Preparing the deterministic fictional sample—no live AI call." : "Analyzing this document in request-scoped memory."}
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <p className="eyebrow">Analysis in progress</p>
          <h2 className="display-face mt-3 text-3xl font-semibold text-[#0e2338] sm:text-4xl">Four visible checkpoints. No false precision.</h2>
          <ol className="mt-8 space-y-3">
            {ANALYSIS_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const done = index < activeStage;
              const active = index === activeStage;
              return (
                <li key={stage.label} className={`grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-2xl border p-4 transition ${active ? "border-[#72aaa1] bg-[#f0f8f5] shadow-[0_10px_30px_rgba(22,116,111,.09)]" : done ? "border-[#d0e3dd] bg-white" : "border-[#e1e6e4] bg-[#fbfcfa]"}`}>
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${done ? "bg-[#16746f] text-white" : active ? "bg-[#dceee9] text-[#16746f]" : "bg-[#eef1ef] text-[#829097]"}`}>
                    {done ? <Check aria-hidden="true" size={21} /> : active ? <LoaderCircle className="animate-spin" aria-hidden="true" size={21} /> : <Icon aria-hidden="true" size={21} />}
                  </span>
                  <span><span className="block font-extrabold text-[#1c3549]">{stage.label}</span><span className="mt-1 block text-sm leading-5 text-[#63717b]">{stage.detail}</span></span>
                  <span className="clinical-number text-xs font-bold text-[#9aa6aa]">0{index + 1}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#dfe6e3] pt-6"><p className="text-xs leading-5 text-[#687781]">You can safely cancel and clear the request at any time.</p><button className="button-secondary shrink-0" type="button" onClick={onCancel}>Cancel and clear</button></div>
        </div>
      </div>
    </main>
  );
}
