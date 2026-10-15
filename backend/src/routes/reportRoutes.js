import express from 'express';
import { createReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Report listing (requires student authentication)
router.post('/', authenticateToken, createReport);

export default router;
