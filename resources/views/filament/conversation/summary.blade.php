@php
    $c = $getRecord();
@endphp

<div class="ss-summary">
    <div class="ss-summary__row">
        <div class="ss-summary__eyebrow">Summary</div>
        <div class="ss-summary__body">
            @if ($c->summary)
                {{ $c->summary }}
            @else
                <span style="color:#94a3b8;">No AI summary generated yet. Wire up Claude in the backend to populate this.</span>
            @endif
        </div>
    </div>
    <div class="ss-summary__row">
        <div class="ss-summary__eyebrow">Suggested action</div>
        <div class="ss-summary__body">
            @if ($c->suggested_action)
                <span class="ss-action-pill">→ {{ $c->suggested_action }}</span>
            @else
                <span style="color:#94a3b8;">No suggestion yet.</span>
            @endif
        </div>
    </div>
</div>
