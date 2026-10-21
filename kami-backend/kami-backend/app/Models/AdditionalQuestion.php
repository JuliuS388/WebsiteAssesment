<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdditionalQuestion extends Model
{
    protected $fillable = [
        'category',
        'question_number',
        'question',
        'purpose',
        'evidence_example',
        'iso_control',
        'iso_name',
    ];

    public function answers(): HasMany
    {
        return $this->hasMany(
            AdditionalAssessmentAnswer::class
        );
    }
}