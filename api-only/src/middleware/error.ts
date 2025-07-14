import { config } from '../config';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMiddleware = (error: Error, req: any, res: any, next: any) => {
  const errorId = crypto.randomUUID();

  // Log error with context
  logger.error('Application error', {
    errorId,
    message: error.message,
    stack: error.stack,
    name: error.name,
    url: req.url,
    method: req.method,
    userAgent: req.headers.get('user-agent'),
    userId: req.user?.id,
    requestId: req.requestId,
  });

  // Handle different error types
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details,
      errorId,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle validation errors
  if (error.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.issues,
      errorId,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      errorId,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle database errors
  if (error.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE',
      errorId,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      error: 'Invalid reference',
      code: 'INVALID_REFERENCE',
      errorId,
      timestamp: new Date().toISOString(),
    });
  }

  // Default server error
  const response: any = {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    errorId,
    timestamp: new Date().toISOString(),
  };

  // Include error details in development
  if (config.isDevelopment) {
    response.details = {
      message: error.message,
      stack: error.stack,
    };
  }

  return res.status(500).json(response);
};