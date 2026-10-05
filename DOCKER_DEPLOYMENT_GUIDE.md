# SWIFTRoute - Docker Deployment Guide

**Last Updated**: January 2026  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Environment Configuration](#environment-configuration)
5. [Building Images](#building-images)
6. [Running with Docker Compose](#running-with-docker-compose)
7. [Service Management](#service-management)
8. [Database Setup](#database-setup)
9. [Monitoring & Logs](#monitoring--logs)
10. [Troubleshooting](#troubleshooting)
11. [Production Deployment](#production-deployment)

---

## 🎯 Overview

SWIFTRoute microservices are fully containerized using Docker. The architecture includes:

- **9 Containers**: Gateway, Monolith, 7 Microservices
- **1 Database Container**: PostgreSQL
- **Shared Network**: All services communicate via `bridge` network
- **Health Checks**: Each service has built-in health monitoring
- **Volume Persistence**: Database data persists across restarts

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Docker Network: swiftroute-network            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Gateway (4000) ←──┐                                         │
│                    │                                         │
│  Monolith (3000) ──┼── All Services                          │
│  Auth (4001) ──────┤    Share Same                           │
│  Order (4003) ─────┤    PostgreSQL                           │
│  Shipment (4004) ──┤    Database                             │
│  Delivery (4005) ──┤                                         │
│  Payment (4006) ───┤                                         │
│  Notification (4007)                                         │
│  Admin (4008) ─────┘                                         │
│                                                               │
│  PostgreSQL (5432)                                           │
│  └─ Volume: postgres_data (persisted)                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Software

- **Docker**: Version 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.20+ (included with Docker Desktop)
- **Git**: For cloning the repository

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 10GB free space
- **CPU**: 4 cores recommended
- **OS**: Windows 10/11, macOS 11+, or Linux

### Verify Installation

```powershell
# Check Docker
docker --version
# Should show: Docker version 24.x.x

# Check Docker Compose
docker compose version
# Should show: Docker Compose version v2.x.x

# Check Docker is running
docker ps
# Should show empty list or running containers
```

---

## 🚀 Quick Start

### 1. Clone Repository (if not already cloned)

```powershell
git clone <repository-url>
cd dbms_project
```

### 2. Create Environment File

```powershell
# Copy example env file
cp .env.example .env

# Edit with your values
notepad .env
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/swiftroute_db

# Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# AI (Optional)
GEMINI_API_KEY=your-gemini-api-key

# Admin Account
ADMIN_EMAIL=admin@swiftroute.com
ADMIN_PASSWORD=Admin@123
```

### 3. Start All Services

```powershell
# Build and start all services
docker compose up --build

# Or run in background (detached mode)
docker compose up -d --build
```

### 4. Wait for Services to Start

First start takes 5-10 minutes to:
- Download base images
- Build all services
- Start PostgreSQL
- Run database migrations
- Start all microservices

### 5. Verify System is Running

```powershell
# Check all containers are running
docker compose ps

# Should show 10 containers: gateway, monolith, 7 services, postgres
# All should be "Up" or "Up (healthy)"

# Check gateway health
curl http://localhost:4000/health
```

### 6. Access the Application

🌐 **Open Browser**: http://localhost:4000

**Login with:**
- Email: `admin@swiftroute.com`
- Password: `Admin@123`

---

## 🔧 Environment Configuration

### Development Environment (.env)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/swiftroute_db

JWT_SECRET=dev-jwt-secret-key
SESSION_SECRET=dev-session-secret-key

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

GEMINI_API_KEY=your-gemini-key

ADMIN_EMAIL=admin@swiftroute.com
ADMIN_PASSWORD=Admin@123
```

### Production Environment

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_password@db.production.com:5432/swiftroute_prod

# Generate secure random strings (256-bit)
JWT_SECRET=<generate-secure-random-string-256-bit>
SESSION_SECRET=<generate-secure-random-string-256-bit>

GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
GOOGLE_CALLBACK_URL=https://swiftroute.com/api/auth/google/callback

GEMINI_API_KEY=<production-key>

ADMIN_EMAIL=admin@swiftroute.com
ADMIN_PASSWORD=<secure-password>
```

**Generate Secure Secrets:**

```powershell
# PowerShell - Generate random 256-bit secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Or use online generator (HTTPS only):
# https://generate-secret.vercel.app/64
```

---

## 🏗️ Building Images

### Build All Services

```powershell
# Build all images
docker compose build

# Build with no cache (clean build)
docker compose build --no-cache

# Build specific service
docker compose build gateway
docker compose build auth
docker compose build shipment
```

### Build Options

```powershell
# Parallel build (faster)
docker compose build --parallel

# Show build progress
docker compose build --progress=plain

# Build and start immediately
docker compose up --build -d
```

### Image Management

```powershell
# List all images
docker images | grep swiftroute

# Remove unused images
docker image prune -a

# Remove specific image
docker rmi swiftroute-gateway:latest
```

---

## 🎮 Running with Docker Compose

### Start Services

```powershell
# Start all services (foreground)
docker compose up

# Start in background (detached)
docker compose up -d

# Start specific services only
docker compose up gateway monolith postgres

# Start and rebuild
docker compose up --build
```

### Stop Services

```powershell
# Stop all services (containers remain)
docker compose stop

# Stop and remove containers
docker compose down

# Stop, remove containers + volumes (DATABASE DATA LOST!)
docker compose down -v

# Stop and remove images
docker compose down --rmi all
```

### Restart Services

```powershell
# Restart all services
docker compose restart

# Restart specific service
docker compose restart gateway
docker compose restart auth
```

---

## 🔧 Service Management

### Check Service Status

```powershell
# List running containers
docker compose ps

# Check specific service
docker compose ps gateway

# View all containers (including stopped)
docker ps -a
```

### Scale Services (future enhancement)

```powershell
# Scale order service to 3 instances
docker compose up -d --scale order=3

# Scale back to 1
docker compose up -d --scale order=1
```

### Execute Commands in Containers

```powershell
# Open shell in container
docker compose exec gateway sh
docker compose exec monolith sh
docker compose exec postgres psql -U postgres -d swiftroute_db

# Run one-off command
docker compose exec auth npx prisma studio
docker compose exec monolith npm run db:seed
```

---

## 🗄️ Database Setup

### Initialize Database

On first run, database is automatically:
1. Created (swiftroute_db)
2. Prisma migrations applied
3. Seeded with roles and admin account

### Manual Database Operations

```powershell
# Run Prisma migrations
docker compose exec monolith npx prisma migrate deploy

# Generate Prisma Client
docker compose exec monolith npx prisma generate

# Seed database
docker compose exec monolith npm run db:seed

# Open Prisma Studio (database GUI)
docker compose exec monolith npx prisma studio
# Access at: http://localhost:5555
```

### Database Backup

```powershell
# Backup database
docker compose exec postgres pg_dump -U postgres swiftroute_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres swiftroute_db < backup.sql
```

### Reset Database

```powershell
# WARNING: This deletes all data!
docker compose down -v
docker compose up -d postgres
docker compose exec monolith npx prisma migrate deploy
docker compose exec monolith npm run db:seed
docker compose up -d
```

---

## 📊 Monitoring & Logs

### View Logs

```powershell
# View all logs
docker compose logs

# Follow logs (live updates)
docker compose logs -f

# Logs for specific service
docker compose logs gateway
docker compose logs auth
docker compose logs -f shipment

# Last 100 lines
docker compose logs --tail=100

# Logs since timestamp
docker compose logs --since 2024-01-20T10:00:00
```

### Service Health

```powershell
# Check health status
docker compose ps

# Gateway health
curl http://localhost:4000/health

# Individual service health
curl http://localhost:4001/health  # Auth
curl http://localhost:4003/health  # Order
curl http://localhost:4004/health  # Shipment
curl http://localhost:4005/health  # Delivery
curl http://localhost:4006/health  # Payment
curl http://localhost:4007/health  # Notification
curl http://localhost:4008/health  # Admin
```

### Resource Usage

```powershell
# Container resource usage
docker stats

# Specific container
docker stats swiftroute-gateway

# All SwiftRoute containers
docker stats $(docker ps --filter name=swiftroute -q)
```

---

## 🐛 Troubleshooting

### Issue: Services Not Starting

```powershell
# Check logs for errors
docker compose logs

# Check specific service
docker compose logs gateway

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Issue: Database Connection Failed

```
Error: Can't reach database server
```

**Solution:**

```powershell
# Check postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres

# Verify connection
docker compose exec postgres psql -U postgres -c "SELECT 1;"
```

### Issue: Port Already in Use

```
Error: bind: address already in use
```

**Solution:**

```powershell
# Find process using port
netstat -ano | findstr :4000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Issue: Out of Disk Space

```powershell
# Check Docker disk usage
docker system df

# Clean up unused data
docker system prune -a --volumes

# Remove specific volumes
docker volume ls
docker volume rm swiftroute_postgres_data
```

### Issue: Services Can't Communicate

```
ECONNREFUSED connecting to service
```

**Solution:**

```powershell
# Verify all services are in same network
docker network inspect swiftroute_swiftroute-network

# Restart all services
docker compose down
docker compose up -d

# Check service names resolve
docker compose exec gateway ping auth
docker compose exec gateway ping postgres
```

### Issue: Health Check Failing

```powershell
# Check health check command
docker inspect swiftroute-gateway | grep -A 10 Healthcheck

# Run health check manually
docker compose exec gateway wget -q -O- http://localhost:4000/health

# Disable health check temporarily (in docker-compose.yml)
# Remove or comment out healthcheck section
```

---

## 🚀 Production Deployment

### Production Best Practices

1. **Use Environment Variables**
   - Never commit secrets to Git
   - Use `.env` file or environment management service

2. **Enable HTTPS**
   - Use reverse proxy (Nginx, Traefik)
   - Obtain SSL certificates (Let's Encrypt)

3. **Database Externalization**
   - Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
   - Don't run database in same Docker host as applications

4. **Monitoring & Logging**
   - Set up centralized logging (ELK stack, Datadog)
   - Add monitoring (Prometheus + Grafana)
   - Configure alerts

5. **Scaling**
   - Use orchestration (Kubernetes, Docker Swarm)
   - Load balancer in front of gateway
   - Database read replicas

6. **Backups**
   - Automated daily database backups
   - Test restore procedures regularly

7. **Security**
   - Run containers as non-root user
   - Scan images for vulnerabilities
   - Keep base images updated
   - Use secrets management (HashiCorp Vault, AWS Secrets Manager)

### Production docker-compose.yml

```yaml
version: '3.9'

services:
  gateway:
    image: swiftroute/gateway:1.0.0
    restart: always
    environment:
      NODE_ENV: production
      # ... other env vars from secrets manager
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "-q", "-O-", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes Deployment (Future)

For production scale, consider Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swiftroute-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: swiftroute/gateway:1.0.0
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
          requests:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📚 Additional Resources

- **Main Startup Guide**: `MICROSERVICES_STARTUP_GUIDE.md`
- **Audit Report**: `MICROSERVICES_AUDIT_REPORT.md`
- **Shared Module**: `shared/README.md`
- **Database Schema**: `prisma/schema.prisma`

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate secure JWT_SECRET and SESSION_SECRET
- [ ] Configure Google OAuth for production domain
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable database encryption at rest
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Scan Docker images for vulnerabilities
- [ ] Implement secrets management
- [ ] Configure CORS for production domains only
- [ ] Review and harden Dockerfile security
- [ ] Enable container resource limits
- [ ] Set up log aggregation
- [ ] Configure automated security updates

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: ✅ Production Ready
