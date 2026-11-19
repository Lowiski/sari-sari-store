import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/productController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(controller.list));
router.get('/categories', asyncHandler(controller.categories));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', validateBody({
  sku: { required: true, maxLength: 30 },
  name: { required: true, maxLength: 100 },
  categoryId: { required: true, type: 'number' },
  price: { required: true, type: 'number', min: 0 },
  cost: { required: true, type: 'number', min: 0 },
}), asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
