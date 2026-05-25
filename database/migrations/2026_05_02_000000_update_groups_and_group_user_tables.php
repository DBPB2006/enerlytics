<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update groups table
        Schema::table('groups', function (Blueprint $table) {
            if (Schema::hasColumn('groups', 'created_by')) {
                $table->renameColumn('created_by', 'owner_id');
            } else {
                $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            }
            $table->text('description')->nullable();
            $table->string('location')->nullable();
        });

        // Update group_user table
        Schema::table('group_user', function (Blueprint $table) {
            // Drop current role column if it's a string, then add as enum
            // For production safety, we'll check if it exists and change it.
            // Laravel's change() method requires doctrine/dbal for older versions,
            // but Laravel 11+ handles it natively.
            $table->enum('role', ['owner', 'admin', 'member'])->default('member')->change();
            $table->enum('status', ['pending', 'approved'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->renameColumn('owner_id', 'created_by');
            $table->dropColumn(['description', 'location']);
        });

        Schema::table('group_user', function (Blueprint $table) {
            $table->string('role')->default('member')->change();
            $table->dropColumn('status');
        });
    }
};
