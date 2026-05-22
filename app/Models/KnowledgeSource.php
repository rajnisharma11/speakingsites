<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'source_type',
        'original_filename_or_url',
        'text_preview',
        'ingested_at',
    ];

    protected $casts = [
        'ingested_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(KnowledgeChunk::class, 'source_id');
    }
}
