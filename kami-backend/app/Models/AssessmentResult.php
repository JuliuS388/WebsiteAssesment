<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentResult extends Model
{
    protected $fillable = [
        'assessment_id',

        'se_score',
        'se_category',

        'readiness_status',
        'readiness_description',

        'total_score',
        'maturity_level',
        'maturity_description',

        'total_questions',
        'total_answered',
        'completion_percentage',

        'score_ii',
        'score_iii',
        'score_iv',
        'score_v',
        'score_vi',
        'score_vii',
        'score_viii',

        'area_details',
    ];

    protected $casts = [
        'se_score' => 'decimal:2',

        'total_score' => 'decimal:2',

        'completion_percentage' => 'decimal:2',

        'score_ii' => 'decimal:2',
        'score_iii' => 'decimal:2',
        'score_iv' => 'decimal:2',
        'score_v' => 'decimal:2',
        'score_vi' => 'decimal:2',
        'score_vii' => 'decimal:2',
        'score_viii' => 'decimal:2',

        'area_details' => 'array',
    ];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(
            Assessment::class
        );
    }
}