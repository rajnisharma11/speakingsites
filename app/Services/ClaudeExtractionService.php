<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ClaudeExtractionService
{
    private const ENDPOINT = 'https://api.anthropic.com/v1/messages';
    private const VERSION = '2023-06-01';

    private const SYSTEM_PROMPT = <<<'TXT'
        You are a lead-qualification assistant for a multi-tenant AI receptionist
        platform. You receive a transcript of a phone-style conversation between a
        website visitor and the business's AI avatar. Your job is to extract clean
        lead details by calling the save_lead_details tool exactly once.

        Rules:
        - Only return information that is actually stated. Never invent names,
          emails, phone numbers, or facts.
        - If a field was not mentioned, set it to null (do not guess).
        - urgency_flag: true only when the visitor expresses immediate need
          (water leak gushing, no heat in winter, medical emergency words, etc.)
          or explicitly says "urgent" / "right now" / "today". Otherwise false.
        - summary: one or two sentences in third person describing what the
          visitor needs. Plain English. No bullet points.
        - suggested_action: a short imperative like "Call back within 30 minutes",
          "Send a plumber today", "Book consultation". Null if not applicable.
        - Phone numbers: normalize to readable form (keep country code if given).
        - If the transcript is empty or non-conversational, set every field to
          null and summary to "No usable transcript captured."
        TXT;

    private const TOOL_NAME = 'save_lead_details';

    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly string $model = 'claude-haiku-4-5-20251001',
    ) {
    }

    public static function fromConfig(): self
    {
        return new self(
            apiKey: config('services.anthropic.key'),
            model: config('services.anthropic.model', 'claude-haiku-4-5-20251001'),
        );
    }

    public function isConfigured(): bool
    {
        return filled($this->apiKey);
    }

    /**
     * Send a transcript to Claude and receive structured lead details.
     *
     * @param  array<int, array{role: string, content: string, timestamp?: string}>  $transcript
     * @return array{
     *   visitor_name: ?string,
     *   visitor_email: ?string,
     *   visitor_phone: ?string,
     *   urgency_flag: bool,
     *   summary: ?string,
     *   suggested_action: ?string,
     * }
     */
    public function extract(array $transcript, ?string $businessName = null): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env.');
        }

        $transcriptText = $this->renderTranscript($transcript);
        $userContent = ($businessName ? "Business: {$businessName}\n\n" : '')
            . "Transcript:\n{$transcriptText}";

        try {
            $response = Http::withHeaders([
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => self::VERSION,
                    'content-type' => 'application/json',
                ])
                ->timeout(60)
                ->post(self::ENDPOINT, [
                    'model' => $this->model,
                    'max_tokens' => 1024,
                    'system' => [
                        [
                            'type' => 'text',
                            'text' => self::SYSTEM_PROMPT,
                            'cache_control' => ['type' => 'ephemeral'],
                        ],
                    ],
                    'tools' => [$this->toolSchema()],
                    'tool_choice' => ['type' => 'tool', 'name' => self::TOOL_NAME],
                    'messages' => [
                        ['role' => 'user', 'content' => $userContent],
                    ],
                ]);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Anthropic API unreachable: ' . $e->getMessage(), previous: $e);
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'Anthropic API error ' . $response->status() . ': ' . $response->body()
            );
        }

        return $this->parseToolUse($response->json());
    }

    private function renderTranscript(array $transcript): string
    {
        if (empty($transcript)) {
            return '(empty)';
        }
        $lines = [];
        foreach ($transcript as $msg) {
            if (! is_array($msg)) {
                continue;
            }
            $role = $msg['role'] ?? 'user';
            $label = $role === 'assistant' ? 'AI' : ucfirst($role);
            $content = trim((string) ($msg['content'] ?? ''));
            if ($content === '') {
                continue;
            }
            $lines[] = "{$label}: {$content}";
        }
        return $lines ? implode("\n", $lines) : '(empty)';
    }

    private function toolSchema(): array
    {
        return [
            'name' => self::TOOL_NAME,
            'description' => 'Persist the structured lead details extracted from the conversation transcript.',
            'input_schema' => [
                'type' => 'object',
                'properties' => [
                    'visitor_name'     => ['type' => ['string', 'null'], 'description' => "Visitor's full name as stated. Null if not given."],
                    'visitor_email'    => ['type' => ['string', 'null'], 'description' => 'Email address. Null if not given.'],
                    'visitor_phone'    => ['type' => ['string', 'null'], 'description' => 'Phone number normalized. Null if not given.'],
                    'urgency_flag'     => ['type' => 'boolean', 'description' => 'True if visitor indicates immediate / emergency need.'],
                    'summary'          => ['type' => ['string', 'null'], 'description' => '1-2 sentence summary of what the visitor needs.'],
                    'suggested_action' => ['type' => ['string', 'null'], 'description' => 'Short imperative next step for the business.'],
                ],
                'required' => ['urgency_flag', 'summary'],
                'additionalProperties' => false,
            ],
        ];
    }

    private function parseToolUse(array $payload): array
    {
        $blocks = $payload['content'] ?? [];
        foreach ($blocks as $block) {
            if (($block['type'] ?? null) === 'tool_use' && ($block['name'] ?? null) === self::TOOL_NAME) {
                $input = $block['input'] ?? [];
                return [
                    'visitor_name'     => $input['visitor_name'] ?? null,
                    'visitor_email'    => $input['visitor_email'] ?? null,
                    'visitor_phone'    => $input['visitor_phone'] ?? null,
                    'urgency_flag'     => (bool) ($input['urgency_flag'] ?? false),
                    'summary'          => $input['summary'] ?? null,
                    'suggested_action' => $input['suggested_action'] ?? null,
                ];
            }
        }
        throw new RuntimeException('Claude response missing expected tool_use block. Raw: ' . json_encode($payload));
    }
}
