import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/inventoryController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(controller.stock));
router.get('/transactions', asyncHandler(controller.transactions));
router.get('/alerts', asyncHandler(controller.alerts));
router.get('/valuation', asyncHandler(controller.valuation));
router.post('/stock-in', validateBody({
  productId: { required: true, type: 'number' },
  quantity: { required: true, type: 'number', min: 1 },
}), asyncHandler(controller.inbound));
router.post('/stock-out', validateBody({
  productId: { required: true, type: 'number' },
  quantity: { required: true, type: 'number', min: 1 },
}), asyncHandler(controller.outbound));

export default router;
