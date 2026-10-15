import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // All order routes require student authentication

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

export default router;
