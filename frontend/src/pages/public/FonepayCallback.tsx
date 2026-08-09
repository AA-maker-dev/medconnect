import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import * as paymentService from '@/services/payment.service';

export default function FonepayCallbackPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });

    if (Object.keys(params).length === 0) {
      setError('No query parameters received from FonePay redirect.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function verify() {
      try {
        const res = await paymentService.verifyFonepayPayment(params);
        if (isMounted) {
          setPaymentData(res);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || 'FonePay verification failed');
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <div className="rounded-xl border border-slate-100 bg-paper-0 shadow-sm p-8 text-center">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-rose-600 animate-spin" />
            <h2 className="font-display text-xl text-slate-900">Verifying FonePay Payment</h2>
            <p className="text-sm text-slate-500">Please wait while we confirm your transaction...</p>
          </div>
        ) : error ? (
          <div className="py-6 flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-danger-100 text-danger-600 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <h2 className="font-display text-xl text-slate-900 mb-2">Payment Unsuccessful</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">{error}</p>
            <div className="flex gap-3">
              <Link to="/patient/appointments">
                <Button variant="outline">My Appointments</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl text-slate-900 mb-2">Payment Completed!</h2>
            <p className="text-sm text-slate-500 mb-6">
              Your appointment payment via FonePay was verified successfully.
            </p>

            {paymentData?.invoice && (
              <div className="w-full rounded-lg bg-ivory-100 p-4 mb-6 text-left flex items-center justify-between border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Reference</p>
                  <p className="text-sm font-mono font-medium text-slate-900">
                    {paymentData.invoice.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid Amount</p>
                  <p className="text-sm font-bold text-teal-900">
                    NPR {Number(paymentData.invoice.total).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link to="/patient/invoices">
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> View Invoice
                </Button>
              </Link>
              <Link to="/patient/appointments">
                <Button className="w-full sm:w-auto flex items-center gap-2">
                  Go to Appointments <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
