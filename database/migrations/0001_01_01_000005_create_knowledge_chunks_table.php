<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('source_id')->constrained('knowledge_sources')->cascadeOnDelete();
            $table->longText('content');
            $table->json('embedding')->nullable();
            $table->unsignedInteger('token_count')->nullable();
            $table->timestamps();
            $table->index(['client_id', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_chunks');
    }
};
