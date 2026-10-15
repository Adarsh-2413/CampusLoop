import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order creation & client payment signature verification (authenticated student session)
router.post('/create-order', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);

// Webhook endpoint (asynchronous notification from Razorpay server, raw body verified)
router.post('/webhook', handleWebhook);

export default router;
