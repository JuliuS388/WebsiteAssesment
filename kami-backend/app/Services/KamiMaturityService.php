<?php

namespace App\Services;

use Illuminate\Support\Collection;

class KamiMaturityService
{
    /**
     * ==========================================================
     * MATRIX TINGKAT KEMATANGAN KAMI 5.0
     * ==========================================================
     *
     * Nilai:
     *
     * min = nilai minimum
     * achievement = nilai pencapaian
     *
     * Jika skor maturity:
     *
     * < min
     *   -> belum mencapai tingkat tersebut
     *
     * >= min dan < achievement
     *   -> masuk tingkat "+" sebelumnya
     *
     * >= achievement
     *   -> mencapai tingkat tersebut
     *
     * Sumber matriks:
     * Indeks KAMI 5.0.
     *
     * Area:
     * II = Tata Kelola
     * III = Pengelolaan Risiko
     * IV = Kerangka Kerja
     * V = Pengelolaan Aset
     * VI = Teknologi
     */
    private array $matrix = [

        /*
         * ======================================================
         * TINGKAT II
         * ======================================================
         */
        'II' => [

            'II' => [
                'min' => 12,
                'achievement' => 36,
            ],

            'III' => [
                'min' => 14,
                'achievement' => 20,
            ],

            'IV' => [
                'min' => 15,
                'achievement' => 24,
            ],

            'V' => [
                'min' => 25,
                'achievement' => 62,
            ],

            'VI' => [
                'min' => 18,
                'achievement' => 28,
            ],
        ],

        /*
         * ======================================================
         * TINGKAT III
         * ======================================================
         */
        'III' => [

            'II' => [
                'min' => 8,
                'achievement' => 14,
            ],

            'III' => [
                'min' => 4,
                'achievement' => 8,
            ],

            'IV' => [
                'min' => 45,
                'achievement' => 62,
            ],

            'V' => [
                'min' => 35,
                'achievement' => 50,
            ],

            'VI' => [
                'min' => 40,
                'achievement' => 62,
            ],
        ],

        /*
         * ======================================================
         * TINGKAT IV
         * ======================================================
         */
        'IV' => [

            'II' => [
                'min' => 24,
                'achievement' => 54,
            ],

            'III' => [
                'min' => 8,
                'achievement' => 12,
            ],

            'IV' => [
                'min' => 15,
                'achievement' => 27,
            ],

            'V' => null,

            'VI' => [
                'min' => 6,
                'achievement' => 9,
            ],
        ],

        /*
         * ======================================================
         * TINGKAT V
         * ======================================================
         */
        'V' => [

            'II' => null,

            'III' => [
                'min' => 12,
                'achievement' => 18,
            ],

            'IV' => [
                'min' => 12,
                'achievement' => 18,
            ],

            'V' => null,

            'VI' => null,
        ],
    ];

    /**
     * ==========================================================
     * DESKRIPSI TINGKAT KEMATANGAN
     * ==========================================================
     */
    private array $descriptions = [

        'I' =>
            'Kondisi Awal',

        'I+' =>
            'Kondisi Awal dengan peningkatan',

        'II' =>
            'Penerapan Kerangka Kerja Dasar',

        'II+' =>
            'Penerapan Kerangka Kerja Dasar dengan peningkatan',

        'III' =>
            'Terdefinisi dan Konsisten',

        'III+' =>
            'Terdefinisi dan Konsisten dengan peningkatan',

        'IV' =>
            'Terkelola dan Terukur',

        'IV+' =>
            'Terkelola dan Terukur dengan peningkatan',

        'V' =>
            'Optimal',
    ];

    /**
     * Urutan tingkat kematangan.
     */
    private array $maturityOrder = [
        'I',
        'I+',
        'II',
        'II+',
        'III',
        'III+',
        'IV',
        'IV+',
        'V',
    ];

