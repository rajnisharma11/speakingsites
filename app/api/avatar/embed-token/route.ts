import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Mints a KEYLESS LiveAvatar session token for a PUBLISHED embed widget.
//
// This is the exact call the LiveAvatar iframe makes internally
// (POST /v1/sessions/embed/token with just the embed_id, no API key). It
// returns a session token for the embed's avatar EVEN WHEN that avatar lives
// in a LiveAvatar space we hold no API key for — e.g. the bespoke "gpwalsh"
// plumber (avatar bb2dad53, voice 13ff8f9e, context 27beb1a8) which lives in
// space acea0893. The returned token carries source=EMBED and the avatar/
// voice/context baked into the published embed.
//
// Driving that token through the web SDK (instead of dropping the sealed
// iframe onto the page) is what finally lets us capture the spoken transcript
// and save the lead: the SDK fires USER/AVATAR_TRANSCRIPTION events the iframe
// never exposed. See Hero.tsx EMBED_AVATAR_IDS / startSession.
export async function POST(request: Request) {
  let body: { embedId?: string; language?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body handled below
  }

  const embedId = body.embedId;
  if (!embedId) {
    return NextResponse.json({ error: "embedId is required" }, { status: 400 });
  }

  const upstream = await fetch(
    "https://api.liveavatar.com/v1/sessions/embed/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embed_id: embedId, language: body.language ?? "en" }),
      cache: "no-store",
    },
  );

  type EmbedTokenResponse = {
    code?: number;
    message?: string;
    data?:
      | { session_token?: string; session_id?: string }
      | Array<{ message?: string }>;
  };
  const json = (await upstream.json().catch(() => ({}))) as EmbedTokenResponse;

  // LiveAvatar signals success with code 1000; errors nest the message in
  // data[0].message or the top-level message.
  if (!upstream.ok || json.code !== 1000) {
    const detail =
      Array.isArray(json.data) && json.data[0]?.message
        ? json.data[0].message
        : (json.message ?? "Embed token request failed");
    return NextResponse.json(
      { error: detail, upstream: json },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  const data = json.data as { session_token?: string; session_id?: string };
  return NextResponse.json({
    sessionToken: data.session_token,
    sessionId: data.session_id,
  });
}
