<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('sector', 64)->nullable()->index()->after('business_name');
        });

        $driver = DB::getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin','client_owner','client') NOT NULL DEFAULT 'client_owner'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_role_index');
                $table->dropColumn('role');
            });

            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['super_admin', 'client_owner', 'client'])->default('client_owner')->index();
            });
        }
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['sector']);
            $table->dropColumn('sector');
        });

        $driver = DB::getDriverName();

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin','client_owner') NOT NULL DEFAULT 'client_owner'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_role_index');
                $table->dropColumn('role');
            });

            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['super_admin', 'client_owner'])->default('client_owner')->index();
            });
        }
    }
};
