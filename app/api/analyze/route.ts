import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/ai/pipeline";
import { mapPipelineError, statusForSafeError } from "@/lib/ai/errors";
import { validateDocument } from "@/lib/documents/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

const requestWindows = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function rateLimitKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ? `ip:${forwarded}` : "local-or-unknown";
}

function withinRateLimit(request: NextRequest) {
  const now = Date.now();
  const key = rateLimitKey(request);
  const recent = (requestWindows.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) return false;
  recent.push(now);
  requestWindows.set(key, recent);
  if (requestWindows.size > 500) requestWindows.clear();
  return true;
}

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  if (!withinRateLimit(request)) {
    return noStoreJson({ error: { code: "rate_limit", requestId } }, 429);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("document");
    if (!(file instanceof File)) {
      return noStoreJson({ error: { code: "unsupported_file", requestId } }, 400);
    }
    const document = await validateDocument(file);
    const carePlan = await analyzeDocument(document);
    return noStoreJson({ carePlan, requestId }, 200);
  } catch (error) {
    const code = mapPipelineError(error);
    return noStoreJson({ error: { code, requestId } }, statusForSafeError(code));
  }
}
