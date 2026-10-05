# SWIFTRoute Microservices - Complete Startup Guide

**Last Updated**: January 2026  
**Architecture**: Microservices with API Gateway

---

## 🎯 Overview

SWIFTRoute now runs as a **complete microservices architecture** with the following components:

1. **API Gateway** (Port 4000) - Primary entry point for ALL traffic
2. **Frontend** served by Monolith (Port 3000) - React SPA
3. **7 Microservices** - Independent backend services
4. **PostgreSQL Database** - Shared data layer

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                                │
│              http://localhost:4000                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓
                 ┌──────────────────────┐
                 │   API GATEWAY (4000) │ ← PRIMARY ENTRY POINT
                 │   gateway/           │
                 └──────────┬───────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ↓                   ↓                    ↓
   [Frontend SPA]    [Microservices]    [AI/Realtime]
        │                   │                    │
        ↓                   ↓                    ↓
  Monolith:3000      Auth: 4001           Monolith:3000
  (Vite serve)       Order: 4003          (Assistant)
                     Ship: 4004            (Realtime SSE)
                     Deliv: 4005
                     Pay: 4006
                     Notif: 4007
                     Admin: 4008
                            │
                            ↓
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  │   Port 5432      │
                  └──────────────────┘
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL 14+
- Git

### Step 1: Database Setup
```powershell
# Ensure PostgreSQL is running
# Default connection: postgresql://postgres:postgres@localhost:5432/swiftroute_db

# Generate Prisma Client
npm run db:generate

# Run migrations
npx prisma migrate dev

# Seed database with roles and initial data
npm run db:seed
```

### Step 2: Start All Services

**Option A: Using Multiple Terminals (Recommended for Development)**

Open 9 separate PowerShell terminals:

```powershell
# Terminal 1: Monolith (Frontend + Fallback APIs)
npm run dev

# Terminal 2: API Gateway (PRIMARY ENTRY)
cd gateway
npm run dev

# Terminal 3: Auth Service
cd services/auth-service
npm run dev

# Terminal 4: Order Service
cd services/order-service
npm run dev

# Terminal 5: Shipment Service
cd services/shipment-service
npm run dev

# Terminal 6: Delivery Service
cd services/delivery-service
npm run dev

# Terminal 7: Payment Service
cd services/payment-service
npm run dev

# Terminal 8: Notification Service
cd services/notification-service
npm run dev

# Terminal 9: Admin Service
cd services/admin-service
npm run dev
```

**Option B: Using PowerShell Script (Coming Soon)**
```powershell
# Run all services with one command
.\start-all-services.ps1
```

### Step 3: Access the Application

🌐 **PRIMARY URL**: http://localhost:4000

**DO NOT use http://localhost:3000** - This bypasses the gateway!

All traffic MUST go through port 4000 (API Gateway).

---

## 📋 Service Health Checks

Once all services are running, verify health:

```powershell
# Gateway health (shows all routing)
curl http://localhost:4000/health

# Individual service health checks
curl http://localhost:3000/api/health  # Monolith
curl http://localhost:4001/health      # Auth Service
curl http://localhost:4003/health      # Order Service
curl http://localhost:4004/health      # Shipment Service
curl http://localhost:4005/health      # Delivery Service
curl http://localhost:4006/health      # Payment Service
curl http://localhost:4007/health      # Notification Service
curl http://localhost:4008/health      # Admin Service
```

Expected responses: All should return `{"service":"...","status":"ok","timestamp":"..."}`

---

## 🔑 Default Admin Credentials

```
Email: admin@swiftroute.com
Password: Admin@123
```

Change these in production!

---

## 🛣️ API Gateway Routing Table

When you access http://localhost:4000/api/..., the gateway routes as follows:

| Frontend Request | Gateway Routes To | Service Port | Responsibility |
|-----------------|-------------------|--------------|----------------|
| `/api/auth/*` | Auth Service | 4001 | Authentication, OAuth, JWT |
| `/api/order-hub/*` | Order Service | 4003 | Universal Order Hub |
| `/api/orders/*` | Order Service | 4003 | External orders |
| `/api/parcels/*` | Shipment Service | 4004 | Parcel management |
| `/api/shipments/*` | Shipment Service | 4004 | Shipment operations |
| `/api/tracking/*` | Shipment Service | 4004 | Tracking (public) |
| `/api/delivery/*` | Delivery Service | 4005 | Agent assignments |
| `/api/payments/*` | Payment Service | 4006 | Payments & invoices |
| `/api/notifications/*` | Notification Service | 4007 | Notifications |
| `/api/admin/*` | Admin Service | 4008 | Admin operations |
| `/api/assistant/*` | Monolith | 3000 | AI Assistant (Gemini) |
| `/api/realtime/*` | Monolith | 3000 | SSE real-time updates |
| `/*` (catchall) | Monolith | 3000 | React SPA (Vite) |

