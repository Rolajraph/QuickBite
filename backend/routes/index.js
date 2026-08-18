import { Router } from 'express';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import foodRoutes from './foodRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Food Ordering API — v1' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/foods', foodRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

export default router;