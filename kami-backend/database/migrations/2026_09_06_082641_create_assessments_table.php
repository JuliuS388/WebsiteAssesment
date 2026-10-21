<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();

            $table->string('school_name');

            $table->string('respondent_name');

            $table->string('respondent_role')->nullable();

            $table->string('unit')->nullable();

            $table->date('assessment_date')->nullable();

            $table->string('assessment_period')->nullable();

            $table->string('assessor_name')->nullable();

            $table->enum('status', [
                'draft',
                'completed'
            ])->default('draft');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};