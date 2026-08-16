"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The error body is deliberately not logged because it could contain document-derived data.
  }, [error]);
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-20 text-[#13263a]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#d7dfdc] bg-white p-8 shadow-sm">
        <p className="eyebrow">ClearCare</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This view could not be shown safely.</h1>
        <p className="mt-4 text-[#51616f]">
          Your document was not saved. Try the view again or return to the sample experience.
        </p>
        <button className="button-primary mt-7" onClick={reset} type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
