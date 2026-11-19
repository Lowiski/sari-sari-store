import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/salesController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(controller.list));
router.get('/summary', asyncHandler(controller.summary));
router.get('/next-invoice', asyncHandler(controller.nextInvoice));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));

export default router;
