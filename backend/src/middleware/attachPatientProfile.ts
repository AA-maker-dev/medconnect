import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      patientId?: string;
    }
  }
}

/**
 * Must run after `authenticate` + `authorize('PATIENT')`. Resolves the
 * Patient row for req.user.id once, so every downstream controller can
 * just read req.patientId instead of re-querying it.
 */
export const attachPatientProfile = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    if (!patient) {
      throw ApiError.notFound('Patient profile not found for this account');
    }

    req.patientId = patient.id;
    next();
  }
);
