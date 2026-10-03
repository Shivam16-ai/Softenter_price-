# 🚀 SwiftRoute - Complete Startup Guide

## ✅ **All Systems Ready!**

Your application has been tested and all components are working correctly:

- ✅ **TypeScript** - No compilation errors
- ✅ **Dependencies** - All packages installed
- ✅ **Database** - JSON datastore ready
- ✅ **Ports** - Both 3000 and 24678 are available
- ✅ **Frontend** - All React components exist
- ✅ **Backend** - All API routes configured
- ✅ **Environment** - Configuration files present

---

## 🎯 **Quick Start (Choose One Method)**

### **Method 1: Clean Startup Script** ⭐ **Recommended**

This automatically handles all port conflicts and process cleanup:

```powershell
.\start-clean.ps1
```

**What it does:**
- ✅ Kills any existing Node processes
- ✅ Frees ports 3000 and 24678
- ✅ Verifies environment
- ✅ Starts the server cleanly

---

### **Method 2: Standard Startup**

```bash
npm run dev
```

**Use this if:** No port conflicts exist

---

### **Method 3: Double-Click Startup**

Simply **double-click** one of these files:
- `start-clean.ps1` (PowerShell)
- `start-server.bat` (Batch file)

---

## 🌐 **Access Your Application**

Once started, access at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **API Health** | http://localhost:3000/api/health | Server status check |
| **Database Viewer** | Open `view-database.html` | Visual database browser |

---

## 👥 **Test Accounts**

### **Admin Account**
```
Email: admin@swiftroute.com
Password: admin123
```
**Access:** Full system control, analytics, user management

### **Courier Agent**
```
Email: agent.marcus@swiftroute.com
Password: agent123
```
**Access:** Delivery management, proof of delivery, route updates

### **Customer**
```
Email: customer@swiftroute.com
Password: customer123
```
**Access:** Book parcels, track shipments, view invoices

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

**Fix:**
```powershell
# Option A: Use clean startup
.\start-clean.ps1

# Option B: Manual fix
Stop-Process -Name node -Force
npm run dev
```

---

### **Issue 2: WebSocket Error (Port 24678)**

**Error:**
```
WebSocket server error: Port 24678 is already in use
```

**Fix:**
```powershell
# Find and kill process using port 24678
$port = netstat -ano | Select-String ":24678.*LISTENING"
$port -match "LISTENING\s+(\d+)" | Out-Null
Stop-Process -Id $matches[1] -Force

# Then start server
npm run dev
```

---

### **Issue 3: Running from Wrong Directory**

**Symptom:** `server.ts not found` error

**Fix:**
```powershell
# Navigate to project root
cd "C:\Users\st505\OneDrive\Desktop\DBMS\project\swiftroute-enterprise-parcel-management (1)"

# Verify you're in the right place
ls server.ts

# Start server
npm run dev
```

---

### **Issue 4: Dependencies Missing**

**Error:**
```
Cannot find module 'express'
```

**Fix:**
```bash
npm install
npm run dev
```

---

### **Issue 5: Database Not Loading**

**Warning:**
```
[WARN] Failed to load database from disk
```

**This is normal!** The app creates an in-memory database automatically.

**To create persistent database:**
```powershell
# The database file will be created automatically
# Location: backend/database/datastore.json
```

---

### **Issue 6: TypeScript Errors**

**Fix:**
```bash
# Check for errors
npm run lint

# If errors exist, rebuild
npm install
npm run lint
```

---

## 🧪 **Test Your Setup**

Run the comprehensive test suite:

```powershell
.\test-app.ps1
```

**Expected Output:**
```
Tests Passed: 10 / 10 (100%)
✅ All tests passed! Application is ready to run.
```

---

## 📊 **Verify Server is Running**

### **Method 1: Check in Browser**
Open: http://localhost:3000/api/health

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-11T...",
  "service": "SwiftRoute Parcel Management API",
  "version": "1.0.0"
}
```

### **Method 2: PowerShell Command**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
```

### **Method 3: Check Processes**
```powershell
# View Node processes
Get-Process node

# Check port 3000
netstat -ano | Select-String ":3000.*LISTENING"
```

