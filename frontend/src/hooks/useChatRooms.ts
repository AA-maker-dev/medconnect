import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/context/SocketContext';
import * as chatService from '@/services/chat.service';

export function useChatRooms() {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: chatService.fetchChatRooms,
  });

  const refetchRooms = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
  }, [queryClient]);

  // Bulk-check presence for every contact once the room list is in, and
  // whenever the socket (re)connects.
  useEffect(() => {
    if (!rooms || rooms.length === 0 || !isConnected) return;

    const userIds = rooms.map((r) => r.other.userId);
    socket.emit('presence:check', { userIds }, (statuses: Record<string, boolean>) => {
      setOnlineUserIds(new Set(Object.entries(statuses).filter(([, on]) => on).map(([id]) => id)));
    });
  }, [rooms, isConnected, socket]);

  // Live presence updates pushed from the server as contacts connect/disconnect.
  useEffect(() => {
    const onPresence = (payload: { userId: string; isOnline: boolean }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (payload.isOnline) next.add(payload.userId);
        else next.delete(payload.userId);
        return next;
      });
    };
    socket.on('presence:update', onPresence);
    return () => {
      socket.off('presence:update', onPresence);
    };
  }, [socket]);

  // Keep the room list (last message preview, unread counts, ordering)
  // fresh in real time without a polling loop.
  useEffect(() => {
    const onNewMessage = () => refetchRooms();
    const onSeenUpdate = () => refetchRooms();
    socket.on('message:new', onNewMessage);
    socket.on('message:seen-update', onSeenUpdate);
    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('message:seen-update', onSeenUpdate);
    };
  }, [socket, refetchRooms]);

  return {
    rooms: rooms ?? [],
    isLoading,
    onlineUserIds,
    totalUnread: (rooms ?? []).reduce((sum, r) => sum + r.unreadCount, 0),
  };
}
