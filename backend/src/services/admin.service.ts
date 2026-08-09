import { Prisma, DoctorVerificationStatus, AppointmentStatus, PaymentStatus, PaymentGateway } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

// ==================================================
// Dashboard summary 
// ==================================================

export async function getDashboardSummary(adminUserId: string) {
  const [
    totalPatients,
    totalDoctors,
    pendingVerifications,
    totalAppointments,
    completedAppointments,
    totalReviews,
    hiddenReviews,
    revenueAgg,
    unreadNotifications,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    prisma.review.count(),
    prisma.review.count({ where: { isVisible: false } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.notification.count({ where: { userId: adminUserId, isRead: false } }),
  ]);

  return {
    totalPatients,
    totalDoctors,
    pendingVerifications,
    totalAppointments,
    completedAppointments,
    totalReviews,
    hiddenReviews,
    totalRevenue: revenueAgg._sum.amount ?? 0,
    unreadNotifications,
  };
}

// ==================================================
// Manage patients
// ==================================================

export async function listPatients(search: string | undefined, page: number, limit: number) {
  const where: Prisma.PatientWhereInput = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: true,
        createdAt: true,
        user: { select: { id: true, email: true, phone: true, isActive: true, lastLoginAt: true } },
        _count: { select: { appointments: true } },
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPatientDetail(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { email: true, phone: true, isActive: true, createdAt: true, lastLoginAt: true } },
      appointments: {
        orderBy: { date: 'desc' },
        take: 10,
        select: {
          id: true,
          date: true,
          status: true,
          doctor: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { appointments: true, reviews: true } },
    },
  });
  if (!patient) throw ApiError.notFound('Patient not found');
  return patient;
}

export async function setPatientActive(patientId: string, isActive: boolean) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw ApiError.notFound('Patient not found');

  await prisma.user.update({ where: { id: patient.userId }, data: { isActive } });
  return { updated: true, isActive };
}

// ==================================================
// Manage doctors + verification
// ==================================================

const DOCTOR_ADMIN_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  qualification: true,
  experienceYears: true,
  consultationFee: true,
  licenseNumber: true,
  verificationStatus: true,
  verificationDocs: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
  specialization: { select: { id: true, name: true } },
  hospital: { select: { id: true, name: true, city: true } },
  user: { select: { id: true, email: true, phone: true, isActive: true, lastLoginAt: true } },
} satisfies Prisma.DoctorSelect;

export async function listDoctors(
  search: string | undefined,
  status: DoctorVerificationStatus | undefined,
  page: number,
  limit: number
) {
  const where: Prisma.DoctorWhereInput = {
    ...(status ? { verificationStatus: status } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { licenseNumber: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: DOCTOR_ADMIN_SELECT,
    }),
    prisma.doctor.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getDoctorDetail(doctorId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      ...DOCTOR_ADMIN_SELECT,
      bio: true,
      awards: true,
      certificates: true,
      _count: { select: { appointments: true, reviews: true } },
    },
  });
  if (!doctor) throw ApiError.notFound('Doctor not found');
  return doctor;
}

export async function verifyDoctor(
  doctorId: string,
  status: 'VERIFIED' | 'REJECTED',
  rejectionReason?: string
) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw ApiError.notFound('Doctor not found');

  if (doctor.verificationStatus !== 'PENDING') {
    throw ApiError.conflict('This doctor has already been reviewed');
  }

  const updated = await prisma.doctor.update({
    where: { id: doctorId },
    data: { verificationStatus: status },
  });

  await prisma.notification.create({
    data: {
      userId: doctor.userId,
      type: status === 'VERIFIED' ? 'DOCTOR_VERIFIED' : 'SYSTEM',
      title: status === 'VERIFIED' ? 'Your profile is now live' : 'Application not approved',
      body:
        status === 'VERIFIED'
          ? 'Congratulations — your license has been verified and your profile is now visible to patients.'
          : `Your application wasn't approved. Reason: ${rejectionReason}`,
    },
  });

  return updated;
}

export async function setDoctorActive(doctorId: string, isActive: boolean) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw ApiError.notFound('Doctor not found');

  await prisma.user.update({ where: { id: doctor.userId }, data: { isActive } });
  return { updated: true, isActive };
}

// ==================================================
// Appointments oversight
// ==================================================

export async function listAppointments(
  filters: { status?: AppointmentStatus; from?: string; to?: string },
  page: number,
  limit: number
) {
  const where: Prisma.AppointmentWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.from || filters.to
      ? {
          date: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        consultationType: true,
        createdAt: true,
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true, specialization: { select: { name: true } } } },
        payment: { select: { status: true, amount: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ==================================================
// Payments oversight
// ==================================================

export async function listPayments(
  filters: { status?: PaymentStatus; gateway?: PaymentGateway },
  page: number,
  limit: number
) {
  const where: Prisma.PaymentWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.gateway ? { gateway: filters.gateway } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        amount: true,
        gateway: true,
        status: true,
        gatewayTxnId: true,
        refundedAmount: true,
        refundedAt: true,
        createdAt: true,
        appointment: {
          select: {
            id: true,
            patient: { select: { firstName: true, lastName: true } },
            doctor: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function refundPayment(paymentId: string, refundAmount?: number) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { appointment: { include: { patient: true } } },
  });
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'SUCCESS') {
    throw ApiError.badRequest('Only successful payments can be refunded');
  }

  const amount = refundAmount ?? Number(payment.amount);
  if (amount > Number(payment.amount)) {
    throw ApiError.badRequest('Refund amount cannot exceed the original payment amount');
  }

  const patientUserId = payment.appointment.patient.userId;

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundedAmount: amount,
        refundedAt: new Date(),
      },
    });

    let wallet = await tx.wallet.findUnique({ where: { userId: patientUserId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId: patientUserId, balance: new Prisma.Decimal(0) },
      });
    }

    const newBalance = Number(wallet.balance) + amount;
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: new Prisma.Decimal(newBalance) },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: new Prisma.Decimal(amount),
        reason: `Refund for appointment payment`,
      },
    });

    await tx.notification.create({
      data: {
        userId: patientUserId,
        type: 'SYSTEM',
        title: 'Payment Refunded',
        body: `NPR ${amount.toLocaleString()} has been refunded to your wallet balance.`,
      },
    });

    return updatedPayment;
  });
}

