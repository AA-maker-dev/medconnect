import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatRooms } from '@/hooks/useChatRooms';

export default function PatientMessagesPage() {
  useSetPageTitle('Messages');
  const { rooms, isLoading, onlineUserIds } = useChatRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden h-[calc(100vh-9rem)]">
      <div className="grid lg:grid-cols-[320px_1fr] h-full">
        <div
          className={`border-r border-slate-100 overflow-y-auto ${selectedRoomId ? 'hidden lg:block' : 'block'}`}
        >
          {isLoading ? (
            <div className="p-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <ChatRoomList
              rooms={rooms}
              activeRoomId={selectedRoomId}
              onlineUserIds={onlineUserIds}
              onSelectRoom={setSelectedRoomId}
            />
          )}
        </div>

        <div className={selectedRoomId ? 'block' : 'hidden lg:flex'}>
          {selectedRoomId ? (
            <ChatWindow roomId={selectedRoomId} onBack={() => setSelectedRoomId(null)} />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <MessageSquare className="h-10 w-10" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
