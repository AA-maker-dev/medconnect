import crypto from 'crypto';

/** 6-digit numeric OTP for email/phone verification. */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}
 
export function otpExpiry(minutes = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/** URL-safe token for password reset links. */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function resetTokenExpiry(minutes = 30): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
