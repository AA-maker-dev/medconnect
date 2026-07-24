import { Request, Response } from 'express';
import { AppointmentStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import * as doctorService from '../services/doctor.service';;

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await doctorService.getDashboardSummary(req.doctorId!, req.user!.id);
  sendSuccess(res, 200, 'Dashboard summary fetched', summary);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await doctorService.getProfile(req.doctorId!);
  sendSuccess(res, 200, 'Profile fetched', profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await doctorService.updateProfile(req.doctorId!, req.body);
  sendSuccess(res, 200, 'Profile updated', profile);
});

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { type, page, limit } = req.validatedQuery as {
    type: 'today' | 'upcoming' | 'requests' | 'history' | 'all';
    page: number;
    limit: number;
  };
  const result = await doctorService.listAppointments(req.doctorId!, type, page, limit);
  sendSuccess(res, 200, 'Appointments fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await doctorService.updateAppointmentStatus(
    req.doctorId!,
    req.params.id,
    req.body as {
      status: AppointmentStatus;
      cancellationReason?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
    }
  );
  sendSuccess(res, 200, 'Appointment status updated', appointment);
});

export const listPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.validatedQuery as { page: number; limit: number };
  const result = await doctorService.listPatients(req.doctorId!, page, limit);
  sendSuccess(res, 200, 'Patients fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const getPatientHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await doctorService.getPatientHistory(req.doctorId!, req.params.patientId);
  sendSuccess(res, 200, 'Patient history fetched', history);
});

export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { months } = req.validatedQuery as { months: number };
  const analytics = await doctorService.getRevenueAnalytics(req.doctorId!, months);
  sendSuccess(res, 200, 'Revenue analytics fetched', analytics);
});

export const listAvailability = asyncHandler(async (req: Request, res: Response) => {
  const availability = await doctorService.listAvailability(req.doctorId!);
  sendSuccess(res, 200, 'Availability fetched', availability);
});

export const addAvailabilitySlot = asyncHandler(async (req: Request, res: Response) => {
  const slot = await doctorService.addAvailabilitySlot(req.doctorId!, req.body);
  sendSuccess(res, 201, 'Availability slot added', slot);
});

export const deleteAvailabilitySlot = asyncHandler(async (req: Request, res: Response) => {
  const result = await doctorService.deleteAvailabilitySlot(req.doctorId!, req.params.id);
  sendSuccess(res, 200, 'Availability slot removed', result);
});

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await doctorService.getWallet(req.user!.id);
  sendSuccess(res, 200, 'Wallet fetched', wallet);
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.validatedQuery as { page: number; limit: number };
  const result = await doctorService.listNotifications(req.user!.id, page, limit);
  sendSuccess(res, 200, 'Notifications fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await doctorService.markNotificationRead(req.user!.id, req.params.id);
  sendSuccess(res, 200, 'Notification marked as read', notification);
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await doctorService.markAllNotificationsRead(req.user!.id);
  sendSuccess(res, 200, 'All notifications marked as read', result);
});

export const listPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const prescriptions = await doctorService.listPrescriptions(req.doctorId!);
  sendSuccess(res, 200, 'Prescriptions fetched', prescriptions);
});

export const createPrescription = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await doctorService.createPrescription(req.doctorId!, req.body);
  sendSuccess(res, 201, 'Prescription created', prescription);
});
