<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = [
        'category',
        'question_number',
        'kami_level',
        'security_category',
        'question',
        'answer_type',
        'evidence_example',
        'iso_control',
        'iso_name',
    ];

    public function answers(): HasMany
    {
        return $this->hasMany(AssessmentAnswer::class);
    }
}