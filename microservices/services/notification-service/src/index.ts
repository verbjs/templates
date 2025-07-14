import { Verb } from 'verb';
import { ServiceRegistry } from '../../../shared/registry';
import { NotificationManager } from './services/notificationManager';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { setupUDP } from './udp';
import { setupMiddleware } from './middleware';
import { logger } from './utils/logger';
import { config } from './config';

async function startNotificationService() {
  const app = new Verb();

  try {
    // Initialize notification manager
    const notificationManager = new NotificationManager();
    await notificationManager.connect();

    // Setup middleware
    setupMiddleware(app);

    // Setup HTTP routes
    setupRoutes(app, notificationManager);

    // Setup WebSocket for real-time notifications
    setupWebSocket(app, notificationManager);

    // Setup UDP for high-frequency events
    setupUDP(app, notificationManager);

    // Start service
    app.listen(config.http.port, async () => {
      logger.info(`📢 Notification Service HTTP on port ${config.http.port}`);
      logger.info(`📡 Notification Service UDP on port ${config.udp.port}`);

      // Register with service registry
      const registry = new ServiceRegistry(config.consul.url);
      await registry.register({
        id: `notification-service-${config.http.port}`,
        name: 'notification-service',
        address: config.host,
        port: config.http.port,
        protocols: ['http', 'websocket', 'udp'],
        health: `http://${config.host}:${config.http.port}/health`,
        tags: ['notification', 'realtime', 'events', 'email', 'sms'],
        meta: {
          udp_port: config.udp.port.toString()
        }
      });

      logger.info('Notification service registered');
    });

  } catch (error) {
    logger.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

startNotificationService();