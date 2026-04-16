import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../utils/env.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized: User not found' 
        });
      }
      
      return next();
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized: Invalid token' 
      });
    }
  }
};

export const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized' 
        });
      }
      
      const user = await User.findById(req.user.id);
      const hasRole = user.roles.some(role => roles.includes(role));
      
      if (hasRole) {
        next();
      } else {
        return res.status(403).json({ 
          success: false,
          message: `Not authorized. Required roles: ${roles.join(', ')}` 
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  };
};