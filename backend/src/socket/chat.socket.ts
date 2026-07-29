import { Server as SocketIOServer, Socket } from 'socket.io';
import { MessageType } from '@prisma/client';
import * as chatService from '../services/chat.service';
import { logger } from '../utils/logger';

const chatRoomName = (roomId: string) => `chat:${roomId}`;

/**
 * Global online-presence tracking. A user can have multiple sockets
 * (several tabs/devices), so we count sockets per userId rather than
 * treating any single disconnect as "this user went offline" — they're
 * only offline once their last socket disconnects.
 *
 * Presence broadcasts go to every connected socket rather than being
 * scoped to shared chat rooms. At this app's scale (a clinic's patient
 * roster, not a social network) that's a reasonable simplicity/cost
 * tradeoff; the alternative (tracking which rooms each user shares with
 * others and only notifying those) is real optimization work for a
 * later pass if this ever needs to scale past that.
 */
const onlineUsers = new Map<string, Set<string>>();

function markOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
  return sockets.size === 1; // true if this is the user's first connection
}

function markOffline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true; // true if the user has no more open connections
  }
  return false;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function registerChatHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    const userId: string = socket.data.userId;

    const becameOnline = markOnline(userId, socket.id);
    if (becameOnline) {
      socket.broadcast.emit('presence:update', { userId, isOnline: true });
    }

    // Track which rooms this socket has joined, purely so we can clean
    // up typing-indicator state on disconnect without trusting the client.
    const joinedRooms = new Set<string>();

    socket.on('room:join', async (payload: { roomId: string }, ack?: (res: unknown) => void) => {
      try {
        const membership = await chatService.getRoomMembership(payload.roomId, userId);
        socket.join(chatRoomName(payload.roomId));
        joinedRooms.add(payload.roomId);

        // Joining a room means you're actively looking at it — the
        // sender's outstanding SENT messages become DELIVERED right now.
        const deliveredCount = await chatService.markDelivered(payload.roomId, userId);
        if (deliveredCount > 0) {
          io.to(chatRoomName(payload.roomId)).emit('message:delivered', {
            roomId: payload.roomId,
            deliveredBy: userId,
          });
        }

        ack?.({ success: true, membership, otherOnline: isUserOnline(membership.otherUserId) });
      } catch (err) {
        ack?.({ success: false, message: err instanceof Error ? err.message : 'Could not join room' });
      }
    });

    socket.on('room:leave', (payload: { roomId: string }) => {
      socket.leave(chatRoomName(payload.roomId));
      joinedRooms.delete(payload.roomId);
    });

    socket.on('presence:check', (payload: { userIds: string[] }, ack?: (res: unknown) => void) => {
      const statuses: Record<string, boolean> = {};
      for (const id of payload.userIds ?? []) {
        statuses[id] = isUserOnline(id);
      }
      ack?.(statuses);
    });

    socket.on(
      'message:send',
      async (
        payload: {
          roomId: string;
          type: MessageType;
          content?: string;
          fileUrl?: string;
          fileName?: string;
          replyToId?: string;
          tempId?: string;
        },
        ack?: (res: unknown) => void
      ) => {
        try {
          await chatService.getRoomMembership(payload.roomId, userId);

          const message = await chatService.createMessage(payload.roomId, userId, {
            type: payload.type,
            content: payload.content,
            fileUrl: payload.fileUrl,
            fileName: payload.fileName,
            replyToId: payload.replyToId,
          });

          io.to(chatRoomName(payload.roomId)).emit('message:new', {
            roomId: payload.roomId,
            message,
            tempId: payload.tempId,
          });

          ack?.({ success: true, message });
        } catch (err) {
          logger.warn(`message:send failed for user=${userId}: ${err}`);
          ack?.({
            success: false,
            tempId: payload.tempId,
            message: err instanceof Error ? err.message : 'Could not send message',
          });
        }
      }
    );

    socket.on('message:seen', async (payload: { roomId: string }) => {
      try {
        const seenIds = await chatService.markSeen(payload.roomId, userId);
        if (seenIds.length > 0) {
          io.to(chatRoomName(payload.roomId)).emit('message:seen-update', {
            roomId: payload.roomId,
            messageIds: seenIds,
            seenBy: userId,
          });
        }
      } catch (err) {
        logger.warn(`message:seen failed for user=${userId}: ${err}`);
      }
    });

    socket.on('message:delete', async (payload: { roomId: string; messageId: string }, ack?: (res: unknown) => void) => {
      try {
        await chatService.deleteMessage(payload.messageId, userId);
        io.to(chatRoomName(payload.roomId)).emit('message:deleted', {
          roomId: payload.roomId,
          messageId: payload.messageId,
        });
        ack?.({ success: true });
      } catch (err) {
        ack?.({ success: false, message: err instanceof Error ? err.message : 'Could not delete message' });
      }
    });

    socket.on('typing:start', (payload: { roomId: string }) => {
      socket.to(chatRoomName(payload.roomId)).emit('typing:update', {
        roomId: payload.roomId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (payload: { roomId: string }) => {
      socket.to(chatRoomName(payload.roomId)).emit('typing:update', {
        roomId: payload.roomId,
        userId,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      for (const roomId of joinedRooms) {
        socket.to(chatRoomName(roomId)).emit('typing:update', { roomId, userId, isTyping: false });
      }

      const becameOffline = markOffline(userId, socket.id);
      if (becameOffline) {
        socket.broadcast.emit('presence:update', { userId, isOnline: false });
      }
    });
  });
}
