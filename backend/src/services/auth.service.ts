import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiryDate,
} from '../utils/jwt';
import { generateOtp, otpExpiry, generateResetToken, resetTokenExpiry } from '../utils/otp';
import {
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
  sendDoctorApplicationReceivedEmail,
} from './email.service';
import { env } from '../config/env';

interface DeviceContext {
  userAgent?: string;
  ipAddress?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function issueTokenPair(
  userId: string,
  role: Role,
  rememberMe: boolean,
  device: DeviceContext
): Promise<AuthTokens> {
  const accessToken = signAccessToken({ userId, role });

  // Create the DB row first so we have an id to embed in the JWT — this
  // is what makes a single refresh token individually revocable (e.g.
  // "log out this device") without invalidating every session.
  const tokenRow = await prisma.refreshToken.create({
    data: {
      token: '', // placeholder, updated below once we know the JWT
      userId,
      userAgent: device.userAgent,
      ipAddress: device.ipAddress,
      expiresAt: refreshTokenExpiryDate(rememberMe),
    },
  });

  const refreshToken = signRefreshToken(
    { userId, tokenId: tokenRow.id },
    rememberMe
  );

  await prisma.refreshToken.update({
    where: { id: tokenRow.id },
    data: { token: refreshToken },
  });

  return { accessToken, refreshToken };
}

function publicUser(user: {
  id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

// ==================================================
// Registration
// ==================================================

export async function registerPatient(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const otp = generateOtp();

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: Role.PATIENT,
      otpCode: otp,
      otpExpiresAt: otpExpiry(),
      patient: {
        create: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
          gender: input.gender,
        },
      },
      wallet: { create: { balance: 0 } },
    },
    include: { patient: true },
  });

  await sendVerificationOtpEmail(user.email, otp, input.firstName);

  return publicUser(user);
}

export async function registerDoctor(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  specializationId: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  licenseNumber: string;
  hospitalId?: string;
  bio?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const existingLicense = await prisma.doctor.findUnique({
    where: { licenseNumber: input.licenseNumber },
  });
  if (existingLicense) {
    throw ApiError.conflict('This license number is already registered');
  }

  const specialization = await prisma.specialization.findUnique({
    where: { id: input.specializationId },
  });
  if (!specialization) {
    throw ApiError.badRequest('Selected specialization does not exist');
  }

  const passwordHash = await hashPassword(input.password);
  const otp = generateOtp();

  // Doctors register with PENDING verification — an admin must approve
  // (verify license/docs) before the profile is searchable/bookable.
  // See Doctor.verificationStatus in the schema and Phase 6 (Admin
  // Dashboard) for the approval flow.
  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: Role.DOCTOR,
      otpCode: otp,
      otpExpiresAt: otpExpiry(),
      doctor: {
        create: {
          firstName: input.firstName,
          lastName: input.lastName,
          qualification: input.qualification,
          experienceYears: input.experienceYears,
          consultationFee: input.consultationFee,
          licenseNumber: input.licenseNumber,
          specializationId: input.specializationId,
          hospitalId: input.hospitalId,
          bio: input.bio,
        },
      },
      wallet: { create: { balance: 0 } },
    },
    include: { doctor: true },
  });

  await sendVerificationOtpEmail(user.email, otp, input.firstName);

  return publicUser(user);
}

// ==================================================
// Email / OTP verification
// ==================================================

export async function verifyOtp(email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.notFound('No account found with this email');

  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    throw ApiError.badRequest('No pending verification for this account');
  }

  if (user.otpExpiresAt < new Date()) {
    throw ApiError.badRequest('OTP has expired. Please request a new one');
  }

  if (user.otpCode !== otp) {
    throw ApiError.badRequest('Incorrect OTP');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
  });

  if (user.role === Role.DOCTOR) {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
    if (doctor) {
      await sendDoctorApplicationReceivedEmail(user.email, doctor.firstName);
    }
  }

  return { verified: true };
}

export async function resendOtp(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.notFound('No account found with this email');
  if (user.isEmailVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  const otp = generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiresAt: otpExpiry() },
  });

  const name =
    (await prisma.patient.findUnique({ where: { userId: user.id } }))?.firstName ??
    (await prisma.doctor.findUnique({ where: { userId: user.id } }))?.firstName ??
    'there';

  await sendVerificationOtpEmail(user.email, otp, name);
  return { sent: true };
}

// ==================================================
// Login
// ==================================================

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
  device: DeviceContext,
  restrictToRole?: Role
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (restrictToRole && user.role !== restrictToRole) {
    // Deliberately identical error to a wrong-password case — don't leak
    // which emails belong to which role.
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Contact support.');
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden('Please verify your email before logging in');
  }

  if (user.role === Role.DOCTOR) {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
    if (doctor?.verificationStatus === 'PENDING') {
      throw ApiError.forbidden(
        'Your doctor profile is still pending admin verification'
      );
    }
    if (doctor?.verificationStatus === 'REJECTED') {
      throw ApiError.forbidden(
        'Your doctor application was not approved. Contact support for details.'
      );
    }
  }

  const tokens = await issueTokenPair(user.id, user.role, rememberMe, device);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { user: publicUser(user), tokens };
}

// ==================================================
// Token refresh (rotation)
// ==================================================

export async function refreshTokens(refreshToken: string, device: DeviceContext) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session. Please log in again.');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
    include: { user: true },
  });

  if (!stored || stored.revoked || stored.token !== refreshToken) {
    // Reuse of a revoked/rotated token is a strong signal of theft — kill
    // every session for this user as a precaution.
    if (stored) {
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { revoked: true },
      });
    }
    throw ApiError.unauthorized('Session invalid. Please log in again.');
  }

  if (stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Session expired. Please log in again.');
  }

  if (!stored.user.isActive) {
    throw ApiError.forbidden('This account has been deactivated.');
  }

  // Rotate: revoke the old token, issue a brand new pair. Prevents replay
  // of a stolen-but-not-yet-used refresh token after the legitimate user
  // has moved on to a new one.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const rememberMe =
    stored.expiresAt.getTime() - stored.createdAt.getTime() >
    8 * 24 * 60 * 60 * 1000; // heuristically: >8 days lifetime means it was a remember-me session

  const tokens = await issueTokenPair(
    stored.userId,
    stored.user.role,
    rememberMe,
    device
  );

  return { user: publicUser(stored.user), tokens, rememberMe };
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.update({
      where: { id: payload.tokenId },
      data: { revoked: true },
    });
  } catch {
    // Already invalid/expired — nothing to revoke, logout still "succeeds"
  }
}

export async function logoutAllDevices(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

// ==================================================
// Forgot / reset password
// ==================================================

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond successfully even if the email doesn't exist — this
  // prevents attackers from using the endpoint to enumerate registered
  // accounts.
  if (!user) return { sent: true };

  const token = generateResetToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: resetTokenExpiry(),
    },
  });

  const name =
    (await prisma.patient.findUnique({ where: { userId: user.id } }))?.firstName ??
    (await prisma.doctor.findUnique({ where: { userId: user.id } }))?.firstName ??
    'there';

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl, name);

  return { sent: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    }),
    // Changing the password invalidates every existing session — a
    // password reset is usually a response to suspected compromise.
    prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    }),
  ]);

  return { reset: true };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { changed: true };
}

// ==================================================
// Session identity
// ==================================================

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { patient: true, doctor: true, admin: true },
  });
  if (!user) throw ApiError.notFound('User not found');

  return {
    ...publicUser(user),
    profile: user.patient ?? user.doctor ?? user.admin ?? null,
  };
}
