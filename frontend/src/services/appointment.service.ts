import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type {
  AppointmentDetail,
  AvailableSlot,
  BookAppointmentPayload,
  BookedAppointment,
  Disease,
  RecommendedDoctorsResult,
  RescheduleAppointmentPayload,
} from '@/types/appointment.types.ts';

export async function fetchDiseases() {
  const { data } = await api.get<ApiResponse<Disease[]>>('/diseases');
  return data.data;
}

export async function fetchRecommendedDoctors(diseaseId: string, limit = 10) {
  const { data } = await api.get<ApiResponse<RecommendedDoctorsResult>>(
    '/appointments/recommended-doctors',
    { params: { diseaseId, limit } }
  );
  return data.data;
}

export async function fetchAvailableSlots(doctorId: string, date: string) {
  const { data } = await api.get<ApiResponse<AvailableSlot[]>>(
    `/appointments/doctors/${doctorId}/slots`,
    { params: { date } }
  );
  return data.data;
}

export async function fetchAvailableDates(doctorId: string, startDate: string, endDate: string) {
  const { data } = await api.get<ApiResponse<string[]>>(
    `/appointments/doctors/${doctorId}/available-dates`,
    { params: { startDate, endDate } }
  );
  return data.data;
}

export async function bookAppointment(payload: BookAppointmentPayload) {
  const { data } = await api.post<ApiResponse<BookedAppointment>>('/appointments', payload);
  return data.data;
}

export async function fetchAppointmentById(id: string) {
  const { data } = await api.get<ApiResponse<AppointmentDetail>>(`/appointments/${id}`);
  return data.data;
}

export async function rescheduleAppointment(payload: RescheduleAppointmentPayload) {
  const { data } = await api.patch<ApiResponse<BookedAppointment>>(
    `/appointments/${payload.appointmentId}/reschedule`,
    payload
  );
  return data.data;
}
