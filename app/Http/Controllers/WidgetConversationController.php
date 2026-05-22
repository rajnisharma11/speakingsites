<?php

namespace App\Http\Controllers;

use App\Jobs\TranscribeConversationAudio;
use App\Models\Client;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class WidgetConversationController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'api_key' => ['required', 'string'],
            'avatar_type' => ['nullable', 'string', 'max:64'],
            'visitor_name' => ['nullable', 'string', 'max:255'],
            'visitor_email' => ['nullable', 'email', 'max:255'],
            'visitor_phone' => ['nullable', 'string', 'max:64'],
        ]);

        $client = $this->resolveClient($data['api_key']);
        if (! $client) {
            return response()->json(['error' => 'invalid_api_key'], 401);
        }

        $conversation = Conversation::create([
            'client_id' => $client->id,
            'session_id' => (string) Str::uuid(),
            'started_at' => now(),
            'avatar_type' => $data['avatar_type'] ?? null,
            'visitor_name' => $data['visitor_name'] ?? null,
            'visitor_email' => $data['visitor_email'] ?? null,
            'visitor_phone' => $data['visitor_phone'] ?? null,
            'transcript' => [],
            'status' => 'new',
        ]);

        return response()->json([
            'session_id' => $conversation->session_id,
            'conversation_id' => $conversation->id,
        ], 201);
    }

    public function end(Request $request): JsonResponse
    {
        $data = $request->validate([
            'api_key' => ['required', 'string'],
            'session_id' => ['required', 'string'],
            'transcript' => ['nullable'],
            'visitor_name' => ['nullable', 'string', 'max:255'],
            'visitor_email' => ['nullable', 'email', 'max:255'],
            'visitor_phone' => ['nullable', 'string', 'max:64'],
            'audio' => ['nullable', 'file', 'mimetypes:audio/webm,audio/ogg,audio/mpeg,audio/wav,audio/mp4,video/webm', 'max:51200'],
        ]);

        $client = $this->resolveClient($data['api_key']);
        if (! $client) {
            return response()->json(['error' => 'invalid_api_key'], 401);
        }

        $conversation = Conversation::where('client_id', $client->id)
            ->where('session_id', $data['session_id'])
            ->first();

        if (! $conversation) {
            return response()->json(['error' => 'session_not_found'], 404);
        }

        $transcript = $this->normaliseTranscript($request->input('transcript'));

        $audioUploaded = false;
        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $ext = $file->getClientOriginalExtension() ?: 'webm';
            $path = $file->storeAs(
                "conversations/{$client->id}",
                $conversation->session_id . '.' . $ext,
                'public'
            );
            $conversation->audio_url = $path;
            $audioUploaded = true;
        }

        // Pull contact details from the transcript so progressively-flushed
        // Leads aren't all NULL when the visitor only shared their info
        // verbally to the avatar. Explicit request fields still win.
        $extracted = $this->extractVisitorInfo($transcript);

        $conversation->fill([
            'ended_at' => now(),
            'transcript' => $transcript,
            'visitor_name' => $data['visitor_name']
                ?? $conversation->visitor_name
                ?? $extracted['name'],
            'visitor_email' => $data['visitor_email']
                ?? $conversation->visitor_email
                ?? $extracted['email'],
            'visitor_phone' => $data['visitor_phone']
                ?? $conversation->visitor_phone
                ?? $extracted['phone'],
        ])->save();

        $conversation->messages()->delete();
        foreach ($transcript as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $role = $entry['role'] ?? null;
            $content = $entry['content'] ?? null;
            if (! in_array($role, ['user', 'assistant', 'system'], true) || ! is_string($content) || $content === '') {
                continue;
            }
            Message::create([
                'conversation_id' => $conversation->id,
                'role' => $role,
                'content' => $content,
                'timestamp' => isset($entry['timestamp'])
                    ? Carbon::parse($entry['timestamp'])
                    : now(),
            ]);
        }

        if ($audioUploaded) {
            TranscribeConversationAudio::dispatch($conversation->id);
        }

        return response()->json([
            'conversation_id' => $conversation->id,
            'audio_url' => $conversation->audio_url
                ? asset('storage/' . $conversation->audio_url)
                : null,
        ]);
    }

    private function resolveClient(string $apiKey): ?Client
    {
        return Client::where('embed_api_key', $apiKey)
            ->where('status', 'active')
            ->first();
    }

    private function normaliseTranscript(mixed $raw): array
    {
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            $raw = is_array($decoded) ? $decoded : [];
        }
        return is_array($raw) ? array_values($raw) : [];
    }

    /**
     * Best-effort extraction of name / email / phone from the user side of
     * the transcript. Returns NULLs when nothing confident is found.
     *
     * Two passes:
     *   1. Concatenated-text patterns ("my name is X", email/phone regex).
     *   2. Context-aware: when the avatar asks for a field, treat the next
     *      user message as the answer (handles short replies like "Raj"
     *      or "9876543210" without preamble).
     */
    private function extractVisitorInfo(array $transcript): array
    {
        $userText = '';
        $pairs = [];
        foreach ($transcript as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $role = $entry['role'] ?? null;
            $content = $entry['content'] ?? null;
            if (! is_string($content)) {
                continue;
            }
            if ($role === 'user' || $role === 'assistant') {
                $pairs[] = ['role' => $role, 'content' => $content];
                if ($role === 'user') {
                    $userText .= ' ' . $content;
                }
            }
        }
        $userText = trim($userText);
        if ($userText === '' && count($pairs) === 0) {
            return ['name' => null, 'email' => null, 'phone' => null];
        }

        // Email: standard RFC-ish match, first hit wins. Pre-normalise the
        // space around "@" so "riya @gmail.com" (common when chat input is
        // tokenised loosely) still matches.
        $email = null;
        $emailText = preg_replace('/\s*@\s*/', '@', $userText);
        if (preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $emailText, $m)) {
            $email = strtolower($m[0]);
        }

        // Phone: at least 7 digits including optional +country code, allow
        // spaces / dashes / parens between digit groups. Strip formatting
        // before persisting so the column stays clean.
        $phone = null;
        if (preg_match('/(\+?\d[\d\s\-().]{6,}\d)/', $userText, $m)) {
            $candidate = preg_replace('/[^\d+]/', '', $m[1]);
            if (strlen(preg_replace('/\D/', '', (string) $candidate)) >= 7) {
                $phone = $candidate;
            }
        }

        // Name: look for common self-introduction patterns. We match a
        // generous run of word-tokens after the trigger, then truncate at
        // the first stop-word ("and", "from", "calling"…) so phrases like
        // "my name is Raj and you can reach me" yield "Raj", not "Raj and
        // you can".
        $name = null;
        $namePatterns = [
            '/\bmy name is\s+([\p{L}\'\-][\p{L}\'\- ]{1,60})/iu',
            '/\bi\'?m\s+([\p{L}\'\-][\p{L}\'\- ]{1,60})/iu',
            '/\bi am\s+([\p{L}\'\-][\p{L}\'\- ]{1,60})/iu',
            '/\bthis is\s+([\p{L}\'\-][\p{L}\'\- ]{1,60})/iu',
            // Labeled form: "name riya", "name: riya", "name is riya".
            // Used by visitors typing labelled fields in one message
            // ("name riya email riya@gmail.com phone 9876543210").
            '/\bname(?:\s+is)?\s*[:\-]?\s+([\p{L}\'\-][\p{L}\'\- ]{1,60})/iu',
        ];
        $stopWords = [
            'and', 'but', 'or', 'so', 'from', 'at', 'on', 'in', 'with',
            'here', 'calling', 'looking', 'trying', 'interested', 'speaking',
            'i', 'you', 'we', 'they', 'the', 'a', 'an',
            // Field labels — stop name capture when the visitor moves to
            // the next labelled field ("name riya email ..." → "riya").
            'email', 'e-mail', 'mail', 'phone', 'mobile', 'number', 'contact',
        ];
        foreach ($namePatterns as $pattern) {
            if (! preg_match($pattern, $userText, $m)) {
                continue;
            }
            $tokens = preg_split('/\s+/', trim($m[1])) ?: [];
            $cleaned = [];
            foreach ($tokens as $tok) {
                if (in_array(mb_strtolower($tok), $stopWords, true)) {
                    break;
                }
                $cleaned[] = $tok;
                if (count($cleaned) >= 4) {
                    break;
                }
            }
            if (count($cleaned) > 0) {
                $name = implode(' ', $cleaned);
                break;
            }
        }

        // Pass 2 — context-aware. Look at assistant prompts and treat the
        // immediately-following user reply as the answer. Useful when the
        // user replies with just "Raj" or "9876543210" without preamble.
        $askName  = '/\b(your name|what.?s your name|may i (?:have|know|get) your name|tell me your name|name please)\b/i';
        $askEmail = '/\b(your e-?mail|email address|what.?s your e-?mail|email please)\b/i';
        $askPhone = '/\b(your (?:phone|mobile|number|contact number)|phone number|mobile number|contact (?:number|details)|how can (?:we|i) (?:reach|contact) you)\b/i';

        for ($i = 0; $i < count($pairs) - 1; $i++) {
            if ($pairs[$i]['role'] !== 'assistant') {
                continue;
            }
            $prompt = $pairs[$i]['content'];
            // Find the next user reply.
            $reply = null;
            for ($j = $i + 1; $j < count($pairs); $j++) {
                if ($pairs[$j]['role'] === 'user') {
                    $reply = trim($pairs[$j]['content']);
                    break;
                }
            }
            if ($reply === null || $reply === '') {
                continue;
            }

            // Name: short, mostly-alphabetic reply after a name prompt.
            if (! $name && preg_match($askName, $prompt) && preg_match('/^[\p{L}][\p{L}\s\'-]{0,40}$/u', $reply)) {
                $tokens = preg_split('/\s+/', $reply) ?: [];
                if (count($tokens) <= 4) {
                    $name = $reply;
                }
            }
            // Email: pull the first email-shaped substring from the reply.
            if (! $email && preg_match($askEmail, $prompt) && preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $reply, $m2)) {
                $email = strtolower($m2[0]);
            }
            // Phone: pull any 7+ digit run from the reply, strip formatting.
            if (! $phone && preg_match($askPhone, $prompt) && preg_match('/(\+?\d[\d\s\-().]{6,}\d)/', $reply, $m2)) {
                $candidate = preg_replace('/[^\d+]/', '', $m2[1]);
                if (strlen(preg_replace('/\D/', '', (string) $candidate)) >= 7) {
                    $phone = $candidate;
                }
            }
        }

        return ['name' => $name, 'email' => $email, 'phone' => $phone];
    }
}
