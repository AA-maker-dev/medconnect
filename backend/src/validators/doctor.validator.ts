import { z } from 'zod';

export const updateDoctorProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    bio: z.string().trim().max(2000).optional(),
    qualification: z.string().trim().min(1).optional(),
    experienceYears: z.coerce.number().int().min(0).max(70).optional(),
    consultationFee: z.coerce.number().min(0).optional(),
    languages: z.array(z.string().trim().min(1)).optional(),
    hospitalId: z.string().uuid().optional().nullable(),
    location: z.string().trim().max(255).optional(),
  }),
});

export const appointmentListQuerySchema = z.object({
  query: z.object({
    type: z.enum(['today', 'upcoming', 'requests', 'history', 'all']).optional().default('all'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
    cancellationReason: z.string().trim().max(500).optional(),
    // Required together when status === 'RESCHEDULED'
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
});

export const availabilitySlotSchema = z.object({
  body: z.object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24-hour format'),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24-hour format'),
    slotDurationMinutes: z.coerce.number().int().min(5).max(240).optional().default(30),
    isActive: z.coerce.boolean().optional().default(true),
  }),
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid(),
    diagnosis: z.string().trim().min(1, 'Diagnosis is required'),
    advice: z.string().trim().max(2000).optional(),
    medicines: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          dosage: z.string().trim().min(1),
          frequency: z.string().trim().min(1),
          durationDays: z.coerce.number().int().min(1).optional(),
          instructions: z.string().trim().max(500).optional(),
        })
      )
      .min(1, 'Add at least one medicine'),
  }),
});

export const revenueAnalyticsQuerySchema = z.object({
  query: z.object({
    months: z.coerce.number().int().min(1).max(24).optional().default(6),
  }),
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),
});
