<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentResult;
use Illuminate\Http\JsonResponse;

class ResultController extends Controller
{
    /**
     * Menampilkan hasil assessment KAMI.
     */
    public function show(
        Assessment $assessment
    ): JsonResponse {
        /*
         * Ambil hasil assessment.
         */
        $result = AssessmentResult::where(
            'assessment_id',
            $assessment->id
        )->first();

        /*
         * Jika hasil belum tersedia.
         */
        if (!$result) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Hasil assessment belum tersedia.',
                'data' => null,
            ], 404);
        }

        /*
         * Ambil area_details.
         */
        $areaDetails =
            $result->area_details;

        /*
         * Jika area_details masih berupa JSON string,
         * ubah menjadi array.
         */
        if (is_string($areaDetails)) {
            $areaDetails =
                json_decode(
                    $areaDetails,
                    true
                );
        }

        /*
         * Pastikan menjadi array.
         */
        if (!is_array($areaDetails)) {
            $areaDetails = [];
        }

        /*
         * Ambil maturity.
         */
        $maturity =
            $areaDetails['maturity']
            ?? [];

        if (!is_array($maturity)) {
            $maturity = [];
        }

        /*
         * ======================================================
         * AREA KAMI
         * ======================================================
         *
         * II - VII:
         * masuk ke Total Indeks KAMI.
         *
         * VIII:
         * hanya suplemen dan tidak masuk total.
         */
        $areas = [];

        foreach (
            [
                'II',
                'III',
                'IV',
                'V',
                'VI',
                'VII',
                'VIII',
            ] as $category
        ) {
            $scoreColumn =
                'score_' .
                strtolower($category);

            /*
             * Ambil data kategori dari area_details.
             */
            $area =
                $areaDetails[$category]
                ?? [];

            if (!is_array($area)) {
                $area = [];
            }

            /*
             * ==================================================
             * SCORE
             * ==================================================
             */
            $score =
                isset($area['score'])
                    ? (float) $area['score']
                    : (float) (
                        $result->{$scoreColumn}
                        ?? 0
                    );

            /*
             * ==================================================
             * TOTAL QUESTIONS
             * ==================================================
             *
             * Ambil dari hasil scoring jika tersedia.
             */
            $totalQuestions =
                isset(
                    $area['total_questions']
                )
                    ? (int) $area[
                        'total_questions'
                    ]
                    : 0;

            /*
             * ==================================================
             * ANSWERED QUESTIONS
             * ==================================================
             *
             * PENTING:
             *
             * KamiScoringService menggunakan nama:
             *
             * answered_questions
             *
             * bukan:
             *
             * answered
             */
            $answered =
                isset(
                    $area[
                        'answered_questions'
                    ]
                )
                    ? (int) $area[
                        'answered_questions'
                    ]
                    : (
                        isset(
                            $area['answered']
                        )
                            ? (int) $area[
                                'answered'
                            ]
                            : 0
                    );

            /*
             * ==================================================
             * PERCENTAGE
             * ==================================================
             */
            $percentage =
                $totalQuestions > 0
                    ? round(
                        (
                            $answered /
                            $totalQuestions
                        ) * 100,
                        2
                    )
                    : 0;

            /*
             * Simpan struktur yang sederhana
             * untuk digunakan oleh React.
             */
            $areas[$category] = [
                'category' =>
                    $category,

                'score' =>
                    $score,

                'answered' =>
                    $answered,

                'total_questions' =>
                    $totalQuestions,

                'percentage' =>
                    $percentage,

                /*
                 * Data tambahan dari scoring
                 * tetap dipertahankan.
                 */
                'level_3_allowed' =>
                    $area[
                        'level_3_allowed'
                    ] ?? null,
            ];
        }

        /*
         * ======================================================
         * SE
         * ======================================================
         */
        $se = [
            'score' =>
                (float) (
                    $result->se_score
                    ?? 0
                ),

            'category' =>
                $result->se_category
                ?? null,
        ];

        /*
         * ======================================================
         * MATURITY
         * ======================================================
         */
        $maturityLevel =
            $result->maturity_level;

        /*
         * Pastikan struktur overall tersedia.
         */
        if (
            isset(
                $maturity['overall']
            ) &&
            is_array(
                $maturity['overall']
            )
        ) {
            $maturity['overall'] = [
                'minimum' =>
                    $maturity[
                        'overall'
                    ]['minimum']
                    ?? null,

                'maximum' =>
                    $maturity[
                        'overall'
                    ]['maximum']
                    ?? null,
            ];
        }

        /*
         * ======================================================
         * TOTAL KAMI
         * ======================================================
         *
         * Nilai total diambil dari hasil scoring.
         *
         * Kategori VIII tidak ditambahkan di sini.
         */
        $totalScore =
            (float) (
                $result->total_score
                ?? 0
            );

        /*
         * ======================================================
         * TOTAL QUESTIONS
         * ======================================================
         *
         * 211 pertanyaan KAMI.
         */
        $totalQuestions =
            (int) (
                $result->total_questions
                ?? 0
            );

        /*
         * ======================================================
         * TOTAL ANSWERED
         * ======================================================
         */
        $totalAnswered =
            (int) (
                $result->total_answered
                ?? 0
            );

        /*
         * ======================================================
         * COMPLETION
         * ======================================================
         */
        $completionPercentage =
            $totalQuestions > 0
                ? round(
                    (
                        $totalAnswered /
                        $totalQuestions
                    ) * 100,
                    2
                )
                : 0;

        /*
         * ======================================================
         * IS COMPLETE
         * ======================================================
         */
        $isComplete =
            $totalAnswered >=
            $totalQuestions;

        /*
         * ======================================================
         * RESPONSE
         * ======================================================
         */
        return response()->json([
            'success' => true,

            'message' =>
                'Hasil assessment berhasil dimuat.',

            'data' => [
                'assessment_id' =>
                    $assessment->id,

                'result_id' =>
                    $result->id,

                /*
                 * SE
                 */
                'se' =>
                    $se,

                /*
                 * Total KAMI.
                 */
                'total_score' =>
                    $totalScore,

                /*
                 * Completion.
                 */
                'total_questions' =>
                    $totalQuestions,

                'total_answered' =>
                    $totalAnswered,

                'completion_percentage' =>
                    $completionPercentage,

                'is_complete' =>
                    $isComplete,

                /*
                 * Maturity.
                 */
                'maturity_level' =>
                    $maturityLevel,

                'maturity_description' =>
                    $result->maturity_description,

                'maturity' =>
                    $maturity,

                /*
                 * Area II-VIII.
                 */
                'areas' =>
                    $areas,

                /*
                 * Readiness.
                 */
                'readiness_status' =>
                    $result->readiness_status
                    ?? null,

                'readiness_description' =>
                    $result->readiness_description
                    ?? null,

                /*
                 * Timestamp.
                 */
                'created_at' =>
                    $result->created_at,

                'updated_at' =>
                    $result->updated_at,
            ],
        ]);
    }
}