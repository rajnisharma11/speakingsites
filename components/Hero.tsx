"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { LiveAvatarSession as LiveAvatarSessionType } from "@heygen/liveavatar-web-sdk";

// An agent's slug. Agents are configured per client in the backend now, so
// this is an open-ended string rather than a fixed union.
type Industry = string;

type AgentOption = { id: Industry; label: string; icon: string };

// Fallback avatar picker, used only if the backend agent list is unreachable
// or empty so the marketing page never renders an empty picker.
const FALLBACK_INDUSTRIES: AgentOption[] = [
  { id: "plumber", label: "Plumber", icon: "/images/Plumbericon.png" },
  { id: "lawyer", label: "Lawyer", icon: "/images/lawyericon.png" },
  { id: "medical", label: "Medical", icon: "/images/nurseicon.png" },
  { id: "builder", label: "Builder", icon: "/images/buildericon.png" },
  { id: "salon", label: "Salon", icon: "/images/Plasterericon.png" },
];

type UiState = "idle" | "connecting" | "live" | "ending" | "error";

type ChatMsg = { sender: "user" | "avatar"; text: string; ts: number };

// Pull visitor name / email / phone out of what the user just said. Voice and
// typed transcripts both flow through here, so the patterns are deliberately
// loose. We only return fields we found; the caller keeps the first non-empty
// hit per session so a later message saying "and my friend's name is …"
// doesn't overwrite the real visitor.
function extractVisitorInfo(text: string): {
  name?: string;
  email?: string;
  phone?: string;
} {
  const out: { name?: string; email?: string; phone?: string } = {};

  const emailMatch = text.match(/\b[\w.+-]+@[\w-]+\.[\w-]+(?:\.[\w-]+)*\b/);
  if (emailMatch) out.email = emailMatch[0];

  // Phone: tolerate +, spaces, dashes, parens, dots. Strip them before saving.
  // Require at least 9 digits so we don't grab "I have 3 cats and 2 kids".
  const phoneRaw = text.match(
    /(\+?\d[\d\s().-]{7,}\d)/,
  );
  if (phoneRaw) {
    const digits = phoneRaw[1].replace(/[^\d+]/g, "");
    if (digits.replace(/\D/g, "").length >= 9) out.phone = digits;
  }

  // Name: only match explicit self-introduction patterns. "I'm" alone is too
  // ambiguous ("I'm calling about…"), so stick to "my name is / this is /
  // I'm called / name's".
  const nameMatch = text.match(
    /(?:my name is|name's|this is|i'?m called)\s+([a-z][a-z'\-]+(?:\s+[a-z][a-z'\-]+){0,2})/i,
  );
  if (nameMatch) {
    out.name = nameMatch[1]
      .trim()
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  return out;
}

