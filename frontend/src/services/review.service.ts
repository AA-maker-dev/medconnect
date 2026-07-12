import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type { FeaturedReview } from '@/types/doctor.types';

export async function fetchFeaturedReviews(limit = 6) {
  const { data } = await api.get<ApiResponse<FeaturedReview[]>>('/reviews/featured', {
    params: { limit },
  });
  return data.data;
}
