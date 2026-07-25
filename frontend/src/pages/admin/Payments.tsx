import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, CreditCard } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import { cn } from '@/utils/cn';
import * as adminDashboardService from '@/services/adminDashboard.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-success-100 text-success-600',
  PENDING: 'bg-amber-100 text-amber-600',
  FAILED: 'bg-danger-100 text-danger-600',
  REFUNDED: 'bg-slate-100 text-slate-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminPaymentsPage() {
  useSetPageTitle('Payments');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', status, page],
    queryFn: () => adminDashboardService.fetchPayments({ status: status || undefined }, page, 10),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => adminDashboardService.refundPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      showToast('Payment refunded.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
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
        <div className="hidden sm:grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto] gap-4 px-6 py-3 bg-ivory-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Patient / Doctor</span>
          <span>Date</span>
          <span>Gateway</span>
          <span>Amount</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : data && data.items.length > 0 ? (
            data.items.map((payment) => (
              <div
                key={payment.id}
                className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto] gap-3 sm:gap-4 px-5 sm:px-6 py-4 items-center"
              >
                <div>
                  <p className="text-sm text-slate-900">
                    {payment.appointment.patient.firstName} {payment.appointment.patient.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Dr. {payment.appointment.doctor.firstName} {payment.appointment.doctor.lastName}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{formatDate(payment.createdAt)}</span>
                <span className="flex items-center gap-1 text-sm text-slate-600">
                  <CreditCard className="h-3.5 w-3.5" />
                  {payment.gateway}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  NPR {Number(payment.amount).toLocaleString()}
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold uppercase px-2 py-0.5 rounded-full w-fit',
                    STATUS_STYLES[payment.status]
                  )}
                >
                  {payment.status}
                </span>
                <div className="flex justify-end">
                  {payment.status === 'SUCCESS' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-auto"
                      isLoading={refundMutation.isPending}
                      onClick={() => refundMutation.mutate(payment.id)}
                    >
                      <RotateCcw className="h-4 w-4" /> Refund
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-slate-500">No payments found.</div>
          )}
        </div>

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
