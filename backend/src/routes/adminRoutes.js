import express from 'express';
import {
  getDashboardMetrics,
  getReports,
  updateReportStatus,
  updateProductStatus,
  getUsers,
  updateUserStatus,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes strictly require valid authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Admin Dashboard Overview & Metrics
router.get('/dashboard', getDashboardMetrics);

// Report Moderation Endpoints
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

// Product Catalog Moderation
router.patch('/products/:id/status', updateProductStatus);

// Student User Management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

// Platform Security & Audit Trail
router.get('/audit-logs', getAuditLogs);

export default router;
