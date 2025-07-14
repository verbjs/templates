# Verb Microservices Starter Template

A production-ready microservices architecture template built with the Verb framework, featuring multi-protocol communication, service discovery, load balancing, and comprehensive monitoring.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │ Service Registry│    │  Load Balancer  │
│                 │    │   (Consul)      │    │     (Redis)     │
│ HTTP/WS/UDP/TCP │◄──►│                 │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  User Service   │ Notification    │    Metrics Service          │
│                 │   Service       │                             │
│ HTTP + WebSocket│ HTTP + WS + UDP │  HTTP + UDP + TCP           │
│ Authentication  │ Real-time       │  High-performance           │
│ User Management │ Notifications   │  Metrics Collection         │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                 │                       │
         ▼                 ▼                       ▼
┌─────────────────┬─────────────────┬─────────────────────────────┐
│   PostgreSQL    │      Redis      │       InfluxDB              │
│   User Data     │   Cache/Queue   │   Time Series Metrics       │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Features

- 🌐 **API Gateway** - Protocol routing with load balancing
- 🔍 **Service Discovery** - Consul-based service registry
- 📡 **Multi-Protocol** - HTTP, WebSocket, UDP, TCP support
- ⚖️ **Load Balancing** - Intelligent request distribution
- 📊 **Monitoring** - Prometheus, Grafana, Jaeger tracing
- 🔒 **Security** - JWT authentication, rate limiting
- 🐳 **Containerized** - Docker and Kubernetes support
- 🧪 **Testing** - Comprehensive test suite
- 📚 **Documentation** - API docs and service contracts

## Services

### API Gateway (Port 3000)
- **Protocol Routing**: Routes requests to appropriate services
- **Load Balancing**: Distributes load across service instances
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Authentication**: Centralized JWT validation
- **Monitoring**: Request tracking and metrics collection

### User Service (Port 3010)
- **Protocols**: HTTP + WebSocket
- **Features**: Authentication, user management, real-time profile updates
- **Database**: PostgreSQL for user data
- **Real-time**: WebSocket for live user status updates

### Notification Service (Port 3020 HTTP, 8020 UDP)
- **Protocols**: HTTP + WebSocket + UDP
- **Features**: Email, SMS, push notifications
- **Real-time**: WebSocket for instant notifications
- **High-frequency**: UDP for event streaming
- **Queue**: Redis for reliable message delivery

### Metrics Service (Port 3030 HTTP, 8030 UDP, 9030 TCP)
- **Protocols**: HTTP + UDP + TCP
- **Features**: StatsD-compatible metrics collection
- **Storage**: InfluxDB for time-series data
- **Protocols**: UDP for high-frequency metrics, TCP for reliable streams
- **Export**: Prometheus metrics endpoint

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository>
cd verb-microservices-starter
bun install
```

### 2. Environment Configuration

Create `.env` files for each service:

```bash
# Copy example environment files
cp .env.example .env
cp gateway/.env.example gateway/.env
cp services/user-service/.env.example services/user-service/.env
cp services/notification-service/.env.example services/notification-service/.env
cp services/metrics-service/.env.example services/metrics-service/.env
```

### 3. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Development Mode

```bash
# Start infrastructure only
docker-compose up -d consul redis postgres influxdb

# Start services in development mode
bun run dev
```

## Service Endpoints

### API Gateway (http://localhost:3000)
```http
# User routes (proxied to user-service)
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id

# Authentication
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh

# Notifications (proxied to notification-service)
POST   /api/notifications
GET    /api/notifications/:userId

# Metrics (proxied to metrics-service)
GET    /api/metrics
POST   /api/metrics

# WebSocket connections
WS     /ws/users         # User updates
WS     /ws/notifications # Real-time notifications

# Admin
GET    /admin/services   # Service registry status
GET    /admin/health     # Overall system health
```

### Protocol-Specific Endpoints

#### UDP Endpoints
```bash
# Send metrics (StatsD format)
echo "user.login:1|c" | nc -u localhost 8030

# Send notification events
echo "NOTIF|user123|New message" | nc -u localhost 8020
```

#### TCP Endpoints
```bash
# Stream metrics
nc localhost 9030
```

## Development

### Running Individual Services

```bash
# API Gateway
cd gateway && bun run dev

# User Service
cd services/user-service && bun run dev

# Notification Service
cd services/notification-service && bun run dev

