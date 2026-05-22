@php
    $c = $getRecord();
    $client = $c->client;
    $sector = $c->avatar_type ?: ($client?->sector);
    $name = $c->visitor_name ?: 'Anonymous visitor';
    $initial = mb_substr($name, 0, 1);
    $duration = ($c->started_at && $c->ended_at)
        ? \Illuminate\Support\Carbon::parse($c->started_at)->diff($c->ended_at)
        : null;
    $messageCount = $c->messages()->count();
@endphp

<section class="ss-conv-hero">
    <div class="ss-conv-hero__blob"></div>

    <div class="ss-conv-hero__top">
        <div class="ss-conv-hero__avatar">{{ strtoupper($initial) }}</div>

        <div class="ss-conv-hero__main">
            <div class="ss-conv-hero__name-row">
                <h2 class="ss-conv-hero__name">{{ $name }}</h2>
                <span class="ss-status-pill ss-status-pill--{{ $c->status }}">{{ ucfirst($c->status) }}</span>
                @if ($c->urgency_flag)
                    <span class="ss-urgent-pill">⚠ Urgent</span>
                @endif
                @if ($sector)
                    <span class="ss-pill ss-pill--ghost">{{ ucfirst($sector) }}</span>
                @endif
            </div>

            <div class="ss-conv-hero__contact">
                @if ($c->visitor_email)
                    <span><svg style="width:0.875rem;height:0.875rem;vertical-align:-2px;margin-right:0.25rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>{{ $c->visitor_email }}</span>
                @endif
                @if ($c->visitor_phone)
                    <span><svg style="width:0.875rem;height:0.875rem;vertical-align:-2px;margin-right:0.25rem;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>{{ $c->visitor_phone }}</span>
                @endif
                @if (! $c->visitor_email && ! $c->visitor_phone)
                    <span style="opacity:0.6;">No contact details captured</span>
                @endif
            </div>
        </div>

        <div class="ss-conv-hero__client">
            <div class="ss-conv-hero__client-label">Client</div>
            <a href="{{ url('admin/clients/' . $client?->id) }}" class="ss-conv-hero__client-link">
                {{ $client?->business_name ?? '—' }}
            </a>
        </div>
    </div>

    <div class="ss-conv-hero__metrics">
        <div class="ss-conv-hero__metric">
            <span class="ss-conv-hero__metric-label">Started</span>
            <span class="ss-conv-hero__metric-value">{{ $c->started_at?->format('M j, Y · H:i') ?: '—' }}</span>
        </div>
        <div class="ss-conv-hero__metric">
            <span class="ss-conv-hero__metric-label">Ended</span>
            <span class="ss-conv-hero__metric-value">{{ $c->ended_at?->format('M j, Y · H:i') ?: 'Still active' }}</span>
        </div>
        <div class="ss-conv-hero__metric">
            <span class="ss-conv-hero__metric-label">Duration</span>
            <span class="ss-conv-hero__metric-value">
                @if ($duration)
                    {{ $duration->i }}m {{ $duration->s }}s
                @else
                    —
                @endif
            </span>
        </div>
        <div class="ss-conv-hero__metric">
            <span class="ss-conv-hero__metric-label">Messages</span>
            <span class="ss-conv-hero__metric-value">{{ $messageCount }}</span>
        </div>
        <div class="ss-conv-hero__metric">
            <span class="ss-conv-hero__metric-label">Audio</span>
            <span class="ss-conv-hero__metric-value">
                @if ($c->audio_url) <span style="color:#15803d;font-weight:600;">● Captured</span>
                @else <span style="color:#94a3b8;">—</span> @endif
            </span>
        </div>
    </div>
</section>
