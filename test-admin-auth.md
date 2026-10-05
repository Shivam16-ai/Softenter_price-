# Admin Authentication Test Cases

## Test Environment Setup
Ensure the following environment variables are set in `.env`:
```
ADMIN_EMAIL=st5051323@gmail.com
ADMIN_PASSWORD=swiftroute@05102026
```

## Test Scenarios

### ✅ Test 1: Valid Admin Login (Should PASS)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "st5051323@gmail.com",
    "password": "swiftroute@05102026"
  }'
```

**Expected Result:**
- Status: 200 OK
- Response contains JWT token
- Response contains user object with admin role
- Activity log entry: "ADMIN_LOGIN"

---

### ❌ Test 2: Admin Login with Wrong Password (Should FAIL)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "st5051323@gmail.com",
    "password": "wrongpassword123"
  }'
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid admin credentials. Access denied."

---

### ❌ Test 3: Admin Login with Database Password (Should FAIL)
Even if the admin user has a hashed password in the database, it should NOT work for login.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "st5051323@gmail.com",
    "password": "admin123"
  }'
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid admin credentials. Access denied."

---

### ❌ Test 4: Regular User Trying Admin Email (Should FAIL)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "st5051323@gmail.com",
    "password": "some_other_password"
  }'
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid admin credentials. Access denied."

---

### ✅ Test 5: Regular Customer Login (Should PASS - Unchanged)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "customer@example.com",
    "password": "customer_password"
  }'
```

**Expected Result:**
- Status: 200 OK
- Normal authentication flow works
- User authenticated with customer role

---

### ✅ Test 6: Delivery Agent Login (Should PASS - Unchanged)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "agent@company.com",
    "password": "agent_password"
  }'
```

**Expected Result:**
- Status: 200 OK
- Normal authentication flow works
- User authenticated with agent role

---

### ❌ Test 7: Database User with Admin Role Using Own Password (Should FAIL)
If someone manually created a database user with admin role (not the env admin):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "someadmin@example.com",
    "password": "their_password"
  }'
```

**Expected Result:**
- Status: 401 Unauthorized
- Error: "Invalid credentials. Admin accounts can only login with designated admin credentials."

---

## Verification Checklist

### Before Testing
- [ ] Environment variables set in `.env` file
- [ ] Backend service restarted to load new env vars
- [ ] Database contains admin user with email matching ADMIN_EMAIL
- [ ] Admin user in database has ADMIN or SUPER_ADMIN role

### Security Checks
- [ ] Admin cannot login with database password
- [ ] Admin can only login with exact env password (plain text match)
- [ ] Regular users with admin role in DB cannot login at all
- [ ] Regular customer/agent login flows still work normally
- [ ] Portal validation still works for customer/agent
- [ ] Google OAuth still works for non-admin users

### Logs to Monitor
Check backend logs for these activity entries:
- `ADMIN_LOGIN` - When admin logs in with env credentials
- `USER_LOGIN` - When customer/agent logs in normally
- Failed login attempts should show appropriate error messages

---

## Database Verification

### Check Admin User Exists
```sql
SELECT 
  u.id, 
  u.email, 
  u."fullName", 
  r.code as role_code,
  u.status 
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email = 'st5051323@gmail.com';
```

**Expected:**
- User exists
- Role code is 'ADMIN' or 'SUPER_ADMIN'
- Status is 'ACTIVE'

### Verify No Admin Password Hash Used
After implementing this security, the admin login should NOT check the `passwordHash` column for admin email. The password in the database (hashed or not) is irrelevant for admin authentication.

---

## Troubleshooting

### Issue: "Admin account not found"
**Solution:** Ensure database has user with email matching `ADMIN_EMAIL` env variable

### Issue: "This account does not have administrative privileges"
**Solution:** Update user's role in database to ADMIN or SUPER_ADMIN:
```sql
UPDATE "User" 
SET "roleId" = (SELECT id FROM "Role" WHERE code = 'ADMIN')
WHERE email = 'st5051323@gmail.com';
```

### Issue: Admin login not using env credentials
**Solution:** 
1. Check `.env` file has ADMIN_EMAIL and ADMIN_PASSWORD
2. Restart backend service to reload environment
3. Verify no spaces in env variable values

### Issue: Regular users can't login
**Solution:** Ensure their email does NOT match ADMIN_EMAIL - if it does, they'll be forced through admin auth flow

---

## Migration Notes

If you're migrating from old admin accounts:
1. Update ADMIN_EMAIL and ADMIN_PASSWORD in `.env`
2. Ensure database user with that email has admin role
3. Old admin accounts in database with different emails will be blocked from logging in
4. To create new admin: Add their email to `.env` as ADMIN_EMAIL
