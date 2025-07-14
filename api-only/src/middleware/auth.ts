import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'MISSING_TOKEN',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug('User authenticated', { userId: req.user.id, email: req.user.email });

    return next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
};

export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied', { 
        userId: req.user.id, 
        userRole: req.user.role, 
        requiredRoles: allowedRoles 
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
      });
    }

    return next();
  };
};