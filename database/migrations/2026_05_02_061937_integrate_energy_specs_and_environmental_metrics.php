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
        Schema::table('resources', function (Blueprint $table) {
            // Solar specific
            $table->decimal('panel_area', 10, 2)->nullable();

            // Wind specific
            $table->decimal('rotor_area', 10, 2)->nullable();

            // Hydro specific
            $table->decimal('flow_rate', 10, 2)->nullable();
            $table->decimal('head', 10, 2)->nullable();

            // Common
            $table->decimal('efficiency', 5, 2)->default(0.70);

            // Manual environmental overrides
            $table->decimal('irradiance', 10, 2)->nullable();
            $table->decimal('wind_speed', 10, 2)->nullable();
            $table->decimal('river_flow', 10, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->dropColumn(['panel_area', 'rotor_area', 'flow_rate', 'head', 'efficiency', 'irradiance', 'wind_speed', 'river_flow']);
        });
    }
};
