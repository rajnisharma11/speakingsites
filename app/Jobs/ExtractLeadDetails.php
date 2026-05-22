<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Services\ClaudeExtractionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class ExtractLeadDetails implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 30;
    public int $timeout = 120;

    public function __construct(public int $conversationId)
    {
    }

    public function handle(): void
    {
        $claude = ClaudeExtractionService::fromConfig();

        if (! $claude->isConfigured()) {
            Log::info('Claude lead extraction skipped: API key not configured', [
                'conversation_id' => $this->conversationId,
            ]);
            return;
        }

        $conversation = Conversation::with('client')->find($this->conversationId);
        if (! $conversation) {
            return;
        }

        // Prefer messages table; fall back to transcript JSON.
        $messages = $conversation->messages()->orderBy('timestamp')->get();
        if ($messages->isNotEmpty()) {
            $transcript = $messages->map(fn ($m) => [
                'role'    => $m->role,
                'content' => $m->content,
            ])->all();
        } else {
            $transcript = is_array($conversation->transcript) ? $conversation->transcript : [];
        }

        if (empty($transcript)) {
            Log::info('Claude extraction skipped: empty transcript', [
                'conversation_id' => $this->conversationId,
            ]);
            return;
        }

        $extracted = $claude->extract(
            transcript: $transcript,
            businessName: $conversation->client?->business_name,
        );

        // Only overwrite fields when the model gave us something. Don't clobber
        // existing visitor info captured via the widget form with a null.
        $updates = [
            'urgency_flag' => $extracted['urgency_flag'],
        ];
        foreach (['visitor_name', 'visitor_email', 'visitor_phone', 'summary', 'suggested_action'] as $field) {
            if (filled($extracted[$field])) {
                $updates[$field] = $extracted[$field];
            }
        }

        $conversation->update($updates);

        Log::info('Claude extraction complete', [
            'conversation_id' => $this->conversationId,
            'extracted_fields' => array_keys(array_filter($extracted, fn ($v) => $v !== null && $v !== false)),
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Claude extraction failed', [
            'conversation_id' => $this->conversationId,
            'error' => $exception->getMessage(),
        ]);
    }
}
