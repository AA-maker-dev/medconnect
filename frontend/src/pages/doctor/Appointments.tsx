import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Check, X, Video, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import { cn } from '@/utils/cn';
import * as doctorDashboardService from '@/services/doctorDashboard.service';
import type { AppointmentStatus } from '@/types/doctorDashboard.types';

type Tab = 'today' | 'upcoming' | 'requests' | 'history';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'requests', label: 'Requests' },
  { key: 'history', label: 'History' },
];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-600',
  APPROVED: 'bg-success-100 text-success-600',
  RESCHEDULED: 'bg-amber-100 text-amber-600',
  COMPLETED: 'bg-teal-100 text-teal-700',
  REJECTED: 'bg-danger-100 text-danger-600',
  CANCELLED: 'bg-slate-100 text-slate-500',
  NO_SHOW: 'bg-danger-100 text-danger-600',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function DoctorAppointmentsPage() {
  useSetPageTitle('Appointments');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('today');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'appointments', tab],
    queryFn: () => doctorDashboardService.fetchAppointments(tab, 1, 20),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      doctorDashboardService.updateAppointmentStatus(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'dashboard-summary'] });
      const messages: Partial<Record<AppointmentStatus, string>> = {
        APPROVED: 'Appointment approved.',
        REJECTED: 'Appointment declined.',
        COMPLETED: 'Appointment marked as completed.',
        CANCELLED: 'Appointment cancelled.',
      };
      showToast(messages[variables.status] ?? 'Appointment updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-100 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-3 text-sm font-semibold font-body border-b-2 -mb-px transition-colors duration-fast whitespace-nowrap',
              tab === t.key
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : data && data.items.length > 0 ? (
          data.items.map((appt) => (
            <div
              key={appt.id}
              className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 font-display text-lg flex items-center justify-center shrink-0">
                {appt.patient.firstName[0]}
                {appt.patient.lastName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-display text-base text-slate-900">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </p>
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                      STATUS_STYLES[appt.status]
                    )}
                  >
                    {appt.status}
                  </span>
                </div>
                {appt.reasonForVisit && (
                  <p className="text-sm text-slate-500 mb-2">{appt.reasonForVisit}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-4 w-4" />
                    {formatDate(appt.date)}, {appt.startTime}
                  </span>
                  <span className="flex items-center gap-1">
                    {appt.consultationType === 'VIDEO' ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    {appt.consultationType === 'VIDEO' ? 'Video call' : 'In-person'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {tab === 'requests' && (
                  <>
                    <Button
                      size="sm"
                      className="w-auto"
                      isLoading={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ id: appt.id, status: 'APPROVED' })}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-auto"
                      onClick={() => statusMutation.mutate({ id: appt.id, status: 'REJECTED' })}
                    >
                      <X className="h-4 w-4" /> Decline
                    </Button>
                  </>
                )}
                {(tab === 'today' || tab === 'upcoming') && appt.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-auto"
                    onClick={() => statusMutation.mutate({ id: appt.id, status: 'COMPLETED' })}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark completed
                  </Button>
                )}
                {tab === 'history' && appt.status === 'COMPLETED' && !appt.prescription && (
                  <Button size="sm" variant="ghost" className="w-auto">
                    <FileText className="h-4 w-4" /> Add prescription
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
            {tab === 'requests'
              ? 'No pending appointment requests.'
              : tab === 'today'
              ? 'No appointments scheduled for today.'
              : tab === 'upcoming'
              ? 'No upcoming appointments.'
              : 'No appointment history yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
