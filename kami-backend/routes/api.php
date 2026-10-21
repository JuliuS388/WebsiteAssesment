<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AdditionalQuestionController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AssessmentAnswerController;
use App\Http\Controllers\AdditionalAssessmentAnswerController;
use App\Http\Controllers\ScoringController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\AssessmentAnswerFileController;
use App\Http\Middleware\EnsureAssessmentOwner;

/*
|--------------------------------------------------------------------------
| KAMI Questions
|--------------------------------------------------------------------------
*/

Route::get(
    '/questions',
    [QuestionController::class, 'index']
);

Route::get(
    '/additional-questions',
    [AdditionalQuestionController::class, 'index']
);


/*
|--------------------------------------------------------------------------
| Assessments
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', EnsureAssessmentOwner::class])->group(function () {
    Route::get(
        '/assessments',
        [AssessmentController::class, 'index']
    );

    Route::post(
        '/assessments',
        [AssessmentController::class, 'store']
    );

    Route::get(
        '/assessments/{assessment}',
        [AssessmentController::class, 'show']
    );

    Route::delete(
        '/assessments/{assessment}',
        [AssessmentController::class, 'destroy']
    );


/*
|--------------------------------------------------------------------------
| KAMI Answers
|--------------------------------------------------------------------------
*/

    Route::post(
        '/assessments/{assessment}/answers',
        [AssessmentAnswerController::class, 'store']
    );


/*
|--------------------------------------------------------------------------
| Evidence Files
|--------------------------------------------------------------------------
*/

    Route::get(
        '/assessments/{assessment}/answers/{answer}/files',
        [AssessmentAnswerFileController::class, 'index']
    );

    Route::post(
        '/assessments/{assessment}/answers/{answer}/files',
        [AssessmentAnswerFileController::class, 'store']
    );

    Route::delete(
        '/assessments/{assessment}/answers/{answer}/files/{file}',
        [AssessmentAnswerFileController::class, 'destroy']
    );


/*
|--------------------------------------------------------------------------
| Additional Questions
|--------------------------------------------------------------------------
*/

    Route::get(
        '/assessments/{assessment}/additional-answers',
        [AdditionalAssessmentAnswerController::class, 'index']
    );

    Route::post(
        '/assessments/{assessment}/additional-answers',
        [AdditionalAssessmentAnswerController::class, 'store']
    );


/*
|--------------------------------------------------------------------------
| Scoring
|--------------------------------------------------------------------------
*/

    Route::post(
        '/assessments/{assessment}/calculate',
        [ScoringController::class, 'calculate']
    );


/*
|--------------------------------------------------------------------------
| Result
|--------------------------------------------------------------------------
*/

    Route::get(
        '/assessments/{assessment}/result',
        [ResultController::class, 'show']
    );
});