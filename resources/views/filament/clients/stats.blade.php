@php
    $client = $getRecord();
    $totalConv = $client->conversations()->count();
    $today = $client->conversations()->whereDate('created_at', today())->count();
    $week = $client->conversations()->where('created_at', '>=', now()->subDays(7))->count();
    $urgent = $client->conversations()->where('urgency_flag', true)->count();

    $statuses = $client->conversations()
        ->selectRaw('status, COUNT(*) as c')
        ->groupBy('status')
        ->pluck('c', 'status')
        ->toArray();

    $statusTotal = array_sum($statuses) ?: 1;

    $days = collect(range(13, 0))->map(fn ($d) => now()->subDays($d)->toDateString());
    $byDay = $client->conversations()
        ->where('created_at', '>=', now()->subDays(14)->startOfDay())
        ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
        ->groupBy('d')
        ->pluck('c', 'd')
        ->toArray();
    $bars = $days->map(fn ($d) => ['date' => $d, 'count' => (int) ($byDay[$d] ?? 0)]);
    $maxBar = max($bars->pluck('count')->max() ?: 0, 1);
    $colour = '#ccff00';

    $cards = [
        ['label' => 'Total',   'value' => $totalConv, 'tone' => '',         'icon' => 'chat'],
        ['label' => 'Today',   'value' => $today,     'tone' => 'success',  'icon' => 'bolt'],
        ['label' => 'Last 7d', 'value' => $week,      'tone' => 'info',     'icon' => 'calendar'],
        ['label' => 'Urgent',  'value' => $urgent,    'tone' => 'warning',  'icon' => 'alert'],
    ];

    $icons = [
        'chat'     => '<path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/>',
        'bolt'     => '<path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/>',
        'calendar' => '<path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>',
        'alert'    => '<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>',
    ];
@endphp

<div class="ss-kpi-grid">
    @foreach ($cards as $card)
        <div class="ss-kpi-card">
            <div class="ss-kpi-icon {{ $card['tone'] ? 'ss-kpi-icon--' . $card['tone'] : '' }}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor">{!! $icons[$card['icon']] !!}</svg>
            </div>
            <div class="ss-kpi-text">
                <div class="ss-kpi-label">{{ $card['label'] }}</div>
                <div class="ss-kpi-value">{{ number_format($card['value']) }}</div>
            </div>
        </div>
    @endforeach
</div>

<div class="ss-row" style="--ss-accent: {{ $colour }};">
    <div class="ss-panel">
        <div class="ss-panel__head">
            <div>
                <div class="ss-panel__eyebrow">Activity</div>
                <div class="ss-panel__title">Conversations · last 14 days</div>
            </div>
            <div class="ss-panel__eyebrow">peak {{ $maxBar }}</div>
        </div>
        <div class="ss-bars">
            @foreach ($bars as $b)
                @php $h = $b['count'] > 0 ? max(8, intval($b['count'] / $maxBar * 100)) : 4; @endphp
                <div class="ss-bar-col">
                    <div class="ss-bar" style="height: {{ $h }}%;">
                        <div class="ss-bar-tooltip">{{ $b['count'] }} on {{ \Illuminate\Support\Carbon::parse($b['date'])->format('M j') }}</div>
                    </div>
                </div>
            @endforeach
        </div>
        <div class="ss-bars-axis">
            <span>{{ \Illuminate\Support\Carbon::parse($bars->first()['date'])->format('M j') }}</span>
            <span>{{ \Illuminate\Support\Carbon::parse($bars->last()['date'])->format('M j') }}</span>
        </div>
    </div>

    <div class="ss-panel">
        <div class="ss-panel__eyebrow" style="margin-bottom: 0.75rem;">Lead status</div>
        @if ($totalConv === 0)
            <div class="ss-empty" style="padding: 1.5rem 0;">No leads yet.</div>
        @else
            <div class="ss-status-bar">
                @foreach (['new', 'contacted', 'booked', 'lost'] as $key)
                    @php $pct = ($statuses[$key] ?? 0) / $statusTotal * 100; @endphp
                    @if ($pct > 0)
                        <div class="ss-color-{{ $key }}" style="width: {{ $pct }}%;"></div>
                    @endif
                @endforeach
            </div>
            <div class="ss-status-list">
                @foreach (['new' => 'New', 'contacted' => 'Contacted', 'booked' => 'Booked', 'lost' => 'Lost'] as $key => $label)
                    <div class="ss-status-item">
                        <span>
                            <span class="ss-status-swatch ss-color-{{ $key }}"></span>
                            <span>{{ $label }}</span>
                        </span>
                        <strong>{{ $statuses[$key] ?? 0 }}</strong>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
