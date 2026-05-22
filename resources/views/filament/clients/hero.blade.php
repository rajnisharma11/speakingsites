@php
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Storage;

    $client = $getRecord();
    $logo = null;
    if ($client->logo_url) {
        $logo = Str::startsWith($client->logo_url, ['http://', 'https://', '/'])
            ? $client->logo_url
            : Storage::disk('public')->url($client->logo_url);
    }
    $colour = '#ccff00';
    $initials = collect(explode(' ', $client->business_name))
        ->map(fn ($w) => mb_substr($w, 0, 1))
        ->take(2)
        ->implode('');
    $statusActive = $client->status === 'active';
    $totalConv = $client->conversations()->count();
    $newLeads = $client->conversations()->where('status', 'new')->count();
    $booked = $client->conversations()->where('status', 'booked')->count();
@endphp

<section class="ss-hero" style="--ss-accent: {{ $colour }};">
    <div class="ss-hero__blob ss-hero__blob--tr" style="background: {{ $colour }};"></div>
    <div class="ss-hero__blob ss-hero__blob--bl" style="background: {{ $colour }};"></div>

    <div class="ss-hero__inner">
        <div class="ss-hero__logo-wrap">
            @if ($logo)
                <span class="ss-hero__logo-halo"></span>
                <img src="{{ $logo }}" alt="{{ $client->business_name }}" class="ss-hero__logo">
            @else
                <div class="ss-hero__avatar-fallback">{{ strtoupper($initials) }}</div>
            @endif
        </div>

        <div class="ss-hero__body">
            <div class="ss-hero__title-row">
                <h2 class="ss-hero__title">{{ $client->business_name }}</h2>
                <span class="ss-pill {{ $statusActive ? 'ss-pill--active' : 'ss-pill--suspended' }}">
                    <span class="ss-pill__dot"></span>
                    {{ $statusActive ? 'Active' : 'Suspended' }}
                </span>
                @if ($client->sector)
                    <span class="ss-pill ss-pill--ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="height:0.875rem;width:0.875rem;"><path fill-rule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.535 0l3.88-3.879a2.5 2.5 0 0 0 0-3.535l-7.5-7.5A2.5 2.5 0 0 0 9.379 3H5.5Zm.75 6.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" clip-rule="evenodd" /></svg>
                        {{ ucfirst($client->sector) }}
                    </span>
                @endif
            </div>

            <div class="ss-hero__meta">
                <span>
                    <span class="ss-hero__color-swatch" style="background: {{ $colour }};"></span>
                    <span style="font-family: ui-monospace, monospace; font-size: 0.75rem;">{{ $colour }}</span>
                </span>
                <span class="dot">•</span>
                <span>Client #{{ $client->id }}</span>
                <span class="dot">•</span>
                <span>Joined {{ $client->created_at?->format('M j, Y') }}</span>
            </div>
        </div>

        <div class="ss-hero__stats">
            <div class="ss-hero__stat" style="min-width: 112px;">
                <div class="ss-hero__stat-label">Total leads</div>
                <div class="ss-hero__stat-value">{{ number_format($totalConv) }}</div>
            </div>
            <div class="ss-hero__stat">
                <div class="ss-hero__stat-label">New</div>
                <div class="ss-hero__stat-value">{{ $newLeads }}</div>
            </div>
            <div class="ss-hero__stat">
                <div class="ss-hero__stat-label">Booked</div>
                <div class="ss-hero__stat-value ss-hero__stat-value--success">{{ $booked }}</div>
            </div>
        </div>
    </div>
</section>
