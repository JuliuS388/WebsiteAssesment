<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assessment extends Model
{
    protected $fillable = [
        'user_id',
        'school_name',
        'respondent_name',
        'respondent_role',
        'unit',
        'assessment_date',
        'assessment_period',
        'assessor_name',
        'status',
    ];

    protected $casts = [
        'assessment_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(
            AssessmentAnswer::class
        );
    }

    public function additionalAnswers(): HasMany
    {
        return $this->hasMany(
            AdditionalAssessmentAnswer::class
        );
    }

    public function result(): HasOne
    {
        return $this->hasOne(
            AssessmentResult::class
        );
    }
}