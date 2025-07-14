# Verb Real-time App Starter Template

A comprehensive real-time application template featuring chat, collaboration tools, live notifications, and real-time data synchronization built with WebSocket-heavy architecture.

## Features

- 💬 **Multi-room Chat** - Real-time messaging with rooms and channels
- 🤝 **Live Collaboration** - Shared documents, whiteboards, cursors
- 📊 **Real-time Dashboard** - Live data updates and metrics
- 🔔 **Push Notifications** - Instant notifications across devices
- 👥 **Presence System** - User online/offline status and activity
- 🎮 **Live Gaming** - Real-time multiplayer game support
- 📹 **Video Chat Integration** - WebRTC signaling server
- 🔄 **Data Sync** - Real-time data synchronization
- 📈 **Live Analytics** - Real-time event tracking
- 🌐 **Multi-device Sync** - Seamless cross-device experience

## Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Start Services
```bash
bun install
bun run dev
```

### 3. Access Applications
- **Chat App**: http://localhost:3000/chat
- **Collaboration**: http://localhost:3000/collab
- **Dashboard**: http://localhost:3000/dashboard
- **WebSocket Playground**: http://localhost:3000/playground

## WebSocket Endpoints

### Chat System
```javascript
// Connect to chat
const ws = new WebSocket('ws://localhost:3000/ws/chat');

// Join room
ws.send(JSON.stringify({
  type: 'room:join',
  room: 'general'
}));

// Send message
ws.send(JSON.stringify({
  type: 'message:send',
  room: 'general',
  content: 'Hello everyone!'
}));
```

### Collaboration
```javascript
// Connect to document
const ws = new WebSocket('ws://localhost:3000/ws/collab/doc123');

// Send cursor position
ws.send(JSON.stringify({
  type: 'cursor:move',
  x: 100,
  y: 200
}));

// Send document changes
ws.send(JSON.stringify({
  type: 'doc:change',
  operation: 'insert',
  position: 45,
  content: 'Hello'
}));
```

### Real-time Dashboard
```javascript
// Subscribe to metrics
const ws = new WebSocket('ws://localhost:3000/ws/dashboard');

ws.send(JSON.stringify({
  type: 'metrics:subscribe',
  metrics: ['users_online', 'messages_per_second', 'cpu_usage']
}));
```

## Project Structure

```
src/
├── websocket/
│   ├── chat/
│   │   ├── rooms.ts         # Chat room management
│   │   ├── messages.ts      # Message handling
│   │   └── presence.ts      # User presence
│   ├── collaboration/
│   │   ├── documents.ts     # Shared documents
│   │   ├── cursors.ts       # Live cursors
│   │   └── operations.ts    # Operational transforms
│   ├── dashboard/
│   │   ├── metrics.ts       # Real-time metrics
│   │   ├── alerts.ts        # Live alerts
│   │   └── analytics.ts     # Event tracking
│   └── gaming/
│       ├── lobby.ts         # Game lobbies
│       ├── matchmaking.ts   # Player matching
│       └── gameplay.ts      # Game state sync
├── services/
│   ├── connectionManager.ts
│   ├── roomManager.ts
│   ├── presenceService.ts
│   └── syncService.ts
├── models/
│   ├── Connection.ts
│   ├── Room.ts
│   ├── Message.ts
│   └── User.ts
└── frontend/
    ├── chat.html
    ├── collab.html
    ├── dashboard.html
    └── playground.html
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Clients   │    │  Mobile Apps    │    │  Desktop Apps   │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼──────────────┐
                    │      Verb WebSocket        │
                    │         Server             │
                    │                            │
                    │  ┌──────────────────────┐  │
                    │  │  Connection Manager  │  │
                    │  │  Room Manager        │  │
                    │  │  Presence Service    │  │
                    │  │  Sync Service        │  │
                    │  └──────────────────────┘  │
                    └─────────────┬──────────────┘
                                  │
                         ┌────────▼────────┐
                         │      Redis      │
                         │  (Pub/Sub +     │
                         │   State Store)  │
                         └─────────────────┘
```

## Real-time Features

### 1. Chat System
```typescript
app.websocket('/ws/chat', {
  open: (ws) => {
    connectionManager.addConnection(ws);
    ws.send(JSON.stringify({
      type: 'connection:established',
      connectionId: ws.id
    }));
  },
  
  message: async (ws, data) => {
    const { type, room, content } = JSON.parse(data);
    
    switch (type) {
      case 'room:join':
        await roomManager.joinRoom(ws, room);
        break;
      case 'message:send':
        await chatService.sendMessage(ws, room, content);
        break;
      case 'typing:start':
        await presenceService.setTyping(ws, room, true);
        break;
    }
  }
});
```