# Metrics Service
cd services/metrics-service && bun run dev
```

### Testing

```bash
# Test all services
bun run test

# Test specific service
cd services/user-service && bun test

# Integration tests
bun run test:integration
```

### Adding New Services

1. Create service directory in `services/`
2. Copy package.json template
3. Implement service with Verb framework
4. Register with Consul on startup
5. Add to docker-compose.yml
6. Update API Gateway routing

Example service structure:
```
services/my-service/
├── package.json
├── src/
│   ├── index.ts          # Main entry point
│   ├── config/           # Configuration
│   ├── routes/           # HTTP routes
│   ├── services/         # Business logic
│   ├── middleware/       # Custom middleware
│   └── utils/           # Utilities
├── tests/
└── Dockerfile
```

## Monitoring and Observability

### Access Monitoring Tools

- **Consul UI**: http://localhost:8500 (Service discovery)
- **Prometheus**: http://localhost:9090 (Metrics)
- **Grafana**: http://localhost:3001 (Dashboards, admin/admin)
- **Jaeger**: http://localhost:16686 (Distributed tracing)

### Health Checks

```bash
# Overall system health
curl http://localhost:3000/health

# Individual service health
curl http://localhost:3010/health  # User service
curl http://localhost:3020/health  # Notification service
curl http://localhost:3030/health  # Metrics service
```

### Metrics Collection

Services automatically collect and expose metrics:

- **Request duration** and **count**
- **Error rates** by service and endpoint
- **System metrics** (CPU, memory, connections)
- **Custom business metrics**

## Kubernetes Deployment

Deploy to Kubernetes cluster:

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n microservices

# Access services
kubectl port-forward svc/api-gateway 3000:3000
```

## Service Communication Patterns

### HTTP Communication
```typescript
// Service-to-service HTTP calls
const response = await fetch('http://user-service:3010/api/users/123');
const user = await response.json();
```

### WebSocket Communication
```typescript
// Real-time updates
ws.publish('user-updates', { userId: '123', status: 'online' });
```

### UDP Communication
```typescript
// High-frequency events
app.udpSend(Buffer.from('EVENT|user123|action'), 8020, 'notification-service');
```

### TCP Communication
```typescript
// Reliable data streams
const stream = net.createConnection(9030, 'metrics-service');
stream.write('METRIC|counter|user.signups|1\n');
```

## Load Balancing

The API Gateway implements several load balancing strategies:

- **Round Robin**: Default for HTTP requests
- **Least Connections**: For WebSocket connections
- **Random**: For UDP packets
- **Sticky Sessions**: For stateful protocols

## Security

- **JWT Authentication**: Centralized token validation
- **Rate Limiting**: Per-service and global limits
- **CORS**: Configurable cross-origin policies
- **Input Validation**: Schema-based validation
- **Service-to-Service**: Internal network communication

## Production Deployment

### Environment Variables

Critical production settings:

```bash
# Security
JWT_SECRET=your-super-secret-key-32-chars-minimum
DATABASE_URL=postgresql://user:pass@db:5432/prod

# Service Discovery
CONSUL_URL=http://consul:8500
REDIS_URL=redis://redis:6379

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
JAEGER_URL=http://jaeger:14268
```

### Scaling

Scale individual services:

```bash
# Docker Compose
docker-compose up -d --scale user-service=3

# Kubernetes
kubectl scale deployment user-service --replicas=3
```

### Health Checks

Configure health checks for production:

```yaml
# Docker Compose
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
  interval: 30s
  timeout: 10s
  retries: 3

# Kubernetes
livenessProbe:
  httpGet:
    path: /health/live
    port: 3010
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Performance

Expected performance characteristics:

- **API Gateway**: 50,000+ req/sec
- **User Service**: 20,000+ req/sec  
- **Notification Service**: 100,000+ events/sec (UDP)
- **Metrics Service**: 500,000+ metrics/sec (UDP)

## Troubleshooting

### Common Issues

1. **Service Discovery**: Check Consul UI for registered services
2. **Database Connections**: Verify connection strings and credentials
3. **Port Conflicts**: Ensure no port conflicts with other applications
4. **Memory Issues**: Monitor service memory usage in Grafana

### Debugging

```bash
# View service logs
docker-compose logs -f user-service

# Check service registration
curl http://localhost:8500/v1/agent/services

# Test service connectivity
curl http://localhost:3010/health
```

This microservices template provides a complete foundation for building scalable, production-ready distributed systems with the Verb framework.