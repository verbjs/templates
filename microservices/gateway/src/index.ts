import { server } from 'verb';

const config = { port: 3000 };
const logger = { info: console.log, error: console.error };

async function startGateway() {
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
        message: 'API Gateway',
        version: '1.0.0'
      });
    });

    // Start gateway
    app.listen(config.port);
    logger.info(`🌐 API Gateway running on port ${config.port}`);
    logger.info(`🏥 Health check: http://localhost:${config.port}/health`);

  } catch (error) {
    logger.error('Failed to start gateway:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Gateway shutting down...');
  process.exit(0);
});

startGateway();