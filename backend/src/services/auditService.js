import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog.js';

/**
 * Creates an immutable audit log record for security, moderation, and compliance tracking.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.actorId - ID of user or admin performing the action
 * @param {string} params.action - Canonical action name (e.g. 'DELIST_PRODUCT', 'SUSPEND_USER', 'RESOLVE_REPORT')
 * @param {string} params.targetType - 'PRODUCT' | 'USER' | 'ORDER' | 'REPORT' | 'SYSTEM'
 * @param {string} params.targetId - Identifier of target entity
 * @param {Object} [params.metadata={}] - Additional structured contextual data
 * @param {string} [params.ipAddress=''] - Client IP address
 * @returns {Promise<Object>} Created audit log document or fallback object
 */
export const createAuditLog = async ({
  actorId,
  action,
  targetType,
  targetId,
  metadata = {},
  ipAddress = ''
}) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // In offline/test mode without active MongoDB Atlas connection
      return {
        _id: 'mock-audit-id-' + Date.now(),
        actorId,
        action,
        targetType,
        targetId,
        metadata,
        ipAddress,
        createdAt: new Date().toISOString()
      };
    }

    const logEntry = await AuditLog.create({
      actorId,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress
    });

    return logEntry;
  } catch (error) {
    console.error(`[AUDIT_LOG_ERROR] Failed to record audit log for action ${action}:`, error.message);
    // Audit logging failure should not crash the main business operation, but should be logged
    return null;
  }
};
