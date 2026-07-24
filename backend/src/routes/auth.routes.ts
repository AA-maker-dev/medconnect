import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authLimiter, otpResendLimiter } from '../middleware/rateLimiter';
import {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  adminLoginSchema,
  refreshTokenSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// ---- Registration ----
router.post(
  '/register/patient',
  authLimiter,
  validate(registerPatientSchema),
  authController.registerPatient
);
router.post(
  '/register/doctor',
  authLimiter,
  validate(registerDoctorSchema),
  authController.registerDoctor
);

// ---- Login ----
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post(
  '/admin/login',
  authLimiter,
  validate(adminLoginSchema),
  authController.adminLogin
);

// ---- Token lifecycle ----
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticate, authController.logoutAllDevices);

// ---- Email / OTP verification ----
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post(
  '/resend-otp',
  otpResendLimiter,
  validate(resendOtpSchema),
  authController.resendOtp
);

// ---- Password reset ----
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

// ---- Current session ----
router.get('/me', authenticate, authController.me);

export default router;
