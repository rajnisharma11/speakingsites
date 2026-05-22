/**
 * SpeakingSites embeddable widget.
 *
 * Captures the visitor's microphone + best-effort HeyGen iframe postMessage
 * transcript, then posts the recording + transcript to the SpeakingSites
 * backend when the conversation ends.
 *
 * Embed:
 *   <script
 *     src="https://your-backend.example.com/widget/speakingsites-widget.js"
 *     data-api-key="sk_xxx"
 *     data-backend="https://your-backend.example.com"
 *     data-avatar-type="plumber"
 *     data-auto-start="plumber"
 *     defer></script>
 *
 * Or programmatically:
 *   SpeakingSites.configure({ backendUrl, apiKey });
 *   SpeakingSites.start('plumber');
 *   SpeakingSites.end();
 */
(function () {
    'use strict';

    var script = document.currentScript || (function () {
        var s = document.getElementsByTagName('script');
        return s[s.length - 1];
    })();

    var config = {
        backendUrl: (script && script.dataset.backend) || '',
        apiKey: (script && script.dataset.apiKey) || '',
        autoStart: (script && script.dataset.autoStart) || null,
        defaultAvatar: (script && script.dataset.avatarType) || null,
        skipPrechatForm: !!(script && script.dataset.skipPrechatForm),
    };

    var state = {
        sessionId: null,
        conversationId: null,
        avatarType: null,
        recorder: null,
        stream: null,
        chunks: [],
        transcript: [],
        endedHandled: false,
        endBtn: null,
        prechatEl: null,
        visitor: { name: null, email: null, phone: null },
    };

    function endpoint(path) {
        return (config.backendUrl || '').replace(/\/+$/, '') + path;
    }

    function log(/* ...args */) {
        if (window.SPEAKINGSITES_DEBUG) {
            console.log.apply(console, ['[speakingsites]'].concat(Array.prototype.slice.call(arguments)));
        }
    }

    function ensureConfigured() {
        if (!config.backendUrl || !config.apiKey) {
            console.warn('[speakingsites] backendUrl and apiKey must be configured before starting.');
            return false;
        }
        return true;
    }

    async function start(avatarType, opts) {
        if (!ensureConfigured()) return;
        if (state.sessionId) return;

        opts = opts || {};
        state.avatarType = avatarType || config.defaultAvatar || null;

        // Visitor details: prefer explicit opts; otherwise show the pre-chat
        // form unless the embed opted out (data-skip-prechat-form or
        // opts.skipForm). The form resolves with whatever the visitor entered
        // (all fields optional — visitor can click "Start" with blanks).
        var visitor = {
            name: opts.visitorName || null,
            email: opts.visitorEmail || null,
            phone: opts.visitorPhone || null,
        };
        var hasAny = visitor.name || visitor.email || visitor.phone;
        if (!hasAny && !config.skipPrechatForm && !opts.skipForm) {
            var collected = await showPrechatForm();
            if (collected === null) {
                // User dismissed the form.
                return;
            }
            visitor = collected;
        }
        state.visitor = visitor;

        await beginSession(visitor);
    }

    async function beginSession(visitor) {
        state.transcript = [];
        state.chunks = [];
        state.endedHandled = false;

        try {
            var body = {
                api_key: config.apiKey,
                avatar_type: state.avatarType,
            };
            if (visitor.name) body.visitor_name = visitor.name;
            if (visitor.email) body.visitor_email = visitor.email;
            if (visitor.phone) body.visitor_phone = visitor.phone;

            var res = await fetch(endpoint('/api/widget/conversation/start'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                console.warn('[speakingsites] start failed', res.status);
                return;
            }
            var data = await res.json();
            state.sessionId = data.session_id;
            state.conversationId = data.conversation_id;
            log('session started', data);
        } catch (e) {
            console.warn('[speakingsites] start error', e);
            return;
        }

        try {
            state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            var mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
            state.recorder = new MediaRecorder(state.stream, { mimeType: mime });
            state.recorder.addEventListener('dataavailable', function (e) {
                if (e.data && e.data.size > 0) state.chunks.push(e.data);
            });
            state.recorder.start(1000);
            log('recording started');
        } catch (e) {
            console.warn('[speakingsites] mic permission denied or unavailable', e);
        }

        showEndButton();
    }

    async function end(opts) {
        if (!state.sessionId || state.endedHandled) return;
        state.endedHandled = true;
        opts = opts || {};

        var audioBlob = await new Promise(function (resolve) {
            if (!state.recorder || state.recorder.state === 'inactive') {
                resolve(null);
                return;
            }
            state.recorder.addEventListener('stop', function () {
                if (state.chunks.length === 0) {
                    resolve(null);
                    return;
                }
                resolve(new Blob(state.chunks, { type: state.recorder.mimeType }));
            }, { once: true });
            state.recorder.stop();
        });

        if (state.stream) {
            state.stream.getTracks().forEach(function (t) { t.stop(); });
        }

        var fd = new FormData();
        fd.append('api_key', config.apiKey);
        fd.append('session_id', state.sessionId);
        fd.append('transcript', JSON.stringify(state.transcript));
        var endName  = opts.visitorName  || state.visitor.name;
        var endEmail = opts.visitorEmail || state.visitor.email;
        var endPhone = opts.visitorPhone || state.visitor.phone;
        if (endName)  fd.append('visitor_name',  endName);
        if (endEmail) fd.append('visitor_email', endEmail);
        if (endPhone) fd.append('visitor_phone', endPhone);
        if (audioBlob) {
            var ext = audioBlob.type.indexOf('webm') !== -1 ? 'webm' : 'ogg';
            fd.append('audio', audioBlob, 'conversation.' + ext);
        }

        try {
            var res = await fetch(endpoint('/api/widget/conversation/end'), {
                method: 'POST',
                body: fd,
            });
            var data = await res.json().catch(function () { return {}; });
            log('session ended', res.status, data);
        } catch (e) {
            console.warn('[speakingsites] end error', e);
        }

        hideEndButton();
        state.sessionId = null;
        state.conversationId = null;
        state.recorder = null;
        state.stream = null;
        state.chunks = [];
        state.transcript = [];
        state.visitor = { name: null, email: null, phone: null };
    }

    // Best-effort transcript capture from HeyGen iframe postMessage.
    // The iframe is cross-origin so we can't inspect its DOM; we only
    // pick up messages it explicitly posts. Schema is normalised below.
    window.addEventListener('message', function (event) {
        if (!event.data || typeof event.data !== 'object') return;
        var d = event.data;
        var role = d.role || d.speaker
            || (d.type === 'user_message' ? 'user'
                : ((d.type === 'assistant_message' || d.type === 'avatar_response') ? 'assistant' : null));
        var content = d.content || d.text || d.message || d.transcript;
        if (role && typeof content === 'string' && content.trim() !== '') {
            state.transcript.push({
                role: (role === 'avatar' || role === 'ai') ? 'assistant' : role,
                content: content.trim(),
                timestamp: new Date().toISOString(),
            });
        }
    });

    // Resolves with { name, email, phone } when the visitor submits the form,
    // or `null` if they dismiss it. All fields are optional.
    function showPrechatForm() {
        return new Promise(function (resolve) {
            if (state.prechatEl) {
                state.prechatEl.remove();
                state.prechatEl = null;
            }

            var overlay = document.createElement('div');
            overlay.id = 'speakingsites-prechat';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif;';

            overlay.innerHTML = ''
                + '<div style="background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:28px 28px 24px;width:min(420px,92vw);">'
                +   '<h3 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0f172a;">Before we start</h3>'
                +   '<p style="margin:0 0 18px;font-size:13px;color:#64748b;line-height:1.45;">Share a few details so we can follow up after the chat.</p>'
                +   '<form id="ss-prechat-form" novalidate>'
                +     '<label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">Name</label>'
                +     '<input name="name" type="text" autocomplete="name" style="display:block;width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;margin-bottom:12px;" />'
                +     '<label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">Email</label>'
                +     '<input name="email" type="email" autocomplete="email" style="display:block;width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;margin-bottom:12px;" />'
                +     '<label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">Phone</label>'
                +     '<input name="phone" type="tel" autocomplete="tel" style="display:block;width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;margin-bottom:6px;" />'
                +     '<div id="ss-prechat-error" style="min-height:18px;font-size:12px;color:#dc2626;margin-bottom:10px;"></div>'
                +     '<div style="display:flex;gap:10px;justify-content:flex-end;">'
                +       '<button type="button" id="ss-prechat-cancel" style="padding:10px 16px;background:#f1f5f9;color:#475569;font-weight:600;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Cancel</button>'
                +       '<button type="submit" style="padding:10px 18px;background:#2563eb;color:#fff;font-weight:600;border:none;border-radius:8px;cursor:pointer;font-size:14px;">Start chat</button>'
                +     '</div>'
                +   '</form>'
                + '</div>';

            document.body.appendChild(overlay);
            state.prechatEl = overlay;

            var form = overlay.querySelector('#ss-prechat-form');
            var errorEl = overlay.querySelector('#ss-prechat-error');
            var cancelBtn = overlay.querySelector('#ss-prechat-cancel');

            function close(result) {
                overlay.remove();
                if (state.prechatEl === overlay) state.prechatEl = null;
                resolve(result);
            }

            cancelBtn.addEventListener('click', function () { close(null); });

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var name = form.elements['name'].value.trim();
                var email = form.elements['email'].value.trim();
                var phone = form.elements['phone'].value.trim();

                // Light client-side email check — server validates again.
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    errorEl.textContent = 'Please enter a valid email address.';
                    return;
                }
                errorEl.textContent = '';

                close({
                    name: name || null,
                    email: email || null,
                    phone: phone || null,
                });
            });

            // Focus first field for fast keyboard entry.
            var firstInput = form.elements['name'];
            if (firstInput) firstInput.focus();
        });
    }

    function showEndButton() {
        if (state.endBtn) return;
        var btn = document.createElement('button');
        btn.id = 'speakingsites-end-btn';
        btn.type = 'button';
        btn.textContent = 'End Chat';
        btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;padding:12px 20px;background:#ef4444;color:#fff;font-weight:600;border:none;border-radius:9999px;box-shadow:0 8px 24px rgba(0,0,0,.3);cursor:pointer;font-family:Inter,system-ui,sans-serif;font-size:14px;';
        btn.addEventListener('click', function () { end(); });
        document.body.appendChild(btn);
        state.endBtn = btn;
    }

    function hideEndButton() {
        if (state.endBtn) {
            state.endBtn.remove();
            state.endBtn = null;
        }
    }

    window.addEventListener('beforeunload', function () {
        if (state.sessionId && !state.endedHandled) {
            end();
        }
    });

    var api = {
        configure: function (opts) {
            if (opts && opts.backendUrl) config.backendUrl = opts.backendUrl;
            if (opts && opts.apiKey) config.apiKey = opts.apiKey;
            if (opts && opts.defaultAvatar) config.defaultAvatar = opts.defaultAvatar;
        },
        start: start,
        end: end,
        pushTranscript: function (role, content) {
            if (!role || !content) return;
            state.transcript.push({
                role: role,
                content: String(content),
                timestamp: new Date().toISOString(),
            });
        },
        state: function () {
            return {
                sessionId: state.sessionId,
                conversationId: state.conversationId,
                avatarType: state.avatarType,
                transcriptCount: state.transcript.length,
            };
        },
    };

    window.SpeakingSites = api;

    // Auto-start when configured via data-auto-start.
    if (config.autoStart && config.backendUrl && config.apiKey) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { start(config.autoStart); });
        } else {
            start(config.autoStart);
        }
    }
})();
