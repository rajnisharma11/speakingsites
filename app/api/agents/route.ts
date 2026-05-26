import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Returns the active agents for the configured client, sanitised for the
// browser (no HeyGen avatar id / LiveAvatar context id — those stay
// server-side and are only used by /api/avatar/token). The Hero widget calls
// this to build the avatar picker dynamically instead of hardcoding it.
//
// Shape mirrors the backend: `agents` are the industry niche avatars (the
// picker grid) and `sales_agent` is the single dedicated Speaking Sites
// sales/demo avatar (rendered separately), or null when none is configured.
export async function GET() {
  const backendUrl = process.env.BACKEND_URL;
  const apiKey = process.env.BACKEND_EMBED_API_KEY;
  if (!backendUrl || !apiKey) {
    return NextResponse.json(
      { error: "BACKEND_URL or BACKEND_EMBED_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  const upstream = await fetch(
    backendUrl.replace(/\/+$/, "") +
      "/api/widget/agents?api_key=" +
      encodeURIComponent(apiKey),
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const json = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: json.error ?? "Backend agents request failed" },
      { status: upstream.status },
    );
  }

  return NextResponse.json({
    agents: json.agents ?? [],
    sales_agent: json.sales_agent ?? null,
  });
}
