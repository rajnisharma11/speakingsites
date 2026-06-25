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

  // Guard + retry the upstream call. A transient blip (flaky WiFi, DNS, TLS, a
  // brief LiveAvatar 5xx, or a timeout) shouldn't surface "Could not reach
  // LiveAvatar token service" to the visitor — most clear up within a second.
  // We retry network throws and 5xx with short backoff; a 4xx is a real client
  // error and returns immediately. Each attempt has a 15s timeout. Only after
  // every attempt fails do we return a clean 502 with the last error's detail.
  const RETRY_DELAYS_MS = [300, 800]; // total attempts = delays + 1 = 3
  let upstream: Response | null = null;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const res = await fetch(
        "https://api.liveavatar.com/v1/sessions/embed/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embed_id: embedId, language: body.language ?? "en" }),
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        },
      );
      if (res.status >= 500 && attempt < RETRY_DELAYS_MS.length) {
        lastErr = new Error(`LiveAvatar upstream ${res.status}`);
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        continue;
      }
      upstream = res;
      break;
    } catch (err) {
      lastErr = err;
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        continue;
      }
    }
  }

  if (!upstream) {
    const reason =
      lastErr instanceof Error && lastErr.name === "TimeoutError"
        ? "LiveAvatar token request timed out"
        : "Could not reach LiveAvatar token service";
    return NextResponse.json(
      { error: reason, detail: lastErr instanceof Error ? lastErr.message : String(lastErr) },
      { status: 502 },
    );
  }

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
