"use client";

import { CheckCircle2, ChevronRight, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import type { TeachBackQuestion } from "@/lib/schema/care-plan";

export function TeachBack({
  questions,
  onOpenSource,
}: {
  questions: TeachBackQuestion[];
  onOpenSource: (title: string, interpretation: string, sourceIds: string[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const question = questions[index];
  const correct = selected !== null && selected === question?.correctOptionIndex;
  const incorrect = selected !== null && !correct;

  const resetQuiz = () => {
    setIndex(0);
    setSelected(null);
    setMissed([]);
    setComplete(false);
  };

  if (complete) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-[#9fcfc3] bg-[#0e2338] text-white shadow-[0_24px_60px_rgba(14,35,56,.16)]" data-testid="quiz-complete">
        <div className="grid gap-8 p-7 sm:grid-cols-[auto_1fr] sm:p-10">
          <span className="grid size-16 place-items-center rounded-2xl bg-[#1b8c83] text-white"><CheckCircle2 aria-hidden="true" size={32} /></span>
          <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#82d2c4]">Teach-back complete</p><h3 className="display-face mt-3 text-3xl font-semibold sm:text-4xl">You checked all {questions.length} key instructions.</h3><p className="mt-4 max-w-xl leading-7 text-[#ccdcdf]">{missed.length > 0 ? `You revisited ${missed.length} concept${missed.length === 1 ? "" : "s"} before finishing. Source links remain available throughout the plan.` : "Every answer matched the source-linked care plan on the first try."}</p><button className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold hover:bg-white/10" type="button" onClick={resetQuiz}><RotateCcw size={17} /> Review again</button></div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#c9d8d3] bg-white shadow-[0_20px_55px_rgba(14,35,56,.09)]">
      <div className="grid md:grid-cols-[180px_1fr]">
        <div className="relative overflow-hidden bg-[#0e2338] p-6 text-white sm:p-8">
          <Sparkles className="text-[#82d2c4]" size={22} />
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.13em] text-[#82d2c4]">Question</p>
          <p className="clinical-number display-face mt-1 text-6xl font-semibold">{String(index + 1).padStart(2, "0")}</p>
          <p className="mt-1 text-sm text-[#a9c0c7]">of {String(questions.length).padStart(2, "0")}</p>
          <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/12" aria-hidden="true"><div className="h-full rounded-full bg-[#64c1b4] transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
          <p className="mt-4 text-xs font-semibold capitalize text-[#cbdadd]">{question.concept.replace("_", " ")}</p>
        </div>
        <div className="p-5 sm:p-8">
      <h3 className="text-xl font-extrabold leading-8 text-[#163249] sm:text-2xl">{question.prompt}</h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer choices">
        {question.options.map((option, optionIndex) => {
          const chosen = selected === optionIndex;
          const isCorrect = optionIndex === question.correctOptionIndex;
          const stateClass = selected === null
            ? "border-[#d6dfdc] hover:border-[#68a69d] hover:bg-[#f5fbf9]"
            : chosen && isCorrect
              ? "border-[#4a958a] bg-[#e6f4ef]"
              : chosen
                ? "border-[#c97066] bg-[#fff1ee]"
                : "border-[#e2e7e5] opacity-65";
          return (
            <button
              key={option}
              className={`flex min-h-16 items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold text-[#294052] transition ${stateClass}`}
              type="button"
              disabled={selected !== null}
              onClick={() => {
                setSelected(optionIndex);
                if (!isCorrect && !missed.includes(question.id)) setMissed([...missed, question.id]);
              }}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs ${chosen ? "border-current" : "border-[#b9c5c1]"}`}>
                {chosen && isCorrect ? <CheckCircle2 size={17} /> : chosen ? <XCircle size={17} /> : String.fromCharCode(65 + optionIndex)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {incorrect && (
        <div className="mt-6 rounded-2xl border border-[#ecd394] bg-[#fff6de] p-5" role="alert" data-testid="quiz-correction">
          <p className="font-bold text-[#5d4619]">Let’s check that against the source.</p>
          <p className="mt-2 text-sm leading-6 text-[#695b3d]">{question.correction}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="button-secondary" type="button" onClick={() => onOpenSource("Teach-back source", question.correction, question.sourceIds)}>View source</button>
            <button className="button-primary" type="button" onClick={() => setSelected(null)}>Try again</button>
          </div>
        </div>
      )}

      {correct && (
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#b8d8ce] bg-[#eaf6f2] p-5 sm:flex-row sm:items-center" role="status">
          <p className="flex items-center gap-2 font-bold text-[#245d55]"><CheckCircle2 size={19} /> That matches the source-linked plan.</p>
          <button
            className="button-primary"
            type="button"
            onClick={() => {
              if (index === questions.length - 1) setComplete(true);
              else { setIndex(index + 1); setSelected(null); }
            }}
          >
            {index === questions.length - 1 ? "Finish check" : "Next question"} <ChevronRight size={17} />
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
