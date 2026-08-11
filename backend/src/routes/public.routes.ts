import { Router } from 'express';
import { validate } from '../middleware/validate';
import * as publicController from '../controllers/public.controller';

const router = Router();

router.get('/specializations', publicController.listSpecializations);
router.get('/hospitals', publicController.listHospitals);
router.get('/stats', publicController.getPlatformStats);
router.get('/diseases', publicController.listDiseases);

export default router; 
