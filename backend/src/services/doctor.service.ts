import { Prisma, AppointmentStatus, NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

const PATIENT_SUMMARY_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  gender: true,
  dateOfBirth: true,
} satisfies Prisma.PatientSelect;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ==================================================
// Dashboard summary
// ==================================================

export async function getDashboardSummary(doctorId: string, userId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    todayCount,
    upcomingCount,
    requestsCount,
    completedCount,
    uniquePatientsResult,
    wallet,
    unreadNotificationsCount,
    ratingAgg,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        doctorId,
        date: { gte: todayStart, lte: todayEnd },
        status: { in: ['APPROVED', 'RESCHEDULED'] },
      },
    }),
    prisma.appointment.count({
      where: {
        doctorId,
        date: { gt: todayEnd },
        status: { in: ['APPROVED', 'RESCHEDULED'] },
      },
    }),
    prisma.appointment.count({ where: { doctorId, status: 'PENDING' } }),
    prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } }),
    prisma.appointment.findMany({
      where: { doctorId },
      distinct: ['patientId'],
      select: { patientId: true },
    }),
    prisma.wallet.findUnique({ where: { userId }, select: { balance: true } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { ratingAvg: true, ratingCount: true },
    }),
  ]);

  return {
    todayAppointments: todayCount,
    upcomingAppointments: upcomingCount,
    appointmentRequests: requestsCount,
    completedAppointments: completedCount,
    totalPatients: uniquePatientsResult.length,
    walletBalance: wallet?.balance ?? 0,
    unreadNotifications: unreadNotificationsCount,
    ratingAvg: ratingAgg?.ratingAvg ?? 0,
    ratingCount: ratingAgg?.ratingCount ?? 0,
  };
}

// ==================================================
// Profile
// ==================================================

export async function getProfile(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: { select: { email: true, phone: true, isEmailVerified: true } },
      specialization: { select: { id: true, name: true } },
      hospital: { select: { id: true, name: true, city: true } },
      awards: true,
      certificates: true,
      availability: true,
    },
  });
  if (!doctor) throw ApiError.notFound('Doctor profile not found');
  return doctor;
}

export async function updateProfile(
  doctorId: string,
  input: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    bio?: string;
    qualification?: string;
    experienceYears?: number;
    consultationFee?: number;
    languages?: string[];
    hospitalId?: string | null;
    location?: string;
  }
) {
  return prisma.doctor.update({ where: { id: doctorId }, data: input });
}

// ==================================================
// Appointments
// ==================================================

export async function listAppointments(
  doctorId: string,
  type: 'today' | 'upcoming' | 'requests' | 'history' | 'all',
  page: number,
  limit: number
) {
  const now = new Date();
  const where: Prisma.AppointmentWhereInput = { doctorId };

  if (type === 'today') {
    where.date = { gte: startOfDay(now), lte: endOfDay(now) };
    where.status = { in: ['APPROVED', 'RESCHEDULED'] };
  } else if (type === 'upcoming') {
    where.date = { gt: endOfDay(now) };
    where.status = { in: ['APPROVED', 'RESCHEDULED'] };
  } else if (type === 'requests') {
    where.status = 'PENDING';
  } else if (type === 'history') {
    where.OR = [
      { status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'] } },
      { date: { lt: startOfDay(now) } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: type === 'history' ? 'desc' : 'asc' },
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
        createdAt: true,
        patient: { select: PATIENT_SUMMARY_SELECT },
        prescription: { select: { id: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateAppointmentStatus(
  doctorId: string,
  appointmentId: string,
  input: {
    status: AppointmentStatus;
    cancellationReason?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }
) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId },
    include: { patient: { select: { userId: true, firstName: true } } },
  });
  if (!appointment) throw ApiError.notFound('Appointment not found');

  if (input.status === 'RESCHEDULED' && (!input.date || !input.startTime || !input.endTime)) {
    throw ApiError.badRequest('date, startTime, and endTime are required when rescheduling');
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: input.status,
      cancellationReason: input.cancellationReason,
      ...(input.status === 'RESCHEDULED' && input.date
        ? { date: new Date(input.date), startTime: input.startTime, endTime: input.endTime }
        : {}),
    },
  });

  // Auto-create the dedicated chat room the moment a doctor approves a
  // booking — this is the hook Phase 8's messaging system builds on.
  if (input.status === 'APPROVED') {
    await prisma.chatRoom.upsert({
      where: { appointmentId },
      update: {},
      create: { appointmentId },
    });
  }

  const notificationCopy: Partial<
    Record<AppointmentStatus, { type: NotificationType; title: string; body: string }>
  > = {
    APPROVED: {
      type: NotificationType.APPOINTMENT_APPROVED,
      title: 'Appointment approved',
      body: `Your appointment on ${updated.date.toDateString()} has been approved.`,
    },
    REJECTED: {
      type: NotificationType.APPOINTMENT_REJECTED,
      title: 'Appointment declined',
      body: 'Unfortunately your appointment request was declined by the doctor.',
    },
    RESCHEDULED: {
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      title: 'Appointment rescheduled',
      body: `Your appointment has been moved to ${updated.date.toDateString()}.`,
    },
    CANCELLED: {
      type: NotificationType.APPOINTMENT_CANCELLED,
      title: 'Appointment cancelled',
      body: 'Your appointment has been cancelled by the doctor.',
    },
  };

  const copy = notificationCopy[input.status];
  if (copy) {
    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        type: copy.type,
        title: copy.title,
        body: copy.body,
      },
    });
  }

  return updated;
}

