import { Request, Response } from 'verb';
import { logger } from '../utils/logger';

export function logging(req: Request, res: Response, next: () => void) {
  const start = Date.now();
  const { method, url, headers } = req;
  
  // Log request
  logger.info(`${method} ${url}`, {
    userAgent: headers['user-agent'],
    ip: req.ip || headers['x-forwarded-for'] || headers['x-real-ip']
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;
    logger.info(`${method} ${url} ${res.status} ${duration}ms`);
    return originalEnd.apply(this, args);
  };
  
  next();
}