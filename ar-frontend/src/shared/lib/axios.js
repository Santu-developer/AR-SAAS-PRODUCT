// ─── src/shared/lib/axios.js ───────────────────────────────────────────────

import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:8080
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Inject JWT Bearer token on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await apiClient.post('/api/v1/auth/refresh-token', {
          refreshToken: useAuthStore.getState().refreshToken,
        });
        const newToken = res.data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
