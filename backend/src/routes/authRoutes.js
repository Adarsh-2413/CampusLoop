import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiting for auth endpoints (prevents brute-force credential stuffing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20, // 20 requests per IP per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticateToken, getMe);
router.post('/verify-email', verifyEmail);

export default router;
