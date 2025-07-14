import { Verb } from 'verb';
import { ServiceRegistry } from './services/registry';
import { LoadBalancer } from './services/loadBalancer';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';
import { config } from './config';

async function startGateway() {
  const app = new Verb();

  try {
    // Initialize service registry
    const registry = new ServiceRegistry(config.consul.url);
    await registry.connect();

    // Initialize load balancer
    const loadBalancer = new LoadBalancer(registry);

    // Setup middleware
    setupMiddleware(app);

    // Setup routes with load balancing
    setupRoutes(app, loadBalancer);

    // Protocol-specific routing
    setupProtocolRouting(app, loadBalancer);

    // Start gateway
    app.listen(config.port, () => {
      logger.info(`🌐 API Gateway running on port ${config.port}`);
      logger.info(`📊 Admin panel: http://localhost:${config.port}/admin`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
    });

  } catch (error) {
    logger.error('Failed to start gateway:', error);
    process.exit(1);
  }
}

function setupProtocolRouting(app: Verb, loadBalancer: LoadBalancer) {
  // WebSocket routing
  app.websocket('/ws/:service/*', {
    open: async (ws) => {
      const service = ws.params.service;
      const target = await loadBalancer.getService(service, 'websocket');
      
      if (!target) {
        ws.close(1008, 'Service unavailable');
        return;
      }

      // Proxy WebSocket connection
      const targetWs = new WebSocket(`ws://${target.address}:${target.port}${ws.url}`);
      
      // Bidirectional proxy
      ws.on('message', (data) => targetWs.send(data));
      targetWs.on('message', (data) => ws.send(data));
      
      ws.on('close', () => targetWs.close());
      targetWs.on('close', () => ws.close());
    }
  });

  // UDP proxy
  app.udp(config.udp.port, {
    message: async (buffer, rinfo) => {
      const serviceHeader = buffer.slice(0, 4).toString();
      const service = serviceHeader.trim();
      
      const target = await loadBalancer.getService(service, 'udp');
      if (target) {
        app.udpSend(buffer.slice(4), target.port, target.address);
      }
    }
  });

  // TCP proxy
  app.tcp(config.tcp.port, {
    connection: async (socket) => {
      // Read service identifier from first packet
      socket.once('data', async (data) => {
        const service = data.slice(0, 8).toString().trim();
        const target = await loadBalancer.getService(service, 'tcp');
        
        if (!target) {
          socket.destroy();
          return;
        }

        // Create connection to target service
        const net = require('net');
        const targetSocket = net.createConnection(target.port, target.address);
        
        // Forward remaining data
        targetSocket.write(data.slice(8));
        
        // Bidirectional proxy
        socket.pipe(targetSocket);
        targetSocket.pipe(socket);
        
        socket.on('close', () => targetSocket.destroy());
        targetSocket.on('close', () => socket.destroy());
      });
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Gateway shutting down...');
  process.exit(0);
});

startGateway();