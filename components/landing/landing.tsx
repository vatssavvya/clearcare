"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  Link2,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Brand } from "@/components/brand";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];

function validateSelection(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_EXTENSIONS.includes(extension)) return "Choose a PDF, PNG, JPG, or JPEG file.";
  if (file.size === 0) return "That file is empty or unreadable.";
  if (file.size > MAX_BYTES) return "That file is larger than the 10 MB limit.";
  const expectedMime = extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : "image/jpeg";
  if (file.type && file.type !== expectedMime) return "The file type does not match its extension. Choose the original PDF or image.";
  return null;
}

type LandingProps = {
  selectedFile: File | null;
  error: string | null;
  onFileSelected: (file: File | null, error: string | null) => void;
  onAnalyze: () => void;
  onDemo: () => void;
};

export function Landing({ selectedFile, error, onFileSelected, onAnalyze, onDemo }: LandingProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (file?: File) => {
    if (!file) return;
    const validationError = validateSelection(file);
    if (validationError && inputRef.current) inputRef.current.value = "";
    onFileSelected(validationError ? null : file, validationError);
  };

  return (
    <div className="landing-canvas min-h-screen overflow-hidden">
      <header className="relative z-20 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <nav className="flex items-center gap-1" aria-label="Landing navigation">
          <a className="button-quiet hidden text-sm sm:inline-flex" href="#how-it-works">How it works</a>
          <a className="button-secondary hidden text-sm md:inline-flex" href="#start">Start with a document</a>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto max-w-[1320px] px-5 pb-8 pt-6 sm:px-8 lg:px-12 lg:pb-12 lg:pt-12">
          <div className="grid items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-14">
            <div className="relative z-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b8d4cc] bg-[#f8fbf8] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#176760] shadow-sm">
                <Sparkles aria-hidden="true" size={15} /> Clarity after discharge
              </div>
              <h1 className="display-face max-w-[760px] text-[clamp(3.35rem,7.2vw,6.8rem)] font-semibold leading-[0.88] text-[#0e2338]">
                Leave with a plan, <span className="relative whitespace-nowrap text-[#16746f]">not a pile<span className="hero-underline" aria-hidden="true" /></span> of pages.
              </h1>
              <p className="mt-8 max-w-[650px] text-lg leading-8 text-[#4d606d] sm:text-xl">
                ClearCare turns dense discharge paperwork into prioritized next steps, with every important detail connected to the exact page it came from.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="button-primary min-w-52" type="button" onClick={onDemo}>
                  Try the Comprehensive Sample <ArrowRight aria-hidden="true" size={18} />
                </button>
                <a className="button-secondary min-w-44" href="#start">Use my document <ArrowDown aria-hidden="true" size={17} /></a>
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-[#ccd8d4] border-y border-[#ccd8d4] py-4 text-xs font-bold text-[#425765] sm:text-sm">
                <span className="flex items-center gap-2 pr-3"><CheckCircle2 className="shrink-0 text-[#16746f]" size={18} /> Source-linked</span>
                <span className="flex items-center gap-2 px-3"><CheckCircle2 className="shrink-0 text-[#16746f]" size={18} /> Uncertainty-aware</span>
                <span className="flex items-center gap-2 pl-3"><CheckCircle2 className="shrink-0 text-[#16746f]" size={18} /> Advice-free</span>
              </div>
            </div>

            <div className="hero-visual relative min-h-[390px] sm:min-h-[510px]">
              <div className="absolute inset-3 overflow-hidden rounded-[2.4rem] border border-[#c6d8d2] bg-[#e9f2ee] shadow-[0_35px_90px_rgba(20,54,64,.16)] sm:inset-6">
                <Image
                  src="/brand/clearcare-document-to-plan.png"
                  alt="A discharge document becoming a verified, source-linked care plan"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0e2338]/35 to-transparent" aria-hidden="true" />
              </div>
              <div className="absolute left-0 top-10 rounded-2xl border border-white/70 bg-white/92 p-4 shadow-[0_15px_45px_rgba(14,35,56,.15)] backdrop-blur sm:left-1 sm:top-20">
                <p className="eyebrow">Step 01</p>
                <p className="mt-1 text-sm font-bold text-[#173349]">Read every page</p>
              </div>
              <div className="absolute bottom-3 right-0 max-w-[240px] rounded-2xl border border-[#9bc8bd] bg-[#0e2338]/94 p-4 text-white shadow-[0_15px_45px_rgba(14,35,56,.22)] backdrop-blur sm:bottom-8 sm:right-1">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#86d3c5]"><Link2 size={14} /> Evidence attached</p>
                <p className="mt-2 text-sm leading-5 text-[#e5eff1]">Each plan item points back to its original page and excerpt.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="start" className="relative z-10 mx-auto max-w-[1180px] scroll-mt-8 px-5 pb-24 pt-8 sm:px-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-[#bed0ca] bg-white shadow-[0_30px_90px_rgba(14,35,56,.12)] lg:grid-cols-[1fr_360px]">
            <div
              className={`relative p-6 transition sm:p-8 ${dragging ? "bg-[#ecf7f4]" : error ? "bg-[#fff8f6]" : "bg-white"}`}
              onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
              onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files[0]); }}
            >
              <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                aria-describedby="file-guidance file-error"
                onChange={(event) => accept(event.target.files?.[0])}
              />
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e1f0eb] text-[#16746f]"><UploadCloud aria-hidden="true" size={24} /></span>
                  <div>
                    <p className="eyebrow">Start here</p>
                    <h2 className="display-face mt-1 text-2xl font-semibold text-[#0e2338]">{dragging ? "Drop your document here" : selectedFile ? "Document ready to check" : "Add discharge instructions"}</h2>
                    {!selectedFile && <p id="file-guidance" className="mt-2 text-sm text-[#667580]">PDF, PNG, JPG, or JPEG · up to 10 MB · PDFs up to 25 pages</p>}
                  </div>
                </div>
                {!selectedFile && <button className="button-secondary shrink-0" type="button" onClick={() => inputRef.current?.click()}>Choose a file</button>}
              </div>

              {selectedFile && (
                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#c4d8d1] bg-[#f4faf7] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex min-w-0 items-center gap-3">
                    <FileText className="shrink-0 text-[#16746f]" size={22} />
                    <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-[#20384b]">{selectedFile.name.split(/[\\/]/).pop()}</span><span className="text-xs text-[#687783]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ready to check</span></span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Remove selected document" className="grid size-11 place-items-center rounded-full text-[#5a6976] hover:bg-white" onClick={() => { if (inputRef.current) inputRef.current.value = ""; onFileSelected(null, null); }}><X size={18} /></button>
                    <button className="button-primary" type="button" onClick={onAnalyze}>Analyze this document <ArrowRight aria-hidden="true" size={18} /></button>
                  </div>
                </div>
              )}
              {error && <p id="file-error" role="alert" className="mt-4 text-sm font-semibold text-[#9b2f2f]">{error}</p>}
            </div>

            <button className="group flex items-center justify-between gap-4 bg-[#0e2338] p-6 text-left text-white transition hover:bg-[#173a56] sm:p-8" type="button" onClick={onDemo}>
              <span>
                <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#83d2c5]"><FileCheck2 size={15} /> No setup needed</span>
                <span className="mt-2 block text-lg font-bold">Explore the sample</span>
                <span className="mt-1 block text-xs leading-5 text-[#c8d9df]">4 fictional pages · deterministic · no network call</span>
              </span>
              <ArrowRight className="shrink-0 transition group-hover:translate-x-1" aria-hidden="true" size={22} />
            </button>
          </div>
          <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-[#5f6f79]"><LockKeyhole className="mt-0.5 shrink-0 text-[#16746f]" aria-hidden="true" size={15} /> Live documents are processed for this request only and are not saved by ClearCare.</p>
        </section>

        <section id="how-it-works" className="journey-section border-y border-[#cfdad6] py-24">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="eyebrow">A careful transformation</p>
                <h2 className="display-face mt-4 text-4xl font-semibold leading-tight text-[#0e2338] sm:text-5xl">The simplification is only as useful as the trail behind it.</h2>
                <p className="mt-6 max-w-md leading-7 text-[#536570]">ClearCare keeps the source close, so a plain-language plan never becomes a detached summary.</p>
              </div>
              <ol className="relative space-y-4">
                {[
                  { icon: ScanSearch, n: "01", title: "Read the whole document", body: "Page boundaries, section context, continuation lines, and medication lists stay connected." },
                  { icon: ShieldCheck, n: "02", title: "Validate before simplifying", body: "Numbers, units, timing, conflicts, and missing information are checked and never silently filled in." },
                  { icon: FileCheck2, n: "03", title: "Build a source-linked plan", body: "Explicit actions come first, with original excerpts and a short teach-back check one tap away." },
                ].map((step) => (
                  <li key={step.n} className="journey-step grid grid-cols-[48px_1fr] gap-4 rounded-[1.5rem] border border-[#ccd9d4] bg-[#fbfcf9]/90 p-5 sm:grid-cols-[64px_1fr_auto] sm:items-center sm:p-6">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#e0f0eb] text-[#16746f]"><step.icon aria-hidden="true" size={23} /></span>
                    <div><h3 className="text-lg font-extrabold text-[#153149]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#586a74]">{step.body}</p></div>
                    <span className="hidden text-4xl font-semibold text-[#c1d2cd] sm:block">{step.n}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8">
          <div className="grid overflow-hidden rounded-[2.25rem] bg-[#0e2338] text-white lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 sm:p-11">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#82d2c4]">Trust is a product feature</p>
              <h2 className="display-face mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">Helpful without pretending to be the clinician.</h2>
              <p className="mt-5 max-w-xl leading-7 text-[#cbdce1]">ClearCare organizes what the document says. It preserves ambiguity, exposes conflicts, and makes source checking part of the interface.</p>
            </div>
            <div className="grid border-t border-white/10 lg:border-l lg:border-t-0">
              <div className="border-b border-white/10 p-7 sm:p-8"><LockKeyhole aria-hidden="true" className="text-[#83d2c5]" /><h3 className="mt-5 text-xl font-bold">Private by default</h3><p className="mt-3 text-sm leading-6 text-[#c8d9df]">Live documents stay in request-scoped memory, are not placed in browser storage, and can be cleared with Reset. This prototype does not claim HIPAA compliance.</p></div>
              <div className="p-7 sm:p-8"><ShieldCheck aria-hidden="true" className="text-[#f1bf57]" /><h3 className="mt-5 text-xl font-bold">Organizer, not medical advice</h3><p className="mt-3 text-sm leading-6 text-[#c8d9df]">ClearCare does not recommend treatments or replace your healthcare professional. Emergency guidance remains explicitly out of scope.</p></div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm font-semibold text-[#425765] sm:grid-cols-3">
            {["Exact numbers stay exact", "Uncertainty stays visible", "Every key item keeps a source"].map((item) => <span key={item} className="flex items-center gap-2 rounded-2xl border border-[#cfdad6] bg-white/65 px-4 py-3"><Check className="text-[#16746f]" size={17} /> {item}</span>)}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#cfdad6] px-5 py-8 text-sm text-[#667580] sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-4 sm:flex-row sm:items-center"><span>ClearCare · OpenAI hackathon prototype · synthetic demo only</span><span>Open source under the repository license</span></div>
      </footer>
    </div>
  );
}
