<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AssessmentAnswerFileTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploaded_evidence_is_returned_when_assessment_is_reopened_and_can_be_opened(): void
    {
        Storage::fake('evidence');

        $user = User::factory()->create();
        $assessment = Assessment::create([
            'user_id' => $user->id,
            'school_name' => 'Sekolah Tes',
            'respondent_name' => 'Responden Tes',
            'status' => 'draft',
        ]);
        $question = Question::create([
            'category' => 'I',
            'question_number' => '1.1',
            'kami_level' => 1,
            'question' => 'Pertanyaan tes',
            'answer_type' => 'implementation',
        ]);
        $answer = AssessmentAnswer::create([
            'assessment_id' => $assessment->id,
            'question_id' => $question->id,
            'answer' => 'Diterapkan',
        ]);

        $uploadResponse = $this->actingAs($user)
            ->post(
                "/api/assessments/{$assessment->id}/answers/{$answer->id}/files",
                [
                    'file' => UploadedFile::fake()
                        ->create('evidence.pdf', 10, 'application/pdf'),
                ]
            )
            ->assertCreated();

        $fileUrl = $uploadResponse->json('data.url');

        $this->getJson("/api/assessments/{$assessment->id}")
            ->assertOk()
            ->assertJsonPath(
                'data.answers.0.files.0.url',
                $fileUrl
            )
            ->assertJsonPath(
                'data.answers.0.files.0.original_name',
                'evidence.pdf'
            );

        $this->get($fileUrl)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', 'inline; filename=evidence.pdf');
    }

    public function test_production_upload_requires_configured_persistent_storage(): void
    {
        config([
            'filesystems.disks.evidence.require_s3' => true,
        ]);

        $user = User::factory()->create();
        $assessment = Assessment::create([
            'user_id' => $user->id,
            'school_name' => 'Sekolah Tes',
            'respondent_name' => 'Responden Tes',
            'status' => 'draft',
        ]);
        $question = Question::create([
            'category' => 'I',
            'question_number' => '1.1',
            'kami_level' => 1,
            'question' => 'Pertanyaan tes',
            'answer_type' => 'implementation',
        ]);
        $answer = AssessmentAnswer::create([
            'assessment_id' => $assessment->id,
            'question_id' => $question->id,
            'answer' => 'Diterapkan',
        ]);

        $this->actingAs($user)
            ->postJson(
                "/api/assessments/{$assessment->id}/answers/{$answer->id}/files",
                [
                    'file' => UploadedFile::fake()
                        ->create('evidence.pdf', 10, 'application/pdf'),
                ]
            )
            ->assertServiceUnavailable()
            ->assertJsonPath('success', false)
            ->assertJsonPath(
                'message',
                'Penyimpanan evidence belum dikonfigurasi. '
                .'Atur AWS_BUCKET, AWS_DEFAULT_REGION, '
                .'AWS_ACCESS_KEY_ID, dan AWS_SECRET_ACCESS_KEY '
                .'pada environment Vercel.'
            );
    }
}
