<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();

            $table->string('category', 10);
            $table->string('question_number', 50);

            $table->integer('kami_level')->nullable();

            $table->string('security_category')->nullable();

            $table->text('question');

            $table->enum('answer_type', [
                'se',
                'implementation'
            ]);

            $table->text('evidence_example')->nullable();

            $table->string('iso_control', 50)->nullable();
            $table->string('iso_name')->nullable();

            $table->timestamps();

            $table->unique([
                'category',
                'question_number'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};