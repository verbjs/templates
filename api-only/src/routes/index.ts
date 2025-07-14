export function setupRoutes(app: any) {
  // Health check route
  app.get('/health', async (req: any, res: any) => {
    try {
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      };
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  // API documentation
  app.get('/docs', (req: any, res: any) => {
    res.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/docs/openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.presets.standalone]
          });
        </script>
      </body>
      </html>
    `);
  });

  app.get('/docs/openapi.json', (req: any, res: any) => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'API Only Template',
        version: '1.0.0',
        description: 'RESTful API with authentication'
      },
      paths: {
        '/health': {
          get: {
            summary: 'Health check',
            responses: {
              '200': { description: 'Service is healthy' }
            }
          }
        }
      }
    };
    res.json(spec);
  });

  // 404 handler
  app.get('*', (req: any, res: any) => {
    res.status(404).json({ error: 'Route not found' });
  });
}