### 2. Live Collaboration
```typescript
app.websocket('/ws/collab/:docId', {
  open: async (ws) => {
    const docId = ws.params.docId;
    await collaborationService.joinDocument(ws, docId);
    
    // Send current document state
    const document = await documentService.getDocument(docId);
    ws.send(JSON.stringify({
      type: 'doc:state',
      content: document.content,
      version: document.version
    }));
  },
  
  message: async (ws, data) => {
    const { type, operation } = JSON.parse(data);
    
    if (type === 'doc:change') {
      // Apply operational transform
      const transformed = await otService.transform(operation);
      await documentService.applyOperation(ws.params.docId, transformed);
      
      // Broadcast to other users
      ws.publish(`doc:${ws.params.docId}`, JSON.stringify({
        type: 'doc:operation',
        operation: transformed
      }));
    }
  }
});
```

### 3. Real-time Dashboard
```typescript
app.websocket('/ws/dashboard', {
  open: (ws) => {
    // Subscribe to system metrics
    ws.subscribe('metrics:system');
    ws.subscribe('metrics:application');
    
    // Send initial metrics
    ws.send(JSON.stringify({
      type: 'metrics:initial',
      data: metricsService.getCurrentMetrics()
    }));
  },
  
  message: async (ws, data) => {
    const { type, metrics } = JSON.parse(data);
    
    if (type === 'metrics:subscribe') {
      metrics.forEach(metric => {
        ws.subscribe(`metrics:${metric}`);
      });
    }
  }
});

// Broadcast metrics every second
setInterval(() => {
  const metrics = metricsService.collect();
  app.publish('metrics:system', JSON.stringify({
    type: 'metrics:update',
    data: metrics
  }));
}, 1000);
```

## Scaling Features

### Connection Management
```typescript
class ConnectionManager {
  private connections = new Map<string, WebSocket>();
  private rooms = new Map<string, Set<string>>();
  
  addConnection(ws: WebSocket) {
    ws.id = crypto.randomUUID();
    this.connections.set(ws.id, ws);
    
    ws.on('close', () => {
      this.removeConnection(ws.id);
    });
  }
  
  broadcast(room: string, message: any) {
    const roomConnections = this.rooms.get(room);
    if (!roomConnections) return;
    
    const serialized = JSON.stringify(message);
    for (const connectionId of roomConnections) {
      const ws = this.connections.get(connectionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(serialized);
      }
    }
  }
}
```

### Horizontal Scaling
```typescript
// Redis pub/sub for multi-server scaling
class ScalableRoomManager {
  constructor(private redis: Redis) {}
  
  async joinRoom(ws: WebSocket, room: string) {
    // Add to local room
    this.localRooms.add(ws.id, room);
    
    // Subscribe to Redis channel
    await this.redis.subscribe(`room:${room}`);
    
    // Broadcast join event
    await this.redis.publish(`room:${room}`, JSON.stringify({
      type: 'user:joined',
      userId: ws.userId,
      server: process.env.SERVER_ID
    }));
  }
  
  async broadcastToRoom(room: string, message: any) {
    // Broadcast locally
    this.localBroadcast(room, message);
    
    // Broadcast via Redis to other servers
    await this.redis.publish(`room:${room}`, JSON.stringify(message));
  }
}
```

## Performance Optimizations

### Message Batching
```typescript
class MessageBatcher {
  private batches = new Map<string, any[]>();
  private timers = new Map<string, NodeJS.Timeout>();
  
  add(room: string, message: any) {
    if (!this.batches.has(room)) {
      this.batches.set(room, []);
    }
    
    this.batches.get(room)!.push(message);
    
    // Batch messages for 50ms or max 10 messages
    if (!this.timers.has(room)) {
      const timer = setTimeout(() => this.flush(room), 50);
      this.timers.set(room, timer);
    }
    
    if (this.batches.get(room)!.length >= 10) {
      this.flush(room);
    }
  }
  
  private flush(room: string) {
    const batch = this.batches.get(room);
    if (batch && batch.length > 0) {
      roomManager.broadcast(room, {
        type: 'batch',
        messages: batch
      });
      
      this.batches.set(room, []);
    }
    
    const timer = this.timers.get(room);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(room);
    }
  }
}
```

## Example Applications

### 1. Real-time Chat
- Multi-room support
- Private messaging
- File sharing
- Emoji reactions
- Message threading

### 2. Collaborative Editor
- Shared document editing
- Live cursors
- Comment system
- Version history
- Conflict resolution

### 3. Live Dashboard
- Real-time metrics
- Alert system
- Data visualization
- User activity tracking
- System monitoring

### 4. Multiplayer Game
- Game lobby system
- Real-time gameplay
- Player matchmaking
- Spectator mode
- Leaderboards

## Testing

```bash
# WebSocket load testing
bun test src/tests/websocket-load.test.ts

# Connection stress test
bun test src/tests/connection-stress.test.ts

# Message throughput test
bun test src/tests/message-throughput.test.ts
```

## Deployment

### Docker
```bash
docker build -t realtime-app .
docker run -p 3000:3000 realtime-app
```

### Production Configuration
- WebSocket connection limits
- Message rate limiting
- Redis clustering
- Load balancer sticky sessions
- CDN for static assets

This real-time starter template provides everything needed to build scalable, real-time applications with WebSocket-heavy features and multi-user collaboration capabilities.