<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScoringTest extends TestCase
{
    use RefreshDatabase;

    public function test_level_three_score_is_not_blocked_by_level_one_answers(): void
    {
        $user = User::factory()->create();
        $assessment = Assessment::create([
            'user_id' => $user->id,
            'school_name' => 'Sekolah Tes',
            'respondent_name' => 'Responden Tes',
            'status' => 'draft',
        ]);

        $levelOneQuestion = Question::create([
            'category' => 'V',
            'question_number' => '5.1',
            'kami_level' => 1,
            'question' => 'Pertanyaan level satu',
            'answer_type' => 'implementation',
        ]);
        $levelThreeQuestion = Question::create([
            'category' => 'V',
            'question_number' => '5.27',
            'kami_level' => 3,
            'question' => 'Pertanyaan level tiga',
            'answer_type' => 'implementation',
        ]);

        AssessmentAnswer::create([
            'assessment_id' => $assessment->id,
            'question_id' => $levelOneQuestion->id,
            'answer' => 'Tidak Dilakukan',
        ]);
        AssessmentAnswer::create([
            'assessment_id' => $assessment->id,
            'question_id' => $levelThreeQuestion->id,
            'answer' => 'Diterapkan Secara Menyeluruh',
        ]);

        $this->actingAs($user)
            ->postJson("/api/assessments/{$assessment->id}/calculate")
            ->assertOk()
            ->assertJsonPath('data.areas.V.score', 9);
    }
}
