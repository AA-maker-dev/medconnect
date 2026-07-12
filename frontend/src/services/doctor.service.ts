import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type { DoctorCard } from '@/types/doctor.types';

export interface ListDoctorsParams {
  sortBy?: 'rating' | 'recent' | 'experience';
  specializationId?: string;
  limit?: number;
}

export async function listDoctors(params: ListDoctorsParams = {}) {
  const { data } = await api.get<ApiResponse<DoctorCard[]>>('/doctors', { params });
  return data.data;
}

export async function getDoctorById(id: string) {
  const { data } = await api.get<ApiResponse<DoctorCard>>(`/doctors/${id}`);
  return data.data;
}