function AvatarStage({
  videoRef,
  uiState,
  isStreamReady,
  errorMessage,
  onStart,
  audioOn,
  onEnableAudio,
  onToggleAudio,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  uiState: UiState;
  isStreamReady: boolean;
  errorMessage: string | null;
  onStart: () => void;
  audioOn: boolean;
  onEnableAudio: () => void;
  onToggleAudio: () => void;
}) {
  return (
    <div className="hero-avatar relative overflow-hidden h-[400px] w-full max-w-[380px] mx-auto group rounded-[10px] bg-black">
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`absolute inset-0 z-10 w-full h-full object-cover transition-opacity duration-300 ${
          isStreamReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Audio toggle (top-right) — visible whenever stream is live. */}
      {uiState === "live" && isStreamReady && (
        <button
          type="button"
          onClick={onToggleAudio}
          title={audioOn ? "Mute avatar audio" : "Unmute avatar audio"}
          className="absolute top-3 right-3 z-30 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors cursor-pointer"
        >
          {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      )}

      {/* Big "Enable sound" CTA shown once stream is live but audio is still muted
          (autoplay policy kept it silent). Direct click = fresh user gesture. */}
      {uiState === "live" && isStreamReady && !audioOn && (
        <button
          type="button"
          onClick={onEnableAudio}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon text-black text-xs font-bold shadow-lg hover:bg-white transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          Click to enable sound
        </button>
      )}

      {uiState === "idle" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-center px-6 bg-black/40 backdrop-blur-[2px]">
          <Mic className="w-10 h-10 text-neon" strokeWidth={1.5} />
          <p className="text-sm text-gray-300">Voice-powered demo avatar</p>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon text-black text-sm font-bold hover:bg-white transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4" strokeWidth={2} />
            Chat now
          </button>
        </div>
      )}

      {(uiState === "connecting" || (uiState === "live" && !isStreamReady)) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
          <Loader2 className="w-10 h-10 text-neon animate-spin" strokeWidth={1.5} />
          <p className="text-sm text-gray-300">Connecting…</p>
        </div>
      )}

      {uiState === "ending" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60">
          <Loader2 className="w-10 h-10 text-gray-400 animate-spin" strokeWidth={1.5} />
          <p className="text-sm text-gray-300">Ending…</p>
        </div>
      )}

      {uiState === "error" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
          <MicOff className="w-10 h-10 text-red-400" strokeWidth={1.5} />
          <p className="text-sm text-red-300">{errorMessage ?? "Something went wrong."}</p>
        </div>
      )}
    </div>
  );
}

function ChatPanel({
  uiState,
  messages,
  onSend,
  onToggleMute,
  isMuted,
}: {
  uiState: UiState;
  messages: ChatMsg[];
  onSend: (text: string) => void;
  onToggleMute: () => void;
  isMuted: boolean;
}) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll the chat list to the bottom only — never call scrollIntoView,
  // which scrolls the whole page to bring the element into view and was
  // causing the page to jump down to the hero chat panel on mount.
  useEffect(() => {
    if (messages.length === 0) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const disabled = uiState !== "live";

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <div className="mt-4 w-full max-w-sm mx-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Chat</p>
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? "Unmute mic" : "Mute mic"}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
            isMuted
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          }`}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {isMuted ? "Muted" : "Mic on"}
        </button>
      </div>

      <div ref={listRef} className="h-32 sm:h-40 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-6">
            {disabled
              ? "Start a session to chat."
              : "Speak, or type below."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-xs leading-relaxed ${
              m.sender === "user"
                ? "self-end bg-neon/15 text-neon border border-neon/20"
                : "self-start bg-white/10 text-gray-200 border border-white/5"
            }`}
          >
            <span className="block text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
              {m.sender === "user" ? "You" : "Avatar"}
            </span>
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 border-t border-white/10">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          disabled={disabled}
          placeholder={disabled ? "Session offline…" : "Type a message…"}
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-md px-2 sm:px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-neon text-black text-sm font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}

export function Hero() {
  const [active, setActive] = useState<Industry>("plumber");
  const [uiState, setUiState] = useState<UiState>("idle");
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  // Disables the avatar tabs during a connect/switch (+ a short cooldown after)
  // so a burst of clicks can't spawn overlapping sessions / trip the limit.
  const [tabsLocked, setTabsLocked] = useState(false);
  const [industries, setIndustries] = useState<AgentOption[]>(FALLBACK_INDUSTRIES);

  // Load the avatar picker from the backend (per-client agents). Each entry's
  // id is the agent slug, which is what we pass to the token + conversation
  // endpoints. Falls back to FALLBACK_INDUSTRIES if the request fails or
  // returns nothing.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agents");
        if (!res.ok) return;
        const json = (await res.json()) as {
          agents?: { slug: string; name: string; icon: string | null }[];
        };
        const list: AgentOption[] = (json.agents ?? [])
          .filter((a) => a.slug && a.name)
          .map((a) => ({
            id: a.slug,
            label: a.name,
            icon: a.icon || "/images/Plumbericon.png",
          }));
        if (!cancelled && list.length > 0) {
          setIndustries(list);
          // Keep the current selection if it's still offered; otherwise pick
          // the first agent so the picker always has a valid active item.
          setActive((cur) => (list.some((x) => x.id === cur) ? cur : list[0].id));
        }
      } catch {
        // keep the fallback list
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSessionType | null>(null);
  // Set synchronously the instant a start begins, so a fast second tab click
  // can't kick off an overlapping session during the ~1–2s token fetch (before
  // sessionRef is assigned). Without this, two sessions race for one <video>
  // and the avatar shows black. Cleared once sessionRef takes over, or on error.
  const startingRef = useRef(false);
  // Timer handle for the post-switch tab cooldown (cleared on unmount).
  const tabLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Backend persistence refs (Laravel widget conversation API).
  const backendSessionIdRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Transcript with ISO timestamps + backend roles ("assistant" not "avatar"),
  // mirrored from the SDK's transcription events.
  const transcriptRef = useRef<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const endedHandledRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Visitor identity scraped from the user's own transcript. First non-empty
  // hit wins so a later utterance ("my wife's name is …") can't overwrite the
  // real lead. Flushed to the backend on every transcript update.
  const visitorNameRef = useRef<string | null>(null);
  const visitorEmailRef = useRef<string | null>(null);
  const visitorPhoneRef = useRef<string | null>(null);

  // Auto-reconnect is intentionally removed — sessions end naturally (user
  // clicks END, or the server terminates the session) and the UI returns
  // to idle. With the LiveAvatar plan upgraded the per-session cap no
  // longer fires mid-conversation, so silent restarts aren't needed; if a
  // session does end for any reason the visitor just clicks Start again.
  // How many times to retry the token request on "concurrency limit" before
  // surfacing the friendly error. Handles brief races against a session that
  // just ended on the server. Total wait = ~3s + ~6s = 9s in the worst case.
  const CONCURRENCY_RETRY_DELAYS_MS = [3000, 6000];
  // Tracks the current industry in a ref so disconnect-time logic doesn't
  // capture a stale value from a listener closure registered earlier.
  const activeIndustryRef = useRef<Industry>("plumber");
  // LiveAvatar's session id from the token response. We hold onto it so the
  // beforeunload beacon can release the concurrency slot — otherwise a tab
  // reload leaves the session "running" server-side until the per-tier hard
  // cap (60s) reaps it, and the next visitor sees "demo is busy".
  const liveAvatarSessionIdRef = useRef<string | null>(null);

  // Avatar-speech noise guard. LiveAvatar's CONVERSATIONAL mode runs VAD on
  // the visitor's mic and interrupts the avatar the moment it hears any
  // noise (TV, kids, traffic, even the visitor breathing). The SDK exposes
  // NO VAD sensitivity dial — the only fix is to mute the mic while the
  // avatar speaks and unmute when it finishes.
  //   • userWantsMicOnRef tracks the visitor's INTENT (set by the mic
  //     toggle button). The auto-unmute on AVATAR_SPEAK_ENDED respects it
  //     so we don't reopen a mic the user explicitly muted.
  //   • avatarSpeakingMutedRef tells the AVATAR_SPEAK_ENDED handler "yes,
  //     it was *us* who muted just now" so we don't keep unmuting when the
  //     mic was already off for some other reason.
  const userWantsMicOnRef = useRef(true);
  const avatarSpeakingMutedRef = useRef(false);

  // Disconnect diagnostics. SESSION_DISCONNECTED only gives us a coarse
  // SessionDisconnectReason (SERVER_INITIATED / UNKNOWN / etc.); the real
  // reason (MAX_DURATION_REACHED, IDLE_TIMEOUT, AGENT_HANG_UP, …) only comes
  // through SESSION_STOPPED's stop_reason payload. We capture it in a ref
  // so the SESSION_DISCONNECTED handler can read it when deciding whether
  // to reconnect. sessionStartedAtRef + sessionLiveAtRef let us log the
  // exact age of the session when it died, which is the only way to tell
  // "60s cap fired" from "idle timeout fired at 30s" from "instant crash".
  const lastStopReasonRef = useRef<string | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const sessionLiveAtRef = useRef<number | null>(null);

  // Progressive transcript flush. Backend /end is idempotent — it replaces
  // the conversation's messages on every call — so we can safely re-POST
  // the growing transcript while the call is still live. Without this, a
  // tab close or browser crash mid-conversation would lose everything.
  const appendVisitorFields = useCallback((fd: FormData) => {
    if (visitorNameRef.current) fd.append("visitor_name", visitorNameRef.current);
    if (visitorEmailRef.current) fd.append("visitor_email", visitorEmailRef.current);
    if (visitorPhoneRef.current) fd.append("visitor_phone", visitorPhoneRef.current);
  }, []);

  const flushTranscript = useCallback(async () => {
    const sessionId = backendSessionIdRef.current;
    if (!sessionId || endedHandledRef.current) return;
    if (transcriptRef.current.length === 0) return;
    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append("transcript", JSON.stringify(transcriptRef.current));
    appendVisitorFields(fd);
    try {
      await fetch("/api/conversation/end/", { method: "POST", body: fd });
    } catch (e) {
      console.warn("[Hero] transcript flush failed", e);
    }
  }, [appendVisitorFields]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      void flushTranscript();
    }, 1500);
  }, [flushTranscript]);

  const finaliseBackendSession = useCallback(async () => {
    const sessionId = backendSessionIdRef.current;
    if (!sessionId || endedHandledRef.current) return;
    endedHandledRef.current = true;
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    // Stop the mic recorder and collect its audio blob (if any).
    const audioBlob = await new Promise<Blob | null>((resolve) => {
      const rec = recorderRef.current;
      if (!rec || rec.state === "inactive") {
        resolve(null);
        return;
      }
      rec.addEventListener(
        "stop",
        () => {
          if (audioChunksRef.current.length === 0) {
            resolve(null);
            return;
          }
          resolve(new Blob(audioChunksRef.current, { type: rec.mimeType }));
        },
        { once: true },
      );
      try {
        rec.stop();
      } catch {
        resolve(null);
      }
    });
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
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
      await fetch("/api/conversation/end/", { method: "POST", body: fd });
    } catch (e) {
      console.warn("[Hero] backend end failed", e);
    }

    backendSessionIdRef.current = null;
    audioChunksRef.current = [];
    transcriptRef.current = [];
    visitorNameRef.current = null;
    visitorEmailRef.current = null;
    visitorPhoneRef.current = null;
    // The SDK's stop() already released the LiveAvatar slot for us; clearing
    // the ref prevents the beforeunload beacon from posting a redundant stop
    // for an already-dead session.
    liveAvatarSessionIdRef.current = null;
  }, [appendVisitorFields]);

  const cleanupSession = useCallback(async () => {
    await finaliseBackendSession();
    const s = sessionRef.current;
    sessionRef.current = null;
    if (!s) return;
    try {
      await s.stop();
    } catch {
      // already disconnected
    }
  }, [finaliseBackendSession]);

  const stopSession = useCallback(async () => {
    setUiState("ending");
    await cleanupSession();
    setIsStreamReady(false);
    setUiState("idle");
  }, [cleanupSession]);

  const startSession = useCallback(async (industry: Industry) => {
    console.log("[Hero] startSession() called", { industry });
    if (sessionRef.current || startingRef.current) {
      console.warn("[Hero] aborting: a session is already starting/active");
      return;
    }
    startingRef.current = true;
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
    // Default to mic-on, matching the auto-unmute in the CONNECTED handler.
    userWantsMicOnRef.current = true;
    avatarSpeakingMutedRef.current = false;

    try {
      // Retry the token request on transient "concurrency limit" errors.
      // The most common cause is timing: a session we (or the LiveAvatar
      // tier's other tenants) just ended hasn't released its slot yet.
      // Backoff schedule lives in CONCURRENCY_RETRY_DELAYS_MS above; non-
      // concurrency errors short-circuit so we don't waste time retrying a
      // genuine bug.
      type TokenPayload = {
        sessionToken: string;
        sessionId: string;
        avatarId: string;
        isSandbox: boolean;
        resolvedSource: string;
        // The cap LiveAvatar actually accepted for this session — may be
        // lower than LIVEAVATAR_MAX_SESSION_DURATION if the token route's
        // cap-exceeded retry path kicked in. Null if no cap was sent.
        maxSessionDuration: number | null;
        // Per-industry context — proves the right agent's training was
        // used. "industry" is the desired source; "global" means the
        // per-industry env var isn't set yet; "none" means no context at
        // all (avatar will use its built-in persona, not trained config).
        contextId: string | null;
        contextSource: "agent" | "industry" | "global" | "none";
        agentSlug: string | null;
        industry: string | null;
      };
      const requestToken = async (): Promise<TokenPayload> => {
        const res = await fetch("/api/avatar/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentSlug: industry }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `Token request failed (${res.status})`);
        }
        return (await res.json()) as TokenPayload;
      };
      let payload: TokenPayload | null = null;
      let lastErr: unknown = null;
      const attempts = [0, ...CONCURRENCY_RETRY_DELAYS_MS];
      for (let i = 0; i < attempts.length; i++) {
        if (attempts[i] > 0) {
          console.log(
            "[Hero] retrying token request after " + attempts[i] + "ms",
          );
          await new Promise((r) => setTimeout(r, attempts[i]));
        }
        try {
          payload = await requestToken();
          break;
        } catch (e) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : String(e);
          // Only retry on concurrency-limit; everything else (auth, invalid
          // avatar id, network) is a hard failure.
          if (!/concurrency limit/i.test(msg)) throw e;
          console.warn(
            "[Hero] token concurrency-limit (attempt " +
              (i + 1) +
              "/" +
              attempts.length +
              ")",
          );
        }
      }
      if (!payload) throw lastErr ?? new Error("Token request failed");
      liveAvatarSessionIdRef.current = payload.sessionId;
      sessionStartedAtRef.current = Date.now();
      sessionLiveAtRef.current = null;
      lastStopReasonRef.current = null;
      console.log("[Hero] token OK", payload);

      const {
        LiveAvatarSession,
        SessionEvent,
        SessionState,
        AgentEventsEnum,
        VoiceChatEvent,
      } = await import("@heygen/liveavatar-web-sdk");
      const session = new LiveAvatarSession(payload.sessionToken, {
        voiceChat: true,
      });
      sessionRef.current = session;
      // sessionRef now guards re-entry; release the synchronous start lock.
      startingRef.current = false;

      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        console.log("[Hero] SESSION_STREAM_READY");
        setIsStreamReady(true);
      });

      session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
        console.log("[Hero] SESSION_STATE_CHANGED →", state);
        if (state === SessionState.CONNECTED) {
          sessionLiveAtRef.current = Date.now();
          // Surface the actual tier cap so we can see in the console whether
          // we're being throttled to 60s (free tier), 300s, 1800s, etc.
          const max = session.maxSessionDuration;
          console.log(
            "[Hero] session CONNECTED — maxSessionDuration=" +
              (max == null ? "null (no cap reported)" : max + "s") +
              ", sessionId=" +
              (session.sessionId ?? "n/a"),
          );
          setUiState("live");
          // Auto-unmute the mic so voice chat works immediately. The user
          // can still mute via the toggle in the chat panel. Without this,
          // visitors press "Chat now" and wonder why the avatar can't hear
          // them — they didn't realise voice chat starts muted. Record the
          // intent so the avatar-speech noise guard knows to restore the
          // mic after each utterance.
          try {
            userWantsMicOnRef.current = true;
            session.voiceChat.unmute();
          } catch (e) {
            console.warn("[Hero] auto-unmute failed", e);
          }
        }
        // DISCONNECTED is handled by SESSION_DISCONNECTED below, which
        // also carries the disconnect reason for the log line. The SDK
        // emits state-change first, then SESSION_DISCONNECTED, so doing
        // nothing here keeps the teardown ordering consistent.
      });

      // Capture the precise server-side stop reason. SESSION_STOPPED fires
      // just before SESSION_DISCONNECTED with the exact enum value
      // (MAX_DURATION_REACHED / IDLE_TIMEOUT / AGENT_HANG_UP / etc.). Now
      // that auto-reconnect is gone we don't branch on this, but it's still
      // logged so unexpected early ends are easy to diagnose.
      session.on(
        AgentEventsEnum.SESSION_STOPPED,
        (e: { stop_reason: string }) => {
          lastStopReasonRef.current = e?.stop_reason ?? null;
          console.log("[Hero] SESSION_STOPPED stop_reason=", e?.stop_reason);
        },
      );

      session.on(SessionEvent.SESSION_DISCONNECTED, (reason) => {
        const now = Date.now();
        const ageSinceStart = sessionStartedAtRef.current
          ? ((now - sessionStartedAtRef.current) / 1000).toFixed(1) + "s"
          : "n/a";
        const ageSinceLive = sessionLiveAtRef.current
          ? ((now - sessionLiveAtRef.current) / 1000).toFixed(1) + "s"
          : "never went live";
        const stopReason = lastStopReasonRef.current;
        console.log(
          "[Hero] SESSION_DISCONNECTED reason=" +
            reason +
            " stop_reason=" +
            (stopReason ?? "none") +
            " ageSinceStart=" +
            ageSinceStart +
            " ageSinceLive=" +
            ageSinceLive,
        );
        sessionRef.current = null;
        setIsStreamReady(false);

        // Auto-reconnect was removed — every disconnect routes straight to
        // idle. The visitor clicks Start again if they want to keep going.
        // stop_reason is still logged above for diagnostics (e.g. spotting
        // an unexpected MAX_DURATION_REACHED that means the env var isn't
        // matching your LiveAvatar tier cap, or an IDLE_TIMEOUT that means
        // the keep-alive heartbeat needs tightening).
        setUiState("idle");
        void finaliseBackendSession();
      });

      // Voice chat mute/unmute state mirrors the SDK's voice chat events.
      session.voiceChat.on(VoiceChatEvent.MUTED, () => setIsMuted(true));
      session.voiceChat.on(VoiceChatEvent.UNMUTED, () => setIsMuted(false));

      // Transcription → chat log + backend transcript buffer (debounced flush).
      session.on(
        AgentEventsEnum.USER_TRANSCRIPTION,
        (e: { text: string }) => {
          if (!e?.text) return;
          setMessages((prev) => [
            ...prev,
            { sender: "user", text: e.text, ts: Date.now() },
          ]);
          transcriptRef.current.push({
            role: "user",
            content: e.text,
            timestamp: new Date().toISOString(),
          });
          const found = extractVisitorInfo(e.text);
          if (found.name && !visitorNameRef.current) visitorNameRef.current = found.name;
          if (found.email && !visitorEmailRef.current) visitorEmailRef.current = found.email;
          if (found.phone && !visitorPhoneRef.current) visitorPhoneRef.current = found.phone;
          scheduleFlush();
        },
      );
      session.on(
        AgentEventsEnum.AVATAR_TRANSCRIPTION,
        (e: { text: string }) => {
          if (!e?.text) return;
          setMessages((prev) => [
            ...prev,
            { sender: "avatar", text: e.text, ts: Date.now() },
          ]);
          transcriptRef.current.push({
            role: "assistant",
            content: e.text,
            timestamp: new Date().toISOString(),
          });
          scheduleFlush();
        },
      );

      // Noise guard: mute the mic for the duration of every avatar utterance
      // so background noise can't trip VAD and chop the avatar mid-sentence.
      // Only auto-mute if the visitor hasn't already muted manually.
      session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        if (!userWantsMicOnRef.current) return;
        try {
          session.voiceChat.mute();
          avatarSpeakingMutedRef.current = true;
        } catch (e) {
          console.warn("[Hero] avatar-speak mute failed", e);
        }
      });
      session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
        // Only restore if we were the ones who muted. If the visitor flipped
        // the toggle mid-utterance, leave the mic where they put it.
        if (!avatarSpeakingMutedRef.current) return;
        avatarSpeakingMutedRef.current = false;
        if (!userWantsMicOnRef.current) return;
        try {
          session.voiceChat.unmute();
        } catch (e) {
          console.warn("[Hero] avatar-speak unmute failed", e);
        }
      });

      // Persist the session in the Laravel backend BEFORE the HeyGen
      // handshake — if HeyGen fails or the user drops, we still have a
      // Lead row and any partial transcript will land via the debounced
      // flush. Idempotent: each transcription flushes the same row.
      try {
        const res = await fetch("/api/conversation/start/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // industry is the agent slug — send it as agentSlug so the lead is
          // attributed to the chosen avatar (niche or sales) in the backend.
          body: JSON.stringify({ avatarType: industry, agentSlug: industry }),
        });
        if (res.ok) {
          const j = (await res.json()) as { sessionId: string };
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
          throw new Error(
            "Microphone API unavailable in this context (requires HTTPS or localhost).",
          );
        }
        // Enable browser-side noise suppression, echo cancellation and
        // auto-gain so the recorded audio doesn't capture every kid /
        // dog / lawnmower around the visitor. Defaults vary by browser;
        // setting these explicitly forces the cleanup pipeline on.
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = stream;
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const rec = new MediaRecorder(stream, { mimeType: mime });
        rec.addEventListener("dataavailable", (ev) => {
          if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
        });
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
      const msg = /concurrency limit/i.test(raw)
        ? "The demo is busy right now — please try again in a moment."
        : raw;
      setErrorMessage(msg);
      setUiState("error");
      sessionRef.current = null;
      // Released so the visitor can retry after a failed start (e.g. the
      // token fetch threw before a session object was ever created).
      startingRef.current = false;
      // Flush whatever we captured and finalise the row so the failed
      // attempt still appears as a Lead (with whatever transcript exists).
      void finaliseBackendSession();
    }
  }, [finaliseBackendSession, scheduleFlush]);

  // Pick whichever <video> element is actually on-screen. Both refs always
  // exist in the React tree (we render both desktop and mobile stages and
  // toggle visibility with Tailwind's `lg:hidden` / `hidden lg:flex`), so
  // the desktop ref is set even on mobile — attaching to it would put the
  // stream on a `display:none` element and the visitor sees a black box
  // (this was the "avatar not showing on mobile" bug). 1024px matches
  // Tailwind's `lg` breakpoint.
  const pickActiveVideoRef = useCallback((): HTMLVideoElement | null => {
    if (typeof window === "undefined") {
      return desktopVideoRef.current ?? mobileVideoRef.current;
    }
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    return (
      (isDesktop ? desktopVideoRef.current : mobileVideoRef.current) ??
      desktopVideoRef.current ??
      mobileVideoRef.current
    );
  }, []);

  // Attach stream to the visible <video> once ready, then try to unmute.
  // Re-runs when the viewport crosses the lg breakpoint (rotation, devtools
  // resize) so the stream follows the visible element instead of stranding
  // on a hidden one.
  useEffect(() => {
    if (!isStreamReady) return;
    const session = sessionRef.current;
    if (!session) return;

    const attach = () => {
      const target = pickActiveVideoRef();
      if (!target) {
        console.warn("[Hero] no <video> ref to attach to");
        return;
      }
      console.log("[Hero] attaching stream to video element", {
        isDesktop:
          typeof window !== "undefined" &&
          window.matchMedia("(min-width: 1024px)").matches,
      });
      session.attach(target);

      // Step 1: muted autoplay (always allowed by browsers).
      target.muted = true;
      target.play().then(
        () => {
          console.log("[Hero] muted video.play() OK; trying to unmute");
          // Step 2: try to unmute. May still be blocked → user clicks the
          // "Click to enable sound" button rendered when audioOn=false.
          target.muted = false;
          target.play().then(
            () => {
              console.log("[Hero] unmuted play() OK — audio is live");
              setAudioOn(true);
            },
            (e) => {
              console.warn("[Hero] unmute blocked; user must click 'Enable sound'", e);
              target.muted = true;
              setAudioOn(false);
            },
          );
        },
        (e) => console.warn("[Hero] muted video.play() failed", e),
      );
    };

    attach();

    // Re-attach if the active breakpoint changes mid-call (e.g. user rotates
    // a tablet across 1024px). Without this, the stream stays bound to the
    // now-hidden video element.
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      console.log("[Hero] viewport crossed lg breakpoint — re-attaching");
      attach();
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [isStreamReady, pickActiveVideoRef]);

  // Reset audioOn when session ends.
  useEffect(() => {
    if (uiState === "idle") setAudioOn(false);
  }, [uiState]);

  const enableAudio = useCallback(() => {
    const target = pickActiveVideoRef();
    if (!target) return;
    target.muted = false;
    target.play().then(
      () => {
        console.log("[Hero] enableAudio() — audio is live");
        setAudioOn(true);
      },
      (e) => {
        console.warn("[Hero] enableAudio() blocked", e);
        target.muted = true;
        setAudioOn(false);
      },
    );
  }, [pickActiveVideoRef]);

  const toggleAudio = useCallback(() => {
    const target = pickActiveVideoRef();
    if (!target) return;
    if (target.muted) {
      enableAudio();
    } else {
      target.muted = true;
      setAudioOn(false);
    }
  }, [enableAudio, pickActiveVideoRef]);

  // Cleanup on unmount — tear down the live session so we don't leak the
  // LiveAvatar concurrency slot or the mic recorder.
  useEffect(() => {
    return () => {
      void cleanupSession();
      if (tabLockTimerRef.current) clearTimeout(tabLockTimerRef.current);
    };
  }, [cleanupSession]);

  // Mirror the selected industry into a ref so any later disconnect-time
  // logic reads the visitor's current industry, not whichever one was
  // active when an event listener was first attached.
  useEffect(() => {
    activeIndustryRef.current = active;
  }, [active]);

  // Keep-alive heartbeat. LiveAvatar enforces a server-side idle timeout
  // whose threshold is NOT exposed in the token payload or the docs — it
  // could be anywhere from ~15s to ~120s. 20s is a defensive cadence that
  // sits inside even the most aggressive plausible window. Each call is
  // cheap (a single API ping); the cost is worth not having sessions die
  // mid-pause while the visitor is thinking. Fires only while live.
  //
  // Two skip conditions avoid racing the server's session-end:
  //   1. If we know maxSessionDuration and we're within 5s of it, the
  //      server is about to kill the session and our heartbeat would land
  //      mid-teardown — 400 "session no longer active" in the network
  //      panel. Skip the ping; we're not saving anything anyway.
  //   2. SDK errors with status 400/403/404 are caught silently for the
  //      same race-window reason (server killed it just before our ping
  //      reached it; SESSION_DISCONNECTED arrives shortly after).
  // Anything else surfaces as a real warning.
  useEffect(() => {
    if (uiState !== "live") return;
    const tick = () => {
      const s = sessionRef.current;
      if (!s) return;
      const max = s.maxSessionDuration;
      const liveAt = sessionLiveAtRef.current;
      if (max != null && liveAt != null) {
        const elapsedSec = (Date.now() - liveAt) / 1000;
        if (elapsedSec >= max - 5) {
          console.log(
            "[Hero] skipping keepAlive — within 5s of maxSessionDuration",
          );
          return;
        }
      }
      s.keepAlive().catch((e: unknown) => {
        const status =
          typeof e === "object" && e !== null && "status" in e
            ? (e as { status?: unknown }).status
            : undefined;
        if (status === 400 || status === 403 || status === 404) return;
        console.warn("[Hero] keepAlive failed", e);
      });
    };
    // Fire immediately on entering live so the timer doesn't start counting
    // down from the user's first long pause.
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [uiState]);

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
  useEffect(() => {
    const isSdkSessionError = (r: unknown): boolean => {
      if (!r || typeof r !== "object") return false;
      const obj = r as { name?: string; message?: string; constructor?: { name?: string } };
      if (obj.constructor?.name === "SessionApiError" || obj.name === "SessionApiError") {
        return true;
      }
      const msg = typeof obj.message === "string" ? obj.message : "";
      return /Session not found|concurrency limit|API request failed/i.test(msg);
    };

    // preventDefault alone only silences the console default — Next 16's dev
    // overlay registers its OWN unhandledrejection/error listener that still
    // fires and pops the red "Runtime Error" screen. stopImmediatePropagation
    // (in the capture phase, which runs first) stops the event before it ever
    // reaches the overlay's handler.
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isSdkSessionError(e.reason)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    const onError = (e: ErrorEvent) => {
      if (isSdkSessionError(e.error) || /Session not found|concurrency limit/i.test(e.message ?? "")) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    // Filter the SDK's own console.error("Session start failed:", ...) call
    // — the dev overlay reads console.error to flag "Console Error".
    const origConsoleError = console.error;
    const patchedConsoleError = (...args: unknown[]) => {
      const first = args[0];
      if (typeof first === "string" && first.startsWith("Session start failed:")) return;
      if (args.some(isSdkSessionError)) return;
      origConsoleError.apply(console, args as never);
    };
    console.error = patchedConsoleError;

    window.addEventListener("unhandledrejection", onRejection, true);
    window.addEventListener("error", onError, true);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection, true);
      window.removeEventListener("error", onError, true);
      if (console.error === patchedConsoleError) console.error = origConsoleError;
    };
  }, []);

  // Fire-and-forget backend flush + LiveAvatar slot release when the tab is
  // closing. We can't await fetch() during beforeunload, but sendBeacon will
  // queue both POSTs so the partial transcript still lands as a Lead AND
  // the LiveAvatar concurrency slot is released immediately instead of
  // sitting "running" until the per-tier max-duration reaps it (which is
  // what causes the next visitor to see "demo is busy").
  useEffect(() => {
    const handler = () => {
      // 1. Release the LiveAvatar concurrency slot. This is independent of
      //    the backend transcript flush — even if we have no backend
      //    session id we still want to free the LiveAvatar session.
      const liveAvatarId = liveAvatarSessionIdRef.current;
      if (liveAvatarId) {
        try {
          const stopFd = new FormData();
          stopFd.append("session_id", liveAvatarId);
          stopFd.append("reason", "USER_CLOSED");
          navigator.sendBeacon("/api/avatar/stop", stopFd);
        } catch {
          // best-effort; nothing else to do during unload
        }
        liveAvatarSessionIdRef.current = null;
      }

      // 2. Flush the transcript to our backend so the partial conversation
      //    lands as a Lead.
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
      } catch {
        // best-effort; nothing else to do during unload
      }
    };
    window.addEventListener("beforeunload", handler);
    // `pagehide` is the reliable unload signal on iOS Safari where
    // beforeunload doesn't always fire.
    window.addEventListener("pagehide", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("pagehide", handler);
    };
  }, []);

  const onPrimaryClick = async () => {
    console.log("[Hero] primary button clicked, uiState =", uiState);
    if (uiState === "live") {
      await stopSession();
      return;
    }
    if (uiState === "connecting" || uiState === "ending") {
      // User is bailing out of an in-flight start; tear it down before
      // launching the new one.
      await cleanupSession();
      setIsStreamReady(false);
      setUiState("idle");
    }
    void startSession(active);
  };

  const onChatNowClick = () => {
    void startSession(active);
  };

  const onIndustryClick = async (next: Industry) => {
    // Ignore clicks while a switch is in flight or cooling down; and ignore a
    // re-click of the avatar that's already live/connecting.
    if (tabsLocked) return;
    if (next === active && (uiState === "live" || uiState === "connecting")) return;
    setActive(next);
    if (uiState === "live" || uiState === "connecting") {
      // Lock the tabs for a short cooldown so the switch can connect without a
      // second click racing it. uiState (connecting/ending) keeps them locked
      // during the switch itself; the timer adds the post-switch grace period.
      setTabsLocked(true);
      if (tabLockTimerRef.current) clearTimeout(tabLockTimerRef.current);
      tabLockTimerRef.current = setTimeout(() => {
        tabLockTimerRef.current = null;
        setTabsLocked(false);
      }, 2500);
      setUiState("ending");
      await cleanupSession();
      setIsStreamReady(false);
      await startSession(next);
    }
  };

  const onSendText = (text: string) => {
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

  const onToggleMute = () => {
    const session = sessionRef.current;
    // No active session yet — just toggle the visual state so the button
    // responds. When a session starts, voice chat events will reset it.
    if (!session) {
      userWantsMicOnRef.current = isMuted; // about to flip below
      setIsMuted((v) => !v);
      return;
    }
    try {
      if (isMuted) {
        // User wants the mic on. Record the intent FIRST so the
        // AVATAR_SPEAK_STARTED handler honours it even if it fires before
        // the unmute completes.
        userWantsMicOnRef.current = true;
        // The visitor took control — abandon any in-flight auto-mute so we
        // don't fight them when AVATAR_SPEAK_ENDED arrives.
        avatarSpeakingMutedRef.current = false;
        session.voiceChat.unmute();
      } else {
        userWantsMicOnRef.current = false;
        avatarSpeakingMutedRef.current = false;
        session.voiceChat.mute();
      }
      // On success the SDK fires VoiceChatEvent.MUTED/UNMUTED which updates
      // isMuted via the listener — don't toggle here or we'd double-flip.
    } catch (e) {
      // SDK rejects (e.g. voice chat never activated because the browser
      // blocked getUserMedia on this insecure origin). Fall back to an
      // optimistic visual toggle so the user still gets feedback.
      console.warn("[Hero] voiceChat toggle failed", e);
      setIsMuted((v) => !v);
    }
  };

  // Tabs are locked while connecting/ending (so no competing session starts)
  // and for the brief cooldown after a switch.
  const tabsDisabled = tabsLocked || uiState === "connecting" || uiState === "ending";

  const buttonLabel =
    uiState === "live"
      ? "END CALL"
      : uiState === "connecting"
        ? "CONNECTING…"
        : uiState === "ending"
          ? "ENDING…"
          : "START TALKING";

  return (
    <section id="try-demo" className="relative z-10 pt-6 lg:pt-16 pb-12 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8 relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neon">
            <span className="w-1.5 h-1.5 rounded-full bg-neon" />
            Now available for all industries
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
            <span className="text-neon">Voice-Powered</span> <br /> Websites!
          </h1>

          <div className="lg:hidden block w-full max-w-sm mx-auto my-10 relative">
            <div className="absolute w-[300px] h-[300px] bg-neon/10 rounded-full blur-[80px] -z-10 animate-pulse left-1/2 -translate-x-1/2 top-10" />
            <AvatarStage
              videoRef={mobileVideoRef}
              uiState={uiState}
              isStreamReady={isStreamReady}
              errorMessage={errorMessage}
              onStart={onChatNowClick}
              audioOn={audioOn}
              onEnableAudio={enableAudio}
              onToggleAudio={toggleAudio}
            />
            <ChatPanel
              uiState={uiState}
              messages={messages}
              onSend={onSendText}
              onToggleMute={onToggleMute}
              isMuted={isMuted}
            />
          </div>

          <div className="max-w-lg">
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed mb-3 sm:mb-4">
              Stop losing customers to missed calls. I answer enquiries, book appointments & capture leads — 24/7. You&apos;re looking at one right now.
            </p>

            <p className="text-sm text-neon mb-6 sm:mb-8 flex items-center gap-2">
              <Volume2 className="w-4 h-4" strokeWidth={1.5} />
              {uiState === "live" ? "Live — speak now." : "I'm listening! Speak to test the demo."}
            </p>

            <button
              type="button"
              onClick={() => void onPrimaryClick()}
              className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#ccff00] text-black text-xs sm:text-sm font-bold rounded-full shadow-[0_0_40px_-10px_rgba(204,255,0,0.6)] hover:shadow-[0_0_60px_-10px_rgba(204,255,0,0.8)] border-t border-white/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 glass-shine opacity-60 pointer-events-none" />
              <span className="relative z-10 flex items-center gap-2">
                {uiState === "connecting" || uiState === "ending" ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                ) : uiState === "live" ? (
                  <MicOff className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Mic className="w-5 h-5 fill-black/10" strokeWidth={1.5} />
                )}
                {buttonLabel}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </button>
          </div>

          <div className="pt-4 sm:pt-8">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4 sm:mb-6">Pick your industry</p>
            <div className="flex flex-wrap gap-3 sm:gap-6">
              {industries.map((ind) => {
                const isActive = active === ind.id;
                return (
                  <button
                    type="button"
                    key={ind.id}
                    onClick={() => void onIndustryClick(ind.id)}
                    disabled={tabsDisabled}
                    aria-disabled={tabsDisabled}
                    className={`avatar-btn ${isActive ? "avatar-active" : ""} flex flex-col items-center gap-2 sm:gap-3 group transition-all ${
                      tabsDisabled && !isActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`avatar-ring w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 overflow-hidden relative transition-all duration-300 bg-black ${
                        isActive ? "transform scale-110" : "border border-white/20 group-hover:border-[#ccff00]"
                      }`}
                    >
                      {/* Icons are admin-configured (may be remote backend
                          URLs), so a plain <img> avoids next/image's domain
                          allowlist. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ind.icon}
                        alt={ind.label}
                        width={64}
                        height={64}
                        className={`w-full h-full object-cover rounded-full transition-all duration-300 ${
                          isActive ? "" : "filter grayscale opacity-70 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 group-hover:text-white transition-colors">
                      {ind.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col relative items-center justify-start">
          <div className="absolute w-[400px] h-[400px] bg-neon/10 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <AvatarStage
              videoRef={desktopVideoRef}
              uiState={uiState}
              isStreamReady={isStreamReady}
              errorMessage={errorMessage}
              onStart={onChatNowClick}
              audioOn={audioOn}
              onEnableAudio={enableAudio}
              onToggleAudio={toggleAudio}
            />
            <ChatPanel
              uiState={uiState}
              messages={messages}
              onSend={onSendText}
              onToggleMute={onToggleMute}
              isMuted={isMuted}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
