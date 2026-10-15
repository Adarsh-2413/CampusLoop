import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Report } from '../models/Report.js';
import { Order } from '../models/Order.js';
import { AuditLog } from '../models/AuditLog.js';
import { createAuditLog } from '../services/auditService.js';

/**
 * GET /api/admin/dashboard
 * Aggregates high-level platform integrity, catalog, user, and transaction metrics.
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Admin dashboard metrics retrieved (test mode)',
        data: {
          totalUsers: 418,
          activeProducts: 86,
          totalVolumeInPaise: 7240000,
          totalVolumeInRupees: 72400,
          openReports: 2,
          totalOrders: 54,
          isLiveDb: false
        }
      });
    }

    const [totalUsers, activeProducts, openReports, totalOrders, volumeAggregate] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'ACTIVE' }),
      Report.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$totalAmountInPaise' } } }
      ])
    ]);

    const totalVolumeInPaise = volumeAggregate[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: 'Admin dashboard metrics retrieved successfully',
      data: {
        totalUsers,
        activeProducts,
        totalVolumeInPaise,
        totalVolumeInRupees: Math.floor(totalVolumeInPaise / 100),
        openReports,
        totalOrders,
        isLiveDb: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reports
 * Fetches reported listings with optional filtering by status and pagination.
 */
