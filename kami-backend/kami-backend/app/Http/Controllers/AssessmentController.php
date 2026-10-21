<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function index()
    {
        $assessments = Assessment::query()
            ->where('user_id', request()->user()->id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $assessments->count(),
            'data' => $assessments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_name' => [
                'required',
                'string',
                'max:255'
            ],

            'respondent_name' => [
                'required',
                'string',
                'max:255'
            ],

            'respondent_role' => [
                'nullable',
                'string',
                'max:255'
            ],

            'unit' => [
                'nullable',
                'string',
                'max:255'
            ],

            'assessment_date' => [
                'nullable',
                'date'
            ],

            'assessment_period' => [
                'nullable',
                'string',
                'max:255'
            ],

            'assessor_name' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);

        $validated['status'] = 'draft';
        $validated['user_id'] = $request->user()->id;

        $assessment = Assessment::create(
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Assessment berhasil dibuat.',
            'data' => $assessment,
        ], 201);
    }

    public function show(Assessment $assessment)
    {
        $assessment->load([
            'answers.question',
            'answers.files',
            'additionalAnswers.question',
        ]);

        return response()->json([
            'success' => true,
            'data' => $assessment,
        ]);
    }

    public function destroy(Assessment $assessment)
    {
        $assessment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Assessment berhasil dihapus.',
        ]);
    }
}