// ==================================================
// Platform revenue analytics
// ==================================================

export async function getRevenueAnalytics(months: number) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCESS', createdAt: { gte: since } },
    select: { amount: true, gateway: true, createdAt: true },
  });

  const monthlyBuckets = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    monthlyBuckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0);
  }

  const gatewayBuckets = new Map<string, number>([
    ['ESEWA', 0],
    ['FONEPAY', 0],
    ['WALLET', 0],
  ]);

  let totalRevenue = 0;
  for (const payment of payments) {
    const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const amount = Number(payment.amount);
    totalRevenue += amount;
    if (monthlyBuckets.has(key)) {
      monthlyBuckets.set(key, (monthlyBuckets.get(key) ?? 0) + amount);
    }
    gatewayBuckets.set(payment.gateway, (gatewayBuckets.get(payment.gateway) ?? 0) + amount);
  }

  return {
    totalRevenue,
    monthly: Array.from(monthlyBuckets.entries()).map(([month, revenue]) => ({ month, revenue })),
    byGateway: Array.from(gatewayBuckets.entries()).map(([gateway, revenue]) => ({
      gateway,
      revenue,
    })),
  };
}

// ==================================================
// System analytics
// ==================================================

export async function getSystemAnalytics(months: number) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [patients, doctors, appointments, specializationCounts] = await Promise.all([
    prisma.patient.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.doctor.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.appointment.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.doctor.groupBy({
      by: ['specializationId'],
      _count: { _all: true },
    }),
  ]);

  function bucketByMonth(rows: Array<{ createdAt: Date }>) {
    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      const d = new Date(since);
      d.setMonth(d.getMonth() + i);
      buckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0);
    }
    for (const row of rows) {
      const key = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([month, count]) => ({ month, count }));
  }

  const specializations = await prisma.specialization.findMany({
    where: { id: { in: specializationCounts.map((s) => s.specializationId) } },
    select: { id: true, name: true },
  });
  const specializationNameMap = new Map(specializations.map((s) => [s.id, s.name]));

  return {
    patientGrowth: bucketByMonth(patients),
    doctorGrowth: bucketByMonth(doctors),
    appointmentVolume: bucketByMonth(appointments),
    specializationDistribution: specializationCounts.map((s) => ({
      specialization: specializationNameMap.get(s.specializationId) ?? 'Unknown',
      count: s._count._all,
    })),
  };
}

// ==================================================
// Reports (date-range appointment + revenue breakdown)
// ==================================================

export async function getAppointmentReport(from?: string, to?: string) {
  const dateFilter: Prisma.AppointmentWhereInput['date'] = {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
  const where: Prisma.AppointmentWhereInput = from || to ? { date: dateFilter } : {};

  const [total, byStatus] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.groupBy({ by: ['status'], where, _count: { _all: true } }),
  ]);

  const revenueAgg = await prisma.payment.aggregate({
    where: {
      status: 'SUCCESS',
      appointment: from || to ? { date: dateFilter } : undefined,
    },
    _sum: { amount: true },
    _count: { _all: true },
  });

  return {
    totalAppointments: total,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    totalRevenue: revenueAgg._sum.amount ?? 0,
    totalPayments: revenueAgg._count._all,
  };
}

// ==================================================
// Manage reviews
// ==================================================

export async function listReviews(
  filters: { visible?: boolean; minRating?: number },
  page: number,
  limit: number
) {
  const where: Prisma.ReviewWhereInput = {
    ...(filters.visible !== undefined ? { isVisible: filters.visible } : {}),
    ...(filters.minRating ? { rating: { gte: filters.minRating } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        doctorReply: true,
        isVisible: true,
        createdAt: true,
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function setReviewVisibility(reviewId: string, isVisible: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound('Review not found');

  return prisma.review.update({ where: { id: reviewId }, data: { isVisible } });
}

export async function deleteReview(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw ApiError.notFound('Review not found');

  await prisma.review.delete({ where: { id: reviewId } });
  return { deleted: true };
}

// ==================================================
// Notification broadcast + admin's own inbox
// ==================================================

export async function broadcastNotification(
  title: string,
  body: string,
  targetRole: 'PATIENT' | 'DOCTOR' | 'ALL'
) {
  const users = await prisma.user.findMany({
    where: targetRole === 'ALL' ? { role: { in: ['PATIENT', 'DOCTOR'] } } : { role: targetRole },
    select: { id: true },
  });

  if (users.length === 0) {
    return { sentTo: 0 };
  }

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: 'SYSTEM' as const,
      title,
      body,
    })),
  });

  return { sentTo: users.length };
}

export async function listMyNotifications(userId: string, page: number, limit: number) {
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

export async function markMyNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) throw ApiError.notFound('Notification not found');

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllMyNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { updated: true };
}

// ==================================================
// Admin profile
// ==================================================

export async function getProfile(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: { user: { select: { email: true, phone: true, createdAt: true } } },
  });
  if (!admin) throw ApiError.notFound('Admin profile not found');
  return admin;
}

export async function updateProfile(
  adminId: string,
  input: { firstName?: string; lastName?: string; avatarUrl?: string | null }
) {
  return prisma.admin.update({ where: { id: adminId }, data: input });
}
