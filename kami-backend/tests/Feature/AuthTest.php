<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_is_logged_in(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.email', 'test@example.com');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_user_can_login_and_logout(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        $this->postJson('/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);

        $this->assertAuthenticatedAs($user);

        $this->postJson('/auth/logout')
            ->assertOk();

        $this->assertGuest();
    }

    public function test_vercel_frontend_session_authenticates_api_requests(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
        ]);

        config([
            'sanctum.stateful' => ['website-assesment.vercel.app'],
        ]);

        $this->postJson('/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertOk();

        $this->withHeader('Origin', 'https://website-assesment.vercel.app')
            ->getJson('/api/assessments')
            ->assertOk()
            ->assertJsonPath('total', 0);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $this->postJson('/auth/login', [
            'email' => 'missing@example.com',
            'password' => 'incorrect-password',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Email atau password tidak sesuai.');

        $this->assertGuest();
    }

    public function test_assessment_api_requires_login(): void
    {
        $this->getJson('/api/assessments')
            ->assertUnauthorized();
    }

    public function test_users_only_see_their_own_assessments(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $this->actingAs($owner)
            ->postJson('/api/assessments', [
                'school_name' => 'Sekolah A',
                'respondent_name' => 'Responden A',
            ])
            ->assertCreated();

        $this->actingAs($otherUser)
            ->getJson('/api/assessments')
            ->assertOk()
            ->assertJsonPath('total', 0);

        $this->actingAs($owner)
            ->getJson('/api/assessments')
            ->assertOk()
            ->assertJsonPath('total', 1);
    }

    public function test_user_cannot_access_another_users_assessment(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $assessmentId = $this->actingAs($owner)
            ->postJson('/api/assessments', [
                'school_name' => 'Sekolah A',
                'respondent_name' => 'Responden A',
            ])
            ->assertCreated()
            ->json('data.id');

        $this->actingAs($otherUser)
            ->getJson("/api/assessments/{$assessmentId}")
            ->assertNotFound();
    }
}