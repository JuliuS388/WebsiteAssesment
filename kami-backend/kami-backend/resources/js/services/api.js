import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,

    headers: {
        Accept: 'application/json',
    },
});

export const authApi = axios.create({
    baseURL: '/',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

export const prepareCsrfCookie = () =>
    authApi.get('/sanctum/csrf-cookie');

export default api;