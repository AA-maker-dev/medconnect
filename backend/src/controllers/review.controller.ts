import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { prisma } from '../config/prisma';

/**
 * Landing-page testimonials: highly-rated, visible reviews only. Never
 * exposes patient contact info — first name + last initial only, matching
 * what a real testimonial section should show.
 */
export const listFeaturedReviews = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);

  const reviews = await prisma.review.findMany({
    where: { isVisible: true, rating: { gte: 4 }, comment: { not: null } },
    orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      patient: { select: { firstName: true, lastName: true, avatarUrl: true } },
      doctor: {
        select: {
          firstName: true,
          lastName: true,
          specialization: { select: { name: true } },
        },
      },
    },
  });

  const shaped = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    patientName: `${r.patient.firstName} ${r.patient.lastName.charAt(0)}.`,
    patientAvatarUrl: r.patient.avatarUrl,
    doctorName: `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`,
    doctorSpecialization: r.doctor.specialization.name,
  }));

  sendSuccess(res, 200, 'Featured reviews fetched', shaped);
});
