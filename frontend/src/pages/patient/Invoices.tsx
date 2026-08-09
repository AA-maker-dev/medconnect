import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Receipt, Eye, Printer } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
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
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['patient', 'invoices'],
    queryFn: patientService.fetchInvoices,
  });

  const handlePrint = () => {
    window.print();
  };

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
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-ivory-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Invoice</span>
          <span>Doctor</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Actions</span>
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
                      'text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full hidden sm:inline-block',
                      PAYMENT_STATUS_STYLES[invoice.payment.status] ?? 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {invoice.payment.status}
                  </span>
                )}

                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-teal-700 hover:bg-teal-50 transition-colors"
                  title="View Receipt"
                >
                  <Eye className="h-4 w-4" />
                </button>

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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onClose={() => setSelectedInvoice(null)} title="Invoice Receipt">
          <div className="flex flex-col gap-6" id="printable-receipt">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
              <div>
                <h3 className="font-display text-xl text-teal-900">MedConnect Clinic</h3>
                <p className="text-xs text-slate-500">Official Payment Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900 block">
                  {selectedInvoice.invoiceNumber}
                </span>
                <span className="text-xs text-slate-500 block">{formatDate(selectedInvoice.createdAt)}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="rounded-lg bg-ivory-100 p-4 border border-slate-100 flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor</span>
                <span className="font-semibold text-slate-900">
                  Dr. {selectedInvoice.appointment.doctor.firstName} {selectedInvoice.appointment.doctor.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway</span>
                <span className="font-semibold text-slate-900">
                  {selectedInvoice.payment?.gateway ?? 'DIRECT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-semibold uppercase text-emerald-700">
                  {selectedInvoice.payment?.status ?? 'SUCCESS'}
                </span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Consultation Subtotal</span>
                <span className="font-medium text-slate-900">
                  NPR {Number(selectedInvoice.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Taxes & Fees</span>
                <span className="font-medium text-slate-900">NPR {Number(selectedInvoice.tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold text-teal-900">
                <span>Total Amount Paid</span>
                <span>NPR {Number(selectedInvoice.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
