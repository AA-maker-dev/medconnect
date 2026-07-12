import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: Role;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  tokenId: string; // matches RefreshToken.id row, enables revocation
}

/**
 * Access tokens are short-lived and carry only what's needed to authorize
 * a request (userId + role). They are NEVER persisted server-side — that's
 * the point of using them instead of a session lookup on every request.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Refresh tokens ARE persisted (see RefreshToken model) so they can be
 * revoked individually (logout on one device) or in bulk (logout
 * everywhere, or password change). `rememberMe` controls the lifetime of
 * both the JWT and the DB row's expiresAt.
 */
export function signRefreshToken(
  payload: RefreshTokenPayload,
  rememberMe: boolean
): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: rememberMe
      ? env.JWT_REFRESH_EXPIRES_IN_REMEMBER_ME
      : env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function refreshTokenExpiryDate(rememberMe: boolean): Date {
  const days = rememberMe ? 30 : 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
