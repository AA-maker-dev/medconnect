import { cn } from '@/utils/cn';
import type { ChatRoomSummary } from '@/types/chat.types';

interface ChatRoomListProps {
  rooms: ChatRoomSummary[];
  activeRoomId: string | null;
  onlineUserIds: Set<string>;
  onSelectRoom: (roomId: string) => void;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ChatRoomList({ rooms, activeRoomId, onlineUserIds, onSelectRoom }: ChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        No conversations yet. They appear here once you have a confirmed appointment.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {rooms.map((room) => {
        const isActive = room.roomId === activeRoomId;
        const isOnline = onlineUserIds.has(room.other.userId);

        return (
          <button
            key={room.roomId}
            onClick={() => onSelectRoom(room.roomId)}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-100 transition-colors duration-fast',
              isActive ? 'bg-teal-100/50' : 'hover:bg-ivory-100'
            )}
          >
            <div className="relative shrink-0">
              {room.other.avatarUrl ? (
                <img
                  src={room.other.avatarUrl}
                  alt={room.other.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-teal-100 text-teal-700 font-display flex items-center justify-center">
                  {initials(room.other.name)}
                </div>
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success-600 border-2 border-paper-0" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    'text-sm truncate',
                    room.unreadCount > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                  )}
                >
                  {room.other.name}
                </p>
                {room.lastMessage && (
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatTime(room.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    'text-xs truncate',
                    room.unreadCount > 0 ? 'text-slate-700' : 'text-slate-400'
                  )}
                >
                  {room.lastMessage
                    ? `${room.lastMessage.isOwn ? 'You: ' : ''}${room.lastMessage.preview}`
                    : 'No messages yet'}
                </p>
                {room.unreadCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-coral-600 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {room.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
