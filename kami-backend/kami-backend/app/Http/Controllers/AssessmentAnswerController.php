<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\Question;
use Illuminate\Http\Request;

class AssessmentAnswerController extends Controller
{
    public function store(
        Request $request,
        Assessment $assessment
    ) {
        $validated = $request->validate([
            'question_id' => [
                'required',
                'integer',
                'exists:questions,id'
            ],

            'answer' => [
                'nullable',
                'string'
            ],

            'evidence' => [
                'nullable',
                'string'
            ],

            'notes' => [
                'nullable',
                'string'
            ],
        ]);

        Question::findOrFail(
            $validated['question_id']
        );

        $answer = AssessmentAnswer::updateOrCreate(
            [
                'assessment_id' => $assessment->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'answer' => $validated['answer'] ?? null,
                'evidence' => $validated['evidence'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Jawaban berhasil disimpan.',
            'data' => $answer,
        ]);
    }
}