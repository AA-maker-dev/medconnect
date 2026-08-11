import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

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
  languages: true,
  specialization: { select: { id: true, name: true } },
  hospital: { select: { id: true, name: true, city: true } },
} satisfies Prisma.DoctorSelect;

// ==================================================
// Smart doctor recommendation
// ==================================================

interface RecommendedDoctor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  qualification: string;
  experienceYears: number;
  consultationFee: Prisma.Decimal;
  ratingAvg: Prisma.Decimal;
  ratingCount: number;
  languages: string[];
  specialization: { id: string; name: string };
  hospital: { id: string; name: string; city: string } | null;
  matchScore: number;
  matchReasons: string[];
}

/**
 * Ranks doctors for a given disease by:
 *   - specialization match (the disease determines this — non-negotiable filter)
 *   - rating (average + volume, so 5.0 from 2 reviews doesn't outrank 4.8 from 200)
 *   - experience (diminishing returns past ~15 years, so it doesn't dominate)
 *   - completion rate (completed vs. cancelled/no-show/rejected appointments —
 *     computed live from Appointment rows rather than a stale stored field)
 *   - has an active weekly availability schedule at all (can't recommend a
 *     doctor with no bookable hours)
 *   - previous-patient boost: if the requesting patient has seen this doctor
 *     before, that's a strong "recommended based on your history" signal
 *
 * Distance is intentionally not scored yet — Doctor.location is free-text,
 * not coordinates, so real distance ranking needs a geocoding step. The
 * schema and this function are structured so adding a `distanceKm` term
 * later is a one-line change, not a rewrite.
 */
export async function getRecommendedDoctors(
  diseaseId: string,
  patientId: string | undefined,
  limit: number
): Promise<{ specialization: { id: string; name: string }; doctors: RecommendedDoctor[] }> {
  const disease = await prisma.disease.findUnique({
    where: { id: diseaseId },
    include: { specialization: { select: { id: true, name: true } } },
  });
  if (!disease) throw ApiError.notFound('Disease not found');

  const candidates = await prisma.doctor.findMany({
    where: {
      specializationId: disease.specializationId,
      verificationStatus: 'VERIFIED',
      user: { isActive: true },
    },
    select: {
      ...DOCTOR_CARD_SELECT,
      availability: { where: { isActive: true }, select: { id: true }, take: 1 },
      appointments: {
        select: { status: true, patientId: true },
      },
    },
  });

  if (candidates.length === 0) {
    return { specialization: disease.specialization, doctors: [] };
  }

  const scored: RecommendedDoctor[] = candidates.map((doctor) => {
    const { appointments, availability, ...doctorCard } = doctor;

    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const negative = appointments.filter((a) =>
      ['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(a.status)
    ).length;
    const resolved = completed + negative;
    // Neutral 70% baseline for doctors with no history yet, so new (but
    // verified) doctors aren't unfairly buried under zero-appointment doctors.
    const completionRate = resolved > 0 ? (completed / resolved) * 100 : 70;

    const hasAvailability = availability.length > 0;
    const previouslySeen = Boolean(
      patientId && appointments.some((a) => a.patientId === patientId)
    );

    const ratingScore = (Number(doctorCard.ratingAvg) / 5) * 40; // 0–40
    const volumeConfidence = Math.min(doctorCard.ratingCount / 20, 1); // caps at 20 reviews
    const ratingWeighted = ratingScore * (0.5 + 0.5 * volumeConfidence); // dampen low-volume 5-stars
    const experienceScore = Math.min(doctorCard.experienceYears / 15, 1) * 20; // 0–20
    const completionScore = (completionRate / 100) * 25; // 0–25
    const availabilityScore = hasAvailability ? 10 : 0;
    const historyBoost = previouslySeen ? 5 : 0;

    const matchScore = Math.round(
      ratingWeighted + experienceScore + completionScore + availabilityScore + historyBoost
    );

    const matchReasons: string[] = [];
    if (previouslySeen) matchReasons.push("You've seen this doctor before");
    if (Number(doctorCard.ratingAvg) >= 4.5 && doctorCard.ratingCount >= 10)
      matchReasons.push('Highly rated');
    if (doctorCard.experienceYears >= 10) matchReasons.push('Highly experienced');
    if (completionRate >= 90 && resolved >= 5) matchReasons.push('Excellent track record');
    if (!hasAvailability) matchReasons.push('No open schedule right now');

    return { ...doctorCard, matchScore, matchReasons };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  return {
    specialization: disease.specialization,
    doctors: scored.slice(0, limit),
  };
}

// ==================================================
// Available slots
// ==================================================

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export async function getAvailableSlots(doctorId: string, dateStr: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw ApiError.notFound('Doctor not found');

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest('Invalid date');
  }

  const dayOfWeek = date.getDay();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [availabilityRows, bookedAppointments] = await Promise.all([
    prisma.doctorAvailability.findMany({
      where: { doctorId, dayOfWeek, isActive: true },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ['PENDING', 'APPROVED', 'RESCHEDULED'] },
      },
      select: { startTime: true },
    }),
  ]);

  const bookedTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const now = new Date();
  const isToday = dayStart.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: Array<{ startTime: string; endTime: string }> = [];

  for (const row of availabilityRows) {
    const start = timeToMinutes(row.startTime);
    const end = timeToMinutes(row.endTime);
    const step = row.slotDurationMinutes;

    for (let t = start; t + step <= end; t += step) {
      if (isToday && t <= nowMinutes) continue; // no booking already-passed slots today

      const slotStart = minutesToTime(t);
      if (bookedTimes.has(slotStart)) continue;

      slots.push({ startTime: slotStart, endTime: minutesToTime(t + step) });
    }
  }

  return slots;
}

