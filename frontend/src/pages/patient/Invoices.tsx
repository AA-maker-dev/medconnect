import { useQuery } from '@tanstack/react-query';
import { Download, Receipt } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { cn } from '@/utils/cn';
import * as patientService from '@/services/patient.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-success-100 text-success-600',
  PENDING: 'bg-amber-100 text-amber-600',
  FAILED: 'bg-danger-100 text-danger-600',
  REFUNDED: 'bg-slate-100 text-slate-500',
};

export default function InvoicesPage() {
  useSetPageTitle('Invoices');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['patient', 'invoices'],
    queryFn: patientService.fetchInvoices,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
        No invoices yet. They'll appear here after you pay for an appointment.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-ivory-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Invoice</span>
        <span>Doctor</span>
        <span>Date</span>
        <span>Amount</span>
        <span></span>
      </div>
      <div className="divide-y divide-slate-100">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 sm:gap-4 px-5 sm:px-6 py-4 items-center"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-slate-900 font-mono">
              <Receipt className="h-4 w-4 text-slate-400 shrink-0" />
              {invoice.invoiceNumber}
            </span>
            <span className="text-sm text-slate-700 truncate">
              Dr. {invoice.appointment.doctor.firstName} {invoice.appointment.doctor.lastName}
            </span>
            <span className="text-sm text-slate-500">{formatDate(invoice.createdAt)}</span>
            <span className="text-sm font-semibold text-slate-900">
              NPR {Number(invoice.total).toLocaleString()}
            </span>
            <div className="flex items-center gap-2 justify-end">
              {invoice.payment && (
                <span
                  className={cn(
                    'text-xs font-semibold uppercase px-2 py-0.5 rounded-full hidden sm:inline-block',
                    PAYMENT_STATUS_STYLES[invoice.payment.status] ?? 'bg-slate-100 text-slate-500'
                  )}
                >
                  {invoice.payment.status}
                </span>
              )}
              {invoice.pdfUrl ? (
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download invoice"
                  className="h-8 w-8 flex items-center justify-center rounded-md text-teal-700 hover:bg-teal-100 transition-colors duration-fast"
                >
                  <Download className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
