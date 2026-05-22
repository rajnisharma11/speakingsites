<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_name',
        'sector',
        'logo_url',
        'primary_colour',
        'heygen_avatar_id',
        'greeting_message',
        'embed_api_key',
        'status',
        'notification_whatsapp',
        'notification_sms',
        'notification_email',
        'notify_whatsapp_enabled',
        'notify_sms_enabled',
        'notify_email_enabled',
    ];

    protected $casts = [
        'notify_whatsapp_enabled' => 'boolean',
        'notify_sms_enabled' => 'boolean',
        'notify_email_enabled' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Client $client) {
            if (empty($client->embed_api_key)) {
                $client->embed_api_key = 'sk_' . Str::random(48);
            }
        });
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function knowledgeSources(): HasMany
    {
        return $this->hasMany(KnowledgeSource::class);
    }

    public function knowledgeChunks(): HasMany
    {
        return $this->hasMany(KnowledgeChunk::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}
