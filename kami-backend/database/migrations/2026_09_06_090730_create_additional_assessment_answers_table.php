<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('additional_assessment_answers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assessment_id')
                ->constrained('assessments')
                ->cascadeOnDelete();

            $table->foreignId('additional_question_id')
                ->constrained('additional_questions')
                ->cascadeOnDelete();

            $table->string('answer')->nullable();

            $table->text('evidence')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique(
                ['assessment_id', 'additional_question_id'],
                'additional_answers_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('additional_assessment_answers');
    }
};