    /**
     * ==========================================================
     * NORMALISASI SECURITY CATEGORY
     * ==========================================================
     *
     * security_category pada database kita berarti:
     *
     * I
     * II
     * III
     * IV
     * V
     */
    private function normalizeMaturityLevel(
        ?string $level
    ): ?string {

        if (!$level) {
            return null;
        }

        $level =
            strtoupper(
                trim($level)
            );

        /*
         * Bersihkan format seperti:
         *
         * "Level II"
         * "Tingkat II"
         */
        $level =
            str_replace(
                [
                    'LEVEL ',
                    'TINGKAT ',
                    ' ',
                ],
                '',
                $level
            );

        /*
         * Hanya I - V yang merupakan
         * tingkat kematangan dasar.
         */
        if (
            in_array(
                $level,
                [
                    'I',
                    'II',
                    'III',
                    'IV',
                    'V',
                ],
                true
            )
        ) {
            return $level;
        }

        return null;
    }

    /**
     * ==========================================================
     * HITUNG SKOR MATURITY PER TINGKAT
     * ==========================================================
     *
     * Contoh:
     *
     * Area II / Tata Kelola
     *
     * Pertanyaan:
     *
     * security_category = II
     * weighted_score = 3
     *
     * maka:
     *
     * scores['II'] += 3
     */
    public function calculateMaturityScores(
        Collection $answers
    ): array {

        $scores = [
            'I' => 0,
            'II' => 0,
            'III' => 0,
            'IV' => 0,
            'V' => 0,
        ];

        $questionCounts = [
            'I' => 0,
            'II' => 0,
            'III' => 0,
            'IV' => 0,
            'V' => 0,
        ];

        $answeredCounts = [
            'I' => 0,
            'II' => 0,
            'III' => 0,
            'IV' => 0,
            'V' => 0,
        ];

        foreach ($answers as $answer) {

            if (!$answer->question) {
                continue;
            }

            /*
             * security_category =
             * Tingkat Kematangan.
             */
            $maturityLevel =
                $this->normalizeMaturityLevel(
                    $answer->question
                        ->security_category
                );

            if (
                !$maturityLevel ||
                !isset(
                    $scores[$maturityLevel]
                )
            ) {
                continue;
            }

            /*
             * Jumlah pertanyaan pada maturity tersebut.
             */
            $questionCounts[
                $maturityLevel
            ]++;

            /*
             * Jumlah pertanyaan yang sudah dijawab.
             */
            if (
                !empty($answer->answer)
            ) {
                $answeredCounts[
                    $maturityLevel
                ]++;
            }

            /*
             * Gunakan weighted_score yang sudah
             * dihitung KamiScoringService.
             */
            $scores[
                $maturityLevel
            ] += (float) (
                $answer->weighted_score ?? 0
            );
        }

        return [
            'scores' =>
                $scores,

            'question_counts' =>
                $questionCounts,

            'answered_counts' =>
                $answeredCounts,
        ];
    }

    /**
     * ==========================================================
     * TENTUKAN MATURITY SATU AREA
     * ==========================================================
     */
    public function determineAreaMaturity(
        string $category,
        array $scores
    ): array {

        /*
         * Mulai dari tingkat I.
         */
        $result = 'I';

        /*
         * Tingkat kematangan yang akan diperiksa
         * secara berurutan.
         */
        $levels = [
            'II',
            'III',
            'IV',
            'V',
        ];

        foreach ($levels as $level) {

            /*
             * Jika area tidak mempunyai
             * aturan maturity pada level tersebut,
             * hentikan pemeriksaan.
             */
            if (
                !array_key_exists(
                    $category,
                    $this->matrix[$level]
                )
            ) {
                break;
            }

            $rule =
                $this->matrix[$level][$category];

            /*
             * Tanda "-" pada matriks.
             */
            if ($rule === null) {
                break;
            }

            /*
             * Ambil skor maturity level tersebut.
             */
            $score =
                (float) (
                    $scores[$level] ?? 0
                );

            /*
             * Belum memenuhi minimum.
             */
            if (
                $score < $rule['min']
            ) {
                break;
            }

            /*
             * Sudah memenuhi minimum tetapi
             * belum mencapai pencapaian penuh.
             */
            if (
                $score <
                $rule['achievement']
            ) {

                $previousLevel =
                    $this->getPreviousBaseLevel(
                        $level
                    );

                $result =
                    $previousLevel . '+';

                break;
            }

            /*
             * Sudah mencapai nilai pencapaian.
             *
             * Naik ke level tersebut.
             */
            $result = $level;
        }

        return [
            'level' =>
                $result,

            'description' =>
                $this->getDescription(
                    $result
                ),

            'score' =>
                array_sum($scores),

            'scores_by_maturity' =>
                $scores,
        ];
    }

