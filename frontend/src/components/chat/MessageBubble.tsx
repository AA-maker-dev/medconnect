import { motion } from 'framer-motion';
import { Check, CheckCheck, FileText, Reply, Trash2, Pill } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ChatMessage } from '@/types/chat.types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function StatusTicks({ status }: { status: ChatMessage['status'] }) {
  if (status === 'SEEN') return <CheckCheck className="h-3.5 w-3.5 text-teal-300" />;
  if (status === 'DELIVERED') return <CheckCheck className="h-3.5 w-3.5 text-white/60" />;
  return <Check className="h-3.5 w-3.5 text-white/60" />;
}

export function MessageBubble({ message, isOwn, onReply, onDelete }: MessageBubbleProps) {
  if (message.isDeleted) {
    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="px-4 py-2.5 rounded-2xl bg-ivory-100 text-slate-400 text-sm italic">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className={cn('flex items-end gap-1.5 group', isOwn ? 'justify-end' : 'justify-start')}
    >
      {isOwn && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-fast mb-1">
          <button
            onClick={() => onReply(message)}
            aria-label="Reply"
            className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:text-teal-700 hover:bg-teal-100 transition-colors duration-fast"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(message.id)}
            aria-label="Delete message"
            className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:text-danger-600 hover:bg-danger-100 transition-colors duration-fast"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        className={cn(
          'max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm',
          isOwn
            ? 'bg-teal-700 text-white rounded-br-md'
            : 'bg-paper-0 border border-slate-100 text-slate-900 rounded-bl-md'
        )}
      >
        {message.replyTo && (
          <div
            className={cn(
              'border-l-2 pl-2.5 mb-2 py-0.5 text-xs rounded',
              isOwn ? 'border-white/40 text-white/70' : 'border-teal-500 text-slate-500'
            )}
          >
            {message.replyTo.isDeleted
              ? 'Original message deleted'
              : message.replyTo.type === 'TEXT'
              ? message.replyTo.content
              : `Sent ${message.replyTo.type.toLowerCase().replace('_', ' ')}`}
          </div>
        )}

        {message.type === 'TEXT' && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {message.type === 'IMAGE' && message.fileUrl && (
          <img
            src={message.fileUrl}
            alt={message.fileName ?? 'Shared image'}
            className="rounded-lg max-w-full max-h-64 object-cover"
          />
        )}

        {(message.type === 'PDF' || message.type === 'PRESCRIPTION') && message.fileUrl && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
              isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-ivory-100 hover:bg-ivory-100/70'
            )}
          >
            {message.type === 'PRESCRIPTION' ? (
              <Pill className="h-4 w-4 shrink-0" />
            ) : (
              <FileText className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{message.fileName ?? 'Attachment'}</span>
          </a>
        )}

        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOwn ? 'justify-end text-white/60' : 'justify-end text-slate-400'
          )}
        >
          <span className="text-[10px]">{formatTime(message.createdAt)}</span>
          {isOwn && <StatusTicks status={message.status} />}
        </div>
      </div>

      {!isOwn && (
        <button
          onClick={() => onReply(message)}
          aria-label="Reply"
          className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:text-teal-700 hover:bg-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-fast mb-1"
        >
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
