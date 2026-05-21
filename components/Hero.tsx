"use client";

import Image from "next/image";
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

type Industry = "plumber" | "lawyer" | "medical" | "builder" | "salon";

const INDUSTRIES: { id: Industry; label: string; icon: string }[] = [
  { id: "plumber", label: "Plumber", icon: "/images/Plumbericon.png" },
  { id: "lawyer", label: "Lawyer", icon: "/images/lawyericon.png" },
  { id: "medical", label: "Medical", icon: "/images/nurseicon.png" },
  { id: "builder", label: "Builder", icon: "/images/buildericon.png" },
  { id: "salon", label: "Salon", icon: "/images/Plasterericon.png" },
];

type UiState = "idle" | "connecting" | "live" | "ending" | "error";

type ChatMsg = { sender: "user" | "avatar"; text: string; ts: number };

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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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

      <div className="h-32 sm:h-40 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 text-sm">
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
        <div ref={endRef} />
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

  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSessionType | null>(null);

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

  // Progressive transcript flush. Backend /end is idempotent — it replaces
  // the conversation's messages on every call — so we can safely re-POST
  // the growing transcript while the call is still live. Without this, a
  // tab close or browser crash mid-conversation would lose everything.
  const flushTranscript = useCallback(async () => {
    const sessionId = backendSessionIdRef.current;
    if (!sessionId || endedHandledRef.current) return;
    if (transcriptRef.current.length === 0) return;
    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append("transcript", JSON.stringify(transcriptRef.current));
    try {
      await fetch("/api/conversation/end/", { method: "POST", body: fd });
    } catch (e) {
      console.warn("[Hero] transcript flush failed", e);
    }
  }, []);

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
  }, []);

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

    try {
      const tokenRes = await fetch("/api/avatar/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry }),
      });
      if (!tokenRes.ok) {
        const j = await tokenRes.json().catch(() => ({}));
        throw new Error(j.error ?? `Token request failed (${tokenRes.status})`);
      }
      const payload = (await tokenRes.json()) as {
        sessionToken: string;
        avatarId: string;
        isSandbox: boolean;
        resolvedSource: string;
      };
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

      session.on(SessionEvent.SESSION_STREAM_READY, () => {
        console.log("[Hero] SESSION_STREAM_READY");
        setIsStreamReady(true);
      });

      session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
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
      });

      session.on(SessionEvent.SESSION_DISCONNECTED, (reason) => {
        console.log("[Hero] SESSION_DISCONNECTED:", reason);
        sessionRef.current = null;
        setIsStreamReady(false);
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

      // Persist the session in the Laravel backend BEFORE the HeyGen
      // handshake — if HeyGen fails or the user drops, we still have a
      // Lead row and any partial transcript will land via the debounced
      // flush. Idempotent: each transcription flushes the same row.
      try {
        const res = await fetch("/api/conversation/start/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarType: industry }),
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      console.error("[Hero] start failed", err);
      const msg = err instanceof Error ? err.message : "Failed to start session.";
      setErrorMessage(msg);
      setUiState("error");
      sessionRef.current = null;
      // Flush whatever we captured and finalise the row so the failed
      // attempt still appears as a Lead (with whatever transcript exists).
      void finaliseBackendSession();
    }
  }, [finaliseBackendSession, scheduleFlush]);

  // Attach stream to the visible <video> once ready, then try to unmute.
  useEffect(() => {
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
  }, [isStreamReady]);

  // Reset audioOn when session ends.
  useEffect(() => {
    if (uiState === "idle") setAudioOn(false);
  }, [uiState]);

  const enableAudio = useCallback(() => {
    const target = desktopVideoRef.current ?? mobileVideoRef.current;
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
  }, []);

  const toggleAudio = useCallback(() => {
    const target = desktopVideoRef.current ?? mobileVideoRef.current;
    if (!target) return;
    if (target.muted) {
      enableAudio();
    } else {
      target.muted = true;
      setAudioOn(false);
    }
  }, [enableAudio]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      void cleanupSession();
    };
  }, [cleanupSession]);

  // Swallow uncaught SessionApiError rejections from the HeyGen SDK.
  // LiveAvatarSession.cleanup() awaits sessionClient.stopSession() but is
  // itself fire-and-forget from handleRoomDisconnect(), so when the session
  // was never created on HeyGen (e.g. concurrency limit, mic-blocked start)
  // the resulting "Session not found" 404 leaks as an unhandled rejection.
  // Our own startSession() catch already surfaces the real error to the UI.
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      const r = e.reason as { name?: string; constructor?: { name?: string } } | null;
      if (
        r &&
        typeof r === "object" &&
        (r.constructor?.name === "SessionApiError" || r.name === "SessionApiError")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  // Fire-and-forget backend flush when the tab is closing. We can't await
  // fetch() during beforeunload, but sendBeacon will queue the POST so the
  // partial transcript still lands as a Lead instead of being lost.
  useEffect(() => {
    const handler = () => {
      const sessionId = backendSessionIdRef.current;
      if (!sessionId || endedHandledRef.current) return;
      endedHandledRef.current = true;
      const fd = new FormData();
      fd.append("session_id", sessionId);
      fd.append("transcript", JSON.stringify(transcriptRef.current));
      try {
        navigator.sendBeacon("/api/conversation/end/", fd);
      } catch {
        // best-effort; nothing else to do during unload
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const onPrimaryClick = async () => {
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

  const onChatNowClick = () => {
    void startSession(active);
  };

  const onIndustryClick = async (next: Industry) => {
    setActive(next);
    if (uiState === "live" || uiState === "connecting") {
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
      setIsMuted((v) => !v);
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
      setIsMuted((v) => !v);
    }
  };

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
              {INDUSTRIES.map((ind) => {
                const isActive = active === ind.id;
                return (
                  <button
                    type="button"
                    key={ind.id}
                    onClick={() => void onIndustryClick(ind.id)}
                    className={`avatar-btn ${isActive ? "avatar-active" : ""} flex flex-col items-center gap-2 sm:gap-3 group cursor-pointer transition-all`}
                  >
                    <div
                      className={`avatar-ring w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 overflow-hidden relative transition-all duration-300 bg-black ${
                        isActive ? "transform scale-110" : "border border-white/20 group-hover:border-[#ccff00]"
                      }`}
                    >
                      <Image
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
