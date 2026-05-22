@php
    $client = $getRecord();
    $key = $client->embed_api_key;
    $backend = rtrim(config('app.url'), '/');
    $sector = $client->sector ?: 'plumber';
    $snippet = "<script src=\"{$backend}/widget/speakingsites-widget.js\"\n        data-backend=\"{$backend}\"\n        data-api-key=\"{$key}\"\n        data-auto-start=\"{$sector}\"\n        defer></script>";
@endphp

<div x-data="{
        tab: 'key',
        keyMasked: true,
        keyCopied: false,
        snippetCopied: false,
        copyKey() {
            navigator.clipboard.writeText('{{ $key }}').then(() => {
                this.keyCopied = true;
                setTimeout(() => this.keyCopied = false, 1500);
            });
        },
        copySnippet() {
            navigator.clipboard.writeText(this.$refs.snippet.textContent).then(() => {
                this.snippetCopied = true;
                setTimeout(() => this.snippetCopied = false, 1500);
            });
        }
    }">
    <div class="ss-tabs">
        <button type="button" class="ss-tab" :class="tab === 'key' ? 'is-active' : ''" x-on:click="tab = 'key'">API Key</button>
        <button type="button" class="ss-tab" :class="tab === 'snippet' ? 'is-active' : ''" x-on:click="tab = 'snippet'">Install snippet</button>
    </div>

    <div x-show="tab === 'key'" x-cloak>
        <div class="ss-keybox">
            <code x-text="keyMasked ? '{{ str_repeat('•', 8) }}' + '{{ substr($key, -8) }}' : '{{ $key }}'"></code>
            <button type="button" class="ss-btn" x-on:click="keyMasked = !keyMasked">
                <span x-text="keyMasked ? 'Show' : 'Hide'"></span>
            </button>
            <button type="button" class="ss-btn ss-btn--primary" x-on:click="copyKey">
                <span x-show="!keyCopied">Copy</span>
                <span x-show="keyCopied" x-cloak>Copied!</span>
            </button>
        </div>
    </div>

    <div x-show="tab === 'snippet'" x-cloak>
        <div class="ss-codeblock">
            <div class="ss-codeblock__head">
                <div class="ss-codeblock__dots">
                    <span></span><span></span><span></span>
                    <span class="ss-codeblock__filename">index.html</span>
                </div>
                <button type="button" class="ss-copy-btn" x-on:click="copySnippet">
                    <span x-show="!snippetCopied">Copy code</span>
                    <span x-show="snippetCopied" x-cloak>Copied!</span>
                </button>
            </div>
            <pre><code x-ref="snippet">{{ $snippet }}</code></pre>
        </div>
        <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #64748b;">
            Paste before <code style="font-family: ui-monospace, monospace;">&lt;/body&gt;</code> on the client's site.
            Make sure <code style="font-family: ui-monospace, monospace;">APP_URL</code> on the backend matches the host above.
        </p>
    </div>
</div>
