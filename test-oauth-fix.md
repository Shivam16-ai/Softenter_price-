# OAuth Authentication Bug Fix - Testing Guide

## 🐛 Bug Fixed
**Issue**: "User account no longer exists" error when logging in via Google OAuth

**Root Cause**: 
- Google OAuth (passport.ts) was creating users in **PostgreSQL via Prisma**
- Auth controller (authController.ts) was reading from old **JSON datastore (db)** 
- JWT validation tried to fetch user from Prisma, but couldn't find the user because the controller never actually saved it to the database

## ✅ Solution Applied
Migrated `authController.ts` to use **Prisma** consistently:
- ✅ `register()` - Now creates users in PostgreSQL
- ✅ `registerAgent()` - Now creates delivery agents in PostgreSQL
- ✅ `login()` - Now queries users from PostgreSQL
- ✅ `resetPassword()` - Now updates passwords in PostgreSQL
- ✅ `updateProfile()` - Now updates profiles in PostgreSQL

Fixed Prisma schema field mappings:
- ✅ `employeeCode` (not `employeeId`)
- ✅ `User.status` for verification (not `DeliveryAgent.verificationStatus`)
- ✅ `AgentVehicle` separate table for vehicle management
- ✅ `maxVolumeCapacityCbm` (not `maxVolumeCapacityCubicMeters`)

## 🧪 How to Test

### Test 1: Google OAuth Login (Primary Fix)
1. Start the server: `npm run dev`
2. Open browser to http://localhost:5000/auth
3. Click "Sign in with Google"
4. Complete Google authentication
5. **Expected**: Successfully redirect to customer dashboard
6. **Previously**: Error "User account no longer exists"

### Test 2: Email/Password Registration
1. Go to http://localhost:5000/auth
2. Click "Register" tab
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123
   - Phone: 1234567890
4. Submit
5. **Expected**: Account created and logged in successfully

### Test 3: Email/Password Login
1. Use credentials from Test 2
2. Login
3. **Expected**: Successfully authenticate

### Test 4: Password Reset
1. Go to "Forgot Password"
2. Enter registered email
3. Enter new password
4. **Expected**: Password updated and logged in

## 🔍 Verification Commands

Check if user exists in PostgreSQL after OAuth:
```sql
SELECT id, email, "fullName", role_id, status, "createdAt"
FROM users
WHERE email = 'your-google-email@gmail.com';
```

Check activity logs:
```sql
SELECT * FROM activity_logs
WHERE action LIKE '%GOOGLE_OAUTH%'
ORDER BY "createdAt" DESC
LIMIT 5;
```

## 📝 Files Modified
- `backend/controllers/authController.ts` - Migrated from JSON db to Prisma
- All user CRUD operations now use PostgreSQL

## ⚠️ Important Notes
- Old JSON datastore (`backend/database/datastore.json`) is NO LONGER USED for users
- All user data is now in PostgreSQL
- JWT tokens remain the same format (no frontend changes needed)
- Session validation now correctly queries PostgreSQL
