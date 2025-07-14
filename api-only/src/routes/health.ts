import { Verb } from 'verb';
import { getPool } from '../db/connection';
import { logger } from '../utils/logger';

export const healthRouter = new Verb();

healthRouter.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'ok'
    }
  };
  
  try {
    // Check database
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    health.checks.database = 'ok';
  } catch (error) {
    logger.error('Database health check failed:', error);
    health.checks.database = 'error';
    health.status = 'degraded';
  }
  
  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
  if (memUsageMB > 500) { // 500MB threshold
    health.checks.memory = 'warning';
    health.status = health.status === 'ok' ? 'degraded' : health.status;
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status = statusCode;
  res.json(health);
});