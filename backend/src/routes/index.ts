import { Router } from 'express';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import doctorRoutes from './doctor.routes';
import reviewRoutes from './review.routes';
import patientRoutes from './patient.routes';
import doctorDashboardRoutes from './doctorDashboard.routes';
import adminRoutes from './admin.routes';
import appointmentRoutes from './appointment.routes';
import chatRoutes from './chat.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', publicRoutes);
router.use('/doctors', doctorRoutes);
router.use('/reviews', reviewRoutes);
router.use('/patients', patientRoutes);
router.use('/doctor', doctorDashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);

// Phase 10+: router.use('/prescriptions', prescriptionRoutes);

export default router;
