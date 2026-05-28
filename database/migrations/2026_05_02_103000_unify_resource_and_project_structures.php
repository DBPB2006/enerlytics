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
        // Update resources table to match unified structure
        Schema::table('resources', function (Blueprint $table) {
            if (Schema::hasColumn('resources', 'name')) {
                $table->renameColumn('name', 'title');
            }
            if (Schema::hasColumn('resources', 'user_id')) {
                $table->renameColumn('user_id', 'created_by');
            }
            if (! Schema::hasColumn('resources', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
        });

        // Drop projects table as it's now unified into resources
        Schema::dropIfExists('projects');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->renameColumn('title', 'name');
            $table->renameColumn('created_by', 'user_id');
            $table->dropColumn('description');
        });

        // Recreating projects table would be complex here,
        // usually we don't rollback unification migrations easily.
    }
};
