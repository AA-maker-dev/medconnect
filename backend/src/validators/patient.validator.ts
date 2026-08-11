import { z } from 'zod';

export const updatePatientProfileSchema = z.object({
  body: z.object({ 
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    bloodGroup: z.string().trim().max(10).optional(),
    address: z.string().trim().max(255).optional(),
    city: z.string().trim().max(100).optional(),
    emergencyContactName: z.string().trim().max(120).optional(),
    emergencyContactPhone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    allergies: z.string().trim().max(1000).optional(),
    chronicConditions: z.string().trim().max(1000).optional(),
  }),
});

export const listAppointmentsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['upcoming', 'past', 'all']).optional().default('all'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),
});

export const createMedicalHistorySchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().max(2000).optional(),
    fileUrl: z.string().url().optional(),
  }),
});

export const addFavoriteDoctorSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('Invalid doctor id'),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    appointmentId: z.string().uuid('Invalid appointment id'),
    doctorId: z.string().uuid('Invalid doctor id'),
    rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
    comment: z.string().trim().max(1000).optional().nullable(),
  }),
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),
});
