import { config } from '../config';
import { logger } from '../utils/logger';

interface RateLimitEntry {
  requests: number[];
  blocked: boolean;
  blockExpires?: number;
}

class RateLimiter {
  private clients = new Map<string, RateLimitEntry>();
  private cleanupInterval: Timer;

  constructor() {
    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  check(clientId: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { requests: [], blocked: false });
    }

    const client = this.clients.get(clientId)!;

    // Check if client is blocked
    if (client.blocked && client.blockExpires && now < client.blockExpires) {
      return false;
    }

    // Remove block if expired
    if (client.blocked && client.blockExpires && now >= client.blockExpires) {
      client.blocked = false;
      client.blockExpires = undefined;
      client.requests = [];
    }

    // Remove old requests
    client.requests = client.requests.filter(time => time > windowStart);

    // Check rate limit
    if (client.requests.length >= maxRequests) {
      // Block aggressive clients
      if (client.requests.length >= maxRequests * 2) {
        client.blocked = true;
        client.blockExpires = now + windowMs * 5; // Block for 5x the window
        logger.warn('Client blocked for aggressive requests', { clientId });
      }
      return false;
    }

    // Add current request
    client.requests.push(now);
    return true;
  }

  private cleanup() {
    const now = Date.now();
    const cutoff = now - config.rateLimit.windowMs * 2;

    for (const [clientId, client] of this.clients.entries()) {
      // Remove clients with no recent activity
      if (client.requests.length === 0 && 
          (!client.blocked || (client.blockExpires && client.blockExpires < now))) {
        this.clients.delete(clientId);
      }
      // Clean old requests
      else {
        client.requests = client.requests.filter(time => time > cutoff);
      }
    }
  }

  getStats(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return { requests: 0, blocked: false };

    const now = Date.now();
    const windowStart = now - config.rateLimit.windowMs;
    const recentRequests = client.requests.filter(time => time > windowStart);

    return {
      requests: recentRequests.length,
      blocked: client.blocked,
      blockExpires: client.blockExpires,
      remaining: Math.max(0, config.rateLimit.maxRequests - recentRequests.length),
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

const rateLimiter = new RateLimiter();

export const rateLimitMiddleware = (req, res, next) => {
  const clientId = req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') || 
                  'unknown';

  const allowed = rateLimiter.check(
    clientId, 
    config.rateLimit.maxRequests, 
    config.rateLimit.windowMs
  );

  if (!allowed) {
    const stats = rateLimiter.getStats(clientId);
    
    logger.warn('Rate limit exceeded', { clientId, stats });

    return res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      ...(stats.blockExpires && {
        blockedUntil: new Date(stats.blockExpires).toISOString(),
      }),
    });
  }

  // Add rate limit headers
  const stats = rateLimiter.getStats(clientId);
  res.headers.set('X-RateLimit-Limit', config.rateLimit.maxRequests.toString());
  res.headers.set('X-RateLimit-Remaining', stats.remaining.toString());
  res.headers.set('X-RateLimit-Reset', new Date(Date.now() + config.rateLimit.windowMs).toISOString());

  return next();
};

// Cleanup on process exit
process.on('SIGTERM', () => rateLimiter.destroy());
process.on('SIGINT', () => rateLimiter.destroy());