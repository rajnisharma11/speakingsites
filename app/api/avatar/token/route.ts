import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Per-industry avatars (used when LIVEAVATAR_IS_SANDBOX != "true").
// IDs from GET https://api.liveavatar.com/v1/avatars/public — adjust freely.
const INDUSTRY_AVATAR_IDS: Record<string, string> = {
  plumber: "64b526e4-741c-43b6-a918-4e40f3261c7a", // Bryan Tech Expert
  lawyer: "0930fd59-c8ad-434d-ad53-b391a1768720", // Dexter Lawyer
  medical: "fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046", // Ann Doctor Sitting
  builder: "91342979-4c4c-44f1-bd3b-1c846d20341e", // Anthony Sitting
  salon: "09919247-f4b2-45d8-a75e-86fc2fceaebf", // Katya in Pink Suit
};

export async function POST(request: Request) {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LIVEAVATAR_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  const isSandbox = process.env.LIVEAVATAR_IS_SANDBOX !== "false";
  const fallbackId = process.env.LIVEAVATAR_DEFAULT_AVATAR_ID;

  let body: { avatarId?: string; industry?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  // Resolve avatar: explicit avatarId wins; otherwise industry → map; otherwise default.
  let avatarId = body.avatarId ?? null;
  let resolvedSource: "explicit" | "industry" | "default" | "sandbox-override" =
    "explicit";
  if (!avatarId && body.industry && INDUSTRY_AVATAR_IDS[body.industry]) {
    avatarId = INDUSTRY_AVATAR_IDS[body.industry];
    resolvedSource = "industry";
  }
  if (!avatarId) {
    avatarId = fallbackId ?? null;
    resolvedSource = "default";
  }
  // In sandbox mode this account only allows the fallback (Wayne). Override.
  if (isSandbox && fallbackId) {
    avatarId = fallbackId;
    resolvedSource = "sandbox-override";
  }
  if (!avatarId) {
    return NextResponse.json(
      {
        error:
          "No avatar resolved (request had no avatarId/industry and LIVEAVATAR_DEFAULT_AVATAR_ID is unset).",
      },
      { status: 400 },
    );
  }

  // Optional cap on session length (seconds). LiveAvatar enforces a per-tier
  // ceiling server-side that we cannot exceed regardless of what we send
  // here. If LIVEAVATAR_MAX_SESSION_DURATION is set we request that value;
  // when it's higher than the account's tier cap the upstream returns
  // "max_session_duration (Xs) exceeds the maximum allowed (Ys)" — we parse
  // the "Ys" out and retry once with that value so a stale env var doesn't
  // break the demo. The server-side log warns so the admin notices the
  // mismatch and updates the env var (or verifies the plan upgrade).
  const maxSessionDurationRaw = process.env.LIVEAVATAR_MAX_SESSION_DURATION;
  const requestedMaxDuration =
    maxSessionDurationRaw && Number.isFinite(Number(maxSessionDurationRaw))
      ? Number(maxSessionDurationRaw)
      : null;

  type TokenSuccess = {
    code: number;
    data: { session_token: string; session_id: string };
    message?: string;
  };
  type TokenError = {
    code?: number;
    data?: Array<{ message?: string }> | unknown;
    message?: string;
  };

  // Builds the request body. Pulled out because the cap-exceeded retry
  // needs to rebuild it with a lower max_session_duration.
  const buildBody = (capSeconds: number | null) =>
    JSON.stringify({
      mode: "FULL",
      avatar_id: avatarId,
      avatar_persona: {
        ...(process.env.LIVEAVATAR_CONTEXT_ID && {
          context_id: process.env.LIVEAVATAR_CONTEXT_ID,
        }),
        language: "en",
      },
      is_sandbox: isSandbox,
      ...(capSeconds !== null && { max_session_duration: capSeconds }),
    });

  const callUpstream = async (capSeconds: number | null) =>
    fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: buildBody(capSeconds),
      cache: "no-store",
    });

  // Pull the upstream error text out of LiveAvatar's response shape, which
  // sometimes nests details in data[0].message and sometimes uses message.
  const extractError = (j: TokenError): string => {
    if (Array.isArray(j.data) && j.data[0]?.message) return j.data[0].message;
    if (typeof j.message === "string") return j.message;
    return "LiveAvatar token request failed";
  };

  let upstream = await callUpstream(requestedMaxDuration);
  let json = (await upstream.json()) as TokenSuccess | TokenError;
  let effectiveMaxDuration = requestedMaxDuration;

  // Cap-exceeded autoretry. The upstream message looks like
  //   "max_session_duration (1800s) exceeds the maximum allowed (60s)"
  // — grab the second number, log the mismatch, retry once with that
  // value, then continue as normal. We only retry if we sent a cap in the
  // first place (no point re-requesting the same thing).
  if (
    requestedMaxDuration !== null &&
    (!upstream.ok || (json as TokenError).code !== 1000)
  ) {
    const errMsg = extractError(json as TokenError);
    const capMatch = /maximum allowed\s*\(\s*(\d+)\s*s?\s*\)/i.exec(errMsg);
    if (capMatch) {
      const allowed = Number(capMatch[1]);
      console.warn(
        "[avatar/token] LIVEAVATAR_MAX_SESSION_DURATION=" +
          requestedMaxDuration +
          " exceeds the tier cap (" +
          allowed +
          "s). Retrying with " +
          allowed +
          ". Lower the env var to " +
          allowed +
          " or upgrade the LiveAvatar plan to remove this warning.",
      );
      upstream = await callUpstream(allowed);
      json = (await upstream.json()) as TokenSuccess | TokenError;
      effectiveMaxDuration = allowed;
    }
  }

  if (!upstream.ok || (json as TokenError).code !== 1000) {
    const detailed = extractError(json as TokenError);
    return NextResponse.json(
      { error: detailed, upstream: json },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  const success = json as TokenSuccess;
  return NextResponse.json({
    sessionToken: success.data.session_token,
    sessionId: success.data.session_id,
    avatarId,
    isSandbox,
    resolvedSource,
    // Exposed for diagnostics: the actual cap LiveAvatar accepted, which
    // may be lower than what was requested if the retry path kicked in.
    maxSessionDuration: effectiveMaxDuration,
  });
}
