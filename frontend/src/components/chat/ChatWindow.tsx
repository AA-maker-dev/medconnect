import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, X, Loader2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as chatService from '@/services/chat.service';
import { MessageBubble } from './MessageBubble';
import { DateSeparator, shouldShowDateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '@/types/chat.types';

function messageTypeForFile(mimeType: string): 'IMAGE' | 'PDF' {
  return mimeType.startsWith('image/') ? 'IMAGE' : 'PDF';
}

interface ChatWindowProps {
  roomId: string;
  onBack?: () => void;
}

export function ChatWindow({ roomId, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
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
  } = useChat(roomId);

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isLoading) return;
    if (isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      isFirstLoad.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    isFirstLoad.current = true;
    setReplyTo(null);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
  }, [roomId]);

  const runSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const result = await chatService.fetchMessages(roomId, 1, 50, query.trim());
      setSearchResults(result.items);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendText = (content: string, replyToId?: string) => {
    sendMessage({ type: 'TEXT', content, replyToId });
  };

  const handleSendFile = async (file: File, replyToId?: string) => {
    setIsUploading(true);
    try {
      const uploaded = await chatService.uploadChatFile(roomId, file);
      sendMessage({
        type: messageTypeForFile(uploaded.mimeType),
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        replyToId,
      });
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not upload file'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (messageId: string) => {
    deleteMessage(messageId);
  };

  const displayedMessages = searchResults ?? messages;

  return (
    <div className="flex flex-col h-full bg-ivory-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-paper-0 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to conversations"
            className="h-9 w-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-ivory-100 lg:hidden shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {membership ? (
          <>
            <div className="relative shrink-0">
              {membership.otherAvatarUrl ? (
                <img
                  src={membership.otherAvatarUrl}
                  alt={membership.otherName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 font-display flex items-center justify-center">
                  {membership.otherName.replace('Dr. ', '')[0]}
                </div>
              )}
              {otherOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success-600 border-2 border-paper-0" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{membership.otherName}</p>
              <p className="text-xs text-slate-400">
                {otherTyping ? (
                  <span className="text-teal-700 font-medium">typing...</span>
                ) : otherOnline ? (
                  'Online'
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}

        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search messages"
          className="h-9 w-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-ivory-100 shrink-0"
        >
          {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {searchOpen && (
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-paper-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                runSearch(e.target.value);
              }}
              placeholder="Search in this conversation..."
              className="w-full h-9 rounded-lg border border-slate-300 bg-ivory-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          {isSearching && <p className="text-xs text-slate-400 mt-1.5">Searching...</p>}
          {!isSearching && searchResults && (
            <p className="text-xs text-slate-400 mt-1.5">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-teal-700 animate-spin" />
          </div>
        ) : (
          <>
            {!searchResults && hasMore && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={loadOlderMessages}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  Load earlier messages
                </button>
              </div>
            )}

            {displayedMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                {searchResults ? 'No messages match your search.' : 'Say hello 👋'}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {displayedMessages.map((message, i) => {
                  const previous = displayedMessages[i - 1];
                  return (
                    <div key={message.id}>
                      {shouldShowDateSeparator(message.createdAt, previous?.createdAt ?? null) && (
                        <DateSeparator iso={message.createdAt} />
                      )}
                      <MessageBubble
                        message={message}
                        isOwn={message.senderId === user?.id}
                        onReply={setReplyTo}
                        onDelete={handleDelete}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {otherTyping && (
              <div className="mt-2">
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      <ChatInput
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSendText={handleSendText}
        onSendFile={handleSendFile}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        isUploading={isUploading}
      />
    </div>
  );
}
