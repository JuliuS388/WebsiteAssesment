<?php

namespace App\Http\Middleware;

use App\Models\Assessment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAssessmentOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $assessmentParameter = $request->route('assessment');

        if ($assessmentParameter !== null) {
            $assessment = $assessmentParameter instanceof Assessment
                ? $assessmentParameter
                : Assessment::find($assessmentParameter);

            if (! $assessment || $assessment->user_id !== $request->user()->id) {
                abort(404);
            }
        }

        return $next($request);
    }
}