    /**
     * ==========================================================
     * LEVEL SEBELUMNYA
     * ==========================================================
     */
    private function getPreviousBaseLevel(
        string $level
    ): string {

        $previous = [
            'II' => 'I',
            'III' => 'II',
            'IV' => 'III',
            'V' => 'IV',
        ];

        return
            $previous[$level]
            ?? 'I';
    }

    /**
     * ==========================================================
     * HITUNG MATURITY SEMUA AREA
     * ==========================================================
     */
    public function calculate(
        array $areaScores,
        Collection $answers
    ): array {

        /*
         * Hitung skor berdasarkan
         * security_category.
         */
        $maturityScores =
            $this->calculateMaturityScores(
                $answers
            );

        $allScores =
            $maturityScores['scores'];

        /*
         * Hasil maturity masing-masing area.
         */
        $areaResults = [];

        /*
         * Lima area inti.
         */
        $coreCategories = [
            'II',
            'III',
            'IV',
            'V',
            'VI',
        ];

        foreach (
            $coreCategories as $category
        ) {

            /*
             * Ambil jawaban area tersebut.
             */
            $categoryAnswers =
                $answers->filter(
                    fn ($answer) =>
                        $answer->question &&
                        $answer->question
                            ->category ===
                        $category
                );

            /*
             * Hitung skor maturity per
             * tingkat untuk area tersebut.
             */
            $categoryMaturity =
                $this->calculateMaturityScores(
                    $categoryAnswers
                );

            /*
             * Tentukan maturity area.
             */
            $areaResults[$category] =
                $this->determineAreaMaturity(
                    $category,
                    $categoryMaturity['scores']
                );

            /*
             * Tambahkan informasi tambahan.
             */
            $areaResults[$category][
                'question_counts'
            ] =
                $categoryMaturity[
                    'question_counts'
                ];

            $areaResults[$category][
                'answered_counts'
            ] =
                $categoryMaturity[
                    'answered_counts'
                ];

            /*
             * Skor total area.
             */
            $areaResults[$category][
                'area_score'
            ] =
                (float) (
                    $areaScores[$category]['score']
                    ?? 0
                );
        }

        /*
         * ======================================================
         * PDP / CATEGORY VII
         * ======================================================
         *
         * PDP tetap disajikan sebagai area tersendiri.
         */
        if (
            isset($areaScores['VII'])
        ) {

            $pdpAnswers =
                $answers->filter(
                    fn ($answer) =>
                        $answer->question &&
                        $answer->question
                            ->category === 'VII'
                );

            $pdpMaturity =
                $this->calculateMaturityScores(
                    $pdpAnswers
                );

            /*
             * Untuk PDP, data maturity berdasarkan
             * security_category tetap dikembalikan.
             *
             * Karena matriks lima area inti tidak
             * mencakup VII, kita tidak memaksakan
             * matriks II-V di sini.
             */
            $pdpLevel =
                $this->determinePdpMaturity(
                    $pdpMaturity['scores']
                );

            $areaResults['VII'] = [
                'level' =>
                    $pdpLevel,

                'description' =>
                    $this->getDescription(
                        $pdpLevel
                    ),

                'score' =>
                    array_sum(
                        $pdpMaturity['scores']
                    ),

                'scores_by_maturity' =>
                    $pdpMaturity['scores'],

                'question_counts' =>
                    $pdpMaturity[
                        'question_counts'
                    ],

                'answered_counts' =>
                    $pdpMaturity[
                        'answered_counts'
                    ],

                'area_score' =>
                    (float) (
                        $areaScores['VII']['score']
                        ?? 0
                    ),
            ];
        }

        /*
         * ======================================================
         * SUPLEMEN / CATEGORY VIII
         * ======================================================
         *
         * Suplemen tidak diberikan maturity I-V.
         * Yang disimpan adalah persentase penerapan.
         */
        $supplementResult = null;

        if (
            isset($areaScores['VIII'])
        ) {

            $supplementAnswers =
                $answers->filter(
                    fn ($answer) =>
                        $answer->question &&
                        $answer->question
                            ->category === 'VIII'
                );

            /*
             * Jumlah pertanyaan VIII harus berdasarkan
             * seluruh pertanyaan VIII, bukan hanya
             * pertanyaan yang sudah dijawab.
             *
             * Dengan demikian:
             * 27 pertanyaan -> maksimum 81.
             */
            $supplementTotalQuestions =
                (int) (
                    $areaScores['VIII']['total_questions']
                    ?? 27
                );

            $supplementResult =
                $this->calculateSupplement(
                    $supplementAnswers,
                    $supplementTotalQuestions
                );
        }

        /*
         * ======================================================
         * MATURITY KESELURUHAN
         * ======================================================
         *
         * Hanya lima area inti yang menentukan
         * rentang maturity keseluruhan:
         *
         * II - VI
         */
        $overall =
            $this->calculateOverallMaturity(
                $areaResults
            );

        return [
            'overall' =>
                $overall,

            'areas' =>
                $areaResults,

            'maturity_scores' =>
                $allScores,

            'supplement' =>
                $supplementResult,
        ];
    }

