import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getStoredRefreshToken, setStoredRefreshToken } from '@/utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

/**
 * The access token lives ONLY in memory (a module-level variable), never
 * in localStorage/sessionStorage. localStorage is readable by any script
 * on the page, so a single XSS bug would hand over the token; keeping it
 * in memory means a page refresh loses it, which is exactly why the
 * refresh-token flow below exists — it silently re-establishes a session
 * from the httpOnly cookie the backend set at login.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- Automatic refresh-on-401, with request queueing ----
// If five requests fire while the token is expired, we don't want to hit
// /auth/refresh five times — the first 401 triggers one refresh call, and
// every other queued request waits on that same promise.
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: getStoredRefreshToken() ?? undefined },
      { withCredentials: true }
    );
    const newAccessToken = response.data?.data?.accessToken as string | undefined;
    const newRefreshToken = response.data?.data?.refreshToken as string | undefined;
    setAccessToken(newAccessToken ?? null);
    if (newRefreshToken) {
      setStoredRefreshToken(newRefreshToken);
    }
    return newAccessToken ?? null;
  } catch {
    setAccessToken(null);
    return null;
  } finally {
    refreshPromise = null;
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retried = true;

      refreshPromise = refreshPromise ?? performRefresh();
      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      // Refresh failed — the session is truly over. Let AuthContext react
      // to this by clearing user state (it listens for this event).
      window.dispatchEvent(new CustomEvent('medconnect:session-expired'));
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}