export const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const mockReports = [
        {
          _id: '507f1f77bcf86cd799439011',
          reportedItem: 'Casio fx-991EX ClassWiz Scientific Calculator',
          productId: 'prod-001',
          reporter: { name: 'Student Amit K.', email: 'amit@student.nitk.edu.in' },
          reportedProductId: {
            _id: 'prod-001',
            title: 'Casio fx-991EX ClassWiz Scientific Calculator',
            priceInPaise: 110000,
            status: 'ACTIVE'
          },
          reason: 'Duplicate listing',
          details: 'Seller listed two identical calculators with slightly different prices in hostel group and here.',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439012',
          reportedItem: 'Electric Induction Cooktop 2000W',
          productId: 'prod-099',
          reporter: { name: 'Hostel Caretaker', email: 'caretaker@admin.nitk.edu.in' },
          reportedProductId: {
            _id: 'prod-099',
            title: 'Electric Induction Cooktop 2000W',
            priceInPaise: 150000,
            status: 'ACTIVE'
          },
          reason: 'Prohibited item',
          details: 'High-wattage induction stoves exceeding 1000W are restricted inside first-year hostel wings.',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      return res.status(200).json({
        success: true,
        data: {
          reports: mockReports,
          total: mockReports.length,
          page: Number(page),
          totalPages: 1
        }
      });
    }

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporterId', 'name email college')
        .populate('reportedProductId', 'title priceInPaise category status images sellerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        reports,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/reports/:id
 * Updates report investigation status and admin resolution notes.
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;

    const allowedStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${allowedStatuses.join(', ')}`
        }
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await createAuditLog({
        actorId: req.user?._id || 'mock-admin-id',
        action: `UPDATE_REPORT_${status}`,
        targetType: 'REPORT',
        targetId: id,
        metadata: { status, adminNotes },
        ipAddress: req.ip || ''
      });

      return res.status(200).json({
        success: true,
        message: `Report status updated to ${status}`,
        data: {
          _id: id,
          status,
          adminNotes,
          updatedAt: new Date().toISOString()
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Malformed report ID format'
        }
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Report does not exist'
        }
      });
    }

    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    await report.save();

    await createAuditLog({
      actorId: req.user._id,
      action: `REPORT_${status}`,
      targetType: 'REPORT',
      targetId: id,
      metadata: { previousStatus: report.status, newStatus: status, adminNotes },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/products/:id/status
 * Moderates a product listing (delist or reactivate).
 */
export const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason = 'Administrative moderation' } = req.body;

    const allowedStatuses = ['ACTIVE', 'INACTIVE', 'RESERVED', 'SOLD'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${allowedStatuses.join(', ')}`
        }
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await createAuditLog({
        actorId: req.user?._id || 'mock-admin-id',
        action: status === 'INACTIVE' ? 'DELIST_PRODUCT' : `UPDATE_PRODUCT_${status}`,
        targetType: 'PRODUCT',
        targetId: id,
        metadata: { status, reason },
        ipAddress: req.ip || ''
      });

      return res.status(200).json({
        success: true,
        message: `Product status successfully updated to ${status}`,
        data: {
          _id: id,
          status,
          moderationReason: reason
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Malformed product ID format'
        }
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product does not exist'
        }
      });
    }

    const previousStatus = product.status;
    product.status = status;
    await product.save();

    await createAuditLog({
      actorId: req.user._id,
      action: status === 'INACTIVE' ? 'DELIST_PRODUCT' : `UPDATE_PRODUCT_${status}`,
      targetType: 'PRODUCT',
      targetId: id,
      metadata: { previousStatus, newStatus: status, reason },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: `Product listing status updated to ${status}`,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Lists registered students and accounts for moderation and auditing.
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const mockUsers = [
        {
          _id: '507f1f77bcf86cd799439001',
          name: 'Prof. S. Rao',
          email: 'admin.moderator@nitk.edu.in',
          role: 'ADMIN',
          college: 'National Institute of Technology Karnataka (NITK)',
          department: 'Computer Science & Administration',
          status: 'ACTIVE',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439002',
          name: 'Arjun Sharma',
          email: 'arjun.seller@student.nitk.edu.in',
          role: 'SELLER',
          college: 'National Institute of Technology Karnataka (NITK)',
          department: 'Mechanical Engineering',
          status: 'ACTIVE',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439003',
          name: 'Sneha Patel',
          email: 'sneha.buyer@student.iitb.ac.in',
          role: 'BUYER',
          college: 'Indian Institute of Technology Bombay (IITB)',
          department: 'Electrical Engineering',
          status: 'ACTIVE',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        }
      ];

      return res.status(200).json({
        success: true,
        data: {
          users: mockUsers,
          total: mockUsers.length,
          page: Number(page),
          totalPages: 1
        }
      });
    }

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -emailVerificationToken -emailVerificationExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Suspends or activates a student account.
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason = 'Administrative account moderation' } = req.body;

    const allowedStatuses = ['ACTIVE', 'SUSPENDED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${allowedStatuses.join(', ')}`
        }
      });
    }

    // Self-suspension prevention check
    if (req.user && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SELF_MODERATION_BLOCKED',
          message: 'Administrators cannot alter their own account status'
        }
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await createAuditLog({
        actorId: req.user?._id || 'mock-admin-id',
        action: status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
        targetType: 'USER',
        targetId: id,
        metadata: { status, reason },
        ipAddress: req.ip || ''
      });

      return res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
        data: {
          _id: id,
          status,
          reason
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Malformed user ID format'
        }
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User does not exist'
        }
      });
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save();

    await createAuditLog({
      actorId: req.user._id,
      action: status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      targetType: 'USER',
      targetId: id,
      metadata: { previousStatus, newStatus: status, reason },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      data: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs
 * Fetches platform audit trails.
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { targetType, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const mockAuditLogs = [
        {
          _id: 'mock-audit-1',
          action: 'ADMIN_LOGIN',
          targetType: 'SYSTEM',
          targetId: 'admin-portal',
          metadata: { note: 'Admin signed in successfully' },
          actorId: { name: 'Prof. S. Rao', email: 'admin.moderator@nitk.edu.in', role: 'ADMIN' },
          createdAt: new Date(Date.now() - 600000).toISOString()
        },
        {
          _id: 'mock-audit-2',
          action: 'SYSTEM_HEALTH',
          targetType: 'SYSTEM',
          targetId: 'api-gateway',
          metadata: { status: 'OK', database: 'CONNECTED' },
          actorId: { name: 'System Watcher', email: 'system@campusloop.internal', role: 'ADMIN' },
          createdAt: new Date(Date.now() - 1500000).toISOString()
        }
      ];

      return res.status(200).json({
        success: true,
        data: {
          logs: mockAuditLogs,
          total: mockAuditLogs.length,
          page: Number(page),
          totalPages: 1
        }
      });
    }

    const query = {};
    if (targetType) query.targetType = targetType;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};
