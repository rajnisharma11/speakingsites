<div class="space-y-3">
    <p class="text-sm text-gray-600 dark:text-gray-300">
        Paste this snippet just before <code class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">&lt;/body&gt;</code> on the client website.
    </p>
    <pre class="bg-gray-900 text-lime-300 text-xs leading-relaxed rounded-lg p-4 overflow-auto max-h-96"><code>{{ $script }}</code></pre>
    <button
        type="button"
        x-data
        x-on:click="navigator.clipboard.writeText(@js($script)); $el.innerText='Copied ✓'; setTimeout(() => $el.innerText='Copy to clipboard', 1500)"
        class="fi-btn fi-btn-color-primary fi-btn-size-md inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
    >
        Copy to clipboard
    </button>
</div>
