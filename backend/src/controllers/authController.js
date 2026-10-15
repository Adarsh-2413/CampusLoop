import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateToken, setSessionCookie, clearSessionCookie } from '../utils/token.js';
import { validateCollegeEmail } from '../utils/emailValidator.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, college, department, phone, hostelRoom, role } = req.body;

    // 1. Mandatory field checks
    if (!name || !email || !password || !college) {
      return res.status(400).json({
        success: false,
        error: 'Name, college email, password, and college affiliation are required.',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
        code: 'WEAK_PASSWORD'
      });
    }

    // 2. Validate college email domain
    const emailCheck = validateCollegeEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({
        success: false,
        error: emailCheck.message,
        code: 'INVALID_COLLEGE_EMAIL'
      });
    }

    // 3. Strict Privilege Guard: Users cannot register as ADMIN
    let assignedRole = 'BUYER';
    if (role === 'SELLER') {
      assignedRole = 'SELLER';
    } else if (role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin privilege cannot be self-assigned during registration.',
        code: 'ROLE_ESCALATION_BLOCKED'
      });
    }

    // 4. Check for existing account
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account is already registered with this college email address.',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // 5. Password hashing with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 7. Save user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      college: college.trim(),
      department: department?.trim() || 'Engineering',
      phone: phone?.trim() || '',
      hostelRoom: hostelRoom?.trim() || '',
      isEmailVerified: process.env.NODE_ENV === 'test', // Auto-verify in test env
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpires
    });

    // 8. Issue session cookie
    const token = generateToken(newUser);
    setSessionCookie(res, token);

    const responseData = {
      user: newUser.toSafeObject()
    };

    // Development-only verification helper
    if (process.env.NODE_ENV !== 'production') {
      responseData.devVerificationNotice = 'Development mode: Use token below or POST /api/auth/verify-email';
      responseData.devVerificationToken = verificationToken;
    }

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Generic error message for security (prevents user enumeration)
    const genericAuthError = {
      success: false,
      error: 'Invalid college email or password.',
      code: 'INVALID_CREDENTIALS'
    };

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json(genericAuthError);
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'This account has been suspended by campus moderators.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(genericAuthError);
    }

    // Issue session cookie
    const token = generateToken(user);
    setSessionCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearSessionCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
};

export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject()
    }
  });
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required.',
        code: 'MISSING_TOKEN'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token.',
        code: 'INVALID_TOKEN'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Student email verified successfully.',
      data: {
        user: user.toSafeObject()
      }
    });
  } catch (error) {
    next(error);
  }
};
