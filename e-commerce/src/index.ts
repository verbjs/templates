import { Verb } from 'verb';
import { config } from './config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { connectDatabase } from './db/connection';
import { ProductRepository } from './repositories/product';
import { UserRepository } from './repositories/user';
import { OrderRepository } from './repositories/order';
import { logger } from './utils/logger';

async function startServer() {
  const app = new Verb();

  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize repositories and create tables
    const userRepo = new UserRepository();
    const productRepo = new ProductRepository();
    const orderRepo = new OrderRepository();
    await userRepo.initializeTable();
    await productRepo.initializeTable();
    await orderRepo.initializeTable();
    logger.info('Database tables initialized');

    // Setup middleware
    setupMiddleware(app);

    // Setup routes
    setupRoutes(app);

    // Start server
    app.listen(config.port, () => {
      logger.info(`🛒 E-commerce server running on port ${config.port}`);
      logger.info(`📊 Admin dashboard at http://localhost:${config.port}/admin`);
      logger.info(`🛍️ Shop at http://localhost:${config.port}/shop`);
      logger.info(`🗺️ API docs at http://localhost:${config.port}/docs`);
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