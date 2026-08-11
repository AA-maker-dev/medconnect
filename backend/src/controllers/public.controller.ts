import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { prisma } from '../config/prisma';
import { sendContactEmail } from '../services/email.service';

export const listSpecializations = asyncHandler(async (_req: Request, res: Response) => {
  const specializations = await prisma.specialization.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, iconUrl: true },
  });
  sendSuccess(res, 200, 'Specializations fetched', specializations);
});

export const listHospitals = asyncHandler(async (_req: Request, res: Response) => {
  const hospitals = await prisma.hospital.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, city: true, logoUrl: true },
  });
  sendSuccess(res, 200, 'Hospitals fetched', hospitals);
});

export const listDiseases = asyncHandler(async (_req: Request, res: Response) => {
  const diseases = await prisma.disease.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      specialization: { select: { id: true, name: true } },
    },
  });
  sendSuccess(res, 200, 'Diseases fetched', diseases);
});

export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
  const [verifiedDoctors, patients, completedAppointments, specializations] =
    await Promise.all([
      prisma.doctor.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.patient.count(),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.specialization.count(),
    ]);

  sendSuccess(res, 200, 'Platform stats fetched', {
    verifiedDoctors,
    patients,
    completedAppointments,
    specializations,
  });
});

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  try {
    await sendContactEmail('rautstevensr@gmail.com', name, email, subject || 'New contact form message', message);
  } catch (err) {
    console.error('Contact email failed:', err);
  }
  sendSuccess(res, 200, 'Message sent successfully');
});
