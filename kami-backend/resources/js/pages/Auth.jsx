import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { authApi, prepareCsrfCookie } from '../services/api';

function Auth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isRegister = window.location.pathname === '/register';
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await prepareCsrfCookie();
            await authApi.post(
                isRegister ? '/auth/register' : '/auth/login',
                form
            );
            navigate(searchParams.get('redirect') || '/', { replace: true });
        } catch (requestError) {
            const messages = Object.values(
                requestError.response?.data?.errors || {}
            ).flat();
            setError(
                messages.join(' ') ||
                requestError.response?.data?.message ||
                'Tidak dapat memproses akun. Coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <main className="kami-auth flex min-h-screen items-center justify-center px-5 py-10">
            <section className="kami-auth-card w-full max-w-md border border-gray-200 bg-white p-8">
                <div className="kami-wordmark">
                    <span className="kami-mark" aria-hidden="true">K</span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-normal text-gray-500">Indeks KAMI</p>
                        <p className="text-xs text-gray-500">SD Teruna Bangsa</p>
                    </div>
                </div>
                <h1 className="kami-auth-title mt-8 text-3xl font-bold text-gray-900">
                    {isRegister ? 'Buat akun' : 'Masuk'}
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                    Sistem Assessment Keamanan Siber SD Teruna Bangsa
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    {isRegister && (
                        <label className="block text-sm font-medium text-gray-700">
                            Nama
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                                maxLength={255}
                                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                            />
                        </label>
                    )}
                    <label className="block text-sm font-medium text-gray-700">
                        Email
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                        />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                        Password
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            required
                            minLength={isRegister ? 8 : undefined}
                            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                        />
                    </label>
                    {isRegister && (
                        <label className="block text-sm font-medium text-gray-700">
                            Konfirmasi password
                            <input
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                            />
                        </label>
                    )}
                    {error && (
                        <p role="alert" className="text-sm text-red-700">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="kami-auth-submit w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-wait disabled:opacity-60"
                    >
                        {loading ? 'Memproses...' : isRegister ? 'Buat akun' : 'Masuk'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                    <Link
                        to={isRegister ? '/login' : '/register'}
                        className="font-semibold text-gray-900 underline underline-offset-2"
                    >
                        {isRegister ? 'Masuk' : 'Daftar'}
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default Auth;