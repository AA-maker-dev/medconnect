import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Check, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import type { PaymentGateway } from '@/types/payment.types';
import * as paymentService from '@/services/payment.service';
import * as patientService from '@/services/patient.service';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorName: string;
  consultationFee: number;
  onSuccess?: () => void;
}

export function PaymentModal({
  open,
  onClose,
  appointmentId,
  doctorName,
  consultationFee,
  onSuccess,
}: PaymentModalProps) {
  const { showToast } = useToast();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('ESEWA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ['patient', 'wallet'],
    queryFn: patientService.fetchWallet,
    enabled: open,
  });

  const walletBalance = Number(wallet?.balance ?? 0);
  const isWalletInsufficient = selectedGateway === 'WALLET' && walletBalance < consultationFee;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (selectedGateway === 'WALLET') {
        await paymentService.payWithWallet(appointmentId);
        showToast('Payment successful via Wallet!', 'success');
        onSuccess?.();
        onClose();
      } else {
        const initData = await paymentService.initiatePayment(appointmentId, selectedGateway);
        if (initData.gatewayUrl && initData.params) {
          // Construct and auto-submit form for gateway redirect
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = initData.gatewayUrl;

          Object.entries(initData.params).forEach(([key, val]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(val);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          showToast('Failed to initialize gateway session', 'error');
        }
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || err.message || 'Payment initiation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Complete Payment">
      <div className="flex flex-col gap-5">
        {/* Payment Summary */}
        <div className="rounded-lg bg-ivory-100 p-4 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Consultation Fee</p>
            <p className="text-sm font-medium text-slate-900">Dr. {doctorName}</p>
          </div>
          <span className="font-display text-xl text-teal-900">
            NPR {consultationFee.toLocaleString()}
          </span>
        </div>

        {/* Gateway Selection */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Payment Method
          </p>

          {/* eSewa Option */}
          <div
            onClick={() => setSelectedGateway('ESEWA')}
            className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
              selectedGateway === 'ESEWA'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs tracking-wider">
                eSewa
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">eSewa Wallet</p>
                <p className="text-xs text-slate-500">Pay securely via eSewa Portal</p>
              </div>
            </div>
            <div
              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                selectedGateway === 'ESEWA' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
              }`}
            >
              {selectedGateway === 'ESEWA' && <Check className="h-3 w-3" />}
            </div>
          </div>

          {/* FonePay Option */}
          <div
            onClick={() => setSelectedGateway('FONEPAY')}
            className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
              selectedGateway === 'FONEPAY'
                ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-rose-600 text-white font-bold flex items-center justify-center text-xs tracking-wider">
                FonePay
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">FonePay / Mobile Banking</p>
                <p className="text-xs text-slate-500">Pay via QR code or direct banking</p>
              </div>
            </div>
            <div
              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                selectedGateway === 'FONEPAY' ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'
              }`}
            >
              {selectedGateway === 'FONEPAY' && <Check className="h-3 w-3" />}
            </div>
          </div>

          {/* MedConnect Wallet Option */}
          <div
            onClick={() => setSelectedGateway('WALLET')}
            className={`p-3.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
              selectedGateway === 'WALLET'
                ? 'border-teal-700 bg-teal-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-teal-800 text-white flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">MedConnect Wallet</p>
                <p className="text-xs text-slate-500">
                  Balance: <span className="font-semibold text-teal-900">NPR {walletBalance.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div
              className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                selectedGateway === 'WALLET' ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300'
              }`}
            >
              {selectedGateway === 'WALLET' && <Check className="h-3 w-3" />}
            </div>
          </div>
        </div>

        {/* Insufficient balance warning */}
        {isWalletInsufficient && (
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Your wallet balance (NPR {walletBalance.toLocaleString()}) is lower than the fee. Please choose eSewa or FonePay, or top up your wallet first.
            </span>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center gap-1.5 justify-center text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
          <span>256-Bit Encrypted Secure Payment</span>
        </div>

        {/* Action Button */}
        <Button
          disabled={isSubmitting || isWalletInsufficient}
          onClick={handleSubmit}
          className="w-full h-11"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </span>
          ) : (
            `Pay NPR ${consultationFee.toLocaleString()} via ${selectedGateway}`
          )}
        </Button>
      </div>
    </Dialog>
  );
}
