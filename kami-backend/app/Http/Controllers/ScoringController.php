<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Services\KamiScoringService;

class ScoringController extends Controller
{
    public function calculate(
        Assessment $assessment,
        KamiScoringService $scoringService
    ) {
        $result = $scoringService->calculate(
            $assessment
        );

        return response()->json([
            'success' => true,
            'message' => 'Perhitungan Indeks KAMI berhasil.',
            'data' => $result,
        ]);
    }
}