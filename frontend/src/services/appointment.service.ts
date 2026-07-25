import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type {
  AppointmentDetail,
  AvailableSlot,
  BookAppointmentPayload,
  BookedAppointment,
  Disease,
  RecommendedDoctorsResult,
} from '@/types/appointment.types';

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

export async function bookAppointment(payload: BookAppointmentPayload) {
  const { data } = await api.post<ApiResponse<BookedAppointment>>('/appointments', payload);
  return data.data;
}

export async function fetchAppointmentById(id: string) {
  const { data } = await api.get<ApiResponse<AppointmentDetail>>(`/appointments/${id}`);
  return data.data;
}
