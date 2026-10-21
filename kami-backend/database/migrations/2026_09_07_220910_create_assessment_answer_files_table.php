<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'assessment_answer_files',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId(
                    'assessment_answer_id'
                )
                ->constrained(
                    'assessment_answers'
                )
                ->cascadeOnDelete();

                $table->string(
                    'original_name'
                );

                $table->string(
                    'file_name'
                );

                $table->string(
                    'file_path'
                );

                $table->string(
                    'mime_type'
                )->nullable();

                $table->unsignedBigInteger(
                    'file_size'
                )->nullable();

                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'assessment_answer_files'
        );
    }
};