---

## 🔐 Security Features

### Implemented
- ✅ JWT Authentication (7-day expiration)
- ✅ Google OAuth 2.0
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Role-based authorization (ADMIN, COURIER_AGENT, CUSTOMER)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Rate limiting (300 req/15min global, 30 req/15min auth)
- ✅ SQL injection protection (Prisma)
- ✅ Session management (express-session)

### Environment Secrets
Never commit these to Git:
- `JWT_SECRET`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `GEMINI_API_KEY`

---

## 📦 Port Allocation

| Service | Port | Status | Entry Point |
|---------|------|--------|-------------|
| **API Gateway** | 4000 | ✅ Running | `gateway/src/server.ts` |
| Monolith | 3000 | ✅ Running | `server.ts` |
| Auth Service | 4001 | ✅ Running | `services/auth-service/src/server.ts` |
| Order Service | 4003 | ✅ Running | `services/order-service/src/server.ts` |
| Shipment Service | 4004 | ✅ Running | `services/shipment-service/src/server.ts` |
| Delivery Service | 4005 | ✅ Running | `services/delivery-service/src/server.ts` |
| Payment Service | 4006 | ✅ Running | `services/payment-service/src/server.ts` |
| Notification Service | 4007 | ✅ Running | `services/notification-service/src/server.ts` |
| Admin Service | 4008 | ✅ Running | `services/admin-service/src/server.ts` |
| PostgreSQL | 5432 | ✅ Running | External database |

---

## 🧪 Testing the Microservices

### Test Authentication Flow
```powershell
# 1. Register a customer
curl -X POST http://localhost:4000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"full_name":"Test User","email":"test@example.com","password":"Test123!","phone":"1234567890"}'

# 2. Login
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"identifier":"test@example.com","password":"Test123!"}'

# Response will include a JWT token
```

### Test Parcel Booking
```powershell
# Replace YOUR_JWT_TOKEN with the token from login
curl -X POST http://localhost:4000/api/parcels `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{
    "recipient_name":"John Doe",
    "recipient_phone":"9876543210",
    "pickup_address":"123 Main St, SF, CA 94102",
    "delivery_address":"456 Oak Ave, LA, CA 90001",
    "weight_kg":2.5,
    "parcel_type":"standard"
  }'
```

### Test Public Tracking
```powershell
# Replace TRACKING_NUMBER with actual tracking number from booking
curl http://localhost:4000/api/tracking/TRACKING_NUMBER
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use
```powershell
# Kill process on specific port
npx kill-port 4000
npx kill-port 3000
npx kill-port 4001
# ... etc for all ports
```

### Issue: Database Connection Failed
```
Error: Can't reach database server at `localhost:5432`
```

**Solution:**
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Check if database `swiftroute_db` exists

```sql
-- In PostgreSQL
CREATE DATABASE swiftroute_db;
```

### Issue: Prisma Client Not Generated
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```powershell
npm run db:generate
```

### Issue: Services Can't Find Each Other
```
Error: ECONNREFUSED connecting to service
```

**Solution:**
1. Ensure ALL services are running (check all 9 terminals)
2. Verify `.env` files in each service folder
3. Check that all services use the same `DATABASE_URL`

### Issue: Google OAuth Not Working
```
Error: redirect_uri_mismatch
```

**Solution:**
1. Go to Google Cloud Console
2. Update OAuth 2.0 Client Authorized redirect URIs:
   - Add: `http://localhost:4000/api/auth/google/callback`
   - Add: `http://localhost:3000/api/auth/google/callback`
3. Update both `.env` and `gateway/.env` with correct `GOOGLE_CALLBACK_URL`

### Issue: Frontend Shows 404 for API Calls
```
GET /api/parcels 404 Not Found
```

