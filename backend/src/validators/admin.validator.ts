import { z } from 'zod';

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const listPatientsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const listDoctorsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const verifyDoctorSchema = z.object({
  body: z
    .object({
      status: z.enum(['VERIFIED', 'REJECTED']),
      rejectionReason: z.string().trim().max(500).optional(),
    })
    .refine((data) => data.status !== 'REJECTED' || Boolean(data.rejectionReason), {
      message: 'A reason is required when rejecting a doctor',
      path: ['rejectionReason'],
    }),
});

export const toggleActiveSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const listAppointmentsQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(['PENDING', 'APPROVED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
      .optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const listPaymentsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']).optional(),
    gateway: z.enum(['ESEWA', 'FONEPAY', 'WALLET']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const refundPaymentSchema = z.object({
  body: z.object({
    refundAmount: z.coerce.number().min(0.01).optional(),
  }),
});

export const listReviewsQuerySchema = z.object({
  query: z.object({
    visible: z.coerce.boolean().optional(),
    minRating: z.coerce.number().int().min(1).max(5).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const toggleReviewVisibilitySchema = z.object({
  body: z.object({
    isVisible: z.boolean(),
  }),
});

export const analyticsQuerySchema = z.object({
  query: z.object({
    months: z.coerce.number().int().min(1).max(24).optional().default(6),
  }),
});

export const reportQuerySchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(150),
    body: z.string().trim().min(1, 'Message body is required').max(1000),
    targetRole: z.enum(['PATIENT', 'DOCTOR', 'ALL']).optional().default('ALL'),
  }),
});

export const updateAdminProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    avatarUrl: z.string().url().optional().nullable(),
  }),
});
