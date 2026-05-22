<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\WhisperTranscriptionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class TranscribeConversationAudio implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 30;
    public int $timeout = 180;

    public function __construct(public int $conversationId)
    {
    }

    public function handle(): void
    {
        $whisper = WhisperTranscriptionService::fromConfig();

        if (! $whisper->isConfigured()) {
            Log::info('Whisper transcription skipped: API key not configured', [
                'conversation_id' => $this->conversationId,
            ]);
            return;
        }

        $conversation = Conversation::find($this->conversationId);
        if (! $conversation || ! $conversation->audio_url) {
            return;
        }

        // Resolve absolute path on the public disk. Handles "conversations/.../x.webm"
        // (relative) and ignores full URLs (we don't transcribe remote files here).
        $relativePath = $conversation->audio_url;
        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            Log::warning('Skipping transcription of remote audio_url', [
                'conversation_id' => $this->conversationId,
                'audio_url' => $relativePath,
            ]);
            return;
        }
        $absolute = Storage::disk('public')->path($relativePath);

        $result = $whisper->transcribe($absolute);

        // Use Whisper's segment list. Each segment becomes a "user" message
        // (widget only records visitor mic; AI side is not in this audio).
        $segments = $result['segments'];
        if (empty($segments) && filled($result['text'])) {
            $segments = [[
                'start' => 0,
                'end'   => 0,
                'text'  => $result['text'],
            ]];
        }

        $base = $conversation->started_at ?: $conversation->created_at ?: now();
        $created = 0;

        Message::where('conversation_id', $conversation->id)
            ->where('role', 'user')
            ->delete();

        foreach ($segments as $segment) {
            if ($segment['text'] === '') {
                continue;
            }
            Message::create([
                'conversation_id' => $conversation->id,
                'role'            => 'user',
                'content'         => $segment['text'],
                'timestamp'       => $base->copy()->addSeconds((int) $segment['start']),
            ]);
            $created++;
        }

        // Mirror into conversations.transcript JSON for the fallback renderer.
        $conversation->transcript = Message::where('conversation_id', $conversation->id)
            ->orderBy('timestamp')
            ->get(['role', 'content', 'timestamp'])
            ->map(fn (Message $m) => [
                'role'      => $m->role,
                'content'   => $m->content,
                'timestamp' => Carbon::parse($m->timestamp)->toIso8601String(),
            ])
            ->toArray();
        $conversation->save();

        Log::info('Whisper transcription complete', [
            'conversation_id' => $this->conversationId,
            'segments'        => $created,
        ]);

        // Chain Claude extraction so the conversation auto-fills lead details.
        if ($created > 0) {
            ExtractLeadDetails::dispatch($this->conversationId);
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Whisper transcription failed', [
            'conversation_id' => $this->conversationId,
            'error'           => $exception->getMessage(),
        ]);
    }
}
