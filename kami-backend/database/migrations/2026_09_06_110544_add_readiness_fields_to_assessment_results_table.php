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
        Schema::table('assessment_results', function (Blueprint $table) {

            $table->string('readiness_status')
                ->nullable()
                ->after('se_category');

            $table->text('readiness_description')
                ->nullable()
                ->after('readiness_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_results', function (Blueprint $table) {

            $table->dropColumn([
                'readiness_status',
                'readiness_description',
            ]);
        });
    }
};