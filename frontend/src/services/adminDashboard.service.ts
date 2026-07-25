import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type { AppNotification } from '@/types/patient.types';
import type {
  AdminAppointmentListItem,
  AdminDashboardSummary,
  AdminDoctorDetail,
  AdminDoctorListItem,
  AdminPatientDetail,
  AdminPatientListItem,
  AdminPaymentListItem,
  AdminProfile,
  AdminReviewListItem,
  AppointmentReport,
  DoctorVerificationStatus,
  PaginatedResult,
  RevenueAnalytics,
  SystemAnalytics,
} from '@/types/adminDashboard.types';

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function fetchDashboardSummary() {
  const { data } = await api.get<ApiResponse<AdminDashboardSummary>>(
    '/admin/dashboard-summary'
  );
  return data.data;
}

// ---- Patients ----

export async function fetchPatients(
  search = '',
  page = 1,
  limit = 10
): Promise<PaginatedResult<AdminPatientListItem>> {
  const { data } = await api.get<PaginatedApiResponse<AdminPatientListItem>>(
    '/admin/patients',
    { params: { search: search || undefined, page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function fetchPatientDetail(id: string) {
  const { data } = await api.get<ApiResponse<AdminPatientDetail>>(`/admin/patients/${id}`);
  return data.data;
}

export async function setPatientActive(id: string, isActive: boolean) {
  await api.patch(`/admin/patients/${id}/active`, { isActive });
}

// ---- Doctors ----

export async function fetchDoctors(
  filters: { search?: string; status?: DoctorVerificationStatus } = {},
  page = 1,
  limit = 10
): Promise<PaginatedResult<AdminDoctorListItem>> {
  const { data } = await api.get<PaginatedApiResponse<AdminDoctorListItem>>('/admin/doctors', {
    params: { ...filters, page, limit },
  });
  return { items: data.data, ...data.meta };
}

export async function fetchDoctorDetail(id: string) {
  const { data } = await api.get<ApiResponse<AdminDoctorDetail>>(`/admin/doctors/${id}`);
  return data.data;
}

export async function verifyDoctor(
  id: string,
  status: 'VERIFIED' | 'REJECTED',
  rejectionReason?: string
) {
  const { data } = await api.patch<ApiResponse<AdminDoctorListItem>>(
    `/admin/doctors/${id}/verify`,
    { status, rejectionReason }
  );
  return data.data;
}

export async function setDoctorActive(id: string, isActive: boolean) {
  await api.patch(`/admin/doctors/${id}/active`, { isActive });
}

// ---- Appointments ----

export async function fetchAppointments(
  filters: { status?: string; from?: string; to?: string } = {},
  page = 1,
  limit = 10
): Promise<PaginatedResult<AdminAppointmentListItem>> {
  const { data } = await api.get<PaginatedApiResponse<AdminAppointmentListItem>>(
    '/admin/appointments',
    { params: { ...filters, page, limit } }
  );
  return { items: data.data, ...data.meta };
}

// ---- Payments ----

export async function fetchPayments(
  filters: { status?: string; gateway?: string } = {},
  page = 1,
  limit = 10
): Promise<PaginatedResult<AdminPaymentListItem>> {
  const { data } = await api.get<PaginatedApiResponse<AdminPaymentListItem>>('/admin/payments', {
    params: { ...filters, page, limit },
  });
  return { items: data.data, ...data.meta };
}

export async function refundPayment(id: string, refundAmount?: number) {
  const { data } = await api.post<ApiResponse<AdminPaymentListItem>>(
    `/admin/payments/${id}/refund`,
    { refundAmount }
  );
  return data.data;
}

// ---- Revenue / analytics / reports ----

export async function fetchRevenueAnalytics(months = 6) {
  const { data } = await api.get<ApiResponse<RevenueAnalytics>>('/admin/revenue-analytics', {
    params: { months },
  });
  return data.data;
}

export async function fetchSystemAnalytics(months = 6) {
  const { data } = await api.get<ApiResponse<SystemAnalytics>>('/admin/system-analytics', {
    params: { months },
  });
  return data.data;
}

export async function fetchAppointmentReport(from?: string, to?: string) {
  const { data } = await api.get<ApiResponse<AppointmentReport>>('/admin/reports/appointments', {
    params: { from, to },
  });
  return data.data;
}

// ---- Reviews ----

export async function fetchReviews(
  filters: { visible?: boolean; minRating?: number } = {},
  page = 1,
  limit = 10
): Promise<PaginatedResult<AdminReviewListItem>> {
  const { data } = await api.get<PaginatedApiResponse<AdminReviewListItem>>('/admin/reviews', {
    params: { ...filters, page, limit },
  });
  return { items: data.data, ...data.meta };
}

export async function setReviewVisibility(id: string, isVisible: boolean) {
  await api.patch(`/admin/reviews/${id}/visibility`, { isVisible });
}

export async function deleteReview(id: string) {
  await api.delete(`/admin/reviews/${id}`);
}

// ---- Notifications ----

export async function broadcastNotification(
  title: string,
  body: string,
  targetRole: 'PATIENT' | 'DOCTOR' | 'ALL'
) {
  const { data } = await api.post<ApiResponse<{ sentTo: number }>>(
    '/admin/notifications/broadcast',
    { title, body, targetRole }
  );
  return data.data;
}

export async function fetchNotifications(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedApiResponse<AppNotification>>(
    '/admin/me/notifications',
    { params: { page, limit } }
  );
  return { items: data.data, ...data.meta };
}

export async function markNotificationRead(id: string) {
  await api.patch(`/admin/me/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch('/admin/me/notifications/read-all');
}

// ---- Profile ----

export async function fetchProfile() {
  const { data } = await api.get<ApiResponse<AdminProfile>>('/admin/me/profile');
  return data.data;
}

export async function updateProfile(payload: { firstName?: string; lastName?: string }) {
  const { data } = await api.patch<ApiResponse<AdminProfile>>('/admin/me/profile', payload);
  return data.data;
}
