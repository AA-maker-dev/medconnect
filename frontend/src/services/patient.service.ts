import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type {
  AppNotification,
  Appointment,
  DashboardSummary,
  FavoriteDoctorEntry,
  Invoice,
  MedicalHistoryEntry,
  PaginatedResult,
  PatientProfile,
  Prescription,
  Wallet,
} from '@/types/patient.types';

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function fetchDashboardSummary() {
  const { data } = await api.get<ApiResponse<DashboardSummary>>(
    '/patients/me/dashboard-summary'
  );
  return data.data;
}

export async function fetchProfile() {
  const { data } = await api.get<ApiResponse<PatientProfile>>('/patients/me/profile');
  return data.data;
}

export async function updateProfile(payload: Partial<PatientProfile>) {
  const { data } = await api.patch<ApiResponse<PatientProfile>>(
    '/patients/me/profile',
    payload
  );
  return data.data;
}

export async function fetchAppointments(
  status: 'upcoming' | 'past' | 'all' = 'all',
  page = 1,
  limit = 10
): Promise<PaginatedResult<Appointment>> {
  const { data } = await api.get<PaginatedApiResponse<Appointment>>(
    '/patients/me/appointments',
    { params: { status, page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function fetchMedicalHistory() {
  const { data } = await api.get<ApiResponse<MedicalHistoryEntry[]>>(
    '/patients/me/medical-history'
  );
  return data.data;
}

export async function createMedicalHistoryEntry(payload: {
  title: string;
  description?: string;
  fileUrl?: string;
}) {
  const { data } = await api.post<ApiResponse<MedicalHistoryEntry>>(
    '/patients/me/medical-history',
    payload
  );
  return data.data;
}

export async function deleteMedicalHistoryEntry(id: string) {
  await api.delete(`/patients/me/medical-history/${id}`);
}

export async function fetchFavoriteDoctors() {
  const { data } = await api.get<ApiResponse<FavoriteDoctorEntry[]>>(
    '/patients/me/favorite-doctors'
  );
  return data.data;
}

export async function addFavoriteDoctor(doctorId: string) {
  const { data } = await api.post<ApiResponse<FavoriteDoctorEntry>>(
    '/patients/me/favorite-doctors',
    { doctorId }
  );
  return data.data;
}

export async function removeFavoriteDoctor(doctorId: string) {
  await api.delete(`/patients/me/favorite-doctors/${doctorId}`);
}

export async function fetchPrescriptions() {
  const { data } = await api.get<ApiResponse<Prescription[]>>('/patients/me/prescriptions');
  return data.data;
}

export async function fetchInvoices() {
  const { data } = await api.get<ApiResponse<Invoice[]>>('/patients/me/invoices');
  return data.data;
}

export async function fetchWallet() {
  const { data } = await api.get<ApiResponse<Wallet>>('/patients/me/wallet');
  return data.data;
}

export async function fetchNotifications(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedApiResponse<AppNotification>>(
    '/patients/me/notifications',
    { params: { page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<ApiResponse<AppNotification>>(
    `/patients/me/notifications/${id}/read`
  );
  return data.data;
}

export async function markAllNotificationsRead() {
  await api.patch('/patients/me/notifications/read-all');
}
