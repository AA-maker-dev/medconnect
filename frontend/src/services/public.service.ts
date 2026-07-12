import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';

export interface Specialization {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
}

export async function fetchSpecializations() {
  const { data } = await api.get<ApiResponse<Specialization[]>>('/specializations');
  return data.data;
}

export async function fetchHospitals() {
  const { data } = await api.get<ApiResponse<Hospital[]>>('/hospitals');
  return data.data;
}

export interface PlatformStatsResponse {
  verifiedDoctors: number;
  patients: number;
  completedAppointments: number;
  specializations: number;
}

export async function fetchPlatformStats() {
  const { data } = await api.get<ApiResponse<PlatformStatsResponse>>('/stats');
  return data.data;
}
