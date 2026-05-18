import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.config.js';
import env from '../utils/env.js';

//  PROTECT MIDDLEWARE 

export const protect = async (req, res, next) => {
  let token;
  
  if (req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, env.jwtSecret);
      
      // Find user in database using Prisma
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized: User not found' 
        });
      }
      
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized: Invalid token' 
      });
    }
  }
  
  return res.status(401).json({ 
    success: false,
    message: 'Not authorized: No token provided' 
  });
};

//  ADMIN MIDDLEWARE - FIXED to accept admin 
export const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User not found'
      });
    }

    // Check if user has admin role
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.includes('admin');
    
    if (!isAdmin) {
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

//  AUTHORIZE MIDDLEWARE 
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized' 
        });
      }
      
      const userRoles = req.user.roles || [];
      const hasRole = userRoles.some(role => roles.includes(role));
      
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