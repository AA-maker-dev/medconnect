import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.get('/featured', reviewController.listFeaturedReviews);

export default router;
 
