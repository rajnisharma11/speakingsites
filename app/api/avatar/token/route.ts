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

// Per-industry LiveAvatar contexts. EACH agent's training lives inside
// its own LiveAvatar context (Contexts → New in https://app.liveavatar.com)
// — the system prompt, opening_text, knowledge base, links and voice
// settings are all configured there. Set the context_id for each
// industry below via env (so the secret stays out of the repo). When a
// visitor picks an industry, the matching context is passed to the
// LiveAvatar token request and the avatar responds only from that
// context's training — no cross-contamination between agents.
//
// Any industry without its own env var falls back to LIVEAVATAR_CONTEXT_ID
// (the legacy single-context behaviour) so half-configured deployments
// still work.
const INDUSTRY_CONTEXT_ENV_KEYS: Record<string, string> = {
  plumber: "LIVEAVATAR_CONTEXT_ID_PLUMBER",
  lawyer: "LIVEAVATAR_CONTEXT_ID_LAWYER",
  medical: "LIVEAVATAR_CONTEXT_ID_MEDICAL",
  builder: "LIVEAVATAR_CONTEXT_ID_BUILDER",
  salon: "LIVEAVATAR_CONTEXT_ID_SALON",
};

function resolveContextId(industry: string | undefined): {
  contextId: string | null;
  source: "industry" | "global" | "none";
} {
  if (industry) {
    const envKey = INDUSTRY_CONTEXT_ENV_KEYS[industry];
    if (envKey && process.env[envKey]) {
      return { contextId: process.env[envKey]!, source: "industry" };
    }
  }
  if (process.env.LIVEAVATAR_CONTEXT_ID) {
    return {
      contextId: process.env.LIVEAVATAR_CONTEXT_ID,
      source: "global",
    };
  }
  return { contextId: null, source: "none" };
}

// Look up the chosen agent's runtime config from the Laravel backend. This is
// now the source of truth for which HeyGen avatar + LiveAvatar context an
// agent uses — each agent has its own context_id, which is what keeps its
// knowledge/persona isolated from the other agents. Returns null (and we fall
// back to the env-var mapping below) if the backend is unreachable or the
// agent isn't found, so the demo never hard-fails on a backend hiccup.
async function fetchAgentRuntime(slug: string | undefined): Promise<{
  heygenAvatarId: string | null;
  contextId: string | null;
} | null> {
  if (!slug) return null;
  const backendUrl = process.env.BACKEND_URL;
  const apiKey = process.env.BACKEND_EMBED_API_KEY;
  if (!backendUrl || !apiKey) return null;
  try {
    const res = await fetch(
      backendUrl.replace(/\/+$/, "") +
        "/api/widget/agents?fields=runtime&api_key=" +
        encodeURIComponent(apiKey),
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    type AgentRuntime = {
      slug: string;
      heygen_avatar_id: string | null;
      liveavatar_context_id: string | null;
    };
    const json = (await res.json()) as {
      agents?: AgentRuntime[];
      sales_agent?: AgentRuntime | null;
    };
    // The sales avatar lives under `sales_agent`, not in the niche `agents`
    // list — search both so the sales slug resolves its runtime config too.
    const all = [
      ...(json.agents ?? []),
      ...(json.sales_agent ? [json.sales_agent] : []),
    ];
    const agent = all.find((a) => a.slug === slug);
    if (!agent) return null;
    return {
      heygenAvatarId: agent.heygen_avatar_id ?? null,
      contextId: agent.liveavatar_context_id ?? null,
    };
  } catch {
    return null;
  }
}

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

  let body: { avatarId?: string; industry?: string; agentSlug?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  // agentSlug is the new identifier; industry is kept as an alias so older
  // callers keep working. Either maps to a backend agent slug.
  const slug = body.agentSlug ?? body.industry;
  const agent = await fetchAgentRuntime(slug);

  // Resolve avatar: explicit avatarId wins; then the backend agent's avatar;
  // then the legacy industry → map; otherwise the default.
  let avatarId = body.avatarId ?? null;
  let resolvedSource:
    | "explicit"
    | "agent"
    | "industry"
    | "default"
    | "sandbox-override" = "explicit";
  if (!avatarId && agent?.heygenAvatarId) {
    avatarId = agent.heygenAvatarId;
    resolvedSource = "agent";
  }
  if (!avatarId && slug && INDUSTRY_AVATAR_IDS[slug]) {
    avatarId = INDUSTRY_AVATAR_IDS[slug];
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

  // Per-industry context — picks the right agent's training (system
  // prompt, knowledge base, opening_text, voice) for the requested
  // industry. Falls back to LIVEAVATAR_CONTEXT_ID if no per-industry
  // value is configured, falls back to omitting the field if neither is
  // set (LiveAvatar then uses the avatar's default persona).
  // The agent's own context wins (per-agent isolation). Fall back to the
  // env-var per-industry / global context only when the agent has none set.
  const envContext = resolveContextId(slug);
  const contextId = agent?.contextId ?? envContext.contextId;
  const contextSource: "agent" | "industry" | "global" | "none" = agent?.contextId
    ? "agent"
    : envContext.source;

  // Builds the request body. Pulled out because the cap-exceeded retry
  // needs to rebuild it with a lower max_session_duration.
  const buildBody = (capSeconds: number | null) =>
    JSON.stringify({
      mode: "FULL",
      avatar_id: avatarId,
      avatar_persona: {
        ...(contextId && { context_id: contextId }),
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
    // Which agent's training was used. "industry" = per-industry context
    // (correct), "global" = single shared context (legacy fallback),
    // "none" = no context configured (avatar uses its built-in persona,
    // probably not what you want for a trained agent).
    contextId,
    contextSource,
    agentSlug: slug ?? null,
    industry: body.industry ?? null,
  });
}
