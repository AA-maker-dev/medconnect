import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

/**
 * Must run after `authenticate` + `authorize('ADMIN')`. Resolves the
 * Admin row for req.user.id once, so downstream controllers just read
 * req.adminId instead of re-querying it.
 */
export const attachAdminProfile = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const admin = await prisma.admin.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found for this account');
    }

    req.adminId = admin.id;
    next();
  }
);
