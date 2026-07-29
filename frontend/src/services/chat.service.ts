import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type {
  ChatMessage,
  ChatRoomSummary,
  PaginatedMessages,
  RoomMembership,
  UploadedFile,
} from '@/types/chat.types';

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function fetchChatRooms() {
  const { data } = await api.get<ApiResponse<ChatRoomSummary[]>>('/chat/rooms');
  return data.data;
}

export async function fetchRoomInfo(roomId: string) {
  const { data } = await api.get<ApiResponse<RoomMembership>>(`/chat/rooms/${roomId}`);
  return data.data;
}

export async function fetchMessages(
  roomId: string,
  page = 1,
  limit = 30,
  search?: string
): Promise<PaginatedMessages> {
  const { data } = await api.get<PaginatedApiResponse<ChatMessage>>(
    `/chat/rooms/${roomId}/messages`,
    { params: { page, limit, search: search || undefined } }
  );
  return { items: data.data, ...data.meta };
}

export async function uploadChatFile(roomId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiResponse<UploadedFile>>(
    `/chat/rooms/${roomId}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
}

export async function deleteMessageRest(messageId: string) {
  await api.delete(`/chat/messages/${messageId}`);
}
