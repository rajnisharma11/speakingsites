@php
    $messages = $getRecord()->messages()->orderBy('timestamp')->get();
    $transcript = $getRecord()->transcript ?? [];
    $items = $messages->count() > 0
        ? $messages->map(fn ($m) => [
            'role' => $m->role,
            'content' => $m->content,
            'timestamp' => $m->timestamp,
        ])->all()
        : (is_array($transcript) ? $transcript : []);
@endphp

@if (empty($items))
    <div class="ss-empty">
        No transcript captured.<br>
        <span style="font-size:0.75rem;">If audio is present, you can run STT (Whisper) on it later.</span>
    </div>
@else
    <div class="ss-chat">
        @foreach ($items as $entry)
            @php
                $role = $entry['role'] ?? 'system';
                $content = $entry['content'] ?? '';
                $timestamp = $entry['timestamp'] ?? null;
                if ($timestamp instanceof \Illuminate\Support\Carbon) {
                    $timestamp = $timestamp->format('H:i:s');
                } elseif (is_string($timestamp)) {
                    try { $timestamp = \Illuminate\Support\Carbon::parse($timestamp)->format('H:i:s'); }
                    catch (\Exception $e) {}
                }
            @endphp
            <div class="ss-chat__row ss-chat__row--{{ $role }}">
                <div class="ss-chat__avatar ss-chat__avatar--{{ $role }}">
                    @if ($role === 'user')
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:1rem;height:1rem;"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd"/></svg>
                    @elseif ($role === 'assistant')
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:1rem;height:1rem;"><path d="M16.5 7.5h-9v9h9v-9Z"/><path fill-rule="evenodd" d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z" clip-rule="evenodd"/></svg>
                    @else
                        ⚙
                    @endif
                </div>
                <div class="ss-chat__bubble-wrap">
                    <div class="ss-chat__meta">
                        <strong>{{ $role === 'assistant' ? 'AI Avatar' : ucfirst($role) }}</strong>
                        @if ($timestamp) <span class="ss-chat__time">{{ $timestamp }}</span> @endif
                    </div>
                    <button type="button"
                            class="ss-chat__bubble ss-chat__bubble--{{ $role }} ss-chat__bubble-btn"
                            title="Click to copy"
                            data-ss-copy="{{ e($content) }}">
                        <span class="ss-chat__bubble-text">{{ $content }}</span>
                        <span class="ss-chat__bubble-tick" style="display:none;">✓ Copied</span>
                    </button>
                </div>
            </div>
        @endforeach
    </div>

    <script>
    (function () {
        if (window.__ssChatCopyInit) return;
        window.__ssChatCopyInit = true;

        function copyText(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            }
            return new Promise(function (resolve, reject) {
                try {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.top = '0';
                    ta.style.left = '0';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    resolve();
                } catch (e) { reject(e); }
            });
        }

        document.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('[data-ss-copy]');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            var text = btn.getAttribute('data-ss-copy') || '';
            var textEl = btn.querySelector('.ss-chat__bubble-text');
            var tickEl = btn.querySelector('.ss-chat__bubble-tick');
            copyText(text).then(function () {
                if (textEl && tickEl) {
                    textEl.style.display = 'none';
                    tickEl.style.display = 'inline';
                }
                btn.classList.add('is-copied');
                setTimeout(function () {
                    if (textEl && tickEl) {
                        textEl.style.display = '';
                        tickEl.style.display = 'none';
                    }
                    btn.classList.remove('is-copied');
                }, 1200);
            }).catch(function (err) {
                console.warn('[ss-copy] copy failed', err);
            });
        });
    })();
    </script>
@endif
