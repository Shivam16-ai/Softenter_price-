# SWIFTRoute - Comprehensive Testing Guide

**Last Updated**: January 2026  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Manual Testing](#manual-testing)
4. [API Testing with Postman](#api-testing-with-postman)
5. [Service Health Verification](#service-health-verification)
6. [Authentication Flow Testing](#authentication-flow-testing)
7. [End-to-End Scenarios](#end-to-end-scenarios)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Future Automated Testing](#future-automated-testing)

---

## 🎯 Overview

This guide provides comprehensive testing procedures for the SWIFTRoute microservices architecture. Since the project is in university/academic context, we focus on **manual testing** and **Postman-based API testing** rather than full automated test suites.

### Testing Levels

```
┌─────────────────────────────────────────────────────────┐
│  Level 1: Service Health Checks                         │
│  └─ Verify all 9 services + database are running        │
├─────────────────────────────────────────────────────────┤
│  Level 2: Individual API Endpoint Testing               │
│  └─ Test each microservice independently                │
├─────────────────────────────────────────────────────────┤
│  Level 3: Integration Testing                           │
│  └─ Test service-to-service communication               │
├─────────────────────────────────────────────────────────┤
│  Level 4: End-to-End User Flows                        │
│  └─ Complete user journeys through UI                   │
├─────────────────────────────────────────────────────────┤
│  Level 5: Security & Authorization                      │
│  └─ Role-based access, JWT validation                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Quick Test Priorities

For demonstration and grading purposes, focus on:

1. **✅ Critical Path**: Customer books shipment → Track → Deliver
2. **✅ Authentication**: Login, Google OAuth, JWT validation
3. **✅ Authorization**: Role-based access (customer, agent, admin)
4. **✅ Gateway Routing**: All APIs route through port 4000
5. **✅ Database Operations**: CRUD operations work correctly

### Testing Checklist

```
□ All services start successfully
□ Database is accessible and seeded
□ Gateway routes to all services
□ Customer can register and login
□ Agent can login
□ Admin can login
□ Google OAuth works
□ Customer can book shipment
□ Agent can view assignments
□ Agent can update delivery status
□ Admin can view dashboard
□ Tracking works publicly
□ Payments process correctly
□ Notifications are created
□ Role-based access is enforced
```

---

## 🔧 Manual Testing

### Prerequisites

```powershell
# Ensure all services are running
.\check-services-health.ps1

# Or manually check
curl http://localhost:4000/health
```

### Test Environment Setup

1. **Start All Services**
   ```powershell
   .\start-all-services.ps1
   # Wait 15 seconds for all services to initialize
   ```

2. **Verify Database**
   ```powershell
   # Check database is seeded with roles
   docker compose exec postgres psql -U postgres -d swiftroute_db -c "SELECT * FROM roles;"
   ```

3. **Access Application**
   - Open browser to: http://localhost:4000

---

## 📮 API Testing with Postman

### Import Postman Collection

A Postman collection exists at `.postman/resources.yaml` or create one:

### 1. Setup Postman Environment

Create environment with variables:

```json
{
  "GATEWAY_URL": "http://localhost:4000",
  "AUTH_TOKEN": "",
  "USER_ID": "",
  "PARCEL_ID": "",
  "TRACKING_NUMBER": ""
}
```

### 2. Test Authentication Endpoints

#### Register Customer

```http
POST {{GATEWAY_URL}}/api/auth/register
Content-Type: application/json

{
  "full_name": "Test Customer",
  "email": "testcustomer@example.com",
  "password": "Test123!",
  "phone": "1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "email": "testcustomer@example.com",
      "role": "customer"
    }
  }
}
```

**Action**: Save `token` to `AUTH_TOKEN` environment variable.

#### Login

```http
POST {{GATEWAY_URL}}/api/auth/login
Content-Type: application/json

{
  "identifier": "testcustomer@example.com",
  "password": "Test123!"
}
```

#### Get Current User

```http
GET {{GATEWAY_URL}}/api/auth/me
Authorization: Bearer {{AUTH_TOKEN}}
```

### 3. Test Order/Shipment Endpoints

#### Book a Shipment

```http
POST {{GATEWAY_URL}}/api/parcels
Authorization: Bearer {{AUTH_TOKEN}}
Content-Type: application/json

{
  "recipient_name": "John Doe",
  "recipient_phone": "9876543210",
  "pickup_address": "123 Main St, San Francisco, CA 94102",
  "delivery_address": "456 Oak Ave, Los Angeles, CA 90001",
  "weight_kg": 2.5,
  "parcel_type": "standard",
  "special_instructions": "Handle with care"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "tracking_number": "SR-2026CA-ABC123",
    "status": "pending",
    "shipping_cost": 15.24
  }
}
```

**Action**: Save `tracking_number` to environment variable.

#### Get Parcels

```http
GET {{GATEWAY_URL}}/api/parcels
Authorization: Bearer {{AUTH_TOKEN}}
```

#### Track Parcel (Public - No Auth)

```http
GET {{GATEWAY_URL}}/api/tracking/{{TRACKING_NUMBER}}
```

### 4. Test Admin Endpoints

#### Login as Admin

```http
POST {{GATEWAY_URL}}/api/auth/login
Content-Type: application/json

{
  "identifier": "admin@swiftroute.com",
  "password": "Admin@123"
}
```

#### Get Dashboard Stats

```http
GET {{GATEWAY_URL}}/api/admin/stats
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Get All Users

```http
GET {{GATEWAY_URL}}/api/admin/users
Authorization: Bearer {{ADMIN_TOKEN}}
```

### 5. Test Payment Endpoints

#### Process Payment

```http
POST {{GATEWAY_URL}}/api/payments/checkout
Authorization: Bearer {{AUTH_TOKEN}}
Content-Type: application/json

{
  "parcel_id": "{{PARCEL_ID}}",
  "payment_method": "credit_card"
}
```

#### Get Payment History

```http
GET {{GATEWAY_URL}}/api/payments/history
Authorization: Bearer {{AUTH_TOKEN}}
```

### 6. Test Notification Endpoints

#### Get Notifications

```http
GET {{GATEWAY_URL}}/api/order-hub/notifications
Authorization: Bearer {{AUTH_TOKEN}}
```

#### Mark Notification as Read

```http
PATCH {{GATEWAY_URL}}/api/order-hub/notifications/{{NOTIFICATION_ID}}/read
Authorization: Bearer {{AUTH_TOKEN}}
```

---

## ✅ Service Health Verification

### Automated Health Check Script

Use the provided script:

```powershell
.\check-services-health.ps1
```

### Manual Health Checks

```powershell
# Gateway
curl http://localhost:4000/health

# Monolith
curl http://localhost:3000/api/health

# Auth Service
curl http://localhost:4001/health

# Order Service
curl http://localhost:4003/health

# Shipment Service
curl http://localhost:4004/health

# Delivery Service
curl http://localhost:4005/health

# Payment Service
curl http://localhost:4006/health

# Notification Service
curl http://localhost:4007/health

# Admin Service
curl http://localhost:4008/health
```

**All should return:**
```json
{
  "service": "service-name",
  "status": "ok",
  "timestamp": "2026-01-20T..."
}
```

---

## 🔐 Authentication Flow Testing

### Test Case 1: Customer Registration & Login

**Steps:**
1. Navigate to http://localhost:4000
2. Click "Get Started" or "Login"
3. Click "Create Account"
4. Fill in registration form
5. Submit
6. Verify redirected to Customer Portal

**Expected Results:**
- ✅ User is registered in database
- ✅ JWT token is issued
- ✅ Token stored in localStorage
- ✅ Redirected to `/customer/order-hub`

### Test Case 2: Google OAuth Login

**Steps:**
1. Navigate to http://localhost:4000/auth
2. Click "Continue with Google"
3. Select Google account
4. Authorize application

**Expected Results:**
- ✅ Redirected to Google login
- ✅ Redirected back with token
- ✅ User created in database (if new)
- ✅ Logged in and redirected to Customer Portal

### Test Case 3: Agent Login

**Steps:**
1. Register as agent or use seeded agent account
2. Navigate to http://localhost:4000/auth
3. Enter agent credentials
4. Submit

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/agent` (Agent Dashboard)
- ✅ Cannot access customer routes

### Test Case 4: Admin Login

**Steps:**
1. Navigate to http://localhost:4000/auth
2. Enter: `admin@swiftroute.com` / `Admin@123`
3. Submit

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/admin` (Admin Dashboard)
- ✅ Can access all admin routes

---

## 🛤️ End-to-End Scenarios

### Scenario 1: Complete Shipment Lifecycle

**Actors**: Customer, Delivery Agent, Admin

**Steps:**

1. **Customer Books Shipment**
   ```
   Customer Portal → Book Shipment
   Fill form → Submit
   Verify: Tracking number generated
   Verify: Status = "Pending"
   Verify: Payment status = "Unpaid"
   ```

2. **Customer Makes Payment**
   ```
   Customer Portal → Payments & Invoices
   Select unpaid shipment → Pay Now
   Verify: Payment processed
   Verify: Payment status = "Paid"
   ```

3. **Admin Assigns Agent**
   ```
   Admin Portal → Parcels
   Select parcel → Assign Agent
   Choose agent → Assign
   Verify: Status = "Assigned"
   Verify: Agent notified
   ```

4. **Agent Picks Up Parcel**
   ```
   Agent Portal → My Assignments
   Select parcel → Update Status
   Status = "Picked Up" → Update
   Verify: Tracking history updated
   ```

5. **Agent Delivers Parcel**
   ```
   Agent Portal → Delivery
   Select parcel → Mark Delivered
   Upload proof → Submit
   Verify: Status = "Delivered"
   Verify: Customer notified
   ```

6. **Customer Views Tracking**
   ```
   Public Tracking Page
   Enter tracking number
   Verify: Full tracking history shown
   Verify: Delivery proof visible
   ```

**Expected Database State:**
- Parcel record created
- Payment record created
- Delivery proof record created
- Tracking history records (5+ entries)
- Notifications created
- Agent stats updated

### Scenario 2: Role-Based Access Control

**Test Unauthorized Access:**

1. **Customer tries to access Admin routes**
   ```
   Login as customer
   Navigate to http://localhost:4000/admin
   Expected: Redirected to /customer/order-hub
   ```

2. **Agent tries to access Customer orders**
   ```
   Login as agent
   Try to view another customer's parcel
   Expected: 403 Forbidden
   ```

3. **Unauthenticated user tries protected route**
   ```
   No login
   Navigate to http://localhost:4000/customer
   Expected: Redirected to /auth
   ```

### Scenario 3: External Order Management

**Test Universal Order Hub:**

1. **Import External Tracking Number**
   ```
   Customer Portal → Order Hub
   Import Tracking → Enter tracking number
   Platform = "USPS" → Import
   Verify: External order created
   ```

2. **Create Return Request**
   ```
   Order Hub → Returns
   Select order → Request Return
   Fill reason → Submit
   Verify: Return request created
   ```

3. **Set Delivery Preferences**
   ```
   Order Hub → Preferences
   Enable "Leave at door"
   Save
   Verify: Preference saved
   ```

---

## ⚡ Performance Testing

### Load Testing (Basic)

For academic purposes, basic load testing:

1. **Concurrent Users Simulation**
   ```powershell
   # Simple load test with curl
   1..100 | ForEach-Object -Parallel {
       curl http://localhost:4000/api/health
   } -ThrottleLimit 10
   ```

2. **Response Time Measurement**
   ```powershell
   Measure-Command {
       curl http://localhost:4000/api/parcels -H "Authorization: Bearer $token"
   }
   ```

### Expected Performance

- Health check: < 100ms
- Login: < 500ms
- Book shipment: < 1000ms
- Get parcels list: < 500ms
- Dashboard stats: < 1000ms

### Gateway Rate Limiting Test

```powershell
# Test rate limiting - should fail after 300 requests
1..350 | ForEach-Object {
    curl http://localhost:4000/api/health
}
# Should see 429 Too Many Requests after ~300
```

---

## 🔒 Security Testing

### Test Case 1: JWT Validation

```powershell
# Try with invalid token
curl http://localhost:4000/api/parcels `
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
```

### Test Case 2: SQL Injection Prevention

```powershell
# Try SQL injection in search
curl "http://localhost:4000/api/parcels?search=' OR '1'='1" `
  -H "Authorization: Bearer $token"

# Expected: Safe query, no database breach
```

### Test Case 3: XSS Prevention

Register user with malicious name:
```json
{
  "full_name": "<script>alert('XSS')</script>",
  "email": "xss@test.com",
  "password": "Test123!"
}
```

**Expected**: Script tags sanitized or escaped in responses.

### Test Case 4: CORS Validation

```javascript
// From different origin
fetch('http://localhost:4000/api/health', {
  method: 'GET',
  mode: 'cors'
}).then(r => r.json()).then(console.log);

// Expected: CORS headers present, request allowed
```

---

## 🚀 Future Automated Testing

For production or future enhancement, consider:

### Unit Tests (Example)

```typescript
// Example: services/auth-service/tests/authService.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/services/authService';

describe('Auth Service', () => {
  it('should hash password', async () => {
    const password = 'Test123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('should compare password with hash', async () => {
    const password = 'Test123!';
    const hash = await hashPassword(password);
    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);
  });
});
```

### Integration Tests (Example)

```typescript
// Example: tests/integration/parcel.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

describe('Parcel API Integration', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login and get token
    const res = await request('http://localhost:4000')
      .post('/api/auth/login')
      .send({ identifier: 'test@example.com', password: 'Test123!' });
    authToken = res.body.data.token;
  });

  it('should book a parcel', async () => {
    const res = await request('http://localhost:4000')
      .post('/api/parcels')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        recipient_name: 'Test Recipient',
        recipient_phone: '1234567890',
        pickup_address: 'Test Pickup',
        delivery_address: 'Test Delivery',
        weight_kg: 2.5
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tracking_number).toMatch(/SR-\d{4}CA-/);
  });
});
```

### E2E Tests with Playwright (Example)

```typescript
// Example: tests/e2e/customer-flow.spec.ts
import { test, expect } from '@playwright/test';

test('customer can book shipment', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:4000');

  // Login
  await page.click('text=Login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'Test123!');
  await page.click('button:has-text("Sign In")');

  // Wait for customer portal
  await expect(page).toHaveURL(/\/customer/);

  // Book shipment
  await page.click('text=Book Shipment');
  await page.fill('[name=recipient_name]', 'John Doe');
  await page.fill('[name=recipient_phone]', '9876543210');
  // ... fill other fields
  await page.click('button:has-text("Book Shipment")');

  // Verify success
  await expect(page.locator('text=Shipment booked successfully')).toBeVisible();
});
```

---

## 📊 Test Coverage Goals

For a complete production system:

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Performance Tests**: Load, stress, spike testing
- **Security Tests**: OWASP Top 10 vulnerabilities

For this academic/university project:

- **Manual Testing**: All critical flows ✅
- **Postman Collection**: All API endpoints ✅
- **Health Checks**: All services ✅
- **Role-Based Access**: Verified ✅

---

## ✅ Testing Checklist for Demonstration

Before presenting/grading:

### Infrastructure
- [ ] All 9 services start without errors
- [ ] Database is accessible
- [ ] Health checks pass for all services
- [ ] Gateway routes correctly

### Authentication
- [ ] Customer registration works
- [ ] Customer login works
- [ ] Agent login works
- [ ] Admin login works
- [ ] Google OAuth works (if configured)
- [ ] JWT validation works

### Customer Flow
- [ ] Book shipment
- [ ] View my shipments
- [ ] Track shipment
- [ ] Make payment
- [ ] View payment history
- [ ] View notifications

### Agent Flow
- [ ] View assignments
- [ ] Update delivery status
- [ ] Submit delivery proof
- [ ] Cannot access customer data

### Admin Flow
- [ ] View dashboard with stats
- [ ] View all users
- [ ] View all parcels
- [ ] Assign agent to parcel
- [ ] Verify courier
- [ ] Cannot be accessed by non-admins

### Security
- [ ] Role-based access enforced
- [ ] Invalid tokens rejected
- [ ] Cross-role access blocked
- [ ] SQL injection prevented

---

## 📚 Additional Resources

- **Postman Collection**: `.postman/resources.yaml`
- **Startup Guide**: `MICROSERVICES_STARTUP_GUIDE.md`
- **Docker Guide**: `DOCKER_DEPLOYMENT_GUIDE.md`
- **API Documentation**: Each service has `/health` endpoint

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: ✅ Ready for Testing
