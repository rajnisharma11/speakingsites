<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->enum('source_type', ['pdf', 'url', 'docx', 'text']);
            $table->string('original_filename_or_url');
            $table->text('text_preview')->nullable();
            $table->timestamp('ingested_at')->nullable();
            $table->timestamps();
            $table->index(['client_id', 'source_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_sources');
    }
};