export async function getAvailableDates(doctorId: string, startDateStr: string, endDateStr: string) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw ApiError.notFound('Doctor not found');

  const startDate = new Date(`${startDateStr}T00:00:00`);
  const endDate = new Date(`${endDateStr}T23:59:59.999`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw ApiError.badRequest('Invalid date range');
  }
  if (startDate > endDate) {
    throw ApiError.badRequest('startDate must be before endDate');
  }

  const availabilityRows = await prisma.doctorAvailability.findMany({
    where: { doctorId, isActive: true },
  });

  if (availabilityRows.length === 0) {
    return [];
  }

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { gte: startDate, lte: endDate },
      status: { in: ['PENDING', 'APPROVED', 'RESCHEDULED'] },
    },
    select: { date: true, startTime: true },
  });

  const bookedMap = new Map<string, Set<string>>();
  for (const appt of bookedAppointments) {
    const key = appt.date.toISOString().slice(0, 10);
    if (!bookedMap.has(key)) bookedMap.set(key, new Set());
    bookedMap.get(key)!.add(appt.startTime);
  }

  const now = new Date();
  const availableDates: string[] = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const dateKey = d.toISOString().slice(0, 10);
    const dayAvailability = availabilityRows.filter((row) => row.dayOfWeek === dayOfWeek);
    if (dayAvailability.length === 0) continue;

    const bookedForDay = bookedMap.get(dateKey) ?? new Set();
    const isToday = d.toDateString() === now.toDateString();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let hasOpenSlot = false;
    for (const row of dayAvailability) {
      const start = timeToMinutes(row.startTime);
      const end = timeToMinutes(row.endTime);
      const step = row.slotDurationMinutes;
      for (let t = start; t + step <= end; t += step) {
        if (isToday && t <= nowMinutes) continue;
        const slotStart = minutesToTime(t);
        if (!bookedForDay.has(slotStart)) {
          hasOpenSlot = true;
          break;
        }
      }
      if (hasOpenSlot) break;
    }

    if (hasOpenSlot) {
      availableDates.push(dateKey);
    }
  }

  return availableDates;
}

// ==================================================
// Booking
// ==================================================

