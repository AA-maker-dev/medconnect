import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Bell, CheckCheck } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import { cn } from '@/utils/cn';
import * as adminDashboardService from '@/services/adminDashboard.service';

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'Everyone (patients + doctors)' },
  { value: 'PATIENT', label: 'Patients only' },
  { value: 'DOCTOR', label: 'Doctors only' },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminNotificationsPage() {
  useSetPageTitle('Manage Notifications');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState<'PATIENT' | 'DOCTOR' | 'ALL'>('ALL');

  const { data: inbox, isLoading: inboxLoading } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => adminDashboardService.fetchNotifications(1, 20),
  });

  const broadcastMutation = useMutation({
    mutationFn: () => adminDashboardService.broadcastNotification(title, body, targetRole),
    onSuccess: (result) => {
      setTitle('');
      setBody('');
      showToast(`Sent to ${result.sentTo} user${result.sentTo !== 1 ? 's' : ''}.`, 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminDashboardService.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: adminDashboardService.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  const hasUnread = inbox?.items.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Send className="h-5 w-5 text-teal-700" />
          <h3 className="font-display text-lg text-slate-900">Broadcast a notification</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) {
              showToast('Title and message are required.', 'error');
              return;
            }
            broadcastMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scheduled maintenance tonight"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 font-body">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Keep it short and clear — this appears in every recipient's notification bell."
            />
          </div>
          <Select
            label="Send to"
            options={TARGET_OPTIONS}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as 'PATIENT' | 'DOCTOR' | 'ALL')}
          />
          <Button
            type="submit"
            isLoading={broadcastMutation.isPending}
            className="w-auto self-start"
          >
            <Send className="h-4 w-4" /> Send notification
          </Button>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-700" /> Your inbox
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="w-auto"
            disabled={!hasUnread}
            isLoading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        </div>

        <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm divide-y divide-slate-100">
          {inboxLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4">
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : inbox && inbox.items.length > 0 ? (
            inbox.items.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                className={cn(
                  'w-full text-left px-5 sm:px-6 py-4 transition-colors duration-fast',
                  !n.isRead ? 'bg-teal-100/30 hover:bg-teal-100/50' : 'hover:bg-ivory-100'
                )}
              >
                <p className={cn('text-sm', !n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700')}>
                  {n.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-slate-400 mt-1.5">{formatDateTime(n.createdAt)}</p>
              </button>
            ))
          ) : (
            <div className="px-5 sm:px-6 py-10 text-center text-slate-500">No notifications yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
