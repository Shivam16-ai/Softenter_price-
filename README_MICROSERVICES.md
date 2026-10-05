# SWIFTRoute Enterprise - Microservices Architecture

**Enterprise Parcel Management System**  
**Architecture**: Microservices  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

## 🚀 Quick Start

### For First-Time Users

```powershell
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate dev
npm run db:seed

# 3. Start all services
.\start-all-services.ps1

# 4. Verify everything is running
.\check-services-health.ps1

# 5. Access the application
# Open browser: http://localhost:4000

# 6. Login with default admin
# Email: admin@swiftroute.com
# Password: Admin@123
```

### Using Docker

```powershell
# 1. Configure environment
cp .env.example .env

# 2. Start all services
docker compose up -d

# 3. Check status
docker compose ps

# 4. Access at http://localhost:4000
```

---

## 📋 What's New - Microservices Architecture

### Before (Monolith)
- Single application handling everything
- One deployment
- Tightly coupled code
- Single point of failure

### After (Microservices)
- **7 Independent Services** with clear boundaries
- **API Gateway** as single entry point
- **Independent Scaling** for each service
- **Fault Isolation** - one service failure doesn't crash everything
- **Technology Flexibility** - each service can use different tech
- **Team Scalability** - different teams can own services

---

## 🏗️ Architecture

```
User → Gateway (4000) → Auth (4001)
                      → Order (4003)
                      → Shipment (4004)
                      → Delivery (4005)
                      → Payment (4006)
                      → Notification (4007)
                      → Admin (4008)
                      → Monolith (3000) [Frontend + AI]
                      ↓
                   PostgreSQL (5432)
```

---

## 📦 Services

| Service | Port | Responsibility |
|---------|------|----------------|
| **Gateway** | 4000 | Routing, security, rate limiting |
| **Monolith** | 3000 | Frontend (React), AI assistant |
| **Auth** | 4001 | Authentication, OAuth, JWT |
| **Order** | 4003 | Universal Order Hub, external orders |
| **Shipment** | 4004 | Parcels, tracking, lifecycle |
| **Delivery** | 4005 | Agent assignments, proof of delivery |
| **Payment** | 4006 | Payments, invoices, transactions |
| **Notification** | 4007 | Alerts, in-app notifications |
| **Admin** | 4008 | Dashboard, user management, reports |

---

## 📚 Documentation

| Document | Purpose | Start Here |
|----------|---------|------------|
| **MICROSERVICES_MIGRATION_COMPLETE.md** | Complete migration summary | ⭐ **READ FIRST** |
| **MICROSERVICES_STARTUP_GUIDE.md** | How to run the system | 🚀 Quick start |
| **TESTING_GUIDE.md** | How to test everything | 🧪 Testing |
| **DOCKER_DEPLOYMENT_GUIDE.md** | Docker deployment | 🐳 Containers |
| **MICROSERVICES_AUDIT_REPORT.md** | Technical deep dive | 🔍 Architecture |
| **shared/README.md** | Shared code documentation | 📦 Utilities |

---

## 🎯 Key Features

### For Customers
- ✅ Register and login (email or Google)
- ✅ Book shipments with real-time pricing
- ✅ Track parcels with live updates
- ✅ Make payments (multiple methods)
- ✅ View payment history and invoices
- ✅ Manage delivery preferences
- ✅ Import external orders (Amazon, eBay, etc.)
- ✅ Request returns
- ✅ Receive notifications

### For Delivery Agents
- ✅ View assigned deliveries
- ✅ Update delivery status
- ✅ Submit proof of delivery (signature, photo)
- ✅ Track performance metrics

### For Administrators
- ✅ Dashboard with real-time statistics
- ✅ User management (customers, agents)
- ✅ Parcel management and assignment
- ✅ Agent verification workflow
- ✅ Revenue and analytics
- ✅ System health monitoring
- ✅ Audit logs

---

## 🔐 Security

- **Authentication**: JWT + Google OAuth 2.0
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: bcrypt hashing (12 rounds)
- **API Security**: Helmet, CORS, rate limiting
- **Data Protection**: Prisma (SQL injection prevention)

---

## 🧪 Testing

### Quick Test

```powershell
# Run health check
.\check-services-health.ps1

# Should show all services "HEALTHY"
```

### Manual Testing

See **TESTING_GUIDE.md** for:
- API endpoint testing with Postman
- End-to-end user flow testing
- Security testing procedures
- Performance testing basics

---

## 🐳 Docker Support

All services are containerized and can run with a single command:

```powershell
docker compose up -d
```

