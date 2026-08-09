import { api } from './api';
import type { ApiResponse } from '@/types/auth.types';
import type { PaymentGateway, InitiatePaymentResponse, WalletTopUpResponse } from '@/types/payment.types';

export async function initiatePayment(appointmentId: string, gateway: PaymentGateway) {
  const { data } = await api.post<ApiResponse<InitiatePaymentResponse>>('/payments/initiate', {
    appointmentId,
    gateway,
  });
  return data.data;
}

export async function verifyEsewaPayment(dataPayload: string) {
  const { data } = await api.get<ApiResponse<any>>('/payments/esewa/verify', {
    params: { data: dataPayload },
  });
  return data.data;
}

export async function verifyFonepayPayment(params: Record<string, any>) {
  const { data } = await api.get<ApiResponse<any>>('/payments/fonepay/verify', {
    params,
  });
  return data.data;
}

export async function payWithWallet(appointmentId: string) {
  const { data } = await api.post<ApiResponse<InitiatePaymentResponse>>('/payments/wallet/pay', {
    appointmentId,
  });
  return data.data;
}

export async function topUpWallet(amount: number, gateway: PaymentGateway = 'WALLET') {
  const { data } = await api.post<ApiResponse<WalletTopUpResponse>>('/payments/wallet/topup', {
    amount,
    gateway,
  });
  return data.data;
}
