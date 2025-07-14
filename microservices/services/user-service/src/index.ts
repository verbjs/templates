import { Verb } from 'verb';
import { ServiceRegistry } from '../../../shared/registry';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { setupMiddleware } from './middleware';
import { connectDatabase } from './db/connection';
import { logger } from './utils/logger';
import { config } from './config';

async function startUserService() {
  const app = new Verb();

  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected');

    // Setup middleware
    setupMiddleware(app);

    // Setup HTTP routes
    setupRoutes(app);

    // Setup WebSocket for real-time user updates
    setupWebSocket(app);

    // Start service
    app.listen(config.port, async () => {
      logger.info(`👤 User Service running on port ${config.port}`);

      // Register with service registry
      const registry = new ServiceRegistry(config.consul.url);
      await registry.register({
        id: `user-service-${config.port}`,
        name: 'user-service',
        address: config.host,
        port: config.port,
        protocols: ['http', 'websocket'],
        health: `http://${config.host}:${config.port}/health`,
        tags: ['user', 'authentication', 'profile']
      });

      logger.info('Service registered with discovery');
    });

  } catch (error) {
    logger.error('Failed to start user service:', error);
    process.exit(1);
  }
}

startUserService();