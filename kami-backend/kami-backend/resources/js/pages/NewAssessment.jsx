import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';

function NewAssessment() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        school_name: 'SD Teruna Bangsa',
        respondent_name: '',
        respondent_role: '',
        unit: '',
        assessment_date: '',
        assessment_period: '',
        assessor_name: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError('');

            const response = await api.post(
                '/assessments',
                form
            );

            if (
                response.data &&
                response.data.success
            ) {
                navigate('/');
                return;
            }

            setError(
                response.data?.message ||
                'Assessment gagal dibuat.'
            );
        } catch (err) {
            console.error(
                'Gagal membuat assessment:',
                err
            );

            if (
                err.response &&
                err.response.data &&
                err.response.data.errors
            ) {
                const validationErrors =
                    err.response.data.errors;

                const messages = Object.values(
                    validationErrors
                ).flat();

                setError(
                    messages.join(' ')
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    'Gagal membuat assessment. Periksa koneksi ke server.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="kami-form-page min-h-screen bg-gray-100">

            <header className="border-b bg-white">
                <div className="mx-auto max-w-5xl px-6 py-5">

                    <div className="flex items-center gap-4">

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            ← Kembali
                        </button>

                        <div>

                            <h1 className="text-2xl font-bold text-gray-900">
                                Assessment Baru
                            </h1>

                            <p className="mt-1 text-sm text-gray-600">
                                Isi informasi assessment keamanan siber sekolah.
                            </p>

                        </div>

                    </div>

                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl bg-white shadow-sm"
                >

                    <div className="border-b px-6 py-5">

                        <h2 className="text-lg font-semibold text-gray-900">
                            Informasi Assessment
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Informasi ini digunakan sebagai identitas assessment.
                        </p>

                    </div>

                    <div className="grid gap-6 px-6 py-6 md:grid-cols-2">

                        <div className="md:col-span-2">

                            <label
                                htmlFor="school_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Sekolah
                            </label>

                            <input
                                id="school_name"
                                name="school_name"
                                type="text"
                                value={form.school_name}
                                onChange={handleChange}
                                required
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Nama sekolah"
                            />

                        </div>

                        <div>

                            <label
                                htmlFor="respondent_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Responden
                            </label>

                            <input
                                id="respondent_name"
                                name="respondent_name"
                                type="text"
                                value={form.respondent_name}
                                onChange={handleChange}
                                required
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Nama responden"
                            />

                        </div>

                        <div>

                            <label
                                htmlFor="respondent_role"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Jabatan Responden
                            </label>

                            <input
                                id="respondent_role"
                                name="respondent_role"
                                type="text"
                                value={form.respondent_role}
                                onChange={handleChange}
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Contoh: Kepala Sekolah"
                            />

                        </div>

                        <div>

                            <label
                                htmlFor="unit"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Unit / Bagian
                            </label>

                            <input
                                id="unit"
                                name="unit"
                                type="text"
                                value={form.unit}
                                onChange={handleChange}
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Contoh: Tata Usaha"
                            />

                        </div>

                        <div>

                            <label
                                htmlFor="assessment_date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Tanggal Assessment
                            </label>

                            <input
                                id="assessment_date"
                                name="assessment_date"
                                type="date"
                                value={form.assessment_date}
                                onChange={handleChange}
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                            />

                        </div>

                        <div>

                            <label
                                htmlFor="assessment_period"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Periode Assessment
                            </label>

                            <input
                                id="assessment_period"
                                name="assessment_period"
                                type="text"
                                value={form.assessment_period}
                                onChange={handleChange}
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Contoh: Semester 1 Tahun 2026"
                            />

                        </div>

                        <div>

                            <label
                                htmlFor="assessor_name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Assessor
                            </label>

                            <input
                                id="assessor_name"
                                name="assessor_name"
                                type="text"
                                value={form.assessor_name}
                                onChange={handleChange}
                                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Nama assessor"
                            />

                        </div>

                    </div>

                    {error && (
                        <div className="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                            <p className="text-sm text-red-700">
                                {error}
                            </p>

                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? 'Menyimpan...'
                                : 'Simpan Assessment'}
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
}

export default NewAssessment;