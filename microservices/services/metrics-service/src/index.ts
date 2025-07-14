import { Verb } from 'verb';
import { ServiceRegistry } from '../../../shared/registry';
import { MetricsCollector } from './services/metricsCollector';
import { setupRoutes } from './routes';
import { setupUDP } from './udp';
import { setupTCP } from './tcp';
import { setupMiddleware } from './middleware';
import { logger } from './utils/logger';
import { config } from './config';

async function startMetricsService() {
  const app = new Verb();

  try {
    // Initialize metrics collector
    const metricsCollector = new MetricsCollector();
    await metricsCollector.connect();

    // Setup middleware
    setupMiddleware(app);

    // Setup HTTP routes (queries and admin)
    setupRoutes(app, metricsCollector);

    // Setup UDP for high-frequency metrics (StatsD protocol)
    setupUDP(app, metricsCollector);

    // Setup TCP for reliable metric streams
    setupTCP(app, metricsCollector);

    // Start service
    app.listen(config.http.port, async () => {
      logger.info(`📊 Metrics Service HTTP on port ${config.http.port}`);
      logger.info(`📡 Metrics Service UDP on port ${config.udp.port}`);
      logger.info(`🔌 Metrics Service TCP on port ${config.tcp.port}`);

      // Register with service registry
      const registry = new ServiceRegistry(config.consul.url);
      await registry.register({
        id: `metrics-service-${config.http.port}`,
        name: 'metrics-service',
        address: config.host,
        port: config.http.port,
        protocols: ['http', 'udp', 'tcp'],
        health: `http://${config.host}:${config.http.port}/health`,
        tags: ['metrics', 'monitoring', 'stats', 'timeseries'],
        meta: {
          udp_port: config.udp.port.toString(),
          tcp_port: config.tcp.port.toString(),
          protocols: 'statsd,prometheus,influx'
        }
      });

      logger.info('Metrics service registered');
    });

  } catch (error) {
    logger.error('Failed to start metrics service:', error);
    process.exit(1);
  }
}

startMetricsService();