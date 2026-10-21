<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentResult;
use App\Models\Question;

class KamiScoringService
{
    /**
     * Mapping skor Kategori I / Sistem Elektronik.
     */
    private array $seScoreMap = [
        'A' => 5,
        'B' => 2,
        'C' => 1,
    ];

    /**
     * Service maturity.
     */
    private KamiMaturityService $maturityService;

    /**
     * Constructor.
     */
    public function __construct(
        KamiMaturityService $maturityService
    ) {
        $this->maturityService =
            $maturityService;
    }

    /**
     * ==========================================================
     * HITUNG SKOR PERTANYAAN
     * ==========================================================
     */
    public function calculateQuestionScore(
        ?string $answer,
        ?int $kamiLevel
    ): float {
        if (
            empty($answer) ||
            empty($kamiLevel)
        ) {
            return 0;
        }

        $answer =
            trim($answer);

        /*
         * Tidak Dilakukan.
         */
        if (
            $answer ===
            'Tidak Dilakukan'
        ) {
            return 0;
        }

        /*
         * Dalam Perencanaan.
         */
        if (
            $answer ===
            'Dalam Perencanaan'
        ) {
            return (float) $kamiLevel;
        }

        /*
         * Dalam Penerapan /
         * Diterapkan Sebagian /
         * Dalam Penerapan atau Diterapkan Sebagian.
         *
         * Semua menggunakan bobot:
         * Kategori Pengaman x 2.
         */
        if (
            $answer ===
                'Dalam Penerapan' ||
            $answer ===
                'Diterapkan Sebagian' ||
            $answer ===
                'Dalam Penerapan atau Diterapkan Sebagian'
        ) {
            return (float) (
                $kamiLevel * 2
            );
        }

        /*
         * Diterapkan Secara Menyeluruh.
         */
        if (
            $answer ===
            'Diterapkan Secara Menyeluruh'
        ) {
            return (float) (
                $kamiLevel * 3
            );
        }

        /*
         * Tidak Berlaku / Relevan.
         *
         * Tetap dipertahankan untuk kompatibilitas
         * dengan data lama yang mungkin sudah tersimpan.
         *
         * Opsi ini tidak perlu ditampilkan lagi
         * pada frontend.
         */
        if (
            $answer ===
                'Tidak Berlaku/Relevan' ||
            $answer ===
                'Tidak Berlaku / Relevan' ||
            $answer ===
                'Tidak Relevan'
        ) {
            if ($kamiLevel === 2) {
                return 6;
            }

            if ($kamiLevel === 3) {
                return 9;
            }

            return 0;
        }

        return 0;
    }

    /**
     * ==========================================================
     * KATEGORI I / SE
     * ==========================================================
     */
    public function calculateSeScore(
        $answers,
        int $totalQuestions
    ): array {
        $score = 0;
        $answered = 0;

        foreach ($answers as $answer) {
            $value =
                strtoupper(
                    trim(
                        $answer->answer ?? ''
                    )
                );

            if (
                !isset(
                    $this->seScoreMap[$value]
                )
            ) {
                continue;
            }

            $questionScore =
                $this->seScoreMap[$value];

            $answer->raw_score =
                $questionScore;

            $answer->weighted_score =
                $questionScore;

            $answer->save();

            $score +=
                $questionScore;

            $answered++;
        }

        /*
         * Kategori Sistem Elektronik.
         */
        if ($score >= 35) {
            $category =
                'Strategis';

        } elseif ($score >= 16) {
            $category =
                'Tinggi';

        } elseif ($score >= 10) {
            $category =
                'Rendah';

        } else {
            $category =
                'Belum Ditentukan';
        }

        return [
            'score' =>
                $score,

            'category' =>
                $category,

            'total_questions' =>
                $totalQuestions,

            'answered_questions' =>
                $answered,
        ];
    }

