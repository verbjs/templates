import { server } from 'verb';
import { config } from './config';
import { connectDatabase } from './db/connection';
import { logger } from './utils/logger';

async function startServer() {
  const app = server.http();

  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Health check route
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Start server
    app.listen(config.port);
    logger.info(`📝 Blog CMS running on port ${config.port}`);
    logger.info(`🏥 Health check at http://localhost:${config.port}/health`);

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