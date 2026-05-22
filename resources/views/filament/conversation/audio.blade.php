@php
    use Illuminate\Support\Str;
    use Illuminate\Support\Facades\Storage;

    $c = $getRecord();
    $url = null;
    if ($c->audio_url) {
        $url = Str::startsWith($c->audio_url, ['http://', 'https://', '/'])
            ? $c->audio_url
            : Storage::disk('public')->url($c->audio_url);
    }
@endphp

@if ($url)
    <div class="ss-audio">
        <div class="ss-audio__waveline">
            @for ($i = 0; $i < 24; $i++)
                <span class="ss-audio__bar" style="height: {{ rand(20, 100) }}%;"></span>
            @endfor
        </div>
        <audio controls preload="metadata" class="ss-audio__player" src="{{ $url }}">
            Your browser does not support audio playback.
        </audio>
        <div class="ss-audio__foot">
            <a href="{{ $url }}" download class="ss-link">⬇ Download recording</a>
            <span style="color:#94a3b8;font-size:0.75rem;">{{ basename($url) }}</span>
        </div>
    </div>
@else
    <div class="ss-empty">No audio captured for this conversation.</div>
@endif
