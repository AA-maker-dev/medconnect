import { api, setAccessToken } from './api';
import { getStoredRefreshToken, setStoredRefreshToken, clearStoredRefreshToken } from '@/utils/authStorage';
import type {
  ApiResponse,
  AuthUser,
  LoginPayload,
  RegisterDoctorPayload,
  RegisterPatientPayload,
} from '@/types/auth.types';

interface LoginResponseData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function registerPatient(payload: RegisterPatientPayload) {
  const { data } = await api.post<ApiResponse<AuthUser>>(
    '/auth/register/patient',
    payload
  );
  return data;
}

export async function registerDoctor(payload: RegisterDoctorPayload) {
  const { data } = await api.post<ApiResponse<AuthUser>>(
    '/auth/register/doctor',
    payload
  );
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<ApiResponse<LoginResponseData>>(
    '/auth/login',
    payload
  );
  setAccessToken(data.data.accessToken);
  setStoredRefreshToken(data.data.refreshToken);
  return data.data;
}

export async function adminLogin(payload: LoginPayload) {
  const { data } = await api.post<ApiResponse<LoginResponseData>>(
    '/auth/admin/login',
    payload
  );
  setAccessToken(data.data.accessToken);
  setStoredRefreshToken(data.data.refreshToken);
  return data.data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
    clearStoredRefreshToken();
  }
}

export async function logoutAllDevices() {
  try {
    await api.post('/auth/logout-all');
  } finally {
    setAccessToken(null);
    clearStoredRefreshToken();
  }
}

export async function verifyOtp(email: string, otp: string) {
  const { data } = await api.post<ApiResponse<{ verified: boolean }>>(
    '/auth/verify-otp',
    { email, otp }
  );
  return data;
}

export async function resendOtp(email: string) {
  const { data } = await api.post<ApiResponse<{ sent: boolean }>>(
    '/auth/resend-otp',
    { email }
  );
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<ApiResponse<{ sent: boolean }>>(
    '/auth/forgot-password',
    { email }
  );
  return data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
) {
  const { data } = await api.post<ApiResponse<{ reset: boolean }>>(
    '/auth/reset-password',
    { token, newPassword, confirmPassword }
  );
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const { data } = await api.post<ApiResponse<{ changed: boolean }>>(
    '/auth/change-password',
    { currentPassword, newPassword, confirmPassword }
  );
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get<ApiResponse<AuthUser & { profile: unknown }>>(
    '/auth/me'
  );
  return data.data;
}

/** Called once on app load to silently restore a session from the refresh cookie. */
export async function tryRestoreSession(maxRetries = 2) {
  const storedRefreshToken = getStoredRefreshToken();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await api.post<ApiResponse<LoginResponseData>>('/auth/refresh', {
        refreshToken: storedRefreshToken ?? undefined,
      });
      setAccessToken(data.data.accessToken);
      setStoredRefreshToken(data.data.refreshToken);
      return data.data.user;
    } catch (err) {
      console.warn(`Session restore attempt ${attempt} failed:`, err);
      setAccessToken(null);
      setStoredRefreshToken(null);
      if (attempt === maxRetries) {
        console.warn('Session restore failed after max retries. Redirecting to login.');
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  return null;
}
