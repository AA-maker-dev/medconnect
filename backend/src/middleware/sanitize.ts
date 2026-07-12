import { NextFunction, Request, Response } from 'express';
import xss from 'xss';

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return xss(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = sanitizeValue(val);
    }
    return result;
  }
  return value;
}

/**
 * Strips script tags / event handlers / javascript: URIs from every string
 * field in the request body before it reaches validation or a controller.
 * Password fields are exempt — sanitizing a password could silently change
 * it and lock the user out (e.g. a "<" they intentionally used).
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const { password, confirmPassword, newPassword, ...rest } = req.body;
    req.body = {
      ...sanitizeValue(rest) as object,
      ...(password !== undefined ? { password } : {}),
      ...(confirmPassword !== undefined ? { confirmPassword } : {}),
      ...(newPassword !== undefined ? { newPassword } : {}),
    };
  }
  next();
}
