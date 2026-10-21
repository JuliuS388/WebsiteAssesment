<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\AssessmentAnswerFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssessmentAnswerFileController extends Controller
{
    /**
     * Menampilkan seluruh file evidence
     * dari satu jawaban.
     */
    public function index(
        Assessment $assessment,
        AssessmentAnswer $answer
    ) {
        $this->validateAnswerOwnership(
            $assessment,
            $answer
        );

        $files = $answer->files()
            ->orderBy('id')
            ->get()
            ->map(function ($file) {
                return $this->formatFile($file);
            });

        return response()->json([
            'success' => true,
            'data' => $files,
        ]);
    }

    /**
     * Upload satu file evidence.
     *
     * File bersifat OPSIONAL.
     * Endpoint ini hanya melakukan upload
     * apabila file memang dikirim.
     */
    public function store(
        Request $request,
        Assessment $assessment,
        AssessmentAnswer $answer
    ) {
        $this->validateAnswerOwnership(
            $assessment,
            $answer
        );

        /*
        |--------------------------------------------------------------------------
        | Cek jumlah file yang sudah tersimpan
        |--------------------------------------------------------------------------
        */

        $currentFileCount = $answer
            ->files()
            ->count();

        if ($currentFileCount >= 5) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Maksimal 5 file untuk satu pertanyaan.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | File tidak wajib
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx',
            ],
        ], [
            'file.file' =>
                'File evidence tidak valid.',

            'file.max' =>
                'Ukuran file maksimal 10 MB.',

            'file.mimes' =>
                'Format file yang diperbolehkan: JPG, JPEG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX.',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Jika tidak ada file, jangan melakukan upload
        |--------------------------------------------------------------------------
        */

        if (
            !isset($validated['file']) ||
            !$validated['file']
        ) {
            return response()->json([
                'success' => true,
                'message' =>
                    'Tidak ada file evidence yang diupload.',
                'data' => null,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | File tersedia, lakukan penyimpanan
        |--------------------------------------------------------------------------
        */

        $uploadedFile = $validated['file'];

        $storedFileName =
            uniqid() .
            '_' .
            time() .
            '.' .
            $uploadedFile
                ->getClientOriginalExtension();

        $storedPath =
            $uploadedFile->storeAs(
                'evidence',
                $storedFileName,
                'public'
            );

        /*
        |--------------------------------------------------------------------------
        | Simpan informasi file ke database
        |--------------------------------------------------------------------------
        */

        $file = AssessmentAnswerFile::create([
            'assessment_answer_id' =>
                $answer->id,

            'original_name' =>
                $uploadedFile
                    ->getClientOriginalName(),

            'file_name' =>
                $storedFileName,

            'file_path' =>
                $storedPath,

            'mime_type' =>
                $uploadedFile
                    ->getMimeType(),

            'file_size' =>
                $uploadedFile
                    ->getSize(),
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'File evidence berhasil diupload.',
            'data' =>
                $this->formatFile($file),
        ], 201);
    }

    /**
     * Menghapus file evidence.
     */
    public function destroy(
        Assessment $assessment,
        AssessmentAnswer $answer,
        AssessmentAnswerFile $file
    ) {
        $this->validateAnswerOwnership(
            $assessment,
            $answer
        );

        /*
        |--------------------------------------------------------------------------
        | Pastikan file memang milik jawaban tersebut
        |--------------------------------------------------------------------------
        */

        if (
            $file->assessment_answer_id
            !== $answer->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'File tidak terkait dengan jawaban ini.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Hapus file fisik
        |--------------------------------------------------------------------------
        */

        if (
            $file->file_path &&
            Storage::disk('public')
                ->exists($file->file_path)
        ) {
            Storage::disk('public')
                ->delete(
                    $file->file_path
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Hapus record database
        |--------------------------------------------------------------------------
        */

        $file->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'File evidence berhasil dihapus.',
        ]);
    }

    /**
     * Memastikan jawaban memang berasal
     * dari assessment yang sedang dibuka.
     */
    private function validateAnswerOwnership(
        Assessment $assessment,
        AssessmentAnswer $answer
    ): void {
        if (
            $answer->assessment_id
            !== $assessment->id
        ) {
            abort(
                response()->json([
                    'success' => false,
                    'message' =>
                        'Jawaban tidak terkait dengan assessment ini.',
                ], 404)
            );
        }
    }

    /**
     * Format data file yang dikirim ke frontend.
     */
    private function formatFile(
        AssessmentAnswerFile $file
    ): array {
        return [
            'id' =>
                $file->id,

            'assessment_answer_id' =>
                $file->assessment_answer_id,

            'original_name' =>
                $file->original_name,

            'file_name' =>
                $file->file_name,

            'file_path' =>
                $file->file_path,

            'mime_type' =>
                $file->mime_type,

            'file_size' =>
                $file->file_size,

            'file_size_mb' =>
                $file->file_size
                    ? round(
                        $file->file_size
                        / 1024
                        / 1024,
                        2
                    )
                    : 0,

            'url' =>
                asset(
                    'storage/' . ltrim(
                        $file->file_path,
                        '/'
                    )
                ),

            'created_at' =>
                $file->created_at,
        ];
    }
}