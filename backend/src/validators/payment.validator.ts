import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid('Valid appointment ID is required'),
    gateway: z.enum(['ESEWA', 'FONEPAY', 'WALLET']),
  }),
});

export const verifyEsewaSchema = z.object({
  query: z.object({
    data: z.string().min(1, 'Payment data payload is required'),
  }),
});

export const verifyFonepaySchema = z.object({
  query: z.object({
    PRN: z.string().optional(),
    PID: z.string().optional(),
    PS: z.string().optional(),
    RC: z.string().optional(),
    UID: z.string().optional(),
    BC: z.string().optional(),
    INI: z.string().optional(),
    P_AMT: z.string().optional(),
    R_AMT: z.string().optional(),
    DV: z.string().optional(),
  }),
});

export const payWithWalletSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid('Valid appointment ID is required'),
  }),
});

export const topUpWalletSchema = z.object({
  body: z.object({
    amount: z.number().min(10, 'Minimum top-up amount is NPR 10').max(100000, 'Maximum top-up amount is NPR 100,000'),
    gateway: z.enum(['ESEWA', 'FONEPAY', 'WALLET']).optional().default('WALLET'),
  }),
});
