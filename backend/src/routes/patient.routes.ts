import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate';
import { attachPatientProfile } from '../middleware/attachPatientProfile';
import { validate } from '../middleware/validate';
import * as patientController from '../controllers/patient.controller';
import {
  updatePatientProfileSchema,
  listAppointmentsQuerySchema,
  createMedicalHistorySchema,
  addFavoriteDoctorSchema,
  paginationQuerySchema,
} from '../validators/patient.validator';

const router = Router();

// Every route here is a patient acting on their own data — lock the whole
// router down to authenticated patients before anything else runs.
router.use(authenticate, authorize('PATIENT'), attachPatientProfile);

router.get('/me/dashboard-summary', patientController.getDashboardSummary);

router.get('/me/profile', patientController.getProfile);
router.patch(
  '/me/profile',
  validate(updatePatientProfileSchema),
  patientController.updateProfile
);

router.get(
  '/me/appointments',
  validate(listAppointmentsQuerySchema),
  patientController.listAppointments
);

router.get('/me/medical-history', patientController.listMedicalHistory);
router.post(
  '/me/medical-history',
  validate(createMedicalHistorySchema),
  patientController.createMedicalHistoryEntry
);
router.delete('/me/medical-history/:id', patientController.deleteMedicalHistoryEntry);

router.get('/me/favorite-doctors', patientController.listFavoriteDoctors);
router.post(
  '/me/favorite-doctors',
  validate(addFavoriteDoctorSchema),
  patientController.addFavoriteDoctor
);
router.delete('/me/favorite-doctors/:doctorId', patientController.removeFavoriteDoctor);

router.get('/me/prescriptions', patientController.listPrescriptions);
router.get('/me/invoices', patientController.listInvoices);
router.get('/me/wallet', patientController.getWallet);

router.get(
  '/me/notifications',
  validate(paginationQuerySchema),
  patientController.listNotifications
);
router.patch('/me/notifications/:id/read', patientController.markNotificationRead);
router.patch('/me/notifications/read-all', patientController.markAllNotificationsRead);

export default router;
