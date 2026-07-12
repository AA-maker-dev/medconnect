export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPatientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
}

export interface RegisterDoctorPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  specializationId: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  licenseNumber: string;
  hospitalId?: string;
  bio?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
