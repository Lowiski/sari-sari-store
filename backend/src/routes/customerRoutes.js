import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/customerController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(controller.list));
router.get('/summary', asyncHandler(controller.summary));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', validateBody({ name: { required: true, maxLength: 100 } }), asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
