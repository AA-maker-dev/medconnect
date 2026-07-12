import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/[0-9]/, 'Needs a number');

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerPatientFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Required'),
    lastName: z.string().trim().min(1, 'Required'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    phone: z.string().trim().optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterPatientFormValues = z.infer<typeof registerPatientFormSchema>;

export const registerDoctorFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Required'),
    lastName: z.string().trim().min(1, 'Required'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    phone: z.string().trim().optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
    specializationId: z.string().min(1, 'Select a specialization'),
    qualification: z.string().trim().min(1, 'Required'),
    experienceYears: z.coerce.number().int().min(0).max(70),
    consultationFee: z.coerce.number().min(0, 'Enter a valid fee'),
    licenseNumber: z.string().trim().min(1, 'Required'),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms to continue' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterDoctorFormValues = z.infer<typeof registerDoctorFormSchema>;

export const otpFormSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
});
export type OtpFormValues = z.infer<typeof otpFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