Includes:
- All 9 services
- PostgreSQL database
- Health checks
- Auto-restart
- Shared network
- Volume persistence

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Auth**: Passport.js, JWT
- **Security**: Helmet, bcrypt

### Frontend
- **Framework**: React 19
- **Router**: React Router DOM v7
- **Styling**: Tailwind CSS 4
- **Build**: Vite
- **State**: Context API

### Infrastructure
- **Gateway**: http-proxy-middleware
- **Containerization**: Docker + Docker Compose
- **Logging**: Winston
- **Health Checks**: Built-in endpoints

---

## 📁 Project Structure

```
swiftroute/
├── gateway/                    # API Gateway (port 4000)
├── services/                   # Microservices
│   ├── auth-service/          # Authentication (4001)
│   ├── order-service/         # Orders (4003)
│   ├── shipment-service/      # Shipments (4004)
│   ├── delivery-service/      # Delivery (4005)
│   ├── payment-service/       # Payments (4006)
│   ├── notification-service/  # Notifications (4007)
│   └── admin-service/         # Admin (4008)
├── shared/                    # Shared types & utilities
│   ├── types/                # TypeScript types
│   ├── constants/            # Constants & enums
│   └── utils/                # Helper functions
├── src/                      # Frontend (React)
├── backend/                  # Monolith backend
├── prisma/                   # Database schema & migrations
├── docker-compose.yml        # Container orchestration
└── Documentation...
```

---

## 🎓 For Academic/University Use

### What to Demonstrate

1. **Microservices Pattern** ⭐
   - Show service independence
   - Explain service boundaries
   - Demo fault isolation

2. **API Gateway Pattern** ⭐
   - Show centralized routing
   - Explain security benefits
   - Demo rate limiting

3. **Database Design** ⭐
   - Show normalized schema (3NF)
   - Explain relationships
   - Demo Prisma ORM

4. **Security Implementation** ⭐
   - Show JWT authentication
   - Demo role-based access
   - Explain OAuth 2.0

5. **Containerization** ⭐
   - Show Docker setup
   - Explain orchestration
   - Demo scaling potential

### Demo Flow (20 minutes)

1. **Architecture Overview** (5 min)
   - Show diagram
   - Explain each service
   - Discuss benefits

2. **Live Demo** (10 min)
   - Start services
   - Customer books shipment
   - Agent delivers parcel
   - Admin views dashboard

3. **Technical Deep Dive** (5 min)
   - Show code organization
   - Explain service communication
   - Discuss database design

---

## 🚨 Troubleshooting

### Services Won't Start

```powershell
# Check if ports are in use
netstat -ano | findstr :4000

# Kill process if needed
taskkill /PID <PID> /F

# Or use:
npx kill-port 4000
```

### Database Connection Failed

```powershell
# Check PostgreSQL is running
docker compose ps postgres

# Restart database
docker compose restart postgres

# Run migrations
npx prisma migrate dev
```

### Health Check Fails

```powershell
# Check service logs
docker compose logs gateway
docker compose logs auth

# Restart specific service
docker compose restart gateway
```

---

## 📞 Support

### Quick Commands

```powershell
# Start development
.\start-all-services.ps1

# Check health
.\check-services-health.ps1

# Start with Docker
docker compose up -d

# Stop all
docker compose down

# View logs
docker compose logs -f
```

### Documentation

- **Full Migration Guide**: `MICROSERVICES_MIGRATION_COMPLETE.md`
- **Setup Instructions**: `MICROSERVICES_STARTUP_GUIDE.md`
- **Testing Procedures**: `TESTING_GUIDE.md`
- **Docker Deployment**: `DOCKER_DEPLOYMENT_GUIDE.md`

---

## 🎉 Migration Complete!

The SWIFTRoute system has been successfully migrated from a monolithic architecture to a complete microservices architecture. All services are operational, tested, and ready for deployment.

### Achievement Summary

✅ 7 Independent Microservices  
✅ API Gateway with Security  
✅ Complete Docker Setup  
✅ Comprehensive Documentation  
✅ Health Monitoring  
✅ Role-Based Security  
✅ Production Ready  

### Next Steps

1. Review **MICROSERVICES_MIGRATION_COMPLETE.md** for complete details
2. Follow **MICROSERVICES_STARTUP_GUIDE.md** to run locally
3. Use **TESTING_GUIDE.md** to verify functionality
4. Deploy with **DOCKER_DEPLOYMENT_GUIDE.md**

---

**Version**: 1.0.0  
**Status**: ✅ Complete  
**Quality**: Production Ready  
**Documentation**: Comprehensive  

**Access**: http://localhost:4000  
**Admin**: admin@swiftroute.com / Admin@123

---

*Built with ❤️ for Enterprise Parcel Management*
