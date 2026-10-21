<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_results', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assessment_id')
                ->unique()
                ->constrained('assessments')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | SISTEM ELEKTRONIK
            |--------------------------------------------------------------------------
            */

            $table->decimal('se_score', 8, 2)->nullable();

            $table->string('se_category')->nullable();

            /*
            |--------------------------------------------------------------------------
            | TOTAL INDEKS KAMI
            |--------------------------------------------------------------------------
            */

            $table->decimal('total_score', 10, 2)->nullable();

            /*
            |--------------------------------------------------------------------------
            | MATURITY
            |--------------------------------------------------------------------------
            |
            | Contoh:
            | I, I+, II, II+, III, III+, IV, IV+, V
            |
            */

            $table->string('maturity_level', 20)->nullable();

            $table->text('maturity_description')->nullable();

            /*
            |--------------------------------------------------------------------------
            | STATUS ASSESSMENT
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('total_questions')->default(0);

            $table->unsignedInteger('total_answered')->default(0);

            $table->decimal(
                'completion_percentage',
                5,
                2
            )->default(0);

            /*
            |--------------------------------------------------------------------------
            | DETAIL SKOR AREA
            |--------------------------------------------------------------------------
            */

            $table->decimal('score_ii', 10, 2)->default(0);
            $table->decimal('score_iii', 10, 2)->default(0);
            $table->decimal('score_iv', 10, 2)->default(0);
            $table->decimal('score_v', 10, 2)->default(0);
            $table->decimal('score_vi', 10, 2)->default(0);
            $table->decimal('score_vii', 10, 2)->default(0);
            $table->decimal('score_viii', 10, 2)->default(0);

            /*
            |--------------------------------------------------------------------------
            | JSON DETAIL
            |--------------------------------------------------------------------------
            */

            $table->json('area_details')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_results');
    }
};