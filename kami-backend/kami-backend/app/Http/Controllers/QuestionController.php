<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = Question::query();

        if ($request->filled('category')) {
            $query->where(
                'category',
                $request->category
            );
        }

        $questions = $query
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $questions->count(),
            'data' => $questions,
        ]);
    }
}