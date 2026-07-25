import { z } from 'zod';

export const recommendedDoctorsQuerySchema = z.object({
  query: z.object({
    diseaseId: z.string().uuid('Select a valid disease'),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }), 
});

export const availableSlotsQuerySchema = z.object({
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  }),
});

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('Select a doctor'),
    diseaseId: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24-hour format'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24-hour format'),
    consultationType: z.enum(['IN_PERSON', 'VIDEO']).optional().default('IN_PERSON'),
    reasonForVisit: z.string().trim().max(500).optional(),
  }),
});
