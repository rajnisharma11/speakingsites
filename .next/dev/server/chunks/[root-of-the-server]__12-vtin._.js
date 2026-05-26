module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/avatar/token/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const runtime = "nodejs";
// Per-industry avatars (used when LIVEAVATAR_IS_SANDBOX != "true").
// IDs from GET https://api.liveavatar.com/v1/avatars/public — adjust freely.
const INDUSTRY_AVATAR_IDS = {
    plumber: "64b526e4-741c-43b6-a918-4e40f3261c7a",
    lawyer: "0930fd59-c8ad-434d-ad53-b391a1768720",
    medical: "fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046",
    builder: "91342979-4c4c-44f1-bd3b-1c846d20341e",
    salon: "09919247-f4b2-45d8-a75e-86fc2fceaebf"
};
async function POST(request) {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "LIVEAVATAR_API_KEY is not set on the server."
        }, {
            status: 500
        });
    }
    const isSandbox = process.env.LIVEAVATAR_IS_SANDBOX !== "false";
    const fallbackId = process.env.LIVEAVATAR_DEFAULT_AVATAR_ID;
    let body = {};
    try {
        body = await request.json();
    } catch  {
    // empty body is fine
    }
    // Resolve avatar: explicit avatarId wins; otherwise industry → map; otherwise default.
    let avatarId = body.avatarId ?? null;
    let resolvedSource = "explicit";
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No avatar resolved (request had no avatarId/industry and LIVEAVATAR_DEFAULT_AVATAR_ID is unset)."
        }, {
            status: 400
        });
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
    const requestedMaxDuration = maxSessionDurationRaw && Number.isFinite(Number(maxSessionDurationRaw)) ? Number(maxSessionDurationRaw) : null;
    // Builds the request body. Pulled out because the cap-exceeded retry
    // needs to rebuild it with a lower max_session_duration.
    const buildBody = (capSeconds)=>JSON.stringify({
            mode: "FULL",
            avatar_id: avatarId,
            avatar_persona: {
                ...process.env.LIVEAVATAR_CONTEXT_ID && {
                    context_id: process.env.LIVEAVATAR_CONTEXT_ID
                },
                language: "en"
            },
            is_sandbox: isSandbox,
            ...capSeconds !== null && {
                max_session_duration: capSeconds
            }
        });
    const callUpstream = async (capSeconds)=>fetch("https://api.liveavatar.com/v1/sessions/token", {
            method: "POST",
            headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json"
            },
            body: buildBody(capSeconds),
            cache: "no-store"
        });
    // Pull the upstream error text out of LiveAvatar's response shape, which
    // sometimes nests details in data[0].message and sometimes uses message.
    const extractError = (j)=>{
        if (Array.isArray(j.data) && j.data[0]?.message) return j.data[0].message;
        if (typeof j.message === "string") return j.message;
        return "LiveAvatar token request failed";
    };
    let upstream = await callUpstream(requestedMaxDuration);
    let json = await upstream.json();
    let effectiveMaxDuration = requestedMaxDuration;
    // Cap-exceeded autoretry. The upstream message looks like
    //   "max_session_duration (1800s) exceeds the maximum allowed (60s)"
    // — grab the second number, log the mismatch, retry once with that
    // value, then continue as normal. We only retry if we sent a cap in the
    // first place (no point re-requesting the same thing).
    if (requestedMaxDuration !== null && (!upstream.ok || json.code !== 1000)) {
        const errMsg = extractError(json);
        const capMatch = /maximum allowed\s*\(\s*(\d+)\s*s?\s*\)/i.exec(errMsg);
        if (capMatch) {
            const allowed = Number(capMatch[1]);
            console.warn("[avatar/token] LIVEAVATAR_MAX_SESSION_DURATION=" + requestedMaxDuration + " exceeds the tier cap (" + allowed + "s). Retrying with " + allowed + ". Lower the env var to " + allowed + " or upgrade the LiveAvatar plan to remove this warning.");
            upstream = await callUpstream(allowed);
            json = await upstream.json();
            effectiveMaxDuration = allowed;
        }
    }
    if (!upstream.ok || json.code !== 1000) {
        const detailed = extractError(json);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: detailed,
            upstream: json
        }, {
            status: upstream.ok ? 502 : upstream.status
        });
    }
    const success = json;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        sessionToken: success.data.session_token,
        sessionId: success.data.session_id,
        avatarId,
        isSandbox,
        resolvedSource,
        // Exposed for diagnostics: the actual cap LiveAvatar accepted, which
        // may be lower than what was requested if the retry path kicked in.
        maxSessionDuration: effectiveMaxDuration
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__12-vtin._.js.map