---

## 🛑 **Stop the Server**

### **Method 1: In Terminal**
Press `Ctrl + C`

### **Method 2: PowerShell Command**
```powershell
Stop-Process -Name node -Force
```

### **Method 3: Task Manager**
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find "Node.js JavaScript Runtime"
3. Right-click → End Task

---

## 📁 **Project Structure**

```
swiftroute-enterprise-parcel-management/
├── 🚀 start-clean.ps1          # Clean startup script
├── 🧪 test-app.ps1              # Test all components
├── 📖 STARTUP_GUIDE.md          # This file
├── 🔧 start-server.bat          # Alternative starter
│
├── src/                         # Frontend React app
│   ├── App.tsx                  # Main app component
│   ├── components/              # Reusable components
│   ├── pages/                   # Page components
│   ├── context/                 # React contexts
│   └── services/                # API client
│
├── backend/                     # Backend API
│   ├── routes/                  # API routes
│   ├── controllers/             # Request handlers
│   ├── services/                # Business logic
│   ├── database/                # Database connection
│   └── middleware/              # Express middleware
│
├── server.ts                    # Main server entry
├── .env                         # Environment config
└── package.json                 # Dependencies
```

---

## 🎨 **Features Overview**

### **For Customers**
- 📦 Book new parcel shipments
- 🔍 Track parcels in real-time
- 💳 View and pay invoices
- 📋 View shipment history
- 🎙️ Voice assistant for tracking

### **For Agents**
- 🚚 View assigned deliveries
- ✅ Update parcel status
- 📸 Submit proof of delivery
- 📍 Scan checkpoints
- 📊 View performance metrics

### **For Admins**
- 👥 Manage users
- 📦 Oversee all parcels
- 💰 View financial reports
- ⚙️ Configure system settings
- 📈 Analytics dashboard
- 📋 Activity logs

---

## 🔒 **Security Notes**

- ✅ JWT-based authentication (7-day expiry)
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ Input validation
- ✅ Secure API endpoints

---

## 📚 **Additional Resources**

### **Database Management**
```powershell
# View database
code backend/database/datastore.json

# Or use HTML viewer
start view-database.html

# Backup database
.\open-database.ps1 backup
```

### **API Documentation**
All endpoints documented in: `backend/routes/`

**Base URL:** `http://localhost:3000/api`

**Available Routes:**
- `/auth/*` - Authentication
- `/parcels/*` - Parcel management
- `/tracking/*` - Public tracking
- `/payments/*` - Payment processing
- `/admin/*` - Admin operations
- `/assistant/*` - AI assistant

---

## 🆘 **Getting Help**

### **Check Logs**
Server logs appear in the terminal where you ran `npm run dev`

### **Common Log Messages**

✅ **Success:**
```
[INFO] SwiftRoute Enterprise Parcel server running on port 3000
```

⚠️ **Warning:**
```
[WARN] Failed to load database from disk, running with in-memory database
```
*This is normal on first run*

❌ **Error:**
```
Error: listen EADDRINUSE: address already in use
```
*Solution: Run `.\start-clean.ps1`*

---

## ✅ **Pre-Flight Checklist**

Before starting, ensure:

- [ ] Node.js is installed
- [ ] Dependencies installed (`npm install`)
- [ ] Ports 3000 and 24678 are free
- [ ] In correct directory (contains `server.ts`)
- [ ] `.env` file exists

**Verify with:**
```powershell
.\test-app.ps1
```

---

## 🚀 **Ready to Launch!**

Your application is fully configured and ready to run.

**Start now:**
```powershell
.\start-clean.ps1
```

Then open your browser to:
**http://localhost:3000**

---

## 📞 **Quick Reference Commands**

| Command | Purpose |
|---------|---------|
| `.\start-clean.ps1` | Start server (clean) |
| `.\test-app.ps1` | Run tests |
| `npm run dev` | Start server (standard) |
| `npm run build` | Build for production |
| `npm run lint` | Check TypeScript |
| `Stop-Process -Name node -Force` | Kill all Node |

---

**Happy Shipping! 📦🚚**
