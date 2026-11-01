<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement(
                'ALTER TABLE assessment_answer_files '
                .'ADD COLUMN file_contents LONGBLOB NULL'
            );

            return;
        }

        Schema::table('assessment_answer_files', function (Blueprint $table) {
            $table->binary('file_contents')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('assessment_answer_files', function (Blueprint $table) {
            $table->dropColumn('file_contents');
        });
    }
};
