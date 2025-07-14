import { createServer } from 'verb';
import type { VerbRequest, VerbResponse } from 'verb';
import { config } from './config';
import { connectDatabase } from './db/connection';
import { logger } from './utils/logger';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    const app = createServer();
    
    // Health check route
    app.get('/health', async (_req: VerbRequest, res: VerbResponse) => {
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      };
      res.json(health);
    });

    // API documentation
    app.get('/docs', (_req: VerbRequest, res: VerbResponse) => {
      res.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>API Documentation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .endpoint { margin: 20px 0; padding: 10px; border-left: 4px solid #007cba; background: #f9f9f9; }
            .method { font-weight: bold; color: #007cba; }
          </style>
        </head>
        <body>
          <h1>API Documentation</h1>
          <div class="endpoint">
            <div><span class="method">GET</span> /health</div>
            <div>Health check endpoint</div>
          </div>
          <div class="endpoint">
            <div><span class="method">GET</span> /docs</div>
            <div>API documentation</div>
          </div>
        </body>
        </html>
      `);
    });

    // Welcome route
    app.get('/', (_req: VerbRequest, res: VerbResponse) => {
      res.json({ 
        message: 'Welcome to Verb API Template',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          docs: '/docs'
        }
      });
    });

    // Start server
    app.listen(config.port);
    logger.info(`🚀 Server running on port ${config.port}`);
    logger.info(`📚 API docs available at http://localhost:${config.port}/docs`);
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