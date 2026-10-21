import React, { useEffect, useState } from 'react';

import {
    createRoot,
} from 'react-dom/client';

import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import NewAssessment from './pages/NewAssessment';
import AssessmentKAMI from './pages/AssessmentKAMI';
import AdditionalAssessment from './pages/AdditionalAssessment';
import CalculateAssessment from './pages/CalculateAssessment';
import Result from './pages/Result';
import AdditionalResult from './pages/AdditionalResult';
import History from './pages/History';
import Auth from './pages/Auth';
import { authApi } from './services/api';

function RequireAuth() {
    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        authApi.get('/auth/user')
            .then((response) => setAuthenticated(Boolean(response.data.user)))
            .catch(() => setAuthenticated(false))
            .finally(() => setChecking(false));
    }, []);

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 text-sm text-gray-600">
                Memeriksa sesi...
            </main>
        );
    }

    if (!authenticated) {
        const redirect = `${location.pathname}${location.search}`;
        return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
    }

    return <Outlet />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />

                <Route element={<RequireAuth />}>
                <Route
                    path="/"
                    element={<Dashboard />}
                />

                <Route
                    path="/assessments/new"
                    element={<NewAssessment />}
                />

                <Route
                    path="/assessments/:assessmentId/kami"
                    element={<AssessmentKAMI />}
                />

                <Route
                    path="/assessments/:assessmentId/additional"
                    element={<AdditionalAssessment />}
                />

                <Route
                    path="/assessments/:assessmentId/calculate"
                    element={<CalculateAssessment />}
                />

                <Route
                    path="/assessments/:assessmentId/result"
                    element={<Result />}
                />

                <Route
                    path="/assessments/:assessmentId/additional-result"
                    element={<AdditionalResult />}
                />

                <Route
                    path="/history"
                    element={<History />}
                />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
