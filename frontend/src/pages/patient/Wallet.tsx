import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from 'lucide-react';
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

export default function WalletPage() {
  useSetPageTitle('Wallet');

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['patient', 'wallet'],
    queryFn: patientService.fetchWallet,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg bg-teal-900 p-6 sm:p-8 text-ivory-50 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-coral-500/20 blur-3xl"
        />
        <div className="flex items-center gap-3 mb-3 relative">
          <WalletIcon className="h-6 w-6 text-coral-500" />
          <span className="text-sm text-ivory-100/70 font-body">Wallet balance</span>
        </div>
        <p className="font-display text-4xl relative">
          {isLoading ? (
            <Skeleton className="h-10 w-40 bg-ivory-50/10" />
          ) : (
            `NPR ${Number(wallet?.balance ?? 0).toLocaleString()}`
          )}
        </p>
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-display text-lg text-slate-900">Transaction history</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4">
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : wallet && wallet.transactions.length > 0 ? (
            wallet.transactions.map((txn) => (
              <div
                key={txn.id}
                className="px-5 sm:px-6 py-4 flex items-center gap-4"
              >
                <div
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                    txn.type === 'CREDIT'
                      ? 'bg-success-100 text-success-600'
                      : 'bg-danger-100 text-danger-600'
                  )}
                >
                  {txn.type === 'CREDIT' ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{txn.reason}</p>
                  <p className="text-xs text-slate-500">{formatDate(txn.createdAt)}</p>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold shrink-0',
                    txn.type === 'CREDIT' ? 'text-success-600' : 'text-danger-600'
                  )}
                >
                  {txn.type === 'CREDIT' ? '+' : '-'}NPR {Number(txn.amount).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 sm:px-6 py-10 text-center text-slate-500">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
