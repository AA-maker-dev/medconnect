import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Video, MapPin } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils/cn';
import * as adminDashboardService from '@/services/adminDashboard.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
  { value: 'NO_SHOW', label: 'No-show' },
];

const STATUS_STYLES: Record<string, string> = {
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminAppointmentsPage() {
  useSetPageTitle('Appointments');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments', status, page],
    queryFn: () => adminDashboardService.fetchAppointments({ status: status || undefined }, page, 10),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full sm:w-56">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr] gap-4 px-6 py-3 bg-ivory-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Date</span>
          <span>Type</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : data && data.items.length > 0 ? (
            data.items.map((appt) => (
              <div
                key={appt.id}
                className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr] gap-3 sm:gap-4 px-5 sm:px-6 py-4 items-center"
              >
                <span className="text-sm text-slate-900">
                  {appt.patient.firstName} {appt.patient.lastName}
                </span>
                <span className="text-sm text-slate-600">
                  Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDate(appt.date)}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  {appt.consultationType === 'VIDEO' ? (
                    <Video className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  {appt.consultationType === 'VIDEO' ? 'Video' : 'In-person'}
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold uppercase px-2 py-0.5 rounded-full w-fit',
                    STATUS_STYLES[appt.status] ?? 'bg-slate-100 text-slate-500'
                  )}
                >
                  {appt.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-slate-500">No appointments found.</div>
          )}
        </div>

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
