<?php

namespace App\Http\Controllers;

use App\Models\AdditionalQuestion;
use Illuminate\Http\Request;

class AdditionalQuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = AdditionalQuestion::query();

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