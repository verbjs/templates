# Verb Blog/CMS Starter Template

A modern, fast blog and content management system built with Verb framework featuring markdown editing, real-time collaboration, and advanced publishing workflows.

## Features

- ✍️ **Rich Editor** - Markdown editor with live preview
- 📝 **Content Management** - Posts, pages, categories, tags
- 👥 **Multi-author** - User roles (admin, editor, author, subscriber)
- 🔄 **Real-time Collaboration** - Live editing via WebSocket
- 🎨 **Themes** - Customizable themes and layouts
- 📱 **Responsive** - Mobile-first responsive design
- 🔍 **SEO Optimized** - Meta tags, sitemaps, structured data
- 💬 **Comments** - Built-in commenting system
- 📊 **Analytics** - Built-in analytics dashboard
- 🔗 **Media Library** - Image upload and management
- 📧 **Newsletter** - Email subscription management
- 🌐 **Multi-language** - i18n support

## Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
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

Visit:
- **Blog**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

## API Endpoints

### Content Management
```http
GET    /api/posts                 # List published posts
GET    /api/posts/:slug           # Get post by slug
POST   /api/admin/posts           # Create post (admin)
PUT    /api/admin/posts/:id       # Update post (admin)
DELETE /api/admin/posts/:id       # Delete post (admin)

GET    /api/pages                 # List pages
GET    /api/pages/:slug           # Get page by slug

GET    /api/categories            # List categories
GET    /api/tags                  # List tags
```

### User Management
```http
POST   /api/auth/register         # User registration
POST   /api/auth/login            # User login
GET    /api/users/profile         # Get user profile
PUT    /api/users/profile         # Update profile
```

### Comments
```http
GET    /api/posts/:id/comments    # Get post comments
POST   /api/posts/:id/comments    # Add comment
PUT    /api/comments/:id          # Update comment
DELETE /api/comments/:id          # Delete comment
```

### Media
```http
POST   /api/media/upload          # Upload media
GET    /api/media                 # List media files
DELETE /api/media/:id             # Delete media
```

## WebSocket Features

### Real-time Editing
```javascript
// Live collaboration
ws.send(JSON.stringify({
  type: 'editor:join',
  postId: '123'
}));

ws.send(JSON.stringify({
  type: 'editor:change',
  postId: '123',
  delta: { /* content changes */ }
}));
```

### Live Comments
```javascript
// Real-time comment updates
ws.send(JSON.stringify({
  type: 'comments:subscribe',
  postId: '123'
}));
```

## Project Structure

```
src/
├── routes/
│   ├── blog.ts          # Public blog routes
│   ├── admin.ts         # Admin panel routes
│   ├── api/
│   │   ├── posts.ts     # Post management API
│   │   ├── users.ts     # User management API
│   │   ├── comments.ts  # Comment system API
│   │   └── media.ts     # Media management API
├── services/
│   ├── contentService.ts
│   ├── userService.ts
│   ├── commentService.ts
│   └── mediaService.ts
├── models/
│   ├── Post.ts
│   ├── Page.ts
│   ├── User.ts
│   ├── Comment.ts
│   └── Media.ts
├── websocket/
│   ├── editor.ts        # Real-time editing
│   ├── comments.ts      # Live comments
│   └── notifications.ts # Admin notifications
├── themes/
│   ├── default/         # Default theme
│   └── custom/          # Custom themes
└── admin/
    ├── dashboard.ts     # Admin dashboard
    ├── posts.ts         # Post management
    ├── media.ts         # Media library
    └── settings.ts      # Site settings
```

## Content Creation Workflow

1. **Draft** - Create new post in draft mode
2. **Edit** - Real-time collaborative editing
3. **Review** - Editorial review process
4. **Schedule** - Schedule for future publication
5. **Publish** - Make live with SEO optimization
6. **Promote** - Share on social media

## Admin Dashboard

Access admin features at `/admin`:
- Content creation and editing
- Media library management
- User and role management
- Site settings and configuration
- Analytics and reporting
- Theme customization

## Real-time Collaboration

### Live Editing
```typescript
app.websocket('/ws/editor/:postId', {
  open: (ws) => {
    ws.subscribe(`editor:${ws.params.postId}`);
    ws.send(JSON.stringify({
      type: 'editor:users',
      users: getActiveEditors(ws.params.postId)
    }));
  },
  
  message: async (ws, data) => {
    const { type, delta } = JSON.parse(data);
    
    if (type === 'editor:change') {
      // Apply changes and broadcast
      await contentService.updateContent(ws.params.postId, delta);
      ws.publish(`editor:${ws.params.postId}`, data);
    }
  }
});
```

## Theme System

Themes are stored in `/themes` directory:
```
themes/
├── default/
│   ├── layout.html
│   ├── post.html
│   ├── index.html
│   ├── styles.css
│   └── scripts.js
└── custom/
    └── ...
```

### Theme Development
```typescript
// Custom theme registration
app.get('/', async (req, res) => {
  const theme = await themeService.getActiveTheme();
  const posts = await contentService.getRecentPosts();
  
  return res.render(`${theme}/index.html`, {
    posts,
    site: await settingsService.getSiteSettings()
  });
});
```

## SEO Features

- **Meta Tags** - Dynamic title, description, keywords
- **Open Graph** - Social media sharing optimization
- **Structured Data** - JSON-LD for search engines
- **Sitemaps** - Auto-generated XML sitemaps
- **Clean URLs** - SEO-friendly URL structure

## Performance

- **Static Generation** - Pre-generate popular pages
- **CDN Integration** - Optimized asset delivery
- **Image Optimization** - Automatic image resizing
- **Caching** - Redis-based content caching
- **Compression** - Gzip/Brotli compression

## Deployment

### Docker
```bash
docker build -t blog-cms .
docker run -p 3000:3000 blog-cms
```

### Production Features
- SSL/HTTPS enforcement
- Database connection pooling
- Redis session storage
- Email newsletter integration
- Backup automation
- Analytics integration

This blog/CMS template provides everything needed to build a modern, scalable content platform with real-time features and professional publishing workflows.