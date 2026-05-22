@php
    $client = $getRecord();
    $recent = $client->conversations()->latest('created_at')->limit(8)->get();
@endphp

@if ($recent->isEmpty())
    <div class="ss-empty">
        <div style="font-size: 0.875rem; margin-bottom: 0.25rem;">No conversations yet.</div>
        <div style="font-size: 0.75rem;">Leads will appear here once visitors start chatting.</div>
    </div>
@else
    <div class="ss-table-wrap">
        <table class="ss-table">
            <thead>
                <tr>
                    <th>Visitor</th>
                    <th style="display: none;" class="sm-show">Contact</th>
                    <th>Status</th>
                    <th>Audio</th>
                    <th>When</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @foreach ($recent as $c)
                    <tr>
                        <td>
                            <div style="font-weight: 600; color: #0f172a;">{{ $c->visitor_name ?: 'Anonymous' }}</div>
                            @if ($c->urgency_flag)
                                <div style="font-size: 0.625rem; color: #dc2626; font-weight: 600; margin-top: 0.125rem;">⚠ Urgent</div>
                            @endif
                        </td>
                        <td>
                            <div style="font-size: 0.75rem; color: #475569;">{{ $c->visitor_email ?: '—' }}</div>
                            @if ($c->visitor_phone)
                                <div style="font-size: 0.6875rem; color: #94a3b8; font-family: ui-monospace, monospace;">{{ $c->visitor_phone }}</div>
                            @endif
                        </td>
                        <td>
                            <span class="ss-status-pill ss-status-pill--{{ $c->status }}">{{ ucfirst($c->status) }}</span>
                        </td>
                        <td>
                            @if ($c->audio_url)
                                <span style="font-size: 0.6875rem; color: #4d7c0f; font-weight: 600;">● Recorded</span>
                            @else
                                <span style="font-size: 0.6875rem; color: #94a3b8;">—</span>
                            @endif
                        </td>
                        <td style="white-space: nowrap; font-size: 0.75rem; color: #64748b;">
                            {{ $c->created_at?->diffForHumans() }}
                        </td>
                        <td style="text-align: right;">
                            <a href="{{ \App\Filament\Resources\ConversationResource::getUrl('view', ['record' => $c]) }}" class="ss-link">View →</a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @if ($client->conversations()->count() > $recent->count())
        <div style="margin-top: 0.75rem; text-align: right;">
            <a href="{{ \App\Filament\Resources\ConversationResource::getUrl('index', ['tableFilters' => ['client_id' => ['value' => $client->id]]]) }}" class="ss-link">View all leads →</a>
        </div>
    @endif
@endif
