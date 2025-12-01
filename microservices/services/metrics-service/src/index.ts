import { server } from 'verb';

const config = { port: 3002 };
const logger = { info: console.log, error: console.error };

async function startMetricsService() {
  const app = server.http();

  try {
    // Health check route
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Welcome route
    app.get('/', (_req, res) => {
      res.json({
        message: 'Metrics Service API',
        version: '1.0.0'
      });
    });

    // Start service
    app.listen(config.port);
    logger.info(`📊 Metrics Service running on port ${config.port}`);

  } catch (error) {
    logger.error('Failed to start metrics service:', error);
    process.exit(1);
  }
}

startMetricsService();