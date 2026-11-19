import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/analyticsController.js';

const router = Router();
router.use(protect);

router.get('/descriptive', asyncHandler(controller.descriptive));
router.get('/predictive', asyncHandler(controller.predictive));
router.get('/prescriptive', asyncHandler(controller.prescriptive));
router.get('/marketing', asyncHandler(controller.marketing));
router.get('/overview', asyncHandler(controller.overview));

export default router;
