import { Verb } from 'verb';
import { config } from './config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { connectDatabase } from './db/connection';
import { BlogRepository } from './repositories/blog';
import { UserRepository } from './repositories/user';
import { logger } from './utils/logger';

async function startServer() {
  const app = new Verb();

  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize repositories and create tables
    const userRepo = new UserRepository();
    const blogRepo = new BlogRepository();
    await userRepo.initializeTable();
    await blogRepo.initializeTable();
    logger.info('Database tables initialized');

    // Setup middleware
    setupMiddleware(app);

    // Setup routes
    setupRoutes(app);

    // Start server
    app.listen(config.port, () => {
      logger.info(`📝 Blog CMS running on port ${config.port}`);
      logger.info(`📚 Admin panel at http://localhost:${config.port}/admin`);
      logger.info(`🌐 Public blog at http://localhost:${config.port}/blog`);
      logger.info(`🏥 Health check at http://localhost:${config.port}/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();