export type MessageType = 'TEXT' | 'IMAGE' | 'PDF' | 'PRESCRIPTION' | 'VOICE_NOTE';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'SEEN';

export interface ReplyPreview {
  id: string;
  content: string | null;
  type: MessageType;
  senderId: string;
  isDeleted: boolean;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  replyToId: string | null;
  replyTo: ReplyPreview | null;
  status: MessageStatus;
  deliveredAt: string | null;
  seenAt: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface ChatRoomSummary {
  roomId: string;
  appointmentId: string;
  appointmentStatus: string;
  other: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    preview: string | null;
    createdAt: string;
    isOwn: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface RoomMembership {
  roomId: string;
  appointmentId: string;
  selfUserId: string;
  otherUserId: string;
  otherName: string;
  otherAvatarUrl: string | null;
  otherRole: 'PATIENT' | 'DOCTOR';
}

export interface PaginatedMessages {
  items: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadedFile {
  fileUrl: string;
  fileName: string;
  mimeType: string;
}
