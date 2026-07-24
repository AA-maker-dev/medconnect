import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace 
  namespace Express {
    interface Request {
      doctorId?: string;
    }
  }
}

/**
 * Must run after `authenticate` + `authorize('DOCTOR')`. Resolves the
 * Doctor row for req.user.id once, so downstream controllers just read
 * req.doctorId instead of re-querying it on every handler.
 */
export const attachDoctorProfile = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    if (!doctor) {
      throw ApiError.notFound('Doctor profile not found for this account');
    }

    req.doctorId = doctor.id;
    next();
  }
);
