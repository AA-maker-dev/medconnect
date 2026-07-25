import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate';
import { attachAdminProfile } from '../middleware/attachAdminProfile';
import { validate } from '../middleware/validate';
import * as adminController from '../controllers/admin.controller';
import { 
  paginationQuerySchema,
  listPatientsQuerySchema,
  listDoctorsQuerySchema,
  verifyDoctorSchema,
  toggleActiveSchema,
  listAppointmentsQuerySchema,
  listPaymentsQuerySchema,
  refundPaymentSchema,
  listReviewsQuerySchema,
  toggleReviewVisibilitySchema,
  analyticsQuerySchema,
  reportQuerySchema,
  broadcastNotificationSchema,
  updateAdminProfileSchema,
} from '../validators/admin.validator';

const router = Router();

// Everything here is admin-only.
router.use(authenticate, authorize('ADMIN'), attachAdminProfile);

router.get('/dashboard-summary', adminController.getDashboardSummary);

// ---- Patients ----
router.get('/patients', validate(listPatientsQuerySchema), adminController.listPatients);
router.get('/patients/:id', adminController.getPatientDetail);
router.patch(
  '/patients/:id/active',
  validate(toggleActiveSchema),
  adminController.setPatientActive
);

// ---- Doctors ----
router.get('/doctors', validate(listDoctorsQuerySchema), adminController.listDoctors);
router.get('/doctors/:id', adminController.getDoctorDetail);
router.patch(
  '/doctors/:id/verify',
  validate(verifyDoctorSchema),
  adminController.verifyDoctor
);
router.patch(
  '/doctors/:id/active',
  validate(toggleActiveSchema),
  adminController.setDoctorActive
);

// ---- Appointments ----
router.get(
  '/appointments',
  validate(listAppointmentsQuerySchema),
  adminController.listAppointments
);

// ---- Payments ----
router.get('/payments', validate(listPaymentsQuerySchema), adminController.listPayments);
router.post(
  '/payments/:id/refund',
  validate(refundPaymentSchema),
  adminController.refundPayment
);

// ---- Revenue & analytics & reports ----
router.get(
  '/revenue-analytics',
  validate(analyticsQuerySchema),
  adminController.getRevenueAnalytics
);
router.get(
  '/system-analytics',
  validate(analyticsQuerySchema),
  adminController.getSystemAnalytics
);
router.get(
  '/reports/appointments',
  validate(reportQuerySchema),
  adminController.getAppointmentReport
);

// ---- Reviews ----
router.get('/reviews', validate(listReviewsQuerySchema), adminController.listReviews);
router.patch(
  '/reviews/:id/visibility',
  validate(toggleReviewVisibilitySchema),
  adminController.setReviewVisibility
);
router.delete('/reviews/:id', adminController.deleteReview);

// ---- Notifications ----
router.post(
  '/notifications/broadcast',
  validate(broadcastNotificationSchema),
  adminController.broadcastNotification
);
router.get(
  '/me/notifications',
  validate(paginationQuerySchema),
  adminController.listMyNotifications
);
router.patch('/me/notifications/:id/read', adminController.markMyNotificationRead);
router.patch('/me/notifications/read-all', adminController.markAllMyNotificationsRead);

// ---- Profile ----
router.get('/me/profile', adminController.getProfile);
router.patch(
  '/me/profile',
  validate(updateAdminProfileSchema),
  adminController.updateProfile
);

export default router;
