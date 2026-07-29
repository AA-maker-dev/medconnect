import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import * as chatService from '@/services/chat.service';
import type { ChatMessage, MessageType, RoomMembership } from '@/types/chat.types';

interface SendMessageInput {
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  replyToId?: string;
}

export function useChat(roomId: string | null) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [membership, setMembership] = useState<RoomMembership | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // ---- Join room, load history ----
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    setIsLoading(true);
    setMessages([]);
    setMembership(null);

    socket.emit(
      'room:join',
      { roomId },
      (res: { success: boolean; membership?: RoomMembership; otherOnline?: boolean; message?: string }) => {
        if (cancelled) return;
        if (res.success && res.membership) {
          setMembership(res.membership);
          setOtherOnline(Boolean(res.otherOnline));
        }
      }
    );

    chatService
      .fetchMessages(roomId, 1, 30)
      .then((result) => {
        if (cancelled) return;
        setMessages(result.items);
        setHasMore(result.page < result.totalPages);
        setPage(1);
        // Chat window is now open — anything from the other party becomes seen.
        socket.emit('message:seen', { roomId });
      })
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
      socket.emit('room:leave', { roomId });
    };
  }, [roomId, socket]);

  // ---- Real-time event listeners ----
  useEffect(() => {
    if (!roomId) return;

    const onNewMessage = (payload: { roomId: string; message: ChatMessage }) => {
      if (payload.roomId !== roomId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        return [...prev, payload.message];
      });
      if (payload.message.senderId !== user?.id) {
        socket.emit('message:seen', { roomId });
      }
    };

    const onDelivered = (payload: { roomId: string }) => {
      if (payload.roomId !== roomId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user?.id && m.status === 'SENT' ? { ...m, status: 'DELIVERED' } : m
        )
      );
    };

    const onSeenUpdate = (payload: { roomId: string; messageIds: string[] }) => {
      if (payload.roomId !== roomId) return;
      setMessages((prev) =>
        prev.map((m) => (payload.messageIds.includes(m.id) ? { ...m, status: 'SEEN' } : m))
      );
    };

    const onDeleted = (payload: { roomId: string; messageId: string }) => {
      if (payload.roomId !== roomId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.messageId
            ? { ...m, isDeleted: true, content: null, fileUrl: null, fileName: null }
            : m
        )
      );
    };

    const onTyping = (payload: { roomId: string; userId: string; isTyping: boolean }) => {
      if (payload.roomId !== roomId || payload.userId === user?.id) return;
      setOtherTyping(payload.isTyping);
    };

    const onPresence = (payload: { userId: string; isOnline: boolean }) => {
      if (membership && payload.userId === membership.otherUserId) {
        setOtherOnline(payload.isOnline);
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('message:delivered', onDelivered);
    socket.on('message:seen-update', onSeenUpdate);
    socket.on('message:deleted', onDeleted);
    socket.on('typing:update', onTyping);
    socket.on('presence:update', onPresence);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('message:delivered', onDelivered);
      socket.off('message:seen-update', onSeenUpdate);
      socket.off('message:deleted', onDeleted);
      socket.off('typing:update', onTyping);
      socket.off('presence:update', onPresence);
    };
  }, [roomId, socket, user?.id, membership]);

  // ---- Actions ----

  const sendMessage = useCallback(
    (input: SendMessageInput) => {
      if (!roomId || !user) return;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        chatRoomId: roomId,
        senderId: user.id,
        type: input.type,
        content: input.content ?? null,
        fileUrl: input.fileUrl ?? null,
        fileName: input.fileName ?? null,
        replyToId: input.replyToId ?? null,
        replyTo: null,
        status: 'SENT',
        deliveredAt: null,
        seenAt: null,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      socket.emit(
        'message:send',
        { roomId, tempId, ...input },
        (res: { success: boolean; message?: ChatMessage; tempId?: string }) => {
          if (res.success && res.message) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? res.message! : m))
            );
          } else {
            // Failed to send — drop the optimistic bubble rather than
            // leave a permanently-stuck "sending" message.
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
          }
        }
      );
    },
    [roomId, socket, user]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!roomId) return;
      socket.emit('message:delete', { roomId, messageId });
    },
    [roomId, socket]
  );

  const startTyping = useCallback(() => {
    if (!roomId) return;
    socket.emit('typing:start', { roomId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { roomId });
    }, 2500);
  }, [roomId, socket]);

  const stopTyping = useCallback(() => {
    if (!roomId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing:stop', { roomId });
  }, [roomId, socket]);

  const loadOlderMessages = useCallback(async () => {
    if (!roomId || !hasMore) return;
    const nextPage = page + 1;
    const result = await chatService.fetchMessages(roomId, nextPage, 30);
    setMessages((prev) => [...result.items, ...prev]);
    setHasMore(nextPage < result.totalPages);
    setPage(nextPage);
  }, [roomId, page, hasMore]);

  return {
    membership,
    messages,
    isLoading,
    hasMore,
    otherTyping,
    otherOnline,
    sendMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    loadOlderMessages,
  };
}
