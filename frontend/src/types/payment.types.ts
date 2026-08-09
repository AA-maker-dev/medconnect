export type PaymentGateway = 'ESEWA' | 'FONEPAY' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface InitiatePaymentResponse {
  gateway: PaymentGateway;
  gatewayUrl?: string;
  params?: Record<string, string>;
  success?: boolean;
  payment?: any;
  invoice?: any;
  remainingBalance?: number;
}

export interface WalletTopUpResponse {
  success: boolean;
  balance: number;
  transaction: {
    id: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    reason: string;
    createdAt: string;
  };
}
