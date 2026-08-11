import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authenticate';
import { attachPatientProfile } from '../middleware/attachPatientProfile';
import { validate } from '../middleware/validate';
import * as appointmentController from '../controllers/appointment.controller';
import { 
  recommendedDoctorsQuerySchema,
  availableSlotsQuerySchema,
  createAppointmentSchema,
  rescheduleAppointmentSchema,
} from '../validators/appointment.validator';

const router = Router();

// ---- Public browsing (personalized if a patient happens to be logged in) ----
router.get(
  '/recommended-doctors',
  optionalAuthenticate,
  validate(recommendedDoctorsQuerySchema),
  appointmentController.getRecommendedDoctors
);
router.get(
  '/doctors/:doctorId/slots',
  validate(availableSlotsQuerySchema),
  appointmentController.getAvailableSlots
);

// ---- Booking (patient-only) ----
router.post(
  '/',
  authenticate,
  authorize('PATIENT'),
  attachPatientProfile,
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

router.patch(
  '/:id/reschedule',
  authenticate,
  authorize('PATIENT'),
  attachPatientProfile,
  validate(rescheduleAppointmentSchema),
  appointmentController.rescheduleAppointment
);

// ---- Confirmation / detail (owner patient or doctor) ----
router.get('/:id', authenticate, appointmentController.getAppointmentById);

export default router;
