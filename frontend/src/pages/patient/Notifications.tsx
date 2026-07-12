import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CalendarCheck,
  MessageSquare,
  FileText,
  CreditCard,
  Star,
  ShieldCheck,
  Info,
  CheckCheck,
} from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import * as patientService from '@/services/patient.service';
import type { NotificationType } from '@/types/patient.types';

const ICON_MAP: Record<NotificationType, typeof Bell> = {
  APPOINTMENT_APPROVED: CalendarCheck,
  APPOINTMENT_REJECTED: CalendarCheck,
  APPOINTMENT_CANCELLED: CalendarCheck,
  APPOINTMENT_RESCHEDULED: CalendarCheck,
  APPOINTMENT_REMINDER: CalendarCheck,
  NEW_MESSAGE: MessageSquare,
  PRESCRIPTION_UPLOADED: FileText,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_FAILED: CreditCard,
  REVIEW_RECEIVED: Star,
  DOCTOR_VERIFIED: ShieldCheck,
  SYSTEM: Info,
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  useSetPageTitle('Notifications');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['patient', 'notifications'],
    queryFn: () => patientService.fetchNotifications(1, 30),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => patientService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['patient', 'dashboard-summary'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: patientService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['patient', 'dashboard-summary'] });
    },
  });

  const hasUnread = data?.items.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 sm:px-6 py-4">
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : data && data.items.length > 0 ? (
          data.items.map((notification) => {
            const Icon = ICON_MAP[notification.type] ?? Bell;
            return (
              <button
                key={notification.id}
                onClick={() =>
                  !notification.isRead && markReadMutation.mutate(notification.id)
                }
                className={cn(
                  'w-full flex items-start gap-4 px-5 sm:px-6 py-4 text-left transition-colors duration-fast',
                  !notification.isRead ? 'bg-teal-100/30 hover:bg-teal-100/50' : 'hover:bg-ivory-100'
                )}
              >
                <div
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                    !notification.isRead ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm',
                      !notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'
                    )}
                  >
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{notification.body}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="h-2 w-2 rounded-full bg-coral-600 mt-2 shrink-0" />
                )}
              </button>
            );
          })
        ) : (
          <div className="px-5 sm:px-6 py-10 text-center text-slate-500">
            You're all caught up — no notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
