import { Router } from 'express';
import * as doctorController from '../controllers/doctor.controller';

const router = Router();

router.get('/', doctorController.listDoctors);
router.get('/:id', doctorController.getDoctorById);

export default router;
