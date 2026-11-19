import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/reportController.js';

const router = Router();
router.use(protect);

router.get('/sales', asyncHandler(controller.sales));
router.get('/inventory', asyncHandler(controller.inventory));

export default router;