    /**
     * ==========================================================
     * PDP MATURITY
     * ==========================================================
     *
     * Untuk sementara PDP ditentukan dari
     * tingkat maturity tertinggi yang benar-benar
     * mempunyai skor.
     *
     * Ini dipisahkan dari matriks lima area inti.
     */
    private function determinePdpMaturity(
        array $scores
    ): string {

        /*
         * Jika belum ada skor sama sekali.
         */
        if (
            array_sum($scores) <= 0
        ) {
            return 'I';
        }

        /*
         * Tentukan maturity berdasarkan
         * tingkat pertanyaan tertinggi yang
         * mempunyai skor.
         *
         * Catatan:
         * Nilai ini nantinya dapat kita validasi
         * lagi terhadap formula resmi PDP KAMI 5.0.
         */
        if (
            ($scores['V'] ?? 0) > 0
        ) {
            return 'V';
        }

        if (
            ($scores['IV'] ?? 0) > 0
        ) {
            return 'IV';
        }

        if (
            ($scores['III'] ?? 0) > 0
        ) {
            return 'III';
        }

        if (
            ($scores['II'] ?? 0) > 0
        ) {
            return 'II';
        }

        return 'I';
    }

    /**
     * ==========================================================
     * SUPLEMEN
     * ==========================================================
     *
     * Category VIII memiliki 27 pertanyaan.
     *
     * Berbeda dengan perhitungan sebelumnya,
     * denominator tidak lagi menggunakan jumlah
     * jawaban yang sudah masuk.
     */
    private function calculateSupplement(
        Collection $answers,
        int $totalQuestions
    ): array {

        /*
         * Pastikan jumlah pertanyaan tidak negatif.
         */
        $totalQuestions =
            max(
                0,
                $totalQuestions
            );

        /*
         * Maksimum skor:
         *
         * 27 pertanyaan x 3 = 81.
         */
        $maxScore =
            $totalQuestions * 3;

        $score = 0;

        foreach ($answers as $answer) {

            if (
                !$answer->question ||
                empty($answer->answer)
            ) {
                continue;
            }

            /*
             * Suplemen menggunakan skor:
             *
             * Tidak Dilakukan = 0
             * Dalam Perencanaan = 1
             * Dalam Penerapan = 2
             * Diterapkan Secara Menyeluruh = 3
             */
            $score +=
                $this->calculateSupplementScore(
                    $answer
                );
        }

        /*
         * Persentase berdasarkan seluruh
         * pertanyaan Category VIII.
         */
        $percentage =
            $maxScore > 0
                ? round(
                    (
                        $score /
                        $maxScore
                    ) * 100,
                    2
                )
                : 0;

        return [
            'score' =>
                $score,

            'max_score' =>
                $maxScore,

            'percentage' =>
                $percentage,

            'total_questions' =>
                $totalQuestions,

            'answered_questions' =>
                $answers->filter(
                    fn ($answer) =>
                        !empty($answer->answer)
                )->count(),
        ];
    }

