import { Request, Response } from 'verb';
import { config } from '../config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Simple in-memory rate limiting
export function security(req: Request, res: Response, next: () => void) {
  // Security headers
  res.headers['X-Content-Type-Options'] = 'nosniff';
  res.headers['X-Frame-Options'] = 'DENY';
  res.headers['X-XSS-Protection'] = '1; mode=block';
  res.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  res.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  
  // Rate limiting
  const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();
  const windowStart = now - config.rateLimit.windowMs;
  
  // Clean old entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const existing = rateLimitStore.get(ip as string);
  
  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(ip as string, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs
    });
  } else {
    existing.count++;
    
    if (existing.count > config.rateLimit.maxRequests) {
      res.status = 429;
      res.json({ error: 'Too many requests' });
      return;
    }
  }
  
  next();
}