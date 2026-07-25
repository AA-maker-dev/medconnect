import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate';
import { attachDoctorProfile } from '../middleware/attachDoctorProfile';
import { validate } from '../middleware/validate';
import * as doctorDashboardController from '../controllers/doctorDashboard.controller';
import {
  updateDoctorProfileSchema,
  appointmentListQuerySchema, 
  updateAppointmentStatusSchema,
  availabilitySlotSchema,
  createPrescriptionSchema,
  revenueAnalyticsQuerySchema,
  paginationQuerySchema,
} from '../validators/doctor.validator';

const router = Router();

// Every route here acts on the logged-in doctor's own data.
router.use(authenticate, authorize('DOCTOR'), attachDoctorProfile);

router.get('/me/dashboard-summary', doctorDashboardController.getDashboardSummary);

router.get('/me/profile', doctorDashboardController.getProfile);
router.patch(
  '/me/profile',
  validate(updateDoctorProfileSchema),
  doctorDashboardController.updateProfile
);

router.get(
  '/me/appointments',
  validate(appointmentListQuerySchema),
  doctorDashboardController.listAppointments
);
router.patch(
  '/me/appointments/:id/status',
  validate(updateAppointmentStatusSchema),
  doctorDashboardController.updateAppointmentStatus
);

router.get(
  '/me/patients',
  validate(paginationQuerySchema),
  doctorDashboardController.listPatients
);
router.get('/me/patients/:patientId/history', doctorDashboardController.getPatientHistory);

router.get(
  '/me/revenue-analytics',
  validate(revenueAnalyticsQuerySchema),
  doctorDashboardController.getRevenueAnalytics
);

router.get('/me/availability', doctorDashboardController.listAvailability);
router.post(
  '/me/availability',
  validate(availabilitySlotSchema),
  doctorDashboardController.addAvailabilitySlot
);
router.delete('/me/availability/:id', doctorDashboardController.deleteAvailabilitySlot);

router.get('/me/wallet', doctorDashboardController.getWallet);

router.get(
  '/me/notifications',
  validate(paginationQuerySchema),
  doctorDashboardController.listNotifications
);
router.patch('/me/notifications/:id/read', doctorDashboardController.markNotificationRead);
router.patch('/me/notifications/read-all', doctorDashboardController.markAllNotificationsRead);

router.get('/me/prescriptions', doctorDashboardController.listPrescriptions);
router.post(
  '/me/prescriptions',
  validate(createPrescriptionSchema),
  doctorDashboardController.createPrescription
);

export default router;
