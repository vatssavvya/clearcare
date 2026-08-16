import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      status: "ready",
      deterministicDemo: true,
      liveAnalysisConfigured: Boolean(
        process.env.OPENAI_API_KEY && process.env.CLEARCARE_ENABLE_LIVE_API === "true",
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
