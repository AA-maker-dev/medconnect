import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../config/prisma';

const DOCTOR_CARD_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  qualification: true,
  experienceYears: true,
  consultationFee: true,
  ratingAvg: true,
  ratingCount: true,
  totalPatients: true,
  languages: true,
  createdAt: true,
  specialization: { select: { id: true, name: true } },
  hospital: { select: { id: true, name: true, city: true } },
} satisfies Prisma.DoctorSelect;

/**
 * Public doctor directory. Only ever returns VERIFIED doctors on an
 * ACTIVE account — a doctor pending/rejected admin review, or one an
 * admin has since deactivated, should not be discoverable or bookable,
 * regardless of what sort/filter is requested.
 *
 * Query params:
 *   sortBy = 'rating' | 'recent' | 'experience'   (default: rating)
 *   specializationId = uuid                        (optional filter)
 *   limit = number, max 50                          (default: 12)
 */
export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const sortBy = (req.query.sortBy as string) ?? 'rating';
  const specializationId = req.query.specializationId as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const orderBy: Prisma.DoctorOrderByWithRelationInput[] =
    sortBy === 'recent'
      ? [{ createdAt: 'desc' }]
      : sortBy === 'experience'
      ? [{ experienceYears: 'desc' }]
      : [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }];

  const doctors = await prisma.doctor.findMany({
    where: {
      verificationStatus: 'VERIFIED',
      user: { isActive: true },
      ...(specializationId ? { specializationId } : {}),
    },
    orderBy,
    take: limit,
    select: DOCTOR_CARD_SELECT,
  });

  sendSuccess(res, 200, 'Doctors fetched', doctors);
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await prisma.doctor.findFirst({
    where: { id: req.params.id, verificationStatus: 'VERIFIED', user: { isActive: true } },
    select: {
      ...DOCTOR_CARD_SELECT,
      bio: true,
      certificates: { select: { id: true, title: true, fileUrl: true, issuedBy: true } },
      awards: { select: { id: true, title: true, year: true, issuer: true } },
      availability: {
        select: { dayOfWeek: true, startTime: true, endTime: true, isActive: true },
      },
    },
  });

  if (!doctor) {
    throw ApiError.notFound('Doctor not found');
  }

  sendSuccess(res, 200, 'Doctor fetched', doctor);
});
