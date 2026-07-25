import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const DOCTOR_SUMMARY_SELECT = {
  id: true, 
  firstName: true,
  lastName: true,
  avatarUrl: true,
  qualification: true,
  consultationFee: true,
  ratingAvg: true,
  ratingCount: true,
  specialization: { select: { id: true, name: true } },
  hospital: { select: { id: true, name: true, city: true } },
} satisfies Prisma.DoctorSelect;

// ==================================================
// Dashboard summary
// ==================================================

export async function getDashboardSummary(patientId: string, userId: string) {
  const now = new Date();

  const [
    upcomingCount,
    pastCount,
    medicalHistoryCount,
    favoriteDoctorsCount,
    prescriptionsCount,
    invoicesCount,
    wallet,
    unreadNotificationsCount,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        patientId,
        status: { in: ['PENDING', 'APPROVED', 'RESCHEDULED'] },
        date: { gte: now },
      },
    }),
    prisma.appointment.count({
      where: {
        patientId,
        OR: [
          { status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'] } },
          { date: { lt: now } },
        ],
      },
    }),
    prisma.medicalHistory.count({ where: { patientId } }),
    prisma.favoriteDoctor.count({ where: { patientId } }),
    prisma.prescription.count({ where: { appointment: { patientId } } }),
    prisma.invoice.count({ where: { patientId } }),
    prisma.wallet.findUnique({ where: { userId }, select: { balance: true } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    upcomingAppointments: upcomingCount,
    pastAppointments: pastCount,
    medicalHistoryEntries: medicalHistoryCount,
    favoriteDoctors: favoriteDoctorsCount,
    prescriptions: prescriptionsCount,
    invoices: invoicesCount,
    walletBalance: wallet?.balance ?? 0,
    unreadNotifications: unreadNotificationsCount,
  };
}

// ==================================================
// Profile
// ==================================================

export async function getProfile(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: { select: { email: true, phone: true, isEmailVerified: true } } },
  });
  if (!patient) throw ApiError.notFound('Patient profile not found');
  return patient;
}

export async function updateProfile(
  patientId: string,
  input: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    bloodGroup?: string;
    address?: string;
    city?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    allergies?: string;
    chronicConditions?: string;
  }
) {
  const { dateOfBirth, ...rest } = input;
  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: {
      ...rest,
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
    },
  });
  return patient;
}

// ==================================================
// Appointments
// ==================================================

export async function listAppointments(
  patientId: string,
  status: 'upcoming' | 'past' | 'all',
  page: number,
  limit: number
) {
  const now = new Date();

  const where: Prisma.AppointmentWhereInput = { patientId };
  if (status === 'upcoming') {
    where.status = { in: ['PENDING', 'APPROVED', 'RESCHEDULED'] };
    where.date = { gte: now };
  } else if (status === 'past') {
    where.OR = [
      { status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'] } },
      { date: { lt: now } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: status === 'past' ? 'desc' : 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        consultationType: true,
        reasonForVisit: true,
        meetingRoomId: true,
        doctor: { select: DOCTOR_SUMMARY_SELECT },
        review: { select: { id: true } },
        prescription: { select: { id: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ==================================================
// Medical history
// ==================================================

export async function listMedicalHistory(patientId: string) {
  return prisma.medicalHistory.findMany({
    where: { patientId },
    orderBy: { recordedAt: 'desc' },
  });
}

export async function createMedicalHistoryEntry(
  patientId: string,
  input: { title: string; description?: string; fileUrl?: string }
) {
  return prisma.medicalHistory.create({
    data: { patientId, ...input },
  });
}

export async function deleteMedicalHistoryEntry(patientId: string, entryId: string) {
  const entry = await prisma.medicalHistory.findFirst({ where: { id: entryId, patientId } });
  if (!entry) throw ApiError.notFound('Medical history entry not found');
  await prisma.medicalHistory.delete({ where: { id: entryId } });
  return { deleted: true };
}

// ==================================================
// Favorite doctors
// ==================================================

export async function listFavoriteDoctors(patientId: string) {
  const favorites = await prisma.favoriteDoctor.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, doctor: { select: DOCTOR_SUMMARY_SELECT } },
  });
  return favorites;
}

export async function addFavoriteDoctor(patientId: string, doctorId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw ApiError.notFound('Doctor not found');

  const existing = await prisma.favoriteDoctor.findUnique({
    where: { patientId_doctorId: { patientId, doctorId } },
  });
  if (existing) throw ApiError.conflict('This doctor is already in your favorites');

  return prisma.favoriteDoctor.create({ data: { patientId, doctorId } });
}

export async function removeFavoriteDoctor(patientId: string, doctorId: string) {
  const existing = await prisma.favoriteDoctor.findUnique({
    where: { patientId_doctorId: { patientId, doctorId } },
  });
  if (!existing) throw ApiError.notFound('This doctor is not in your favorites');

  await prisma.favoriteDoctor.delete({ where: { patientId_doctorId: { patientId, doctorId } } });
  return { removed: true };
}

// ==================================================
// Prescriptions
// ==================================================

export async function listPrescriptions(patientId: string) {
  return prisma.prescription.findMany({
    where: { appointment: { patientId } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      diagnosis: true,
      advice: true,
      pdfUrl: true,
      createdAt: true,
      doctor: {
        select: { firstName: true, lastName: true, specialization: { select: { name: true } } },
      },
      appointment: { select: { id: true, date: true } },
      medicines: {
        select: { id: true, name: true, dosage: true, frequency: true, durationDays: true },
      },
      labReports: { select: { id: true, title: true, fileUrl: true } },
    },
  });
}

// ==================================================
// Invoices
// ==================================================

export async function listInvoices(patientId: string) {
  return prisma.invoice.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      invoiceNumber: true,
      subtotal: true,
      tax: true,
      total: true,
      pdfUrl: true,
      createdAt: true,
      appointment: {
        select: {
          date: true,
          doctor: { select: { firstName: true, lastName: true } },
        },
      },
      payment: { select: { status: true, gateway: true } },
    },
  });
}

// ==================================================
// Wallet
// ==================================================

export async function getWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!wallet) throw ApiError.notFound('Wallet not found');
  return wallet;
}

// ==================================================
// Notifications
// ==================================================

export async function listNotifications(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) throw ApiError.notFound('Notification not found');

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { updated: true };
}
