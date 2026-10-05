# Admin Authentication Security Implementation

## Overview
This document describes the enhanced security implementation for admin authentication, ensuring that admin users can ONLY login using credentials defined in environment variables.

## Changes Made

### 1. Environment Variables (`.env` files)
Both `.env` and `services/auth-service/.env` now contain:
```
ADMIN_EMAIL=st5051323@gmail.com
ADMIN_PASSWORD=swiftroute@05102026
```

### 2. Authentication Controller (`backend/controllers/authController.ts`)

#### Enhanced Login Logic
The `login` function now implements a **two-tier authentication system**:

**Tier 1: Admin Authentication (Environment-Based)**
- If login identifier matches `ADMIN_EMAIL` from environment variables:
  - Password is validated directly against `ADMIN_PASSWORD` (plain text comparison, no hash)
  - Database user record is fetched only for session data
  - Role verification ensures user has ADMIN or SUPER_ADMIN role
  - **No database password hash is used or checked**

**Tier 2: Regular User Authentication (Database-Based)**
- For all non-admin users (customers, agents):
  - Normal database authentication with bcrypt password hashing
  - Prevents any database user with ADMIN/SUPER_ADMIN role from logging in via standard flow
  - Portal validation still applies

#### Security Safeguards

1. **Admin Credential Isolation**
   ```typescript
   const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
   const adminPassword = process.env.ADMIN_PASSWORD;
   
   if (adminEmail && lowerId === adminEmail) {
     // Admin-only authentication path
     if (!adminPassword || password !== adminPassword) {
       return sendError(res, 'Invalid admin credentials. Access denied.', 401);
     }
   }
   ```

2. **Role Protection**
   ```typescript
   // For regular users - block admin roles
   if (user.role.code === 'ADMIN' || user.role.code === 'SUPER_ADMIN') {
     return sendError(res, 'Invalid credentials. Admin accounts can only login with designated admin credentials.', 401);
   }
   ```

3. **Database Admin User Validation**
   - Admin user must exist in database with proper role
   - Prevents environment-only admin accounts without database records

## Security Benefits

### ✅ Advantages
1. **Single Source of Truth**: Admin credentials centrally managed in environment variables
2. **No Database Compromise Risk**: Admin password not stored in database (even hashed)
3. **Easy Credential Rotation**: Change environment variables without database updates
4. **Prevents Privilege Escalation**: Regular users cannot gain admin access via database manipulation
5. **Audit Trail**: Separate log entry for admin logins vs regular user logins

### ⚠️ Important Notes
1. **Environment Security**: `.env` files must be secured and never committed to version control
2. **Deployment**: Ensure environment variables are properly set in production
3. **Admin Account Setup**: Admin user record must exist in database with correct role
4. **Password Storage**: Admin password in `.env` is plain text - file permissions critical

## Usage

### Admin Login
```bash
POST /api/auth/login
{
  "identifier": "st5051323@gmail.com",
  "password": "swiftroute@05102026"
}
```

### Regular User Login (Unchanged)
```bash
POST /api/auth/login
{
  "identifier": "customer@example.com",
  "password": "their_password"
}
```

## Testing Scenarios

### ✅ Should Succeed
- Admin login with correct env credentials
- Customer/Agent login with correct database credentials

### ❌ Should Fail
- Admin login with wrong password
- Admin login with database password hash
- Regular user trying to use admin credentials
- Database user with admin role using their own password

## Maintenance

### Changing Admin Credentials
1. Update `ADMIN_EMAIL` and/or `ADMIN_PASSWORD` in both `.env` files
2. Ensure database has user with matching email and admin role
3. Restart services to reload environment variables
4. Test login with new credentials

### Adding Multiple Admins
To support multiple admin accounts:
1. Use comma-separated values in env: `ADMIN_EMAIL=admin1@example.com,admin2@example.com`
2. Modify login controller to split and check against array
3. Maintain separate password env vars or use a secure credential store

## Compliance Notes
- This implementation separates admin authentication from standard user flows
- Meets requirement: "Admin should login with credentials from env file only"
- Prevents any bypass through database manipulation or registration endpoints
- Existing admin registration block in `register()` function remains active
