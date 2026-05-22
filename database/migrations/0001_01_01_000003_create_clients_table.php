<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->string('logo_url')->nullable();
            $table->string('primary_colour', 16)->default('#4f46e5');
            $table->string('heygen_avatar_id')->nullable();
            $table->text('greeting_message')->nullable();
            $table->string('embed_api_key', 64)->unique();
            $table->enum('status', ['active', 'suspended'])->default('active')->index();
            $table->string('notification_whatsapp')->nullable();
            $table->string('notification_sms')->nullable();
            $table->string('notification_email')->nullable();
            $table->boolean('notify_whatsapp_enabled')->default(false);
            $table->boolean('notify_sms_enabled')->default(false);
            $table->boolean('notify_email_enabled')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
        });
        Schema::dropIfExists('clients');
    }
};
