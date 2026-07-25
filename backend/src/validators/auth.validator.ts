import { z } from 'zod';

const passwordSchema = z
  .string() 
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number')
  .optional();

export const registerPatientSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(1, 'First name is required'),
      lastName: z.string().trim().min(1, 'Last name is required'),
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
      confirmPassword: z.string(),
      dateOfBirth: z.string().optional(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const registerDoctorSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(1, 'First name is required'),
      lastName: z.string().trim().min(1, 'Last name is required'),
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
      confirmPassword: z.string(),
      specializationId: z.string().uuid('Select a specialization'),
      qualification: z.string().trim().min(1, 'Qualification is required'),
      experienceYears: z.coerce.number().int().min(0).max(70),
      consultationFee: z.coerce.number().min(0),
      licenseNumber: z.string().trim().min(1, 'License number is required'),
      hospitalId: z.string().uuid().optional(),
      bio: z.string().max(2000).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  }),
});

export const adminLoginSchema = loginSchema;

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(), // may also arrive via httpOnly cookie
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, 'Reset token is required'),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});