**Solution:**
- Ensure you're accessing via port 4000 (gateway), NOT port 3000
- Check that the specific microservice is running
- Verify gateway routing in `gateway/src/server.ts`

---

## 🔄 Development Workflow

### Adding a New API Endpoint

1. **Determine which service** owns the functionality
2. **Add route** to that service's `src/server.ts`
3. **No gateway changes needed** - routing is already configured
4. **Test directly** on service port first (e.g., `http://localhost:4003/api/...`)
5. **Test via gateway** at `http://localhost:4000/api/...`
6. **Update frontend** API client if needed

### Making Database Changes

```powershell
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Generate Prisma Client
npm run db:generate

# 4. Restart all services that use Prisma (all except gateway)
```

---

## 📊 Monitoring & Logging

### Service Logs
Each service logs to console with Winston:
- `[timestamp] [LEVEL] [ServiceName] message`

Example:
```
[2026-01-20T10:30:45.123Z] [INFO] [AuthService] User logged in: test@example.com (customer)
[2026-01-20T10:30:47.456Z] [INFO] [ShipmentService] Parcel created: SR-2026CA-A1B2C3
```

### Gateway Logs
Gateway logs all proxied requests:
```
[2026-01-20T10:30:45.100Z] [INFO] [Gateway] POST /api/auth/login → routing...
[2026-01-20T10:30:45.101Z] [INFO] [Gateway → AuthService] POST /api/auth/login
```

---

## 🔧 Production Deployment Considerations

### ⚠️ Before Production:
1. **Change all secrets** in `.env` files
2. **Enable HTTPS** (TLS certificates)
3. **Set up separate databases** per service (optional, currently shared)
4. **Configure CDN** for static assets
5. **Set up Redis** for caching and sessions
6. **Add monitoring** (Prometheus + Grafana)
7. **Add logging aggregation** (ELK stack)
8. **Set up CI/CD** pipeline
9. **Configure load balancer** for gateway
10. **Set up database backups**

### Environment Variables for Production:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://produser:securepass@prod-db:5432/swiftroute_prod
JWT_SECRET=<generate-256-bit-random-secret>
SESSION_SECRET=<generate-256-bit-random-secret>
GOOGLE_CALLBACK_URL=https://swiftroute.com/api/auth/google/callback
ALLOWED_ORIGINS=https://swiftroute.com,https://www.swiftroute.com
```

---

## 📚 Additional Resources

- **Audit Report**: See `MICROSERVICES_AUDIT_REPORT.md`
- **Database Schema**: See `prisma/schema.prisma`
- **API Documentation**: See Postman collection in `.postman/`
- **Docker Guide**: See `DOCKER_DEPLOYMENT_GUIDE.md` (coming soon)

---

## ✅ Verification Checklist

Before considering the system operational:

- [ ] PostgreSQL is running and accessible
- [ ] Database migrations are applied (`npx prisma migrate dev`)
- [ ] Database is seeded with roles (`npm run db:seed`)
- [ ] All 9 services are running (monolith + gateway + 7 microservices)
- [ ] Gateway health check returns OK (`curl http://localhost:4000/health`)
- [ ] All service health checks return OK
- [ ] Can access frontend at `http://localhost:4000`
- [ ] Can register a new customer
- [ ] Can login with customer credentials
- [ ] Can login with admin credentials (admin@swiftroute.com)
- [ ] Can book a shipment
- [ ] Can view shipment tracking
- [ ] Can access agent portal
- [ ] Can access admin portal
- [ ] Google OAuth redirects correctly (if configured)

---

## 🎓 For University/Academic Presentation

### Key Points to Highlight:
1. **Separation of Concerns**: Each service has a single responsibility
2. **Independent Scaling**: Services can be scaled independently
3. **Technology Flexibility**: Each service can use different tech stacks
4. **Fault Isolation**: Failure in one service doesn't crash the entire system
5. **Team Scalability**: Different teams can own different services
6. **API Gateway Pattern**: Single entry point with routing, security, rate limiting
7. **Database per Service** (future): Currently shared, can be separated
8. **Service Discovery** (future): Currently hardcoded, can use Consul/Eureka
9. **Message Queue** (future): Can add RabbitMQ/Kafka for async communication
10. **Containerization** (future): Docker + Kubernetes for orchestration

---

**Last Updated**: January 20, 2026  
**Version**: 1.0.0  
**Status**: ✅ Fully Operational in Development Mode
