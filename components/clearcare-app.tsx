"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisProgress, ANALYSIS_STAGES } from "@/components/analysis/analysis-progress";
import { CarePlanDashboard } from "@/components/care-plan/care-plan-dashboard";
import { Landing } from "@/components/landing/landing";
import { CarePlanSchema, type CarePlan } from "@/lib/schema/care-plan";

type Screen = "landing" | "analyzing" | "care-plan";

function delay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Cancelled", "AbortError"));
    }, { once: true });
  });
}

function safeLiveError(code?: string) {
  const messages: Record<string, string> = {
    unsupported_file: "Choose a supported PDF, PNG, JPG, or JPEG file.",
    mime_mismatch: "The document type does not match its file extension.",
    file_too_large: "The document is larger than the 10 MB limit.",
    too_many_pages: "The PDF has more than 25 pages.",
    unreadable_file: "ClearCare could not safely read that document.",
    live_disabled: "Live analysis is unavailable in this environment.",
    authentication: "Live analysis could not authenticate. The comprehensive sample is still available.",
    billing_or_permission: "Live analysis is not available for this API project. The comprehensive sample is still available.",
    rate_limit: "Live analysis is temporarily busy. Try again later or use the comprehensive sample.",
    timeout: "The analysis took too long and was cancelled. The document was not saved.",
    refusal: "The document could not be transformed into a care plan. No result was saved.",
    structured_output: "The analysis did not pass ClearCare’s structure checks. No result was shown.",
    budget_guard: "The configured live-test budget or run limit has been reached.",
  };
  return messages[code ?? ""] ?? "Live analysis was unavailable. Your document was not saved; try the comprehensive sample instead.";
}

export function ClearCareApp({ comprehensiveSample }: { comprehensiveSample: CarePlan }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<CarePlan | null>(null);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [stage, setStage] = useState(0);
  const [documentPreview, setDocumentPreview] = useState<{ url: string; mimeType: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokeDocumentPreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setDocumentPreview(null);
  }, []);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    revokeDocumentPreview();
    setSelectedFile(null);
    setPlan(null);
    setError(null);
    setStage(0);
    setScreen("landing");
  };

  const runDemo = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    revokeDocumentPreview();
    setError(null);
    setMode("demo");
    setScreen("analyzing");
    try {
      for (let current = 0; current < ANALYSIS_STAGES.length; current += 1) {
        setStage(current);
        await delay(230, controller.signal);
      }
      setPlan(CarePlanSchema.parse(comprehensiveSample));
      setScreen("care-plan");
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        setError("The sample could not be prepared. Please try again.");
        setScreen("landing");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const runLive = async () => {
    if (!selectedFile) return;
    const controller = new AbortController();
    abortRef.current = controller;
    revokeDocumentPreview();
    const objectUrl = URL.createObjectURL(selectedFile);
    previewUrlRef.current = objectUrl;
    setDocumentPreview({ url: objectUrl, mimeType: selectedFile.type });
    setError(null);
    setMode("live");
    setStage(0);
    setScreen("analyzing");
    let stageTimer: number | undefined;
    try {
      stageTimer = window.setInterval(() => {
        setStage((current) => Math.min(current + 1, ANALYSIS_STAGES.length - 1));
      }, 1800);
      const data = new FormData();
      data.set("document", selectedFile);
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: data,
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = (await response.json()) as { carePlan?: unknown; error?: { code?: string } };
      if (!response.ok || !payload.carePlan) {
        throw new Error(payload.error?.code ?? "unknown");
      }
      setStage(ANALYSIS_STAGES.length - 1);
      setPlan(CarePlanSchema.parse(payload.carePlan));
      setScreen("care-plan");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      revokeDocumentPreview();
      setError(safeLiveError(caught instanceof Error ? caught.message : undefined));
      setScreen("landing");
    } finally {
      if (stageTimer) window.clearInterval(stageTimer);
      abortRef.current = null;
    }
  };

  if (screen === "analyzing") return <AnalysisProgress activeStage={stage} mode={mode} onCancel={reset} />;
  if (screen === "care-plan" && plan) return <CarePlanDashboard plan={plan} onReset={reset} documentPreview={documentPreview} />;
  return (
    <Landing
      selectedFile={selectedFile}
      error={error}
      onFileSelected={(file, nextError) => {
        if (!file) revokeDocumentPreview();
        setSelectedFile(file);
        setError(nextError);
      }}
      onAnalyze={() => void runLive()}
      onDemo={() => void runDemo()}
    />
  );
}
