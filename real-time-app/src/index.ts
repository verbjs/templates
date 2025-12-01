import { server } from 'verb';

const config = { port: 3000 };
const logger = { info: console.log, error: console.error };

async function startServer() {
  const app = server.websocket();

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
        message: 'Real-time App API',
        version: '1.0.0'
      });
    });

    // Start server
    app.listen(config.port);
    logger.info(`🚀 Real-time app running on port ${config.port}`);
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