    /**
     * ==========================================================
     * HITUNG AREA II - VIII
     * ==========================================================
     */
    private function calculateAreaScore(
        $answers,
        string $category,
        int $totalQuestions
    ): array {
        $score = 0;
        $answered = 0;

        /*
         * Hitung jawaban.
         */
        foreach ($answers as $answer) {
            if (
                !$answer->question ||
                empty($answer->answer)
            ) {
                continue;
            }

            $question =
                $answer->question;

            $questionScore =
                $this->calculateQuestionScore(
                    $answer->answer,
                    $question->kami_level
                );

            /*
             * Simpan skor.
             */
            $answer->raw_score =
                $questionScore;

            $answer->weighted_score =
                $questionScore;

            $answer->save();

            $score +=
                $questionScore;

            $answered++;
        }

        return [
            'category' =>
                $category,

            'score' =>
                $score,

            'total_questions' =>
                $totalQuestions,

            'answered_questions' =>
                $answered,

            'level_3_allowed' =>
                true,
        ];
    }

    /**
     * ==========================================================
     * PERHITUNGAN UTAMA
     * ==========================================================
     */
    public function calculate(
        Assessment $assessment
    ): array {
        /*
         * Load assessment dan seluruh pertanyaannya.
         */
        $assessment->load([
            'answers.question',
        ]);

        $answers =
            $assessment->answers;

        /*
         * ======================================================
         * KATEGORI I
         * ======================================================
         */
        $seAnswers =
            $answers->filter(
                fn ($answer) =>
                    $answer->question &&
                    $answer->question
                        ->category === 'I'
            );

        $seTotalQuestions =
            Question::where(
                'category',
                'I'
            )->count();

        $seResult =
            $this->calculateSeScore(
                $seAnswers,
                $seTotalQuestions
            );

        /*
         * ======================================================
         * AREA II - VIII
         * ======================================================
         */
        $areaScores = [];

        $categories = [
            'II',
            'III',
            'IV',
            'V',
            'VI',
            'VII',
            'VIII',
        ];

        foreach (
            $categories as $category
        ) {
            $totalQuestions =
                Question::where(
                    'category',
                    $category
                )->count();

            $areaAnswers =
                $answers->filter(
                    fn ($answer) =>
                        $answer->question &&
                        $answer->question
                            ->category ===
                            $category
                );

            $areaScores[$category] =
                $this->calculateAreaScore(
                    $areaAnswers,
                    $category,
                    $totalQuestions
                );
        }

        /*
         * ======================================================
         * TOTAL INDEKS KAMI
         * ======================================================
         *
         * Total Indeks KAMI hanya terdiri dari:
         *
         * II  = Tata Kelola
         * III = Pengelolaan Risiko
         * IV  = Kerangka Kerja Keamanan Informasi
         * V   = Pengelolaan Aset
         * VI  = Teknologi
         * VII = Perlindungan Data Pribadi
         *
         * Kategori I:
         *   Tidak masuk Total Indeks KAMI.
         *
         * Kategori VIII:
         *   Suplemen, tidak masuk Total Indeks KAMI.
         *
         * Additional Assessment:
         *   Tidak diproses oleh service ini.
         */
        $kamiCategories = [
            'II',
            'III',
            'IV',
            'V',
            'VI',
            'VII',
        ];

        $totalScore = 0;

        foreach (
            $kamiCategories as $category
        ) {
            $totalScore +=
                (float) (
                    $areaScores[$category]['score']
                    ?? 0
                );
        }

        /*
         * ======================================================
         * MATURITY
         * ======================================================
         *
         * Kategori I tidak digunakan.
         */
        $securityAnswers =
            $answers->filter(
                fn ($answer) =>
                    $answer->question &&
                    $answer->question
                        ->category !== 'I'
            );

        $maturityResult =
            $this->maturityService->calculate(
                $areaScores,
                $securityAnswers
            );

        /*
         * ======================================================
         * TOTAL QUESTIONS
         * ======================================================
         */
        $totalQuestions =
            Question::count();

        /*
         * ======================================================
         * TOTAL ANSWERED
         * ======================================================
         *
         * Hanya menghitung pertanyaan KAMI.
         *
         * Additional Assessment tidak termasuk
         * karena berada pada tabel terpisah.
         */
        $totalAnswered =
            $answers
                ->filter(
                    fn ($answer) =>
                        !empty(
                            $answer->answer
                        )
                )
                ->count();

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

        $isComplete =
            $totalAnswered >=
            $totalQuestions;

        /*
         * ======================================================
         * STATUS ASSESSMENT
         * ======================================================
         *
         * Status disimpan sebagai completed apabila
         * seluruh pertanyaan KAMI sudah terisi.
         * Jika belum lengkap, status tetap draft.
         *
         * Dashboard tetap dapat membuka assessment
         * yang sudah completed.
         */
        $assessment->status =
            $isComplete
                ? 'completed'
                : 'draft';

        $assessment->save();

        /*
         * ======================================================
         * MATURITY OVERALL
         * ======================================================
         */
        $maturityMinimum =
            $maturityResult[
                'overall'
            ][
                'minimum'
            ] ?? 'I';

        $maturityMaximum =
            $maturityResult[
                'overall'
            ][
                'maximum'
            ] ?? 'I';

        $maturityLevel =
            $maturityMinimum .
            ' s/d ' .
            $maturityMaximum;

        /*
         * ======================================================
         * AREA DETAILS
         * ======================================================
         */
        $areaDetails = [];

        foreach (
            $areaScores as $category => $area
        ) {
            $areaDetails[
                $category
            ] =
                $area;
        }

        /*
         * Tambahkan hasil maturity.
         */
        $areaDetails[
            'maturity'
        ] =
            $maturityResult;

        /*
         * ======================================================
         * SIMPAN RESULT
         * ======================================================
         */
        $result =
            AssessmentResult::updateOrCreate(
                [
                    'assessment_id' =>
                        $assessment->id,
                ],
                [
                    'se_score' =>
                        $seResult[
                            'score'
                        ],

                    'se_category' =>
                        $seResult[
                            'category'
                        ],

                    'total_score' =>
                        $totalScore,

                    'maturity_level' =>
                        $maturityLevel,

                    'maturity_description' =>
                        $this->buildMaturityDescription(
                            $maturityMinimum,
                            $maturityMaximum
                        ),

                    'total_questions' =>
                        $totalQuestions,

                    'total_answered' =>
                        $totalAnswered,

                    'completion_percentage' =>
                        $completionPercentage,

                    'score_ii' =>
                        $areaScores[
                            'II'
                        ]['score'],

                    'score_iii' =>
                        $areaScores[
                            'III'
                        ]['score'],

                    'score_iv' =>
                        $areaScores[
                            'IV'
                        ]['score'],

                    'score_v' =>
                        $areaScores[
                            'V'
                        ]['score'],

                    'score_vi' =>
                        $areaScores[
                            'VI'
                        ]['score'],

                    'score_vii' =>
                        $areaScores[
                            'VII'
                        ]['score'],

                    /*
                     * VIII tetap disimpan sebagai
                     * data suplemen.
                     *
                     * Tetapi TIDAK masuk total_score.
                     */
                    'score_viii' =>
                        $areaScores[
                            'VIII'
                        ]['score'],

                    'area_details' =>
                        $areaDetails,
                ]
            );

        /*
         * ======================================================
         * RESPONSE
         * ======================================================
         */
        return [
            'assessment_id' =>
                $assessment->id,

            'result_id' =>
                $result->id,

            'se' =>
                $seResult,

            'total_score' =>
                $totalScore,

            'total_questions' =>
                $totalQuestions,

            'total_answered' =>
                $totalAnswered,

            'completion_percentage' =>
                $completionPercentage,

            'is_complete' =>
                $isComplete,

            'maturity' =>
                $maturityResult,

            'areas' =>
                $areaScores,
        ];
    }

    /**
     * ==========================================================
     * DESKRIPSI MATURITY
     * ==========================================================
     */
    private function buildMaturityDescription(
        string $minimum,
        string $maximum
    ): string {
        if (
            $minimum ===
            $maximum
        ) {
            return
                $this->maturityService
                    ->getDescription(
                        $minimum
                    )
                ??
                'Tingkat kematangan belum ditentukan.';
        }

        $minimumDescription =
            $this->maturityService
                ->getDescription(
                    $minimum
                );

        $maximumDescription =
            $this->maturityService
                ->getDescription(
                    $maximum
                );

        return
            'Rentang tingkat kematangan ' .
            $minimum .
            ' s/d ' .
            $maximum .
            '. ' .
            (
                $minimumDescription
                ?? ''
            ) .
            ' hingga ' .
            (
                $maximumDescription
                ?? ''
            ) .
            '.';
    }
}