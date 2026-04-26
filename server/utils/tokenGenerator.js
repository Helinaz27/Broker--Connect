import jwt from 'jsonwebtoken';
import env from './env.js';

// Generate JWT token
const generateToken = (id) => {
  const token=jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpire });
  return token;
};

// Set token in cookie
export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

// Clear token cookie
export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'strict'
  });
};

export default generateToken;