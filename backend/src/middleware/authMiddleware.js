import mongoose from 'mongoose';
import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // 1. Extract token from HTTP-only cookie or Authorization header
    let token = req.cookies?.campusloop_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to proceed.',
        code: 'UNAUTHORIZED'
      });
    }

    // 2. Verify signature & expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please log in again.',
        code: 'SESSION_EXPIRED'
      });
    }

    // 3. Verify user exists and is active in database
    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Account no longer exists.',
          code: 'USER_NOT_FOUND'
        });
      }

      if (user.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          error: 'Your account has been suspended by campus moderators.',
          code: 'ACCOUNT_SUSPENDED'
        });
      }
    } else {
      // Offline / Test environment fallback using verified JWT payload
      user = {
        _id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'BUYER',
        name: 'Verified Student',
        college: 'National Institute of Technology',
        status: 'ACTIVE',
        toSafeObject: function () {
          return {
            id: this._id,
            email: this.email,
            role: this.role,
            name: this.name,
            college: this.college
          };
        }
      };
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: This resource requires [${allowedRoles.join(' or ')}] role.`,
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};
