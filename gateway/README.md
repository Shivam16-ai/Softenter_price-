# SwiftRoute API Gateway

**Version**: 1.0.0  
**Purpose**: Central routing layer for SwiftRoute microservices architecture

---

## Overview

The API Gateway is the single entry point for all client requests in the SwiftRoute microservices architecture. It handles routing, security, rate limiting, and service orchestration.

### Current Mode

**MONOLITH PASSTHROUGH MODE**

All requests are currently forwarded to the existing monolith (port 3000). As services are migrated, routing rules will be updated to direct traffic to independent microservices.

---

## Architecture

```
Frontend (React)
      ↓
API Gateway (Port 4000)
      ↓
   ┌──┴──┐
   ↓     ↓
Monolith  [Future Microservices]
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd gateway
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
NODE_ENV=development
MONOLITH_URL=http://localhost:3000
JWT_SECRET=your-secret-here
```

### 3. Start Gateway

```bash
npm run dev
```

The gateway will start on `http://localhost:4000`

### 4. Verify Health

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2026-10-03T04:50:00.000Z",
  "services": {
    "monolith": {
      "enabled": true,
      "url": "http://localhost:3000",
      "routes": ["*"]
    },
    "auth-service": {
      "enabled": false,
      "url": "http://localhost:4001",
      "routes": ["/api/auth/*"]
    }
    // ... other services
  }
}
```

---

## Current Routing Table

| Route | Destination | Port | Status |
|-------|-------------|------|--------|
| `/api/auth/*` | Monolith | 3000 | ✅ Active |
| `/api/parcels/*` | Monolith | 3000 | ✅ Active |
| `/api/order-hub/*` | Monolith | 3000 | ✅ Active |
| `/api/payments/*` | Monolith | 3000 | ✅ Active |
| `/api/tracking/*` | Monolith | 3000 | ✅ Active |
| `/api/admin/*` | Monolith | 3000 | ✅ Active |
| `/api/assistant/*` | Monolith | 3000 | ✅ Active |
| `/api/realtime/*` | Monolith (WS) | 3000 | ✅ Active |
| `/*` (all others) | Monolith | 3000 | ✅ Active |

---

## Features

### ✅ HTTP Proxy
- Forwards HTTP requests to appropriate services
- Preserves headers, cookies, and authentication

### ✅ WebSocket Support
- Proxies WebSocket connections for real-time features
- Supports `/api/realtime/*` endpoints

### ✅ Security
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configured
- **Rate Limiting**: 100 requests per 15 minutes per IP

### ✅ Logging
- **Winston**: Structured logging
- **Console**: Colorized console output
- **Files**: 
  - `logs/gateway-error.log` - Error logs
  - `logs/gateway-combined.log` - All logs

### ✅ Service Registry
- Tracks available services and their status
- Easy service enable/disable
- Health status reporting

---

## Testing

### Test Authentication
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"customer@swiftroute.com","password":"customer123"}'
```

### Test Order Hub
```bash
TOKEN="your-jwt-token-here"
curl http://localhost:4000/api/order-hub/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Test Proxy
All requests should be logged and forwarded to monolith.

Check logs:
```bash
tail -f logs/gateway-combined.log
```

---

## Migration Process

### Phase 1: Gateway Setup (Current)
- ✅ Gateway created
- ✅ All routes → Monolith
- ✅ Transparent proxy

### Phase 2: First Service (Auth)
1. Create auth-service implementation
2. Start auth-service on port 4001
3. Update gateway routing:

```typescript
// In src/server.ts
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL, // Changed from MONOLITH_URL
  changeOrigin: true
}));
```

4. Enable in service registry:
```typescript
serviceRegistry.enableService('auth-service');
```

5. Test authentication through gateway → auth-service
6. Keep monolith as fallback

### Phase 3-6: Other Services
Repeat for:
- Notification Service
- Order Service
- Shipment Service
- Delivery Service
- Admin Service

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 4000 | Gateway port |
| `NODE_ENV` | development | Environment mode |
| `MONOLITH_URL` | http://localhost:3000 | Monolith URL |
| `AUTH_SERVICE_URL` | http://localhost:4001 | Auth service URL |
| `NOTIFICATION_SERVICE_URL` | http://localhost:4002 | Notification service URL |
| `ORDER_SERVICE_URL` | http://localhost:4003 | Order service URL |
| `SHIPMENT_SERVICE_URL` | http://localhost:4004 | Shipment service URL |
| `DELIVERY_SERVICE_URL` | http://localhost:4005 | Delivery service URL |
| `ADMIN_SERVICE_URL` | http://localhost:4006 | Admin service URL |
| `JWT_SECRET` | (required) | JWT secret for validation |
| `ALLOWED_ORIGINS` | localhost:3000,localhost:5173 | CORS origins |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start gateway in development mode |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start gateway in production mode |

---

## Troubleshooting

### Gateway won't start
- Check if port 4000 is available
- Verify monolith is running on port 3000
- Check `.env` configuration

### Requests failing
- Verify monolith is running: `curl http://localhost:3000/health`
- Check gateway logs: `tail -f logs/gateway-combined.log`
- Test monolith directly first

### CORS errors
- Add frontend origin to `ALLOWED_ORIGINS` in `.env`
- Restart gateway after environment changes

### Rate limit hit
- Increase `RATE_LIMIT_MAX_REQUESTS` for development
- Or wait 15 minutes for reset

---

## Service Registry API

### Get Service Status
```typescript
import { serviceRegistry } from './src/config/serviceRegistry';

// Get all services
const services = serviceRegistry.getAllServices();

// Get specific service
const authService = serviceRegistry.getService('auth-service');

// Enable service
serviceRegistry.enableService('auth-service');

// Disable service
serviceRegistry.disableService('auth-service');

// Get health status
const health = serviceRegistry.getHealthStatus();
```

---

## Logging

### Log Levels
- `error`: Critical errors
- `warn`: Warnings
- `info`: General information (default)
- `debug`: Detailed debugging

### Log Format
```
2026-10-03 04:50:00 [info] [Gateway] GET /api/auth/login
2026-10-03 04:50:01 [info] [Gateway → Monolith] POST /api/auth/login
```

### View Logs
```bash
# Watch all logs
tail -f logs/gateway-combined.log

# Watch errors only
tail -f logs/gateway-error.log

# Search logs
grep "error" logs/gateway-combined.log
```

---

## Development

### Project Structure
```
gateway/
├── src/
│   ├── config/
│   │   ├── logger.ts           # Winston logger
│   │   └── serviceRegistry.ts  # Service tracking
│   └── server.ts                # Main gateway server
├── logs/                        # Log files
├── .env                         # Environment config
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

### Adding a New Service Route

1. Update `serviceRegistry.ts`:
```typescript
this.register({
  name: 'new-service',
  url: process.env.NEW_SERVICE_URL || 'http://localhost:4007',
  enabled: false,
  routes: ['/api/new/*']
});
```

2. Add route in `server.ts`:
```typescript
const NEW_SERVICE_URL = process.env.NEW_SERVICE_URL || 'http://localhost:4007';

app.use('/api/new', createProxyMiddleware({
  target: NEW_SERVICE_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → New Service] ${req.method} /api/new${req.url}`);
  }
}));
```

3. Add to `.env`:
```env
NEW_SERVICE_URL=http://localhost:4007
```

---

## Security Considerations

### Currently Implemented
- ✅ Helmet (security headers)
- ✅ CORS (cross-origin control)
- ✅ Rate limiting (abuse prevention)
- ✅ Request logging (audit trail)

### Future Enhancements
- [ ] JWT validation at gateway level
- [ ] API key authentication
- [ ] Request/response transformation
- [ ] Circuit breaker pattern
- [ ] Request caching
- [ ] Load balancing (multiple service instances)

---

## Production Readiness

### Before Production Deployment

1. **Environment**:
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure proper CORS origins

2. **Scaling**:
   - Run multiple gateway instances
   - Add load balancer (Nginx/HAProxy)
   - Use process manager (PM2)

3. **Monitoring**:
   - Set up log aggregation (ELK/Datadog)
   - Add health check monitoring
   - Configure alerts

4. **Security**:
   - Enable HTTPS
   - Implement API rate limiting per user
   - Add request/response validation
   - Enable audit logging

---

## FAQ

### Q: Do I need to change the frontend?
**A**: Not immediately. Frontend can continue using port 3000 (monolith) until gateway is tested. Then update frontend to use port 4000.

### Q: What happens if a service is down?
**A**: Gateway will return 503 (Service Unavailable). You can implement fallback to monolith if needed.

### Q: Can I run gateway in production now?
**A**: Yes, but it's just a proxy to monolith. Full benefits come after service migration.

### Q: How do I roll back?
**A**: Point frontend back to port 3000. Gateway is completely separate and can be stopped without affecting monolith.

---

## Support

- **Issues**: Check gateway logs first
- **Questions**: Review this README
- **Bugs**: Check service registry status

---

**Status**: ✅ Ready for testing  
**Next**: Install dependencies and start gateway
