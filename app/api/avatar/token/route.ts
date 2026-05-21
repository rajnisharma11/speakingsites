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

  const upstream = await fetch("https://api.liveavatar.com/v1/sessions/token", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "FULL",
      avatar_id: avatarId,
      avatar_persona: {
        ...(process.env.LIVEAVATAR_CONTEXT_ID && {
          context_id: process.env.LIVEAVATAR_CONTEXT_ID,
        }),
        language: "en",
      },
      is_sandbox: isSandbox,
    }),
    cache: "no-store",
  });

  const json = await upstream.json();
  if (!upstream.ok || json.code !== 1000) {
    const detailed =
      Array.isArray(json.data) && json.data[0]?.message
        ? json.data[0].message
        : (json.message ?? "LiveAvatar token request failed");
    return NextResponse.json(
      { error: detailed, upstream: json },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  return NextResponse.json({
    sessionToken: json.data.session_token,
    sessionId: json.data.session_id,
    avatarId,
    isSandbox,
    resolvedSource,
  });
}
