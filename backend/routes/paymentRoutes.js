import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.post('/initialize', protect, paymentController.initializePayment);
router.get('/verify/:reference', protect, paymentController.verifyPayment);

export default router;