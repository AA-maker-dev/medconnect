import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Paperclip, Send, Smile, X, FileText } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import type { ChatMessage } from '@/types/chat.types';

interface ChatInputProps {
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  onSendText: (content: string, replyToId?: string) => void;
  onSendFile: (file: File, replyToId?: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  isUploading: boolean;
}

export function ChatInput({
  replyTo,
  onCancelReply,
  onSendText,
  onSendFile,
  onTyping,
  onStopTyping,
  isUploading,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed, replyTo?.id);
    setText('');
    onStopTyping();
    onCancelReply();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file, replyTo?.id);
      onCancelReply();
    }
    e.target.value = '';
  };

  return (
    <div className="border-t border-slate-100 bg-paper-0 p-3 sm:p-4">
      {replyTo && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-ivory-100 px-3 py-2 mb-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-teal-700">Replying to</p>
            <p className="text-sm text-slate-600 truncate">
              {replyTo.type === 'TEXT' ? replyTo.content : `${replyTo.type} attachment`}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            onClick={() => setEmojiOpen((v) => !v)}
            aria-label="Add emoji"
            className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-ivory-100 hover:text-teal-700 transition-colors duration-fast shrink-0"
          >
            <Smile className="h-5 w-5" />
          </button>
          <EmojiPicker
            open={emojiOpen}
            onClose={() => setEmojiOpen(false)}
            onSelect={(emoji) => {
              setText((t) => t + emoji);
              textareaRef.current?.focus();
            }}
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Attach file"
          className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-ivory-100 hover:text-teal-700 transition-colors duration-fast shrink-0 disabled:opacity-50"
        >
          {isUploading ? (
            <FileText className="h-5 w-5 animate-pulse" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onBlur={onStopTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-slate-300 bg-ivory-50 px-4 py-2.5 text-sm text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 max-h-32"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Send message"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-teal-700 text-white hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-fast shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
