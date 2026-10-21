<?php

namespace App\Http\Controllers;

use App\Models\AdditionalAssessmentAnswer;
use App\Models\Assessment;
use App\Models\AdditionalQuestion;
use Illuminate\Http\Request;

class AdditionalAssessmentAnswerController extends Controller
{
    /**
     * Menampilkan seluruh pertanyaan tambahan beserta
     * jawaban untuk assessment tertentu.
     */
    public function index(
        Assessment $assessment
    ) {
        $questions =
            AdditionalQuestion::orderBy('id')
                ->get();

        $answers =
            AdditionalAssessmentAnswer::where(
                'assessment_id',
                $assessment->id
            )
            ->get()
            ->keyBy('additional_question_id');

        $data =
            $questions->map(
                function ($question) use ($answers) {

                    $answer =
                        $answers->get(
                            $question->id
                        );

                    return [
                        'id' =>
                            $question->id,

                        'category' =>
                            $question->category,

                        'question_number' =>
                            $question->question_number,

                        'question' =>
                            $question->question,

                        'purpose' =>
                            $question->purpose,

                        'evidence_example' =>
                            $question->evidence_example,

                        'iso_control' =>
                            $question->iso_control,

                        'iso_name' =>
                            $question->iso_name,

                        'answer' =>
                            $answer?->answer,

                        'evidence' =>
                            $answer?->evidence,

                        'notes' =>
                            $answer?->notes,
                    ];
                }
            )
            ->values();

        return response()->json([
            'success' => true,

            'data' => [
                'assessment_id' =>
                    $assessment->id,

                'total_questions' =>
                    $questions->count(),

                'answered_questions' =>
                    $answers->count(),

                'questions' =>
                    $data,
            ],
        ]);
    }

    /**
     * Menyimpan atau memperbarui jawaban
     * pertanyaan tambahan.
     */
    public function store(
        Request $request,
        Assessment $assessment
    ) {
        $validated = $request->validate([
            'additional_question_id' => [
                'required',
                'integer',
                'exists:additional_questions,id'
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

        AdditionalQuestion::findOrFail(
            $validated['additional_question_id']
        );

        $answer =
            AdditionalAssessmentAnswer::updateOrCreate(
                [
                    'assessment_id' =>
                        $assessment->id,

                    'additional_question_id' =>
                        $validated[
                            'additional_question_id'
                        ],
                ],
                [
                    'answer' =>
                        $validated['answer']
                        ?? null,

                    'evidence' =>
                        $validated['evidence']
                        ?? null,

                    'notes' =>
                        $validated['notes']
                        ?? null,
                ]
            );

        return response()->json([
            'success' => true,

            'message' =>
                'Jawaban tambahan berhasil disimpan.',

            'data' => $answer,
        ]);
    }
}