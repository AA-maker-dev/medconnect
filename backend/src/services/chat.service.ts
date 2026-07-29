import { MessageType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

// ==================================================
// Membership — the core rule enforced everywhere in this file:
// a chat room exists 1:1 with an Appointment, so "can this user access
// this room" collapses to "is this user the patient or doctor on the
// appointment this room belongs to". No separate ACL table to drift out
// of sync with appointment cancellation/reassignment.
// ==================================================

export interface RoomMembership {
  roomId: string;
  appointmentId: string;
  selfUserId: string;
  otherUserId: string;
  otherName: string;
  otherAvatarUrl: string | null;
  otherRole: 'PATIENT' | 'DOCTOR';
}

export async function getRoomMembership(
  roomId: string,
  requesterUserId: string
): Promise<RoomMembership> {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      appointment: {
        select: {
          id: true,
          patient: { select: { userId: true, firstName: true, lastName: true, avatarUrl: true } },
          doctor: { select: { userId: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!room) throw ApiError.notFound('Chat room not found');

  const { patient, doctor } = room.appointment;

  if (requesterUserId === patient.userId) {
    return {
      roomId: room.id,
      appointmentId: room.appointmentId,
      selfUserId: patient.userId,
      otherUserId: doctor.userId,
      otherName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      otherAvatarUrl: doctor.avatarUrl,
      otherRole: 'DOCTOR',
    };
  }

  if (requesterUserId === doctor.userId) {
    return {
      roomId: room.id,
      appointmentId: room.appointmentId,
      selfUserId: doctor.userId,
      otherUserId: patient.userId,
      otherName: `${patient.firstName} ${patient.lastName}`,
      otherAvatarUrl: patient.avatarUrl,
      otherRole: 'PATIENT',
    };
  }

  throw ApiError.forbidden('You do not have access to this chat room');
}

// ==================================================
// Room list
// ==================================================

export async function listChatRooms(userId: string, role: 'PATIENT' | 'DOCTOR') {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      appointment:
        role === 'PATIENT' ? { patient: { userId } } : { doctor: { userId } },
    },
    orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    include: {
      appointment: {
        select: {
          id: true,
          status: true,
          patient: { select: { userId: true, firstName: true, lastName: true, avatarUrl: true } },
          doctor: { select: { userId: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, type: true, createdAt: true, senderId: true, isDeleted: true },
      },
    },
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ['chatRoomId'],
    where: {
      chatRoomId: { in: rooms.map((r) => r.id) },
      senderId: { not: userId },
      status: { not: 'SEEN' },
      isDeleted: false,
    },
    _count: { _all: true },
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.chatRoomId, u._count._all]));

  return rooms.map((room) => {
    const isPatientSelf = room.appointment.patient.userId === userId;
    const other = isPatientSelf ? room.appointment.doctor : room.appointment.patient;
    const lastMessage = room.messages[0];

    return {
      roomId: room.id,
      appointmentId: room.appointment.id,
      appointmentStatus: room.appointment.status,
      other: {
        userId: other.userId,
        name: isPatientSelf ? `Dr. ${other.firstName} ${other.lastName}` : `${other.firstName} ${other.lastName}`,
        avatarUrl: other.avatarUrl,
      },
      lastMessage: lastMessage
        ? {
            preview: lastMessage.isDeleted
              ? 'This message was deleted'
              : lastMessage.type === 'TEXT'
              ? lastMessage.content
              : `Sent ${lastMessage.type.toLowerCase().replace('_', ' ')}`,
            createdAt: lastMessage.createdAt,
            isOwn: lastMessage.senderId === userId,
          }
        : null,
      unreadCount: unreadMap.get(room.id) ?? 0,
      updatedAt: room.lastMessageAt ?? room.createdAt,
    };
  });
}

// ==================================================
// Messages
// ==================================================

export async function listMessages(
  roomId: string,
  page: number,
  limit: number,
  search?: string
) {
  const where = {
    chatRoomId: roomId,
    isDeleted: false,
    ...(search ? { content: { contains: search, mode: 'insensitive' as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        replyTo: {
          select: { id: true, content: true, type: true, senderId: true, isDeleted: true },
        },
      },
    }),
    prisma.message.count({ where }),
  ]);

  return {
    // Reversed so the frontend can render oldest→newest top-to-bottom
    // while still paginating "load older" from the most recent page.
    items: items.reverse(),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createMessage(
  roomId: string,
  senderId: string,
  input: {
    type: MessageType;
    content?: string;
    fileUrl?: string;
    fileName?: string;
    replyToId?: string;
  }
) {
  if (input.replyToId) {
    const original = await prisma.message.findFirst({
      where: { id: input.replyToId, chatRoomId: roomId },
    });
    if (!original) throw ApiError.badRequest('Cannot reply to a message outside this room');
  }

  const message = await prisma.message.create({
    data: {
      chatRoomId: roomId,
      senderId,
      type: input.type,
      content: input.content,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      replyToId: input.replyToId,
      status: 'SENT',
    },
    include: {
      replyTo: {
        select: { id: true, content: true, type: true, senderId: true, isDeleted: true },
      },
    },
  });

  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { lastMessageAt: message.createdAt },
  });

  return message;
}

export async function markDelivered(roomId: string, receiverUserId: string) {
  const result = await prisma.message.updateMany({
    where: { chatRoomId: roomId, senderId: { not: receiverUserId }, status: 'SENT' },
    data: { status: 'DELIVERED', deliveredAt: new Date() },
  });
  return result.count;
}

export async function markSeen(roomId: string, receiverUserId: string) {
  const toMark = await prisma.message.findMany({
    where: {
      chatRoomId: roomId,
      senderId: { not: receiverUserId },
      status: { not: 'SEEN' },
    },
    select: { id: true },
  });

  if (toMark.length === 0) return [];

  await prisma.message.updateMany({
    where: { id: { in: toMark.map((m) => m.id) } },
    data: { status: 'SEEN', seenAt: new Date() },
  });

  return toMark.map((m) => m.id);
}

export async function deleteMessage(messageId: string, requesterUserId: string) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw ApiError.notFound('Message not found');
  if (message.senderId !== requesterUserId) {
    throw ApiError.forbidden('You can only delete your own messages');
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, content: null, fileUrl: null, fileName: null },
  });
}
