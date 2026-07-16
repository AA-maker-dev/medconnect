import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type {
  AvailabilitySlot,
  DoctorAppointment,
  DoctorDashboardSummary,
  DoctorFullProfile,
  DoctorPatientListItem,
  DoctorPrescription,
  DoctorWallet,
  PaginatedResult,
  PatientHistory,
  RevenueAnalytics,
  AppointmentStatus,
} from '@/types/doctorDashboard.types';
import type { AppNotification } from '@/types/patient.types';

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function fetchDashboardSummary() {
  const { data } = await api.get<ApiResponse<DoctorDashboardSummary>>(
    '/doctor/me/dashboard-summary'
  );
  return data.data;
}

export async function fetchProfile() {
  const { data } = await api.get<ApiResponse<DoctorFullProfile>>('/doctor/me/profile');
  return data.data;
}

export async function updateProfile(payload: Partial<DoctorFullProfile>) {
  const { data } = await api.patch<ApiResponse<DoctorFullProfile>>(
    '/doctor/me/profile',
    payload
  );
  return data.data;
}

export async function fetchAppointments(
  type: 'today' | 'upcoming' | 'requests' | 'history' | 'all' = 'all',
  page = 1,
  limit = 10
): Promise<PaginatedResult<DoctorAppointment>> {
  const { data } = await api.get<PaginatedApiResponse<DoctorAppointment>>(
    '/doctor/me/appointments',
    { params: { type, page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function updateAppointmentStatus(
  id: string,
  payload: {
    status: AppointmentStatus;
    cancellationReason?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }
) {
  const { data } = await api.patch<ApiResponse<DoctorAppointment>>(
    `/doctor/me/appointments/${id}/status`,
    payload
  );
  return data.data;
}

export async function fetchPatients(
  page = 1,
  limit = 12
): Promise<PaginatedResult<DoctorPatientListItem>> {
  const { data } = await api.get<PaginatedApiResponse<DoctorPatientListItem>>(
    '/doctor/me/patients',
    { params: { page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function fetchPatientHistory(patientId: string) {
  const { data } = await api.get<ApiResponse<PatientHistory>>(
    `/doctor/me/patients/${patientId}/history`
  );
  return data.data;
}

export async function fetchRevenueAnalytics(months = 6) {
  const { data } = await api.get<ApiResponse<RevenueAnalytics>>(
    '/doctor/me/revenue-analytics',
    { params: { months } }
  );
  return data.data;
}

export async function fetchAvailability() {
  const { data } = await api.get<ApiResponse<AvailabilitySlot[]>>('/doctor/me/availability');
  return data.data;
}

export async function addAvailabilitySlot(payload: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  isActive?: boolean;
}) {
  const { data } = await api.post<ApiResponse<AvailabilitySlot>>(
    '/doctor/me/availability',
    payload
  );
  return data.data;
}

export async function deleteAvailabilitySlot(id: string) {
  await api.delete(`/doctor/me/availability/${id}`);
}

export async function fetchWallet() {
  const { data } = await api.get<ApiResponse<DoctorWallet>>('/doctor/me/wallet');
  return data.data;
}

export async function fetchPrescriptions() {
  const { data } = await api.get<ApiResponse<DoctorPrescription[]>>(
    '/doctor/me/prescriptions'
  );
  return data.data;
}

export async function createPrescription(payload: {
  appointmentId: string;
  diagnosis: string;
  advice?: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    durationDays?: number;
    instructions?: string;
  }>;
}) {
  const { data } = await api.post<ApiResponse<DoctorPrescription>>(
    '/doctor/me/prescriptions',
    payload
  );
  return data.data;
}

export async function fetchNotifications(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedApiResponse<AppNotification>>(
    '/doctor/me/notifications',
    { params: { page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<ApiResponse<AppNotification>>(
    `/doctor/me/notifications/${id}/read`
  );
  return data.data;
}

export async function markAllNotificationsRead() {
  await api.patch('/doctor/me/notifications/read-all');
}