// ==================================================
// Patients (unique patients this doctor has seen)
// ==================================================

export async function listPatients(doctorId: string, page: number, limit: number) {
  const distinctPatientIds = await prisma.appointment.findMany({
    where: { doctorId },
    distinct: ['patientId'],
    select: { patientId: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const ids = distinctPatientIds.map((p) => p.patientId);

  const patients = await prisma.patient.findMany({
    where: { id: { in: ids } },
    select: {
      ...PATIENT_SUMMARY_SELECT,
      bloodGroup: true,
      allergies: true,
      chronicConditions: true,
      appointments: {
        where: { doctorId },
        orderBy: { date: 'desc' },
        take: 1,
        select: { date: true, status: true },
      },
      _count: { select: { appointments: { where: { doctorId } } } },
    },
  });

  // Preserve the most-recent-appointment ordering from the distinct query
  const order = new Map(ids.map((id, i) => [id, i]));
  patients.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  const total = await prisma.appointment
    .findMany({ where: { doctorId }, distinct: ['patientId'], select: { patientId: true } })
    .then((r) => r.length);

  return { items: patients, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPatientHistory(doctorId: string, patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: PATIENT_SUMMARY_SELECT,
  });
  if (!patient) throw ApiError.notFound('Patient not found');

  const appointments = await prisma.appointment.findMany({
    where: { doctorId, patientId },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      date: true,
      status: true,
      consultationType: true,
      reasonForVisit: true,
      prescription: {
        select: {
          id: true,
          diagnosis: true,
          advice: true,
          medicines: { select: { name: true, dosage: true, frequency: true } },
        },
      },
      review: { select: { rating: true, comment: true } },
    },
  });

  if (appointments.length === 0) {
    throw ApiError.notFound('No appointment history with this patient');
  }

  return { patient, appointments };
}

// ==================================================
// Revenue analytics
// ==================================================

export async function getRevenueAnalytics(doctorId: string, months: number) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const payments = await prisma.payment.findMany({
    where: {
      status: 'SUCCESS',
      appointment: { doctorId },
      createdAt: { gte: since },
    },
    select: { amount: true, createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, 0);
  }

  let totalRevenue = 0;
  for (const payment of payments) {
    const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const amount = Number(payment.amount);
    totalRevenue += amount;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + amount);
    }
  }

  const [completedCount, cancelledCount, totalCount] = await Promise.all([
    prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } }),
    prisma.appointment.count({
      where: { doctorId, status: { in: ['CANCELLED', 'REJECTED', 'NO_SHOW'] } },
    }),
    prisma.appointment.count({ where: { doctorId } }),
  ]);

  return {
    totalRevenue,
    monthly: Array.from(buckets.entries()).map(([month, revenue]) => ({ month, revenue })),
    completedCount,
    cancelledCount,
    completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 1000) / 10 : 0,
  };
}

// ==================================================
// Availability schedule
// ==================================================

export async function listAvailability(doctorId: string) {
  return prisma.doctorAvailability.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

export async function addAvailabilitySlot(
  doctorId: string,
  input: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    isActive: boolean;
  }
) {
  if (input.startTime >= input.endTime) {
    throw ApiError.badRequest('Start time must be before end time');
  }
  return prisma.doctorAvailability.create({ data: { doctorId, ...input } });
}

export async function deleteAvailabilitySlot(doctorId: string, slotId: string) {
  const slot = await prisma.doctorAvailability.findFirst({ where: { id: slotId, doctorId } });
  if (!slot) throw ApiError.notFound('Availability slot not found');
  await prisma.doctorAvailability.delete({ where: { id: slotId } });
  return { deleted: true };
}

// ==================================================
// Wallet
// ==================================================

export async function getWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
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

// ==================================================
// Prescriptions
// ==================================================

export async function listPrescriptions(doctorId: string) {
  return prisma.prescription.findMany({
    where: { doctorId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      diagnosis: true,
      advice: true,
      pdfUrl: true,
      createdAt: true,
      appointment: { select: { id: true, date: true } },
      medicines: true,
    },
  });
}

export async function createPrescription(
  doctorId: string,
  input: {
    appointmentId: string;
    diagnosis: string;
    advice?: string;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      durationDays?: number;
      instructions?: string;
    }>;
  }
) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: input.appointmentId, doctorId },
  });
  if (!appointment) throw ApiError.notFound('Appointment not found');

  const existing = await prisma.prescription.findUnique({
    where: { appointmentId: input.appointmentId },
  });
  if (existing) throw ApiError.conflict('A prescription already exists for this appointment');

  const prescription = await prisma.prescription.create({
    data: {
      appointmentId: input.appointmentId,
      doctorId,
      diagnosis: input.diagnosis,
      advice: input.advice,
      medicines: { create: input.medicines },
    },
    include: { medicines: true },
  });

  const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId } });
  if (patient) {
    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: 'PRESCRIPTION_UPLOADED',
        title: 'New prescription available',
        body: 'Your doctor has uploaded a prescription for your recent appointment.',
      },
    });
  }

  return prescription;
}
