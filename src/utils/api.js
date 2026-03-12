import axios from 'axios';

// ─── SEC-01: In-memory access token store ────────────────────────────────────
// The access token is kept in a module-level closure rather than localStorage.
// This prevents XSS scripts from reading it via localStorage.getItem('token').
// On page refresh the token is gone, but the HttpOnly refresh-token cookie
// (set by the server) lets us silently re-issue one via /auth/refresh.
let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = ()      => _accessToken;

// ─── Plain instance — no auth header, used only for token refresh ─────────────
// This MUST NOT use the main `api` instance, otherwise the expired Bearer token
// gets attached to the /auth/refresh call and the server rejects it before it
// ever reads the HttpOnly cookie.
const plainAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
});

// ─── Main API instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required to send the HttpOnly refresh cookie
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// ─── Refresh token queue ──────────────────────────────────────────────────────
// Prevents a race condition where multiple simultaneous 401 responses each try
// to hit /auth/refresh, causing all but the first to fail with an already-used
// token and force an unnecessary logout.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ─── Response interceptor — refresh on 401 ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auth routes to prevent refresh loops
    const skipUrls = ['/auth/login', '/auth/refresh', '/auth/2fa', '/auth/super-login'];
    const isAuthRoute = skipUrls.some((u) => originalRequest?.url?.includes(u));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      // If a refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Use plainAxios so the expired Bearer token is NOT sent to /auth/refresh
        const { data } = await plainAxios.post('/auth/refresh');

        if (!data.token) throw new Error('No token in refresh response');

        setAccessToken(data.token);
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        processQueue(null, data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        localStorage.removeItem('userInfo');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;