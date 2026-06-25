// Client instrumentation hook — runs at the very top of Next's dev client
// bootstrap (`require('private-next-instrumentation-client')` in
// app-next-dev.js), BEFORE `renderAppDevOverlay()` calls
// `handleGlobalErrors()`. That ordering is the whole point of putting this
// here instead of in a component effect.
//
// The HeyGen LiveAvatar SDK leaks two benign rejections during a failed /
// torn-down session that otherwise pop Next 16's red "Runtime Error" overlay:
//   1) LiveAvatarSession.start() fires `this.cleanup()` WITHOUT awaiting it.
//      cleanup() calls stopSession() on a session that was never created, so
//      HeyGen replies 404 "Session not found" → unhandled rejection.
//   2) Account-wide "Session concurrency limit reached" / transient
//      "API request failed" surface the same way.
// Our own start() catch (Hero.tsx) already shows a friendly message in the UI,
// so these are pure noise.
//
// Why this MUST register before Next's handler (and why the old capture-phase
// listener in Hero.tsx did not work): `unhandledrejection` is dispatched on
// `window`, which is the event TARGET. Per the DOM spec, listeners on the
// target node fire in REGISTRATION ORDER regardless of the capture flag — the
// capture/bubble distinction only orders listeners on *ancestors* of the
// target. Next registers `handleGlobalErrors()` at boot; a listener added
// later (e.g. on component mount) runs after it, so calling
// stopImmediatePropagation() there is too late — Next's overlay already
// queued the error. Registering here, before Next's runtime sets up, means our
// listener runs first and stopImmediatePropagation() actually blocks Next's.

const isSdkSessionError = (r: unknown): boolean => {
  if (!r || typeof r !== "object") return false;
  const obj = r as {
    name?: string;
    message?: string;
    constructor?: { name?: string };
  };
  if (
    obj.constructor?.name === "SessionApiError" ||
    obj.name === "SessionApiError"
  ) {
    return true;
  }
  const msg = typeof obj.message === "string" ? obj.message : "";
  return /Session not found|concurrency limit|API request failed/i.test(msg);
};

if (typeof window !== "undefined") {
  window.addEventListener(
    "unhandledrejection",
    (e: PromiseRejectionEvent) => {
      if (isSdkSessionError(e.reason)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  window.addEventListener(
    "error",
    (e: ErrorEvent) => {
      if (
        isSdkSessionError(e.error) ||
        /Session not found|concurrency limit/i.test(e.message ?? "")
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
}

export {};
