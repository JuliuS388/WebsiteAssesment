<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentAnswerFile extends Model
{
    protected $fillable = [
        'assessment_answer_id',
        'original_name',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function assessmentAnswer(): BelongsTo
    {
        return $this->belongsTo(
            AssessmentAnswer::class
        );
    }
}