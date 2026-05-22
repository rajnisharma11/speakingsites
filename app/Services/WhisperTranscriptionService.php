<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhisperTranscriptionService
{
    private const ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';

    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly string $model = 'whisper-1',
    ) {
    }

    public static function fromConfig(): self
    {
        return new self(
            apiKey: config('services.openai.key'),
            model: config('services.openai.whisper_model', 'whisper-1'),
        );
    }

    public function isConfigured(): bool
    {
        return filled($this->apiKey);
    }

    /**
     * Transcribe an audio file with Whisper.
     *
     * @param  string  $absolutePath  Path to audio file on disk
     * @return array{text: string, segments: array<int, array{start: float, end: float, text: string}>}
     */
    public function transcribe(string $absolutePath): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('OpenAI API key not configured. Set OPENAI_API_KEY in .env.');
        }
        if (! is_file($absolutePath)) {
            throw new RuntimeException("Audio file not found: {$absolutePath}");
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(120)
                ->attach('file', file_get_contents($absolutePath), basename($absolutePath))
                ->asMultipart()
                ->post(self::ENDPOINT, [
                    ['name' => 'model', 'contents' => $this->model],
                    ['name' => 'response_format', 'contents' => 'verbose_json'],
                    ['name' => 'timestamp_granularities[]', 'contents' => 'segment'],
                ]);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Whisper API unreachable: ' . $e->getMessage(), previous: $e);
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'Whisper API error ' . $response->status() . ': ' . $response->body()
            );
        }

        $data = $response->json();

        return [
            'text'     => (string) ($data['text'] ?? ''),
            'segments' => array_map(
                static fn (array $s) => [
                    'start' => (float) ($s['start'] ?? 0),
                    'end'   => (float) ($s['end'] ?? 0),
                    'text'  => trim((string) ($s['text'] ?? '')),
                ],
                $data['segments'] ?? []
            ),
        ];
    }
}
