import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api, { authApi } from '../services/api';

function Dashboard() {
    const navigate = useNavigate();

    const [assessments, setAssessments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAssessments();
        authApi.get('/auth/user')
            .then((response) => setUser(response.data.user))
            .catch(() => setUser(null));
    }, []);

    const handleLogout = async () => {
        await authApi.post('/auth/logout');
        setUser(null);
        navigate('/login', { replace: true });
    };

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await api.get('/assessments');

            if (
                !response.data ||
                !response.data.success
            ) {
                setAssessments([]);
                return;
            }

            const assessmentList =
                response.data.data || [];

            /*
             * Status Dashboard ditentukan dari
             * kelengkapan jawaban assessment.
             *
             * 211 = pertanyaan KAMI
             * 21  = pertanyaan tambahan
             *
             * Assessment dianggap Selesai apabila
             * seluruh 232 pertanyaan sudah terisi.
             */
            const assessmentsWithProgress =
                await Promise.all(
                    assessmentList.map(
                        async (assessment) => {
                            try {
                                const [
                                    assessmentResponse,
                                    additionalResponse,
                                ] = await Promise.all([
                                    api.get(
                                        `/assessments/${assessment.id}`
                                    ),
                                    api.get(
                                        `/assessments/${assessment.id}/additional-answers`
                                    ),
                                ]);

                                const assessmentDetail =
                                    assessmentResponse
                                        ?.data
                                        ?.data || {};

                                const kamiAnswers =
                                    assessmentDetail.answers || [];

                                const kamiAnswered =
                                    kamiAnswers.filter(
                                        (answer) =>
                                            answer.answer !== null &&
                                            answer.answer !== ''
                                    ).length;

                                const kamiTotal = 211;

                                const additionalData =
                                    additionalResponse
                                        ?.data
                                        ?.data || {};

                                const additionalTotal =
                                    Number(
                                        additionalData.total_questions
                                    ) || 21;

                                const additionalAnswered =
                                    Number(
                                        additionalData.answered_questions
                                    ) || 0;

                                const isComplete =
                                    kamiAnswered >= kamiTotal &&
                                    additionalAnswered >= additionalTotal;

                                return {
                                    ...assessment,
                                    status: isComplete
                                        ? 'completed'
                                        : 'draft',
                                    kamiAnswered,
                                    kamiTotal,
                                    additionalAnswered,
                                    additionalTotal,
                                };
                            } catch (progressError) {
                                console.error(
                                    `Gagal mengambil progress assessment ${assessment.id}:`,
                                    progressError
                                );

                                return {
                                    ...assessment,
                                    status:
                                        assessment.status ===
                                        'completed'
                                            ? 'completed'
                                            : 'draft',
                                };
                            }
                        }
                    )
                );

            setAssessments(
                assessmentsWithProgress
            );
        } catch (err) {
            console.error(
                'Gagal mengambil assessment:',
                err
            );

            setError(
                'Gagal mengambil data assessment dari server.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssessment = (
        assessment
    ) => {
        /*
         * Assessment yang sudah selesai tetap dapat
         * dibuka kembali untuk melihat atau mengubah
         * jawaban yang sudah tersimpan.
         */
        navigate(
            `/assessments/${assessment.id}/kami`
        );
    };

    return (
        <div className="kami-dashboard min-h-screen bg-gray-100">

            <header className="kami-topbar border-b bg-white">
                <div className="kami-topbar-inner mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">

                    <div className="kami-wordmark">
                        <span className="kami-mark" aria-hidden="true">K</span>
                        <div>
                            <h1 className="kami-dashboard-title text-2xl font-bold text-gray-900">
                                Indeks KAMI
                            </h1>

                            <p className="mt-1 text-sm text-gray-600">
                                Sistem Assessment Keamanan Siber SD Teruna Bangsa
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        {user ? (
                            <>
                                <span className="hidden text-sm text-gray-600 sm:inline">
                                    {user.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Keluar
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">

                <section className="kami-dashboard-intro">

                    <div>
                        <h2>Ruang kerja keamanan informasi</h2>
                        <p>Kelola dan pantau assessment keamanan siber sekolah dalam satu tempat.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/assessments/new')}
                        className="kami-primary-action rounded-lg px-4 py-2.5 text-sm"
                    >
                        + Assessment Baru
                    </button>

                </section>

                <section className="kami-stat-grid grid gap-6 md:grid-cols-3">

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Total Assessment
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {loading
                                ? '...'
                                : assessments.length}
                        </p>

                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Pertanyaan KAMI
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            211
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Pertanyaan resmi Indeks KAMI
                        </p>

                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Pertanyaan Tambahan
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            21
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Dasar analisis perancangan SOP
                        </p>

                    </div>

                </section>

                <section className="kami-assessment-list mt-8 rounded-xl bg-white shadow-sm">

                    <div className="border-b px-6 py-5">

                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                            <div>

                                <h3 className="text-lg font-semibold text-gray-900">
                                    Assessment
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Daftar assessment yang telah dibuat.
                                </p>

                            </div>

                            <div className="flex flex-wrap gap-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            '/history'
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Riwayat Assessment
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            '/assessments/new'
                                        )
                                    }
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    + Assessment Baru
                                </button>

                            </div>

                        </div>

                    </div>

                    {loading && (
                        <div className="px-6 py-10 text-center">

                            <p className="text-sm text-gray-500">
                                Memuat data assessment...
                            </p>

                        </div>
                    )}

                    {!loading && error && (
                        <div className="px-6 py-10 text-center">

                            <p className="text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={loadAssessments}
                                className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Coba Lagi
                            </button>

                        </div>
                    )}

                    {!loading &&
                        !error &&
                        assessments.length === 0 && (
                            <div className="px-6 py-10 text-center">

                                <p className="text-sm text-gray-500">
                                    Belum ada assessment.
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Buat assessment baru untuk
                                    memulai proses assessment.
                                </p>

                            </div>
                        )}

                    {!loading &&
                        !error &&
                        assessments.length > 0 && (
                            <div className="divide-y">

                                {assessments.map(
                                    (
                                        assessment
                                    ) => (
                                        <div
                                            key={
                                                assessment.id
                                            }
                                            className="px-6 py-5"
                                        >

                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                                <div>

                                                    <div className="flex flex-wrap items-center gap-3">

                                                        <h4 className="font-semibold text-gray-900">
                                                            {
                                                                assessment.school_name
                                                            }
                                                        </h4>

                                                        <span
                                                            className={
                                                                assessment.status ===
                                                                'completed'
                                                                    ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                                                                    : 'rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700'
                                                            }
                                                        >
                                                            {
                                                                assessment.status ===
                                                                'completed'
                                                                    ? 'Selesai'
                                                                    : 'Draft'
                                                            }
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Responden:{' '}
                                                        {
                                                            assessment.respondent_name
                                                        }
                                                    </p>

                                                    {assessment.assessment_date && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            Tanggal:{' '}
                                                            {
                                                                assessment.assessment_date
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenAssessment(
                                                            assessment
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    Buka Assessment
                                                </button>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;