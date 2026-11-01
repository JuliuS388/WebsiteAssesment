<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AssessmentAnswerFileTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploaded_evidence_is_returned_when_assessment_is_reopened_and_can_be_opened(): void
    {
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

        $fileContents = "%PDF-1.4\nEvidence\0contents\xFF\xFE";

        $uploadResponse = $this->actingAs($user)
            ->post(
                "/api/assessments/{$assessment->id}/answers/{$answer->id}/files",
                [
                    'file' => UploadedFile::fake()->createWithContent(
                        'evidence.pdf',
                        $fileContents
                    ),
                ]
            )
            ->assertCreated();

        $fileUrl = $uploadResponse->json('data.url');
        $fileId = $uploadResponse->json('data.id');

        $this->assertDatabaseHas('assessment_answer_files', [
            'id' => $fileId,
            'file_contents' => $fileContents,
        ]);

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

        $this->assertArrayNotHasKey(
            'file_contents',
            $this->getJson("/api/assessments/{$assessment->id}")
                ->json('data.answers.0.files.0')
        );

        $this->get($fileUrl)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertHeader('content-disposition', 'inline; filename=evidence.pdf')
            ->assertContent($fileContents);

        $this->get($fileUrl.'?download=1')
            ->assertOk()
            ->assertHeader('content-disposition', 'attachment; filename=evidence.pdf')
            ->assertContent($fileContents);
    }

    public function test_evidence_upload_does_not_require_object_storage_credentials(): void
    {
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
            ->assertCreated();
    }
}
