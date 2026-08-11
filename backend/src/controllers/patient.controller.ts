import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import * as patientService from '../services/patient.service';

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await patientService.getDashboardSummary(req.patientId!, req.user!.id);
  sendSuccess(res, 200, 'Dashboard summary fetched', summary);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await patientService.getProfile(req.patientId!);
  sendSuccess(res, 200, 'Profile fetched', profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await patientService.updateProfile(req.patientId!, req.body);
  sendSuccess(res, 200, 'Profile updated', profile);
});

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.validatedQuery as {
    status: 'upcoming' | 'past' | 'all';
    page: number;
    limit: number;
  };
  const result = await patientService.listAppointments(req.patientId!, status, page, limit);
  sendSuccess(res, 200, 'Appointments fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const listMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const entries = await patientService.listMedicalHistory(req.patientId!);
  sendSuccess(res, 200, 'Medical history fetched', entries);
});

export const createMedicalHistoryEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await patientService.createMedicalHistoryEntry(req.patientId!, req.body);
  sendSuccess(res, 201, 'Medical history entry added', entry);
});

export const deleteMedicalHistoryEntry = asyncHandler(async (req: Request, res: Response) => {
  const result = await patientService.deleteMedicalHistoryEntry(req.patientId!, req.params.id);
  sendSuccess(res, 200, 'Medical history entry deleted', result);
});

export const listFavoriteDoctors = asyncHandler(async (req: Request, res: Response) => {
  const favorites = await patientService.listFavoriteDoctors(req.patientId!);
  sendSuccess(res, 200, 'Favorite doctors fetched', favorites);
});

export const addFavoriteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const favorite = await patientService.addFavoriteDoctor(req.patientId!, req.body.doctorId);
  sendSuccess(res, 201, 'Doctor added to favorites', favorite);
});

export const removeFavoriteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const result = await patientService.removeFavoriteDoctor(req.patientId!, req.params.doctorId);
  sendSuccess(res, 200, 'Doctor removed from favorites', result);
});

export const checkFavoriteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const isFavorited = await patientService.isDoctorFavorited(req.patientId!, req.params.doctorId);
  sendSuccess(res, 200, 'Favorite status fetched', { isFavorited });
});

export const listPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const prescriptions = await patientService.listPrescriptions(req.patientId!);
  sendSuccess(res, 200, 'Prescriptions fetched', prescriptions);
});

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const invoices = await patientService.listInvoices(req.patientId!);
  sendSuccess(res, 200, 'Invoices fetched', invoices);
});

export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await patientService.getWallet(req.user!.id);
  sendSuccess(res, 200, 'Wallet fetched', wallet);
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.validatedQuery as { page: number; limit: number };
  const result = await patientService.listNotifications(req.user!.id, page, limit);
  sendSuccess(res, 200, 'Notifications fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await patientService.markNotificationRead(req.user!.id, req.params.id);
  sendSuccess(res, 200, 'Notification marked as read', notification);
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await patientService.markAllNotificationsRead(req.user!.id);
  sendSuccess(res, 200, 'All notifications marked as read', result);
});