export async function createAppointment(
  patientId: string,
  input: {
    doctorId: string;
    diseaseId?: string;
    date: string;
    startTime: string;
    endTime: string;
    consultationType: 'IN_PERSON' | 'VIDEO';
    reasonForVisit?: string;
  }
) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId },
    select: { id: true, userId: true, verificationStatus: true, user: { select: { isActive: true } } },
  });
  if (!doctor) throw ApiError.notFound('Doctor not found');
  if (doctor.verificationStatus !== 'VERIFIED' || !doctor.user.isActive) {
    throw ApiError.badRequest('This doctor is not currently accepting bookings');
  }

  // Re-check the slot is still free right before booking — closes most of
  // the race-condition window between the patient viewing slots and
  // submitting the form. Not perfectly atomic without a DB-level unique
  // constraint on (doctorId, date, startTime), which is a reasonable
  // follow-up hardening step.
  const availableSlots = await getAvailableSlots(input.doctorId, input.date);
  const stillAvailable = availableSlots.some((s) => s.startTime === input.startTime);
  if (!stillAvailable) {
    throw ApiError.conflict('This slot was just booked by someone else. Please pick another.');
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId: input.doctorId,
      diseaseId: input.diseaseId,
      date: new Date(`${input.date}T00:00:00`),
      startTime: input.startTime,
      endTime: input.endTime,
      consultationType: input.consultationType,
      reasonForVisit: input.reasonForVisit,
      status: 'PENDING',
    },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      consultationType: true,
      reasonForVisit: true,
      doctor: { select: DOCTOR_CARD_SELECT },
    },
  });

  await prisma.notification.create({
    data: {
      userId: doctor.userId,
      type: 'SYSTEM',
      title: 'New appointment request',
      body: `You have a new appointment request for ${appointment.date.toDateString()} at ${appointment.startTime}.`,
    },
  });

  return appointment;
}

// ==================================================
// Confirmation / detail lookup
// ==================================================

export async function getAppointmentById(
  appointmentId: string,
  requesterUserId: string,
  requesterRole: 'PATIENT' | 'DOCTOR' | 'ADMIN'
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { userId: true, firstName: true, lastName: true } },
      doctor: { select: { userId: true, ...DOCTOR_CARD_SELECT } },
      disease: { select: { id: true, name: true } },
    },
  });
  if (!appointment) throw ApiError.notFound('Appointment not found');

  const isOwner =
    appointment.patient.userId === requesterUserId ||
    appointment.doctor.userId === requesterUserId;

  if (!isOwner && requesterRole !== 'ADMIN') {
    throw ApiError.forbidden('You do not have access to this appointment');
  }

  return appointment;
}

export async function rescheduleAppointment(
  patientId: string,
  input: {
    appointmentId: string;
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    consultationType: 'IN_PERSON' | 'VIDEO';
    reasonForVisit?: string;
  }
) {
  const original = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: { doctor: { select: { userId: true, verificationStatus: true, user: { select: { isActive: true } } } } },
  });
  if (!original) throw ApiError.notFound('Appointment not found');
  if (original.patientId !== patientId) throw ApiError.forbidden('You do not own this appointment');
  if (original.doctorId !== input.doctorId) throw ApiError.badRequest('Doctor does not match original appointment');

  const doctor = original.doctor;
  if (doctor.verificationStatus !== 'VERIFIED' || !doctor.user.isActive) {
    throw ApiError.badRequest('This doctor is not currently accepting bookings');
  }

  const availableSlots = await getAvailableSlots(input.doctorId, input.date);
  const stillAvailable = availableSlots.some((s) => s.startTime === input.startTime);
  if (!stillAvailable) {
    throw ApiError.conflict('This slot was just booked by someone else. Please pick another.');
  }

  const newAppointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId: input.doctorId,
      diseaseId: original.diseaseId,
      date: new Date(`${input.date}T00:00:00`),
      startTime: input.startTime,
      endTime: input.endTime,
      consultationType: input.consultationType,
      reasonForVisit: input.reasonForVisit ?? original.reasonForVisit,
      status: 'PENDING',
      rescheduledFromId: original.id,
    },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      consultationType: true,
      reasonForVisit: true,
      doctor: { select: DOCTOR_CARD_SELECT },
    },
  });

  await prisma.appointment.update({
    where: { id: original.id },
    data: { status: 'RESCHEDULED' },
  });

  await prisma.notification.create({
    data: {
      userId: doctor.userId,
      type: 'APPOINTMENT_RESCHEDULED',
      title: 'Appointment rescheduled',
      body: `A patient has requested to reschedule appointment ${original.id} to ${newAppointment.date.toDateString()} at ${newAppointment.startTime}.`,
    },
  });

  return newAppointment;
}
