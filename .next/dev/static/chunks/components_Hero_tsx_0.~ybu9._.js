(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Hero.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Hero",
    ()=>Hero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.mjs [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.mjs [app-client] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic-off.mjs [app-client] (ecmascript) <export default as MicOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.mjs [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.mjs [app-client] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-x.mjs [app-client] (ecmascript) <export default as VolumeX>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const INDUSTRIES = [
    {
        id: "plumber",
        label: "Plumber",
        icon: "/images/Plumbericon.png"
    },
    {
        id: "lawyer",
        label: "Lawyer",
        icon: "/images/lawyericon.png"
    },
    {
        id: "medical",
        label: "Medical",
        icon: "/images/nurseicon.png"
    },
    {
        id: "builder",
        label: "Builder",
        icon: "/images/buildericon.png"
    },
    {
        id: "salon",
        label: "Salon",
        icon: "/images/Plasterericon.png"
    }
];
// Pull visitor name / email / phone out of what the user just said. Voice and
// typed transcripts both flow through here, so the patterns are deliberately
// loose. We only return fields we found; the caller keeps the first non-empty
// hit per session so a later message saying "and my friend's name is …"
// doesn't overwrite the real visitor.
function extractVisitorInfo(text) {
    const out = {};
    const emailMatch = text.match(/\b[\w.+-]+@[\w-]+\.[\w-]+(?:\.[\w-]+)*\b/);
    if (emailMatch) out.email = emailMatch[0];
    // Phone: tolerate +, spaces, dashes, parens, dots. Strip them before saving.
    // Require at least 9 digits so we don't grab "I have 3 cats and 2 kids".
    const phoneRaw = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (phoneRaw) {
        const digits = phoneRaw[1].replace(/[^\d+]/g, "");
        if (digits.replace(/\D/g, "").length >= 9) out.phone = digits;
    }
    // Name: only match explicit self-introduction patterns. "I'm" alone is too
    // ambiguous ("I'm calling about…"), so stick to "my name is / this is /
    // I'm called / name's".
    const nameMatch = text.match(/(?:my name is|name's|this is|i'?m called)\s+([a-z][a-z'\-]+(?:\s+[a-z][a-z'\-]+){0,2})/i);
    if (nameMatch) {
        out.name = nameMatch[1].trim().split(/\s+/).map((w)=>w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    return out;
}
function AvatarStage({ videoRef, uiState, isStreamReady, errorMessage, onStart, audioOn, onEnableAudio, onToggleAudio }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "hero-avatar relative overflow-hidden h-[400px] w-full max-w-[380px] mx-auto group rounded-[10px] bg-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                ref: videoRef,
                playsInline: true,
                autoPlay: true,
                muted: true,
                className: `absolute inset-0 z-10 w-full h-full object-cover transition-opacity duration-300 ${isStreamReady ? "opacity-100" : "opacity-0"}`
            }, void 0, false, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            uiState === "live" && isStreamReady && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onToggleAudio,
                title: audioOn ? "Mute avatar audio" : "Unmute avatar audio",
                className: "absolute top-3 right-3 z-30 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors cursor-pointer",
                children: audioOn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/components/Hero.tsx",
                    lineNumber: 111,
                    columnNumber: 22
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/components/Hero.tsx",
                    lineNumber: 111,
                    columnNumber: 56
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this),
            uiState === "live" && isStreamReady && !audioOn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onEnableAudio,
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon text-black text-xs font-bold shadow-lg hover:bg-white transition-colors cursor-pointer",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this),
                    "Click to enable sound"
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 118,
                columnNumber: 9
            }, this),
            uiState === "idle" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-center px-6 bg-black/40 backdrop-blur-[2px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                        className: "w-10 h-10 text-neon",
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-300",
                        children: "Voice-powered demo avatar"
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 131,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onStart,
                        className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon text-black text-sm font-bold hover:bg-white transition-colors cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                className: "w-4 h-4",
                                strokeWidth: 2
                            }, void 0, false, {
                                fileName: "[project]/components/Hero.tsx",
                                lineNumber: 137,
                                columnNumber: 13
                            }, this),
                            "Chat now"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 132,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 129,
                columnNumber: 9
            }, this),
            (uiState === "connecting" || uiState === "live" && !isStreamReady) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-10 h-10 text-neon animate-spin",
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-300",
                        children: "Connecting…"
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 144,
                columnNumber: 9
            }, this),
            uiState === "ending" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-10 h-10 text-gray-400 animate-spin",
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-300",
                        children: "Ending…"
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 153,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this),
            uiState === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__["MicOff"], {
                        className: "w-10 h-10 text-red-400",
                        strokeWidth: 1.5
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-300",
                        children: errorMessage ?? "Something went wrong."
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 158,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Hero.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_c = AvatarStage;
function ChatPanel({ uiState, messages, onSend, onToggleMute, isMuted }) {
    _s();
    const [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const listRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Scroll the chat list to the bottom only — never call scrollIntoView,
    // which scrolls the whole page to bring the element into view and was
    // causing the page to jump down to the hero chat panel on mount.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPanel.useEffect": ()=>{
            if (messages.length === 0) return;
            const el = listRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        }
    }["ChatPanel.useEffect"], [
        messages.length
    ]);
    const disabled = uiState !== "live";
    const submit = ()=>{
        const t = draft.trim();
        if (!t) return;
        onSend(t);
        setDraft("");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-4 w-full max-w-sm mx-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between px-3 py-2 border-b border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold text-gray-300 uppercase tracking-wider",
                        children: "Chat"
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onToggleMute,
                        title: isMuted ? "Unmute mic" : "Mute mic",
                        className: `inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${isMuted ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`,
                        children: [
                            isMuted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__["MicOff"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/Hero.tsx",
                                lineNumber: 215,
                                columnNumber: 22
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/Hero.tsx",
                                lineNumber: 215,
                                columnNumber: 59
                            }, this),
                            isMuted ? "Muted" : "Mic on"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 205,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: listRef,
                className: "h-32 sm:h-40 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 text-sm",
                children: [
                    messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 text-xs text-center mt-6",
                        children: disabled ? "Start a session to chat." : "Speak, or type below."
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 222,
                        columnNumber: 11
                    }, this),
                    messages.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `max-w-[85%] px-2.5 py-1.5 rounded-lg text-xs leading-relaxed ${m.sender === "user" ? "self-end bg-neon/15 text-neon border border-neon/20" : "self-start bg-white/10 text-gray-200 border border-white/5"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "block text-[9px] uppercase tracking-wider opacity-60 mb-0.5",
                                    children: m.sender === "user" ? "You" : "Avatar"
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 237,
                                    columnNumber: 13
                                }, this),
                                m.text
                            ]
                        }, i, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 229,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 border-t border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: draft,
                        onChange: (e)=>setDraft(e.target.value),
                        onKeyDown: (e)=>{
                            if (e.key === "Enter") submit();
                        },
                        disabled: disabled,
                        placeholder: disabled ? "Session offline…" : "Type a message…",
                        className: "flex-1 min-w-0 bg-white/5 border border-white/10 rounded-md px-2 sm:px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon/40 disabled:opacity-50"
                    }, void 0, false, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: submit,
                        disabled: disabled || !draft.trim(),
                        "aria-label": "Send message",
                        className: "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-neon text-black text-sm font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                className: "w-3.5 h-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/Hero.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "hidden sm:inline",
                                children: "Send"
                            }, void 0, false, {
                                fileName: "[project]/components/Hero.tsx",
                                lineNumber: 265,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Hero.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Hero.tsx",
                lineNumber: 245,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Hero.tsx",
        lineNumber: 202,
        columnNumber: 5
    }, this);
}
_s(ChatPanel, "1afSzIsLatFb1wwpBIT/iDau4qQ=");
_c1 = ChatPanel;
function Hero() {
    _s1();
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("plumber");
    const [uiState, setUiState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [isStreamReady, setIsStreamReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isMuted, setIsMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [audioOn, setAudioOn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const desktopVideoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mobileVideoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Backend persistence refs (Laravel widget conversation API).
    const backendSessionIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recorderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const micStreamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioChunksRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    // Transcript with ISO timestamps + backend roles ("assistant" not "avatar"),
    // mirrored from the SDK's transcription events.
    const transcriptRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const endedHandledRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const flushTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Visitor identity scraped from the user's own transcript. First non-empty
    // hit wins so a later utterance ("my wife's name is …") can't overwrite the
    // real lead. Flushed to the backend on every transcript update.
    const visitorNameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const visitorEmailRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const visitorPhoneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Progressive transcript flush. Backend /end is idempotent — it replaces
    // the conversation's messages on every call — so we can safely re-POST
    // the growing transcript while the call is still live. Without this, a
    // tab close or browser crash mid-conversation would lose everything.
    const appendVisitorFields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[appendVisitorFields]": (fd)=>{
            if (visitorNameRef.current) fd.append("visitor_name", visitorNameRef.current);
            if (visitorEmailRef.current) fd.append("visitor_email", visitorEmailRef.current);
            if (visitorPhoneRef.current) fd.append("visitor_phone", visitorPhoneRef.current);
        }
    }["Hero.useCallback[appendVisitorFields]"], []);
    const flushTranscript = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[flushTranscript]": async ()=>{
            const sessionId = backendSessionIdRef.current;
            if (!sessionId || endedHandledRef.current) return;
            if (transcriptRef.current.length === 0) return;
            const fd = new FormData();
            fd.append("session_id", sessionId);
            fd.append("transcript", JSON.stringify(transcriptRef.current));
            appendVisitorFields(fd);
            try {
                await fetch("/api/conversation/end/", {
                    method: "POST",
                    body: fd
                });
            } catch (e) {
                console.warn("[Hero] transcript flush failed", e);
            }
        }
    }["Hero.useCallback[flushTranscript]"], [
        appendVisitorFields
    ]);
    const scheduleFlush = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[scheduleFlush]": ()=>{
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
            flushTimerRef.current = setTimeout({
                "Hero.useCallback[scheduleFlush]": ()=>{
                    flushTimerRef.current = null;
                    void flushTranscript();
                }
            }["Hero.useCallback[scheduleFlush]"], 1500);
        }
    }["Hero.useCallback[scheduleFlush]"], [
        flushTranscript
    ]);
    const finaliseBackendSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[finaliseBackendSession]": async ()=>{
            const sessionId = backendSessionIdRef.current;
            if (!sessionId || endedHandledRef.current) return;
            endedHandledRef.current = true;
            if (flushTimerRef.current) {
                clearTimeout(flushTimerRef.current);
                flushTimerRef.current = null;
            }
            // Stop the mic recorder and collect its audio blob (if any).
            const audioBlob = await new Promise({
                "Hero.useCallback[finaliseBackendSession]": (resolve)=>{
                    const rec = recorderRef.current;
                    if (!rec || rec.state === "inactive") {
                        resolve(null);
                        return;
                    }
                    rec.addEventListener("stop", {
                        "Hero.useCallback[finaliseBackendSession]": ()=>{
                            if (audioChunksRef.current.length === 0) {
                                resolve(null);
                                return;
                            }
                            resolve(new Blob(audioChunksRef.current, {
                                type: rec.mimeType
                            }));
                        }
                    }["Hero.useCallback[finaliseBackendSession]"], {
                        once: true
                    });
                    try {
                        rec.stop();
                    } catch  {
                        resolve(null);
                    }
                }
            }["Hero.useCallback[finaliseBackendSession]"]);
            if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach({
                    "Hero.useCallback[finaliseBackendSession]": (t)=>t.stop()
                }["Hero.useCallback[finaliseBackendSession]"]);
                micStreamRef.current = null;
            }
            recorderRef.current = null;
            const fd = new FormData();
            fd.append("session_id", sessionId);
            fd.append("transcript", JSON.stringify(transcriptRef.current));
            appendVisitorFields(fd);
            if (audioBlob) {
                const ext = audioBlob.type.indexOf("webm") !== -1 ? "webm" : "ogg";
                fd.append("audio", audioBlob, "conversation." + ext);
            }
            try {
                await fetch("/api/conversation/end/", {
                    method: "POST",
                    body: fd
                });
            } catch (e) {
                console.warn("[Hero] backend end failed", e);
            }
            backendSessionIdRef.current = null;
            audioChunksRef.current = [];
            transcriptRef.current = [];
            visitorNameRef.current = null;
            visitorEmailRef.current = null;
            visitorPhoneRef.current = null;
        }
    }["Hero.useCallback[finaliseBackendSession]"], [
        appendVisitorFields
    ]);
    const cleanupSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[cleanupSession]": async ()=>{
            await finaliseBackendSession();
            const s = sessionRef.current;
            sessionRef.current = null;
            if (!s) return;
            try {
                await s.stop();
            } catch  {
            // already disconnected
            }
        }
    }["Hero.useCallback[cleanupSession]"], [
        finaliseBackendSession
    ]);
    const stopSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[stopSession]": async ()=>{
            setUiState("ending");
            await cleanupSession();
            setIsStreamReady(false);
            setUiState("idle");
        }
    }["Hero.useCallback[stopSession]"], [
        cleanupSession
    ]);
    const startSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[startSession]": async (industry)=>{
            console.log("[Hero] startSession() called", {
                industry
            });
            if (sessionRef.current) {
                console.warn("[Hero] aborting: sessionRef still set");
                return;
            }
            setErrorMessage(null);
            setIsStreamReady(false);
            setUiState("connecting");
            setMessages([]);
            transcriptRef.current = [];
            audioChunksRef.current = [];
            endedHandledRef.current = false;
            backendSessionIdRef.current = null;
            visitorNameRef.current = null;
            visitorEmailRef.current = null;
            visitorPhoneRef.current = null;
            try {
                const tokenRes = await fetch("/api/avatar/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        industry
                    })
                });
                if (!tokenRes.ok) {
                    const j = await tokenRes.json().catch({
                        "Hero.useCallback[startSession]": ()=>({})
                    }["Hero.useCallback[startSession]"]);
                    throw new Error(j.error ?? `Token request failed (${tokenRes.status})`);
                }
                const payload = await tokenRes.json();
                console.log("[Hero] token OK", payload);
                const { LiveAvatarSession, SessionEvent, SessionState, AgentEventsEnum, VoiceChatEvent } = await __turbopack_context__.A("[project]/node_modules/@heygen/liveavatar-web-sdk/lib/index.esm.js [app-client] (ecmascript, async loader)");
                const session = new LiveAvatarSession(payload.sessionToken, {
                    voiceChat: true
                });
                sessionRef.current = session;
                session.on(SessionEvent.SESSION_STREAM_READY, {
                    "Hero.useCallback[startSession]": ()=>{
                        console.log("[Hero] SESSION_STREAM_READY");
                        setIsStreamReady(true);
                    }
                }["Hero.useCallback[startSession]"]);
                session.on(SessionEvent.SESSION_STATE_CHANGED, {
                    "Hero.useCallback[startSession]": (state)=>{
                        console.log("[Hero] SESSION_STATE_CHANGED →", state);
                        if (state === SessionState.CONNECTED) {
                            setUiState("live");
                            // Auto-unmute the mic so voice chat works immediately. The user
                            // can still mute via the toggle in the chat panel. Without this,
                            // visitors press "Chat now" and wonder why the avatar can't hear
                            // them — they didn't realise voice chat starts muted.
                            try {
                                session.voiceChat.unmute();
                            } catch (e) {
                                console.warn("[Hero] auto-unmute failed", e);
                            }
                        } else if (state === SessionState.DISCONNECTED) {
                            sessionRef.current = null;
                            setIsStreamReady(false);
                            setUiState("idle");
                            void finaliseBackendSession();
                        }
                    }
                }["Hero.useCallback[startSession]"]);
                session.on(SessionEvent.SESSION_DISCONNECTED, {
                    "Hero.useCallback[startSession]": (reason)=>{
                        console.log("[Hero] SESSION_DISCONNECTED:", reason);
                        sessionRef.current = null;
                        setIsStreamReady(false);
                        setUiState("idle");
                        void finaliseBackendSession();
                    }
                }["Hero.useCallback[startSession]"]);
                // Voice chat mute/unmute state mirrors the SDK's voice chat events.
                session.voiceChat.on(VoiceChatEvent.MUTED, {
                    "Hero.useCallback[startSession]": ()=>setIsMuted(true)
                }["Hero.useCallback[startSession]"]);
                session.voiceChat.on(VoiceChatEvent.UNMUTED, {
                    "Hero.useCallback[startSession]": ()=>setIsMuted(false)
                }["Hero.useCallback[startSession]"]);
                // Transcription → chat log + backend transcript buffer (debounced flush).
                session.on(AgentEventsEnum.USER_TRANSCRIPTION, {
                    "Hero.useCallback[startSession]": (e)=>{
                        if (!e?.text) return;
                        setMessages({
                            "Hero.useCallback[startSession]": (prev)=>[
                                    ...prev,
                                    {
                                        sender: "user",
                                        text: e.text,
                                        ts: Date.now()
                                    }
                                ]
                        }["Hero.useCallback[startSession]"]);
                        transcriptRef.current.push({
                            role: "user",
                            content: e.text,
                            timestamp: new Date().toISOString()
                        });
                        const found = extractVisitorInfo(e.text);
                        if (found.name && !visitorNameRef.current) visitorNameRef.current = found.name;
                        if (found.email && !visitorEmailRef.current) visitorEmailRef.current = found.email;
                        if (found.phone && !visitorPhoneRef.current) visitorPhoneRef.current = found.phone;
                        scheduleFlush();
                    }
                }["Hero.useCallback[startSession]"]);
                session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, {
                    "Hero.useCallback[startSession]": (e)=>{
                        if (!e?.text) return;
                        setMessages({
                            "Hero.useCallback[startSession]": (prev)=>[
                                    ...prev,
                                    {
                                        sender: "avatar",
                                        text: e.text,
                                        ts: Date.now()
                                    }
                                ]
                        }["Hero.useCallback[startSession]"]);
                        transcriptRef.current.push({
                            role: "assistant",
                            content: e.text,
                            timestamp: new Date().toISOString()
                        });
                        scheduleFlush();
                    }
                }["Hero.useCallback[startSession]"]);
                // Persist the session in the Laravel backend BEFORE the HeyGen
                // handshake — if HeyGen fails or the user drops, we still have a
                // Lead row and any partial transcript will land via the debounced
                // flush. Idempotent: each transcription flushes the same row.
                try {
                    const res = await fetch("/api/conversation/start/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            avatarType: industry
                        })
                    });
                    if (res.ok) {
                        const j = await res.json();
                        backendSessionIdRef.current = j.sessionId;
                        console.log("[Hero] backend session started", j.sessionId);
                    } else {
                        console.warn("[Hero] backend start non-OK", res.status);
                    }
                } catch (e) {
                    console.warn("[Hero] backend start error", e);
                }
                // Best-effort mic recording so the admin can listen to the user's
                // side of the conversation in the Leads panel. HeyGen's avatar audio
                // is rendered client-side and not captured here. Start BEFORE
                // session.start() so we don't miss the opening seconds.
                // `navigator.mediaDevices` is undefined in insecure contexts
                // (anything other than localhost / HTTPS), so guard before touching it.
                try {
                    if (!navigator.mediaDevices?.getUserMedia) {
                        throw new Error("Microphone API unavailable in this context (requires HTTPS or localhost).");
                    }
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });
                    micStreamRef.current = stream;
                    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
                    const rec = new MediaRecorder(stream, {
                        mimeType: mime
                    });
                    rec.addEventListener("dataavailable", {
                        "Hero.useCallback[startSession]": (ev)=>{
                            if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
                        }
                    }["Hero.useCallback[startSession]"]);
                    rec.start(1000);
                    recorderRef.current = rec;
                } catch (e) {
                    console.warn("[Hero] mic recording unavailable", e);
                }
                await session.start();
                console.log("[Hero] session.start() resolved");
            } catch (err) {
                console.warn("[Hero] start failed", err);
                const raw = err instanceof Error ? err.message : "Failed to start session.";
                // The HeyGen API's "Session concurrency limit reached" is an account-
                // wide cap, not user error — phrase it so visitors don't think the
                // demo is broken.
                const msg = /concurrency limit/i.test(raw) ? "The demo is busy right now — please try again in a moment." : raw;
                setErrorMessage(msg);
                setUiState("error");
                sessionRef.current = null;
                // Flush whatever we captured and finalise the row so the failed
                // attempt still appears as a Lead (with whatever transcript exists).
                void finaliseBackendSession();
            }
        }
    }["Hero.useCallback[startSession]"], [
        finaliseBackendSession,
        scheduleFlush
    ]);
    // Attach stream to the visible <video> once ready, then try to unmute.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hero.useEffect": ()=>{
            if (!isStreamReady) return;
            const session = sessionRef.current;
            if (!session) return;
            const target = desktopVideoRef.current ?? mobileVideoRef.current;
            if (!target) {
                console.warn("[Hero] no <video> ref to attach to");
                return;
            }
            console.log("[Hero] attaching stream to video element");
            session.attach(target);
            // Step 1: muted autoplay (always allowed by browsers).
            target.muted = true;
            target.play().then({
                "Hero.useEffect": ()=>{
                    console.log("[Hero] muted video.play() OK; trying to unmute");
                    // Step 2: try to unmute. May still be blocked → user clicks the
                    // "Click to enable sound" button rendered when audioOn=false.
                    target.muted = false;
                    target.play().then({
                        "Hero.useEffect": ()=>{
                            console.log("[Hero] unmuted play() OK — audio is live");
                            setAudioOn(true);
                        }
                    }["Hero.useEffect"], {
                        "Hero.useEffect": (e)=>{
                            console.warn("[Hero] unmute blocked; user must click 'Enable sound'", e);
                            target.muted = true;
                            setAudioOn(false);
                        }
                    }["Hero.useEffect"]);
                }
            }["Hero.useEffect"], {
                "Hero.useEffect": (e)=>console.warn("[Hero] muted video.play() failed", e)
            }["Hero.useEffect"]);
        }
    }["Hero.useEffect"], [
        isStreamReady
    ]);
    // Reset audioOn when session ends.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hero.useEffect": ()=>{
            if (uiState === "idle") setAudioOn(false);
        }
    }["Hero.useEffect"], [
        uiState
    ]);
    const enableAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[enableAudio]": ()=>{
            const target = desktopVideoRef.current ?? mobileVideoRef.current;
            if (!target) return;
            target.muted = false;
            target.play().then({
                "Hero.useCallback[enableAudio]": ()=>{
                    console.log("[Hero] enableAudio() — audio is live");
                    setAudioOn(true);
                }
            }["Hero.useCallback[enableAudio]"], {
                "Hero.useCallback[enableAudio]": (e)=>{
                    console.warn("[Hero] enableAudio() blocked", e);
                    target.muted = true;
                    setAudioOn(false);
                }
            }["Hero.useCallback[enableAudio]"]);
        }
    }["Hero.useCallback[enableAudio]"], []);
    const toggleAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Hero.useCallback[toggleAudio]": ()=>{
            const target = desktopVideoRef.current ?? mobileVideoRef.current;
            if (!target) return;
            if (target.muted) {
                enableAudio();
            } else {
                target.muted = true;
                setAudioOn(false);
            }
        }
    }["Hero.useCallback[toggleAudio]"], [
        enableAudio
    ]);
    // Cleanup on unmount.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hero.useEffect": ()=>{
            return ({
                "Hero.useEffect": ()=>{
                    void cleanupSession();
                }
            })["Hero.useEffect"];
        }
    }["Hero.useEffect"], [
        cleanupSession
    ]);
    // Swallow uncaught SessionApiError noise from the HeyGen SDK so it doesn't
    // hit Next.js's dev error overlay. Two leaks exist:
    //   1) LiveAvatarSession.start() runs `console.error("Session start failed:", err)`
    //      before re-throwing — our own catch already shows the message in the
    //      UI, so the console.error is duplicate noise that the dev overlay
    //      surfaces as a "Console Error".
    //   2) The same start() then fires `this.cleanup()` without awaiting, which
    //      calls stopSession() on a session that was never created. HeyGen
    //      replies 404 "Session not found" → unhandled rejection.
    // Match by message content (and constructor name as a fallback), and use
    // capture-phase listeners so we run before the dev overlay's handler.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hero.useEffect": ()=>{
            const isSdkSessionError = {
                "Hero.useEffect.isSdkSessionError": (r)=>{
                    if (!r || typeof r !== "object") return false;
                    const obj = r;
                    if (obj.constructor?.name === "SessionApiError" || obj.name === "SessionApiError") {
                        return true;
                    }
                    const msg = typeof obj.message === "string" ? obj.message : "";
                    return /Session not found|concurrency limit|API request failed/i.test(msg);
                }
            }["Hero.useEffect.isSdkSessionError"];
            const onRejection = {
                "Hero.useEffect.onRejection": (e)=>{
                    if (isSdkSessionError(e.reason)) e.preventDefault();
                }
            }["Hero.useEffect.onRejection"];
            const onError = {
                "Hero.useEffect.onError": (e)=>{
                    if (isSdkSessionError(e.error) || /Session not found|concurrency limit/i.test(e.message ?? "")) {
                        e.preventDefault();
                    }
                }
            }["Hero.useEffect.onError"];
            // Filter the SDK's own console.error("Session start failed:", ...) call
            // — the dev overlay reads console.error to flag "Console Error".
            const origConsoleError = console.error;
            const patchedConsoleError = {
                "Hero.useEffect.patchedConsoleError": (...args)=>{
                    const first = args[0];
                    if (typeof first === "string" && first.startsWith("Session start failed:")) return;
                    if (args.some(isSdkSessionError)) return;
                    origConsoleError.apply(console, args);
                }
            }["Hero.useEffect.patchedConsoleError"];
            console.error = patchedConsoleError;
            window.addEventListener("unhandledrejection", onRejection, true);
            window.addEventListener("error", onError, true);
            return ({
                "Hero.useEffect": ()=>{
                    window.removeEventListener("unhandledrejection", onRejection, true);
                    window.removeEventListener("error", onError, true);
                    if (console.error === patchedConsoleError) console.error = origConsoleError;
                }
            })["Hero.useEffect"];
        }
    }["Hero.useEffect"], []);
    // Fire-and-forget backend flush when the tab is closing. We can't await
    // fetch() during beforeunload, but sendBeacon will queue the POST so the
    // partial transcript still lands as a Lead instead of being lost.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hero.useEffect": ()=>{
            const handler = {
                "Hero.useEffect.handler": ()=>{
                    const sessionId = backendSessionIdRef.current;
                    if (!sessionId || endedHandledRef.current) return;
                    endedHandledRef.current = true;
                    const fd = new FormData();
                    fd.append("session_id", sessionId);
                    fd.append("transcript", JSON.stringify(transcriptRef.current));
                    if (visitorNameRef.current) fd.append("visitor_name", visitorNameRef.current);
                    if (visitorEmailRef.current) fd.append("visitor_email", visitorEmailRef.current);
                    if (visitorPhoneRef.current) fd.append("visitor_phone", visitorPhoneRef.current);
                    try {
                        navigator.sendBeacon("/api/conversation/end/", fd);
                    } catch  {
                    // best-effort; nothing else to do during unload
                    }
                }
            }["Hero.useEffect.handler"];
            window.addEventListener("beforeunload", handler);
            return ({
                "Hero.useEffect": ()=>window.removeEventListener("beforeunload", handler)
            })["Hero.useEffect"];
        }
    }["Hero.useEffect"], []);
    const onPrimaryClick = async ()=>{
        console.log("[Hero] primary button clicked, uiState =", uiState);
        if (uiState === "live") {
            await stopSession();
            return;
        }
        if (uiState === "connecting" || uiState === "ending") {
            await cleanupSession();
            setIsStreamReady(false);
            setUiState("idle");
        }
        void startSession(active);
    };
    const onChatNowClick = ()=>{
        void startSession(active);
    };
    const onIndustryClick = async (next)=>{
        setActive(next);
        if (uiState === "live" || uiState === "connecting") {
            setUiState("ending");
            await cleanupSession();
            setIsStreamReady(false);
            await startSession(next);
        }
    };
    const onSendText = (text)=>{
        const session = sessionRef.current;
        if (!session) return;
        // Don't add locally — the LiveAvatar backend will emit USER_TRANSCRIPTION
        // for this typed input and our listener will render it. Adding here
        // produces a duplicate "You: …" entry.
        try {
            session.message(text);
        } catch (e) {
            console.warn("[Hero] message() failed", e);
        }
    };
    const onToggleMute = ()=>{
        const session = sessionRef.current;
        // No active session yet — just toggle the visual state so the button
        // responds. When a session starts, voice chat events will reset it.
        if (!session) {
            setIsMuted((v)=>!v);
            return;
        }
        try {
            if (isMuted) {
                session.voiceChat.unmute();
            } else {
                session.voiceChat.mute();
            }
        // On success the SDK fires VoiceChatEvent.MUTED/UNMUTED which updates
        // isMuted via the listener — don't toggle here or we'd double-flip.
        } catch (e) {
            // SDK rejects (e.g. voice chat never activated because the browser
            // blocked getUserMedia on this insecure origin). Fall back to an
            // optimistic visual toggle so the user still gets feedback.
            console.warn("[Hero] voiceChat toggle failed", e);
            setIsMuted((v)=>!v);
        }
    };
    const buttonLabel = uiState === "live" ? "END CALL" : uiState === "connecting" ? "CONNECTING…" : uiState === "ending" ? "ENDING…" : "START TALKING";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "try-demo",
        className: "relative z-10 pt-6 lg:pt-16 pb-12 lg:pb-32 overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6 sm:space-y-8 relative z-20",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neon",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "w-1.5 h-1.5 rounded-full bg-neon"
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 843,
                                    columnNumber: 13
                                }, this),
                                "Now available for all industries"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 842,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-neon",
                                    children: "Voice-Powered"
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 848,
                                    columnNumber: 13
                                }, this),
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 848,
                                    columnNumber: 62
                                }, this),
                                " Websites!"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 847,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "lg:hidden block w-full max-w-sm mx-auto my-10 relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute w-[300px] h-[300px] bg-neon/10 rounded-full blur-[80px] -z-10 animate-pulse left-1/2 -translate-x-1/2 top-10"
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 852,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AvatarStage, {
                                    videoRef: mobileVideoRef,
                                    uiState: uiState,
                                    isStreamReady: isStreamReady,
                                    errorMessage: errorMessage,
                                    onStart: onChatNowClick,
                                    audioOn: audioOn,
                                    onEnableAudio: enableAudio,
                                    onToggleAudio: toggleAudio
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 853,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatPanel, {
                                    uiState: uiState,
                                    messages: messages,
                                    onSend: onSendText,
                                    onToggleMute: onToggleMute,
                                    isMuted: isMuted
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 863,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 851,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed mb-3 sm:mb-4",
                                    children: "Stop losing customers to missed calls. I answer enquiries, book appointments & capture leads — 24/7. You're looking at one right now."
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 873,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-neon mb-6 sm:mb-8 flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
                                            className: "w-4 h-4",
                                            strokeWidth: 1.5
                                        }, void 0, false, {
                                            fileName: "[project]/components/Hero.tsx",
                                            lineNumber: 878,
                                            columnNumber: 15
                                        }, this),
                                        uiState === "live" ? "Live — speak now." : "I'm listening! Speak to test the demo."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 877,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>void onPrimaryClick(),
                                    className: "group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#ccff00] text-black text-xs sm:text-sm font-bold rounded-full shadow-[0_0_40px_-10px_rgba(204,255,0,0.6)] hover:shadow-[0_0_60px_-10px_rgba(204,255,0,0.8)] border-t border-white/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-x-0 top-0 h-1/2 glass-shine opacity-60 pointer-events-none"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Hero.tsx",
                                            lineNumber: 887,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "relative z-10 flex items-center gap-2",
                                            children: [
                                                uiState === "connecting" || uiState === "ending" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-5 h-5 animate-spin",
                                                    strokeWidth: 1.5
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Hero.tsx",
                                                    lineNumber: 890,
                                                    columnNumber: 19
                                                }, this) : uiState === "live" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__["MicOff"], {
                                                    className: "w-5 h-5",
                                                    strokeWidth: 1.5
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Hero.tsx",
                                                    lineNumber: 892,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                                    className: "w-5 h-5 fill-black/10",
                                                    strokeWidth: 1.5
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Hero.tsx",
                                                    lineNumber: 894,
                                                    columnNumber: 19
                                                }, this),
                                                buttonLabel
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Hero.tsx",
                                            lineNumber: 888,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            className: "w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform",
                                            strokeWidth: 1.5
                                        }, void 0, false, {
                                            fileName: "[project]/components/Hero.tsx",
                                            lineNumber: 898,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 882,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 872,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-4 sm:pt-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-medium text-gray-500 uppercase tracking-widest mb-4 sm:mb-6",
                                    children: "Pick your industry"
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 903,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-3 sm:gap-6",
                                    children: INDUSTRIES.map((ind)=>{
                                        const isActive = active === ind.id;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>void onIndustryClick(ind.id),
                                            className: `avatar-btn ${isActive ? "avatar-active" : ""} flex flex-col items-center gap-2 sm:gap-3 group cursor-pointer transition-all`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `avatar-ring w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 overflow-hidden relative transition-all duration-300 bg-black ${isActive ? "transform scale-110" : "border border-white/20 group-hover:border-[#ccff00]"}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: ind.icon,
                                                        alt: ind.label,
                                                        width: 64,
                                                        height: 64,
                                                        className: `w-full h-full object-cover rounded-full transition-all duration-300 ${isActive ? "" : "filter grayscale opacity-70 group-hover:opacity-100"}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/Hero.tsx",
                                                        lineNumber: 919,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Hero.tsx",
                                                    lineNumber: 914,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] uppercase font-semibold tracking-wider text-gray-400 group-hover:text-white transition-colors",
                                                    children: ind.label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Hero.tsx",
                                                    lineNumber: 929,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, ind.id, true, {
                                            fileName: "[project]/components/Hero.tsx",
                                            lineNumber: 908,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 904,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 902,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Hero.tsx",
                    lineNumber: 841,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "hidden lg:flex flex-col relative items-center justify-start",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute w-[400px] h-[400px] bg-neon/10 rounded-full blur-[100px] -z-10 animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 940,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative z-10 w-full max-w-sm mx-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AvatarStage, {
                                    videoRef: desktopVideoRef,
                                    uiState: uiState,
                                    isStreamReady: isStreamReady,
                                    errorMessage: errorMessage,
                                    onStart: onChatNowClick,
                                    audioOn: audioOn,
                                    onEnableAudio: enableAudio,
                                    onToggleAudio: toggleAudio
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 942,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatPanel, {
                                    uiState: uiState,
                                    messages: messages,
                                    onSend: onSendText,
                                    onToggleMute: onToggleMute,
                                    isMuted: isMuted
                                }, void 0, false, {
                                    fileName: "[project]/components/Hero.tsx",
                                    lineNumber: 952,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Hero.tsx",
                            lineNumber: 941,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Hero.tsx",
                    lineNumber: 939,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Hero.tsx",
            lineNumber: 840,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Hero.tsx",
        lineNumber: 839,
        columnNumber: 5
    }, this);
}
_s1(Hero, "EDuODfF1stf4tU3uOnXxI0WRAFE=");
_c2 = Hero;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "AvatarStage");
__turbopack_context__.k.register(_c1, "ChatPanel");
__turbopack_context__.k.register(_c2, "Hero");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_Hero_tsx_0.~ybu9._.js.map