@php
    $client = $getRecord();
    $channels = [
        [
            'tone'    => 'sky',
            'label'   => 'Email',
            'value'   => $client->notification_email,
            'enabled' => (bool) $client->notify_email_enabled,
            'svg'     => '<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>',
        ],
        [
            'tone'    => 'green',
            'label'   => 'WhatsApp',
            'value'   => $client->notification_whatsapp,
            'enabled' => (bool) $client->notify_whatsapp_enabled,
            'svg'     => '<path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/>',
        ],
        [
            'tone'    => 'amber',
            'label'   => 'SMS',
            'value'   => $client->notification_sms,
            'enabled' => (bool) $client->notify_sms_enabled,
            'svg'     => '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>',
        ],
    ];
@endphp

<div class="ss-noti-grid">
    @foreach ($channels as $c)
        <div class="ss-noti-card {{ $c['enabled'] ? '' : 'is-off' }}">
            <div class="ss-noti-head">
                <div class="ss-noti-title">
                    <span class="ss-noti-icon ss-noti-icon--{{ $c['tone'] }}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor">{!! $c['svg'] !!}</svg>
                    </span>
                    <span>{{ $c['label'] }}</span>
                </div>
                <span class="ss-toggle {{ $c['enabled'] ? 'ss-toggle--on' : 'ss-toggle--off' }}">
                    <span class="ss-toggle__dot"></span>
                    {{ $c['enabled'] ? 'On' : 'Off' }}
                </span>
            </div>
            <div class="ss-noti-value">{{ $c['value'] ?: 'Not configured' }}</div>
        </div>
    @endforeach
</div>
