import { Request, Response } from 'express';
import {
  DoctorVerificationStatus,
  AppointmentStatus,
  PaymentStatus,
  PaymentGateway,
} from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import * as adminService from '../services/admin.service';

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await adminService.getDashboardSummary(req.user!.id);
  sendSuccess(res, 200, 'Dashboard summary fetched', summary);
});

// ---- Patients ----

export const listPatients = asyncHandler(async (req: Request, res: Response) => {
  const { search, page, limit } = req.validatedQuery as {
    search?: string;
    page: number;
    limit: number;
  };
  const result = await adminService.listPatients(search, page, limit);
  sendSuccess(res, 200, 'Patients fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const getPatientDetail = asyncHandler(async (req: Request, res: Response) => {
  const patient = await adminService.getPatientDetail(req.params.id);
  sendSuccess(res, 200, 'Patient fetched', patient);
});

export const setPatientActive = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.setPatientActive(req.params.id, req.body.isActive);
  sendSuccess(res, 200, 'Patient status updated', result);
});

// ---- Doctors ----

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, page, limit } = req.validatedQuery as {
    search?: string;
    status?: DoctorVerificationStatus;
    page: number;
    limit: number;
  };
  const result = await adminService.listDoctors(search, status, page, limit);
  sendSuccess(res, 200, 'Doctors fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const getDoctorDetail = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await adminService.getDoctorDetail(req.params.id);
  sendSuccess(res, 200, 'Doctor fetched', doctor);
});

export const verifyDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { status, rejectionReason } = req.body as {
    status: 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
  };
  const doctor = await adminService.verifyDoctor(req.params.id, status, rejectionReason);
  sendSuccess(res, 200, 'Doctor verification updated', doctor);
});

export const setDoctorActive = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.setDoctorActive(req.params.id, req.body.isActive);
  sendSuccess(res, 200, 'Doctor status updated', result);
});

// ---- Appointments ----

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { status, from, to, page, limit } = req.validatedQuery as {
    status?: AppointmentStatus;
    from?: string;
    to?: string;
    page: number;
    limit: number;
  };
  const result = await adminService.listAppointments({ status, from, to }, page, limit);
  sendSuccess(res, 200, 'Appointments fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

// ---- Payments ----

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { status, gateway, page, limit } = req.validatedQuery as {
    status?: PaymentStatus;
    gateway?: PaymentGateway;
    page: number;
    limit: number;
  };
  const result = await adminService.listPayments({ status, gateway }, page, limit);
  sendSuccess(res, 200, 'Payments fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await adminService.refundPayment(req.params.id, req.body.refundAmount);
  sendSuccess(res, 200, 'Payment refunded', payment);
});

// ---- Revenue & analytics ----

export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { months } = req.validatedQuery as { months: number };
  const analytics = await adminService.getRevenueAnalytics(months);
  sendSuccess(res, 200, 'Revenue analytics fetched', analytics);
});

export const getSystemAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { months } = req.validatedQuery as { months: number };
  const analytics = await adminService.getSystemAnalytics(months);
  sendSuccess(res, 200, 'System analytics fetched', analytics);
});

export const getAppointmentReport = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.validatedQuery as { from?: string; to?: string };
  const report = await adminService.getAppointmentReport(from, to);
  sendSuccess(res, 200, 'Report generated', report);
});

// ---- Reviews ----

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const { visible, minRating, page, limit } = req.validatedQuery as {
    visible?: boolean;
    minRating?: number;
    page: number;
    limit: number;
  };
  const result = await adminService.listReviews({ visible, minRating }, page, limit);
  sendSuccess(res, 200, 'Reviews fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const setReviewVisibility = asyncHandler(async (req: Request, res: Response) => {
  const review = await adminService.setReviewVisibility(req.params.id, req.body.isVisible);
  sendSuccess(res, 200, 'Review visibility updated', review);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.deleteReview(req.params.id);
  sendSuccess(res, 200, 'Review deleted', result);
});

// ---- Notifications ----

export const broadcastNotification = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, targetRole } = req.body as {
    title: string;
    body: string;
    targetRole: 'PATIENT' | 'DOCTOR' | 'ALL';
  };
  const result = await adminService.broadcastNotification(title, body, targetRole);
  sendSuccess(res, 200, 'Notification broadcast sent', result);
});

export const listMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.validatedQuery as { page: number; limit: number };
  const result = await adminService.listMyNotifications(req.user!.id, page, limit);
  sendSuccess(res, 200, 'Notifications fetched', result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const markMyNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await adminService.markMyNotificationRead(req.user!.id, req.params.id);
  sendSuccess(res, 200, 'Notification marked as read', notification);
});

export const markAllMyNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.markAllMyNotificationsRead(req.user!.id);
  sendSuccess(res, 200, 'All notifications marked as read', result);
});

// ---- Profile ----

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await adminService.getProfile(req.adminId!);
  sendSuccess(res, 200, 'Profile fetched', profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await adminService.updateProfile(req.adminId!, req.body);
  sendSuccess(res, 200, 'Profile updated', profile);
});