    /**
     * ==========================================================
     * HITUNG SKOR SATU PERTANYAAN SUPLEMEN
     * ==========================================================
     */
    private function calculateSupplementScore(
        $answer
    ): float {

        $status =
            trim(
                $answer->answer ?? ''
            );

        /*
         * Tidak Dilakukan.
         */
        if (
            $status ===
            'Tidak Dilakukan'
        ) {
            return 0;
        }

        /*
         * Dalam Perencanaan.
         */
        if (
            $status ===
            'Dalam Perencanaan'
        ) {
            return 1;
        }

        /*
         * Dalam Penerapan.
         */
        if (
            $status ===
                'Dalam Penerapan' ||
            $status ===
                'Diterapkan Sebagian'
        ) {
            return 2;
        }

        /*
         * Menyeluruh.
         */
        if (
            $status ===
            'Diterapkan Secara Menyeluruh'
        ) {
            return 3;
        }

        return 0;
    }

    /**
     * ==========================================================
     * MATURITY KESELURUHAN
     * ==========================================================
     */
    private function calculateOverallMaturity(
        array $areaResults
    ): array {

        $levels = [];

        foreach (
            [
                'II',
                'III',
                'IV',
                'V',
                'VI',
            ] as $category
        ) {

            if (
                !isset(
                    $areaResults[$category]['level']
                )
            ) {
                continue;
            }

            $levels[] =
                $areaResults[$category]['level'];
        }

        /*
         * Jika belum ada area yang memiliki
         * hasil maturity.
         */
        if (empty($levels)) {
            return [
                'minimum' => 'I',
                'maximum' => 'I',
            ];
        }

        /*
         * Buat mapping level -> posisi.
         *
         * Posisi array dimulai dari 0:
         *
         * I    = 0
         * I+   = 1
         * II   = 2
         * II+  = 3
         * III  = 4
         * III+ = 5
         * IV   = 6
         * IV+  = 7
         * V    = 8
         */
        $levelPosition = [];

        foreach (
            $this->maturityOrder as $index => $level
        ) {
            $levelPosition[$level] = $index;
        }

        $numeric = [];

        foreach ($levels as $level) {

            if (
                array_key_exists(
                    $level,
                    $levelPosition
                )
            ) {
                $numeric[] =
                    $levelPosition[$level];
            }
        }

        /*
         * Jika tidak ada level yang valid,
         * gunakan kondisi awal.
         */
        if (empty($numeric)) {
            return [
                'minimum' => 'I',
                'maximum' => 'I',
            ];
        }

        /*
         * Ambil posisi maturity terendah
         * dan tertinggi.
         */
        $minimumPosition =
            min($numeric);

        $maximumPosition =
            max($numeric);

        return [
            'minimum' =>
                $this->maturityOrder[
                    $minimumPosition
                ],

            'maximum' =>
                $this->maturityOrder[
                    $maximumPosition
                ],
        ];
    }

    /**
     * ==========================================================
     * DESKRIPSI MATURITY
     * ==========================================================
     */
    public function getDescription(
        ?string $level
    ): ?string {

        if (!$level) {
            return null;
        }

        return
            $this->descriptions[$level]
            ?? null;
    }
}