import { Verb } from 'verb';
import { config } from './config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { connectDatabase } from './db/connection';
import { RoomRepository } from './repositories/room';
import { UserRepository } from './repositories/user';
import { MessageRepository } from './repositories/message';
import { logger } from './utils/logger';

async function startServer() {
  const app = new Verb();

  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize repositories and create tables
    const userRepo = new UserRepository();
    const roomRepo = new RoomRepository();
    const messageRepo = new MessageRepository();
    await userRepo.initializeTable();
    await roomRepo.initializeTable();
    await messageRepo.initializeTable();
    logger.info('Database tables initialized');

    // Setup middleware
    setupMiddleware(app);

    // Setup HTTP routes
    setupRoutes(app);

    // Setup WebSocket handlers
    setupWebSocket(app);

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Real-time app running on port ${config.port}`);
      logger.info(`💬 Chat interface at http://localhost:${config.port}/chat`);
      logger.info(`🎮 Game rooms at http://localhost:${config.port}/rooms`);
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