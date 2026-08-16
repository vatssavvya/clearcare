"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, FileSearch, ShieldAlert, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Source } from "@/lib/schema/care-plan";

const statusLabel = {
  matched: "Matched to source",
  partially_matched: "Partially matched",
  unverified: "Independent match unavailable",
} as const;

export function SourceDrawer({
  title,
  interpretation,
  sources,
  activeIndex,
  synthetic,
  documentPreview,
  onIndexChange,
  onClose,
}: {
  title: string;
  interpretation: string;
  sources: Source[];
  activeIndex: number;
  synthetic: boolean;
  documentPreview?: { url: string; mimeType: string } | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const source = sources[activeIndex];

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [onClose]);

  if (!source) return null;

  return (
    <div className="drawer-backdrop no-print" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div
        ref={panelRef}
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-drawer-title"
        aria-describedby="source-drawer-description"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0e2338]/97 px-5 py-5 text-white backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#82d2c4]">Source verification</p>
            <p className="mt-1 text-xs font-semibold text-[#b8ccd2]" aria-live="polite">Evidence {activeIndex + 1} of {sources.length}</p>
          </div>
          <button ref={closeRef} className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10" type="button" onClick={onClose} aria-label="Close source verification">
            <X size={21} />
          </button>
        </header>

        <div className="source-drawer-body px-5 py-7 sm:px-9 sm:py-9">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-[#e1f1ec] px-3 py-1.5 text-[#176760]">Page {source.pageNumber}</span>
            <span className="rounded-full bg-[#edf0f2] px-3 py-1.5 text-[#4f5e68]">{source.confidence} confidence</span>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${source.matchStatus === "matched" ? "bg-[#e1f1ec] text-[#176760]" : "bg-[#fff0cc] text-[#825816]"}`}>
              {source.matchStatus === "matched" ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
              {statusLabel[source.matchStatus]}
            </span>
          </div>

          <h2 id="source-drawer-title" className="display-face mt-6 text-3xl font-semibold leading-tight text-[#0e2338]">{title}</h2>
          <p id="source-drawer-description" className="mt-4 leading-7 text-[#50616d]">{interpretation}</p>

          <section className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#344c5d]">Original excerpt</h3>
              <span className="text-xs text-[#6d7b84]">{source.sectionName ?? "Section not detected"}</span>
            </div>
            <blockquote className="source-quote mt-3 rounded-r-2xl p-5 text-[1.02rem]">“{source.excerpt}”</blockquote>
          </section>

          <section className="mt-8 rounded-[2rem] border border-[#cbd9d4] bg-[#f2f7f4] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Page preview</p>
                <h3 className="mt-2 font-bold text-[#153149]">Page {source.pageNumber} · {source.sectionName ?? "Source section"}</h3>
              </div>
              <FileSearch aria-hidden="true" className="text-[#16746f]" size={24} />
            </div>
            <div className="relative mx-auto mt-5 aspect-[.773] max-w-md overflow-hidden rounded-lg border border-[#b8c7c2] bg-[#fbfaf6] shadow-[0_18px_45px_rgba(16,42,56,.16)]">
              {synthetic ? (
                <Image
                  src={`/samples/pages/page-${source.pageNumber}.png`}
                  alt={`Fictional discharge document page ${source.pageNumber}`}
                  width={720}
                  height={932}
                  className="h-full w-full object-contain"
                />
              ) : documentPreview?.mimeType === "application/pdf" ? (
                <iframe
                  className="h-full w-full bg-white"
                  src={`${documentPreview.url}#page=${source.pageNumber}&view=FitH&toolbar=0&navpanes=0`}
                  title={`Uploaded PDF page ${source.pageNumber}`}
                />
              ) : documentPreview ? (
                <Image
                  src={documentPreview.url}
                  alt="Uploaded discharge instruction image"
                  width={1200}
                  height={1552}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="grid h-full place-items-center p-8 text-center text-sm leading-6 text-[#65757f]">Original page preview is unavailable for this result.</div>
              )}
            </div>
            <div className="mx-auto mt-4 max-w-sm rounded-xl border-l-4 border-[#e1a52e] bg-[#fff0c8] p-3 text-xs leading-5 text-[#3b454d]">
              <span className="block font-extrabold uppercase tracking-wider text-[#7a5718]">Best-effort excerpt locator</span>
              <span className="mt-1 block">{source.excerpt}</span>
            </div>
            {synthetic && (
              <a className="button-secondary mt-5 w-full" href={`/samples/clearcare-comprehensive-sample.pdf#page=${source.pageNumber}`} target="_blank" rel="noreferrer">
                Open fictional PDF at page {source.pageNumber} <ExternalLink aria-hidden="true" size={17} />
              </a>
            )}
          </section>

          {source.matchStatus !== "matched" && (
            <div className="mt-6 rounded-2xl border border-[#ecd394] bg-[#fff5dc] p-4 text-sm leading-6 text-[#665126]">
              ClearCare could not independently match all of this excerpt. Check the original page and confirm the instruction with the care team.
            </div>
          )}

          {sources.length > 1 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#dbe2df] pt-6">
              <button className="button-secondary" type="button" disabled={activeIndex === 0} onClick={() => onIndexChange(activeIndex - 1)}>
                <ArrowLeft size={17} /> Previous
              </button>
              <span className="text-xs font-bold text-[#6b7982]">Page {source.pageNumber}</span>
              <button className="button-secondary" type="button" disabled={activeIndex === sources.length - 1} onClick={() => onIndexChange(activeIndex + 1)}>
                Next <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
