import { Router } from 'express';
import * as publicController from '../controllers/public.controller';

const router = Router();

router.get('/specializations', publicController.listSpecializations);
router.get('/hospitals', publicController.listHospitals);
router.get('/stats', publicController.getPlatformStats);

export default router;
