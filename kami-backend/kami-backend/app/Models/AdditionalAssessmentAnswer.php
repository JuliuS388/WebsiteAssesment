<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdditionalAssessmentAnswer extends Model
{
    protected $fillable = [
        'assessment_id',
        'additional_question_id',
        'answer',
        'evidence',
        'notes',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(
            Assessment::class
        );
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(
            AdditionalQuestion::class,
            'additional_question_id'
        );
    }
}