import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import { cn } from '@/utils/cn';
import * as adminDashboardService from '@/services/adminDashboard.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminPatientsPage() {
  useSetPageTitle('Manage Patients');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'patients', search, page],
    queryFn: () => adminDashboardService.fetchPatients(search, page, 10),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminDashboardService.setPatientActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      showToast('Patient status updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email..."
          className="h-11 w-full rounded-lg border border-slate-300 bg-paper-0 pl-10 pr-3.5 text-base font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-ivory-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Patient</span>
          <span>City</span>
          <span>Appointments</span>
          <span>Joined</span>
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
            data.items.map((patient) => (
              <div
                key={patient.id}
                className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 sm:gap-4 px-5 sm:px-6 py-4 items-center"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{patient.user.email}</p>
                </div>
                <span className="text-sm text-slate-600">{patient.city ?? '—'}</span>
                <span className="text-sm text-slate-600">{patient._count.appointments}</span>
                <span className="text-sm text-slate-500">{formatDate(patient.createdAt)}</span>
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase px-2 py-0.5 rounded-full hidden sm:inline-block',
                      patient.user.isActive
                        ? 'bg-success-100 text-success-600'
                        : 'bg-danger-100 text-danger-600'
                    )}
                  >
                    {patient.user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                  <button
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: patient.id,
                        isActive: !patient.user.isActive,
                      })
                    }
                    className={cn(
                      'h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-fast',
                      patient.user.isActive
                        ? 'text-slate-400 hover:text-danger-600 hover:bg-danger-100'
                        : 'text-slate-400 hover:text-success-600 hover:bg-success-100'
                    )}
                    aria-label={patient.user.isActive ? 'Deactivate patient' : 'Activate patient'}
                  >
                    {patient.user.isActive ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-slate-500">No patients found.</div>
          )}
        </div>

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
