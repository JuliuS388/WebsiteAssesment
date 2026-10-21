<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentAnswer extends Model
{
    protected $fillable = [
        'assessment_id',
        'question_id',
        'answer',
        'evidence',
        'notes',
        'raw_score',
        'weighted_score',
    ];

    protected $casts = [
        'raw_score' => 'decimal:2',
        'weighted_score' => 'decimal:2',
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
            Question::class
        );
    }

    public function files(): HasMany
    {
        return $this->hasMany(
            AssessmentAnswerFile::class
        );
    }
}