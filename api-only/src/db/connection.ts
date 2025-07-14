import { Database } from 'bun:sqlite';
import { config } from '../config';
import { logger } from '../utils/logger';

let db: Database;

export async function connectDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    db = new Database(config.database.url);
    
    // Test connection
    db.query('SELECT 1').get();

    logger.info('Database connected successfully');
    return db;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    db.close();
    logger.info('Database connection closed');
  }
}