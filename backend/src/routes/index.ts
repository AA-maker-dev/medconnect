import { Router } from 'express';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import doctorRoutes from './doctor.routes';
import reviewRoutes from './review.routes';
import patientRoutes from './patient.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', publicRoutes);
router.use('/doctors', doctorRoutes);
router.use('/reviews', reviewRoutes);
router.use('/patients', patientRoutes);

// Phase 7+: router.use('/appointments', appointmentRoutes);
// Phase 8+: socket namespace registered separately in src/socket
// Phase 9+: router.use('/payments', paymentRoutes);
// Phase 10+: router.use('/prescriptions', prescriptionRoutes);
//            router.use('/notifications', notificationRoutes);

export default router;
