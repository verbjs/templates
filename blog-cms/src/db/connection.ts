import { Pool } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

let pool: Pool;

export async function connectDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool({
      connectionString: config.database.url,
      max: 20,
      min: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 10000,
      query_timeout: 10000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connected successfully');
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}