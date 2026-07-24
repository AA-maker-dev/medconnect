import rateLimit from 'express-rate-limit';;
import { env } from '../config/env';

/** General API rate limit. */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/**
 * Stricter limit for login/register/otp/reset endpoints — these are the
 * targets of credential-stuffing and brute-force attacks, so they get a
 * much tighter window than general API traffic.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a few minutes.',
  },
});

/** Even stricter for OTP resend — prevents email/SMS bombing. */
export const otpResendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait a few minutes before retrying.',
  },
});
