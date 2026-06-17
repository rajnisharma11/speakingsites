import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_URL;
  const apiKey = process.env.BACKEND_EMBED_API_KEY;
  if (!backendUrl || !apiKey) {
    return NextResponse.json(
      { error: "BACKEND_URL or BACKEND_EMBED_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let body: {
    avatarType?: string;
    agentSlug?: string;
    liveAvatarSessionId?: string;
    visitorName?: string;
    visitorEmail?: string;
    visitorPhone?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  const upstream = await fetch(
    backendUrl.replace(/\/+$/, "") + "/api/widget/conversation/start",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        // agent_slug attributes the lead/transcript to the chosen avatar
        // (niche or sales). avatar_type kept for backwards compatibility.
        agent_slug: body.agentSlug ?? body.avatarType ?? null,
        avatar_type: body.avatarType ?? null,
        // LiveAvatar session id → lets the backend pull the transcript from the
        // LiveAvatar API after the chat ends.
        liveavatar_session_id: body.liveAvatarSessionId ?? null,
        visitor_name: body.visitorName ?? null,
        visitor_email: body.visitorEmail ?? null,
        visitor_phone: body.visitorPhone ?? null,
      }),
      cache: "no-store",
    },
  );

  const json = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: json.error ?? "Backend start request failed", upstream: json },
      { status: upstream.status },
    );
  }

  return NextResponse.json({
    sessionId: json.session_id,
    conversationId: json.conversation_id,
  });
}
