import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import * as authService from '../services/auth.service';;

const REFRESH_COOKIE_NAME = 'medconnect_refresh_token';

function deviceContext(req: Request) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

/**
 * Refresh tokens are set as httpOnly cookies (immune to XSS-based theft)
 * AND returned in the JSON body (for native-app / non-browser clients
 * that can't rely on cookies). The frontend web client should prefer the
 * cookie and never persist the body value to localStorage.
 */
function setRefreshCookie(res: Response, token: string, rememberMe: boolean) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.IS_PROD,
    sameSite: 'lax',
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

export const registerPatient = asyncHandler(async (req, res) => {
  const user = await authService.registerPatient(req.body);
  sendSuccess(res, 201, 'Registration successful. Check your email for a verification code.', user);
});

export const registerDoctor = asyncHandler(async (req, res) => {
  const user = await authService.registerDoctor(req.body);
  sendSuccess(
    res,
    201,
    'Registration submitted. Verify your email, then wait for admin approval before logging in.',
    user
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  const { user, tokens } = await authService.login(
    email,
    password,
    rememberMe,
    deviceContext(req)
  );
  setRefreshCookie(res, tokens.refreshToken, rememberMe);
  sendSuccess(res, 200, 'Login successful', {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  const { user, tokens } = await authService.login(
    email,
    password,
    rememberMe,
    deviceContext(req),
    Role.ADMIN
  );
  setRefreshCookie(res, tokens.refreshToken, rememberMe);
  sendSuccess(res, 200, 'Login successful', {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
  const tokenFromBody = req.body?.refreshToken;
  const refreshToken = tokenFromCookie ?? tokenFromBody;

  if (!refreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const { user, tokens, rememberMe } = await authService.refreshTokens(
    refreshToken,
    deviceContext(req)
  );

  setRefreshCookie(res, tokens.refreshToken, rememberMe);

  sendSuccess(res, 200, 'Token refreshed', {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;
  await authService.logout(refreshToken);
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logged out successfully');
});

export const logoutAllDevices = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAllDevices(req.user!.id);
  clearRefreshCookie(res);
  sendSuccess(res, 200, 'Logged out from all devices');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOtp(email, otp);
  sendSuccess(res, 200, 'Email verified successfully', result);
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.resendOtp(email);
  sendSuccess(res, 200, 'A new verification code has been sent to your email', result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  sendSuccess(
    res,
    200,
    'If an account exists with this email, a reset link has been sent.',
    result
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  sendSuccess(res, 200, 'Password reset successfully. Please log in.', result);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
  sendSuccess(res, 200, 'Password changed successfully', result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  sendSuccess(res, 200, 'Current user fetched', user);
});
