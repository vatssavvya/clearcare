import { ShieldCheck } from "lucide-react";

export function LogoMark({ className = "size-11" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 5h28l16 16v38H10z" fill="#0e2338" />
      <path d="M38 5v16h16z" fill="#dff3ee" />
      <path d="M18 19h14M18 27h11" fill="none" stroke="#dff3ee" strokeLinecap="round" strokeWidth="4" />
      <path d="M18 36h8" fill="none" stroke="#169b91" strokeLinecap="round" strokeWidth="4" />
      <path d="M21 52c8-9 15-7 24-20" fill="none" stroke="#19a79c" strokeLinecap="round" strokeWidth="6" />
      <path d="m39 31 11-4-2 11z" fill="#19a79c" stroke="#19a79c" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="ClearCare home">
      <LogoMark className="size-11 shrink-0 drop-shadow-sm" />
      <span>
        <span className="display-face block text-[1.35rem] font-bold leading-none text-[#0e2338]">ClearCare</span>
        {!compact && (
          <span className="mt-1 flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#5a6976]">
            <ShieldCheck aria-hidden="true" size={12} /> Source first
          </span>
        )}
      </span>
    </div>
  );
}
