import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Stop an active LiveAvatar session server-side. Exists primarily for the
// beforeunload `sendBeacon` path in Hero.tsx — when a visitor reloads or
// closes the tab mid-call, the SDK never gets a chance to call its own
// stop(). The LiveAvatar session then stays "running" against your account's
// concurrency cap until the per-tier max duration times out (60s on the
// current tier). That makes the very next visitor see "demo is busy".
//
// LiveAvatar reference: POST https://api.liveavatar.com/v1/sessions/stop
// Accepts both JSON body and beacon FormData (visitor unload path uses the
// latter — fetch isn't reliable during unload).
export async function POST(request: Request) {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LIVEAVATAR_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let sessionId: string | null = null;
  let reason: string | null = null;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as {
        session_id?: string;
        sessionId?: string;
        reason?: string;
      };
      sessionId = body.session_id ?? body.sessionId ?? null;
      reason = body.reason ?? null;
    } catch {
      // fall through to empty
    }
  } else {
    try {
      const fd = await request.formData();
      const sid = fd.get("session_id") ?? fd.get("sessionId");
      if (typeof sid === "string") sessionId = sid;
      const r = fd.get("reason");
      if (typeof r === "string") reason = r;
    } catch {
      // fall through to empty
    }
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 },
    );
  }

  const upstream = await fetch("https://api.liveavatar.com/v1/sessions/stop", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      reason: reason ?? "USER_CLOSED",
    }),
    cache: "no-store",
  });

  // LiveAvatar returns 200 even on "session already ended" — treat any 2xx
  // as success. Fire-and-forget callers (sendBeacon) ignore the body anyway.
  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: "Upstream stop failed", upstream: text },
      { status: upstream.status },
    );
  }

  return NextResponse.json({ ok: true });
}
