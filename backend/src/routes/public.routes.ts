import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as publicController from '../controllers/public.controller';
import { contactFormSchema } from '../validators/appointment.validator';

const router = Router();

router.get('/specializations', publicController.listSpecializations);
router.get('/hospitals', publicController.listHospitals);
router.get('/stats', publicController.getPlatformStats);
router.get('/diseases', publicController.listDiseases);

router.post('/contact', validate(contactFormSchema), publicController.submitContactForm);

export default router; 
