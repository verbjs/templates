# Verb API Starter Template

A production-ready API starter template built with the Verb framework. This template provides a solid foundation for building scalable REST APIs with authentication, validation, rate limiting, logging, and monitoring.

## Features

- 🚀 **Verb Framework** - High-performance multi-protocol web framework
- 🔐 **JWT Authentication** - Secure authentication with refresh tokens
- ✅ **Request Validation** - Schema validation with Zod
- 🛡️ **Security** - Rate limiting, CORS, security headers
- 📊 **Monitoring** - Health checks, metrics, structured logging
- 🗄️ **Database** - PostgreSQL with connection pooling
- 🧪 **Testing** - Comprehensive test suite with coverage
- 📦 **Docker** - Container support for deployment
- 🔧 **TypeScript** - Full TypeScript support with strict typing

## Quick Start

### 1. Environment Setup

Create a `.env` file:

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/verbapi

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Database Setup

```bash
# Run migrations
bun run db:migrate

# Seed database (optional)
bun run db:seed
```

### 4. Start Development Server

```bash
bun run dev
```

The API will be available at:
- **API**: http://localhost:3000/api
- **Health**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics
- **Docs**: http://localhost:3000/docs

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Users (Protected)

```http
GET    /api/protected/users
GET    /api/protected/users/:id
PUT    /api/protected/users/:id
DELETE /api/protected/users/:id
```

### Health & Monitoring

```http
GET /health           # Basic health check
GET /health/live      # Liveness probe
GET /health/ready     # Readiness probe
GET /health/detailed  # Detailed health info
GET /metrics          # Prometheus metrics
```

## Project Structure

```
src/
├── config/           # Configuration management
├── middleware/       # Custom middleware
├── routes/          # API route definitions
├── services/        # Business logic
├── repositories/    # Data access layer
├── db/             # Database setup and migrations
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
```

## Scripts

```bash
# Development
bun run dev          # Start with hot reload
bun run start        # Start production server

# Building
bun run build        # Build for production

# Testing
bun run test         # Run tests
bun run test:watch   # Watch mode
bun run test:coverage # With coverage

# Code Quality
bun run lint         # Check code style
bun run lint:fix     # Fix code style
bun run typecheck    # Type checking

# Database
bun run db:migrate   # Run migrations
bun run db:seed      # Seed database

# Docker
bun run docker:build # Build Docker image
bun run docker:run   # Run container
```

## Authentication

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Access protected routes

```bash
curl -X GET http://localhost:3000/api/protected/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configurable origins
- **Security Headers**: XSS protection, content type sniffing prevention
- **Input Validation**: Schema-based validation with detailed errors
- **JWT Security**: Secure token generation with blacklisting
- **Password Hashing**: bcrypt with configurable rounds

## Monitoring

### Health Checks

- **Basic**: `/health` - Overall application health
- **Liveness**: `/health/live` - Process is alive
- **Readiness**: `/health/ready` - Ready to serve traffic
- **Detailed**: `/health/detailed` - Comprehensive health info

### Metrics

Prometheus-compatible metrics at `/metrics`:

- HTTP request metrics (duration, status codes, count)
- System metrics (memory, CPU, uptime)
- Custom application metrics

### Logging

Structured JSON logging with:

- Request correlation IDs
- User context
- Error tracking
- Performance monitoring

## Deployment

### Docker

```bash
# Build image
docker build -t verb-api .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e JWT_SECRET="your-jwt-secret" \
  verb-api
```

### Docker Compose

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure `DATABASE_URL` for production database
- [ ] Set appropriate `CORS_ORIGIN` values
- [ ] Configure rate limiting for your use case
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up backup strategy
- [ ] Enable HTTPS in production

## Configuration

All configuration is handled through environment variables with validation:

- **Required**: `DATABASE_URL`, `JWT_SECRET`
- **Optional**: All others have sensible defaults
- **Validation**: Automatic validation on startup with clear error messages

## Testing

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage report
bun test --coverage
```

Tests include:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Authentication flow tests
- Error handling tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.