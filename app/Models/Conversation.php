<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'session_id',
        'started_at',
        'ended_at',
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'transcript',
        'audio_url',
        'avatar_type',
        'summary',
        'suggested_action',
        'urgency_flag',
        'status',
        'owner_notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'transcript' => 'array',
        'urgency_flag' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('timestamp');
    }
}
