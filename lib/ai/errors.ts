import OpenAI from "openai";
import { DocumentValidationError } from "@/lib/documents/validation";

export type SafeErrorCode =
  | DocumentValidationError["code"]
  | "live_disabled"
  | "authentication"
  | "billing_or_permission"
  | "rate_limit"
  | "timeout"
  | "refusal"
  | "structured_output"
  | "budget_guard"
  | "unknown";

export class ClearCarePipelineError extends Error {
  constructor(public readonly code: SafeErrorCode) {
    super(code);
    this.name = "ClearCarePipelineError";
  }
}

export function mapPipelineError(error: unknown): SafeErrorCode {
  if (error instanceof DocumentValidationError || error instanceof ClearCarePipelineError) return error.code;
  if (error instanceof OpenAI.AuthenticationError) return "authentication";
  if (error instanceof OpenAI.PermissionDeniedError) return "billing_or_permission";
  if (error instanceof OpenAI.RateLimitError) return "rate_limit";
  if (error instanceof OpenAI.APIConnectionTimeoutError) return "timeout";
  if (error instanceof OpenAI.BadRequestError) return "structured_output";
  return "unknown";
}

export function statusForSafeError(code: SafeErrorCode) {
  if (["unsupported_file", "mime_mismatch", "file_too_large", "too_many_pages", "unreadable_file"].includes(code)) return 400;
  if (code === "live_disabled") return 503;
  if (code === "authentication" || code === "billing_or_permission") return 503;
  if (code === "rate_limit") return 429;
  if (code === "budget_guard") return 429;
  if (code === "timeout") return 504;
  return 502;
}
