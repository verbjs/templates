# Verb Framework Templates

Production-ready starter templates for building applications with the Verb framework. Each template provides a complete, opinionated foundation that follows best practices and includes everything needed to get started quickly.

## Available Templates

### 🚀 [API-Only](./api-only/)
**Perfect for**: REST APIs, microservices, backend services

A production-ready API starter with authentication, database integration, and comprehensive middleware. Includes JWT auth, rate limiting, validation, logging, and testing setup.

**Features:**
- ✅ JWT Authentication & Authorization
- ✅ Database integration (SQLite/PostgreSQL)
- ✅ Rate limiting & security middleware
- ✅ Input validation with Zod
- ✅ Comprehensive logging
- ✅ Health checks & monitoring
- ✅ Docker support
- ✅ Full test suite

**Tech Stack:** Verb, TypeScript, SQLite, JWT, Zod, Biome

---

### 📝 [Blog/CMS](./blog-cms/)
**Perfect for**: Content management systems, blogs, marketing sites

A complete CMS with admin panel, content management, and user authentication. Built for content creators and marketing teams.

**Features:**
- ✅ Content management system
- ✅ Admin dashboard
- ✅ User authentication
- ✅ Rich text editor
- ✅ Media management
- ✅ SEO optimization

**Tech Stack:** Verb, TypeScript, React, SQLite

---

### 🏪 [E-commerce](./ecommerce/)
**Perfect for**: Online stores, marketplaces, retail applications

Full-featured e-commerce platform with payment processing, inventory management, and order tracking.

**Features:**
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Payment processing
- ✅ Order management
- ✅ Inventory tracking
- ✅ User accounts

**Tech Stack:** Verb, TypeScript, React, PostgreSQL

---

### 🔄 [Microservices](./microservices/)
**Perfect for**: Distributed systems, enterprise applications, scalable architectures

Complete microservices architecture with API gateway, service discovery, and inter-service communication patterns.

**Features:**
- ✅ API Gateway
- ✅ Service registry
- ✅ Multiple services (User, Notification, Metrics)
- ✅ Docker Compose setup
- ✅ Shared utilities
- ✅ Load balancing ready

**Tech Stack:** Verb, TypeScript, Docker, PostgreSQL

---

### ⚡ [Real-time App](./realtime-app/)
**Perfect for**: Chat applications, live updates, collaborative tools

Real-time application foundation with WebSocket support, live updates, and multi-user collaboration features.

**Features:**
- ✅ WebSocket integration
- ✅ Real-time messaging
- ✅ Live updates
- ✅ User presence
- ✅ Room management
- ✅ Event broadcasting

**Tech Stack:** Verb, TypeScript, WebSockets, React

## Quick Start

### Using create-verb (Recommended)

```bash
# Create a new project from a template
bunx create-verb my-app --template api-only

# Or interactively choose a template
bunx create-verb my-app
```

### Manual Installation

```bash
# Clone a specific template
git clone https://github.com/verbjs/templates.git
cd templates/api-only

# Install dependencies
bun install

# Start development
bun run dev
```

## Template Structure

Each template follows a consistent structure:

```
template-name/
├── README.md              # Template-specific documentation
├── package.json           # Dependencies and scripts
├── Dockerfile             # Container configuration (when applicable)
├── bun.lock               # Lockfile
├── src/                   # Source code
│   ├── index.ts          # Application entry point
│   ├── config/           # Configuration management
│   ├── middleware/       # Custom middleware
│   ├── routes/           # Route handlers
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
└── tests/                # Test suite
```

## Development Workflow

All templates include these standard scripts:

```bash
# Development (with hot reload)
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Run tests
bun run test

# Code formatting
bun run lint
bun run lint:fix

# Type checking
bun run typecheck
```

## Template Features

### Common Features (All Templates)
- 🔧 **TypeScript** - Full type safety
- ⚡ **Bun Runtime** - Maximum performance
- 🧪 **Testing Setup** - Comprehensive test suite
- 🔍 **Code Quality** - Linting and formatting with Biome
- 📦 **Docker Support** - Production-ready containers
- 🔒 **Security** - Built-in security best practices
- 📝 **Documentation** - Complete setup and usage guides

### Performance Optimized
- Sub-millisecond response times
- Minimal memory footprint
- Efficient request handling
- Built-in caching strategies

### Production Ready
- Error handling and logging
- Health checks and monitoring
- Environment configuration
- Graceful shutdown handling
- Security middleware

## Customization

Each template is designed to be a starting point. Common customizations:

### Database
```typescript
// Switch from SQLite to PostgreSQL
import { Client } from 'pg';
const client = new Client(process.env.DATABASE_URL);

// Or use Bun's native drivers
import { Database } from 'bun:sqlite';
const db = new Database('app.db');
```

### Authentication
```typescript
// Add OAuth providers
app.get('/auth/github', githubAuth);
app.get('/auth/google', googleAuth);

// Add role-based permissions
app.use(requireRole('admin'));
```

### Middleware
```typescript
// Add custom middleware
app.use(customLogging);
app.use(analytics);
app.use(compression);
```

## Deployment

All templates include deployment configurations:

### Docker
```bash
# Build container
docker build -t my-app .

# Run container
docker run -p 3000:3000 my-app
```

### Cloud Platforms
- **Railway**: `railway deploy`
- **Fly.io**: `fly deploy`
- **Vercel**: Works with Edge Functions
- **AWS/GCP/Azure**: Standard container deployment

## Best Practices

### File Organization
- Keep routes thin, move logic to services
- Use middleware for cross-cutting concerns
- Organize by feature, not by file type
- Separate configuration from code

### Error Handling
```typescript
// Global error handler
app.use((error, req, res, next) => {
  logger.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### Environment Configuration
```typescript
// config/index.ts
export const config = {
  port: process.env.PORT || 3000,
  database: process.env.DATABASE_URL || 'sqlite:app.db',
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};
```

## Contributing

### Adding a New Template

1. **Create template directory**
   ```bash
   mkdir templates/my-template
   cd templates/my-template
   ```

2. **Follow template structure**
   - Include comprehensive README.md
   - Add package.json with standard scripts
   - Implement best practices
   - Add tests and documentation

3. **Test thoroughly**
   ```bash
   bun install
   bun run dev
   bun run test
   bun run build
   ```

4. **Update this README**
   - Add template to the list above
   - Include features and tech stack
   - Add any special instructions

### Template Requirements

- ✅ Complete README with setup instructions
- ✅ Production-ready configuration
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Test coverage > 80%
- ✅ TypeScript strict mode
- ✅ Proper logging and monitoring
- ✅ Docker support

## Support

- **Documentation**: [verb.sh/docs](https://verb.sh/docs)
- **Examples**: [verb.sh/examples](https://verb.sh/examples)
- **GitHub Issues**: [github.com/verbjs/verb](https://github.com/verbjs/verb)
- **Discord**: [Join our community](https://discord.gg/verb)

## License

All templates are MIT licensed. See individual template directories for specific license information.

---

**Ready to build something amazing?** Choose a template above and start building with Verb! 🚀