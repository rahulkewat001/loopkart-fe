import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach access token to every request ────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auto-refresh token on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];
const AUTH_BYPASS_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const requestUrl = original?.url || '';
    const shouldBypassRefresh = AUTH_BYPASS_ROUTES.some((route) => requestUrl.includes(route));

    if (shouldBypassRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token found, redirecting to login');
          localStorage.clear();
          window.location.href = '/?auth=login';
          return Promise.reject(error);
        }

        console.log('Attempting to refresh token...');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        console.log('Token refreshed successfully');
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        console.error('Token refresh failed:', err);
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/?auth=login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
