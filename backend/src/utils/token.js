import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campusloop_fallback_dev_secret_key_12345';
const TOKEN_EXPIRY = process.env.SESSION_EXPIRES_IN || '7d';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const setSessionCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('campusloop_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

export const clearSessionCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('campusloop_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
};
