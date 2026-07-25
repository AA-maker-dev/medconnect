import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle2, Star, BadgeCheck } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import { cn } from '@/utils/cn';
import * as adminDashboardService from '@/services/adminDashboard.service';
import type { DoctorVerificationStatus } from '@/types/adminDashboard.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_STYLES: Record<DoctorVerificationStatus, string> = {
  VERIFIED: 'bg-success-100 text-success-600',
  PENDING: 'bg-amber-100 text-amber-600',
  REJECTED: 'bg-danger-100 text-danger-600',
};

export default function AdminDoctorsPage() {
  useSetPageTitle('Manage Doctors');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'doctors', search, status, page],
    queryFn: () =>
      adminDashboardService.fetchDoctors(
        { search: search || undefined, status: (status || undefined) as DoctorVerificationStatus | undefined },
        page,
        10
      ),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminDashboardService.setDoctorActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      showToast('Doctor status updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or license..."
            className="h-11 w-full rounded-lg border border-slate-300 bg-paper-0 pl-10 pr-3.5 text-base font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto] gap-4 px-6 py-3 bg-ivory-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Doctor</span>
          <span>Specialization</span>
          <span>Rating</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : data && data.items.length > 0 ? (
            data.items.map((doctor) => (
              <div
                key={doctor.id}
                className="grid grid-cols-2 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto] gap-3 sm:gap-4 px-5 sm:px-6 py-4 items-center"
              >
                <div className="flex items-center gap-1.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{doctor.user.email}</p>
                  </div>
                  {doctor.verificationStatus === 'VERIFIED' && (
                    <BadgeCheck className="h-4 w-4 text-teal-600 shrink-0" />
                  )}
                </div>
                <span className="text-sm text-slate-600">{doctor.specialization.name}</span>
                <span className="flex items-center gap-1 text-sm text-slate-600">
                  <Star className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                  {Number(doctor.ratingAvg).toFixed(1)}
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold uppercase px-2 py-0.5 rounded-full w-fit',
                    STATUS_STYLES[doctor.verificationStatus]
                  )}
                >
                  {doctor.verificationStatus}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: doctor.id,
                        isActive: !doctor.user.isActive,
                      })
                    }
                    className={cn(
                      'h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-fast',
                      doctor.user.isActive
                        ? 'text-slate-400 hover:text-danger-600 hover:bg-danger-100'
                        : 'text-slate-400 hover:text-success-600 hover:bg-success-100'
                    )}
                    aria-label={doctor.user.isActive ? 'Deactivate doctor' : 'Activate doctor'}
                    title={doctor.user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {doctor.user.isActive ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-slate-500">No doctors found.</div>
          )}
        </div>

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
