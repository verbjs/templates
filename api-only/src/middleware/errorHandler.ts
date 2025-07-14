import { Request, Response } from 'verb';
import { logger } from '../utils/logger';
import { config } from '../config';

export function errorHandler(error: Error, req: Request, res: Response, next: () => void) {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });
  
  // Don't expose stack traces in production
  const isDev = config.isDevelopment;
  
  res.status = 500;
  res.json({
    error: 'Internal server error',
    ...(isDev && { 
      message: error.message,
      stack: error.stack 
    })
  });
}