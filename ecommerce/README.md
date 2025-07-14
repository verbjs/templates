# Verb E-commerce Starter Template

A complete e-commerce platform built with Verb framework featuring product management, shopping cart, payments integration, and real-time inventory updates.

## Features

- 🛍️ **Product Catalog** - Categories, search, filtering, variants
- 🛒 **Shopping Cart** - Real-time cart updates via WebSocket
- 💳 **Payment Processing** - Stripe integration with webhooks
- 📦 **Order Management** - Order tracking, fulfillment, returns
- 👤 **User Accounts** - Registration, profiles, order history
- 📊 **Admin Dashboard** - Product management, analytics
- 📱 **Real-time Updates** - Inventory, order status, notifications
- 🔍 **Search & Filters** - Full-text search, faceted navigation
- 📧 **Email Integration** - Order confirmations, shipping updates
- 🎨 **Customizable UI** - Responsive design with theme support

## Quick Start

### 1. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

Required environment variables:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-32-character-secret
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Database Setup
```bash
bun install
bun run db:migrate
bun run db:seed
```

### 3. Start Development
```bash
bun run dev
```

## API Endpoints

### Products
```http
GET    /api/products              # List products with filters
GET    /api/products/:id          # Get product details
POST   /api/admin/products        # Create product (admin)
PUT    /api/admin/products/:id    # Update product (admin)
DELETE /api/admin/products/:id    # Delete product (admin)
```

### Shopping Cart
```http
GET    /api/cart                  # Get current cart
POST   /api/cart/items            # Add item to cart
PUT    /api/cart/items/:id        # Update cart item
DELETE /api/cart/items/:id        # Remove cart item
POST   /api/cart/clear           # Clear cart
```

### Orders
```http
POST   /api/orders               # Create order
GET    /api/orders               # List user orders
GET    /api/orders/:id           # Get order details
POST   /api/orders/:id/cancel    # Cancel order
```

### Payments
```http
POST   /api/payments/intent      # Create payment intent
POST   /api/payments/confirm     # Confirm payment
POST   /api/webhooks/stripe      # Stripe webhooks
```

### WebSocket Events
```javascript
// Real-time cart updates
ws.send(JSON.stringify({
  type: 'cart:update',
  productId: '123',
  quantity: 2
}));

// Inventory updates
ws.send(JSON.stringify({
  type: 'inventory:subscribe',
  productIds: ['123', '456']
}));
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Verb API       │    │   Database      │
│   (React/Vue)   │◄──►│                 │◄──►│   PostgreSQL    │
│                 │    │ HTTP + WebSocket│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Stripe      │    │     Redis       │
                       │   (Payments)    │    │   (Cache/Cart)  │
                       └─────────────────┘    └─────────────────┘
```

## Project Structure

```
src/
├── routes/
│   ├── products.ts      # Product catalog API
│   ├── cart.ts          # Shopping cart API
│   ├── orders.ts        # Order management
│   ├── payments.ts      # Payment processing
│   ├── auth.ts          # Authentication
│   └── admin.ts         # Admin endpoints
├── services/
│   ├── productService.ts
│   ├── cartService.ts
│   ├── orderService.ts
│   ├── paymentService.ts
│   └── emailService.ts
├── models/
│   ├── Product.ts
│   ├── Cart.ts
│   ├── Order.ts
│   └── User.ts
├── websocket/
│   ├── cart.ts          # Real-time cart updates
│   ├── inventory.ts     # Stock notifications
│   └── orders.ts        # Order status updates
└── admin/
    ├── dashboard.ts     # Admin dashboard
    ├── products.ts      # Product management
    └── orders.ts        # Order management
```

## Database Schema

Key tables:
- **products** - Product catalog with variants
- **categories** - Product categorization
- **cart_items** - Shopping cart contents
- **orders** - Order information
- **order_items** - Order line items
- **users** - Customer accounts
- **payments** - Payment transactions

## Payment Flow

1. **Add to Cart** - Items stored in Redis for session persistence
2. **Checkout** - Create Stripe Payment Intent
3. **Payment** - Process payment via Stripe
4. **Fulfillment** - Update inventory, send confirmation email
5. **Webhooks** - Handle Stripe events for order updates

## Real-time Features

### Shopping Cart Sync
```typescript
// WebSocket cart synchronization
app.websocket('/ws/cart', {
  open: (ws) => {
    ws.subscribe(`cart:${ws.userId}`);
  },
  message: async (ws, data) => {
    const { type, productId, quantity } = JSON.parse(data);
    
    if (type === 'cart:update') {
      await cartService.updateItem(ws.userId, productId, quantity);
      ws.publish(`cart:${ws.userId}`, {
        type: 'cart:updated',
        cart: await cartService.getCart(ws.userId)
      });
    }
  }
});
```

### Inventory Updates
```typescript
// Real-time stock notifications
app.websocket('/ws/inventory', {
  message: async (ws, data) => {
    const { type, productIds } = JSON.parse(data);
    
    if (type === 'inventory:subscribe') {
      productIds.forEach(id => {
        ws.subscribe(`inventory:${id}`);
      });
    }
  }
});
```

## Admin Dashboard

Access admin features at `/admin`:
- Product management (CRUD operations)
- Order processing and tracking
- Customer management
- Sales analytics and reports
- Inventory management

## Testing

```bash
# Run all tests
bun test

# Test payments (requires Stripe test keys)
bun test src/services/paymentService.test.ts

# Integration tests
bun test src/integration/
```

## Deployment

### Docker
```bash
docker build -t ecommerce-app .
docker run -p 3000:3000 ecommerce-app
```

### Production Checklist
- [ ] Configure production Stripe keys
- [ ] Set up SSL certificates
- [ ] Configure email service (SendGrid/Mailgun)
- [ ] Set up Redis for cart persistence
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Configure CDN for static assets

This e-commerce template provides a solid foundation for building scalable online stores with modern features and real-time capabilities.