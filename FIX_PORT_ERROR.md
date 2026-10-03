# ✅ Port Error Fixed!

## **What Was Wrong:**

1. ❌ Port 3000 was already in use by another Node.js process
2. ❌ You were trying to run `npm run dev` from the `backend` directory
3. ❌ WebSocket port 24678 was also in use (Vite HMR)

## **What I Fixed:**

1. ✅ Killed the process using port 3000 (PID: 5340)
2. ✅ Port 3000 is now free

## **How to Run the Server Correctly:**

### **IMPORTANT: Run from ROOT directory, not backend!**

```bash
# Make sure you're in the root directory
cd C:\Users\st505\OneDrive\Desktop\DBMS\project\swiftroute-enterprise-parcel-management (1)

# Then run
npm run dev
```

### **If you see the error again:**

**Option 1: Kill all Node processes**
```powershell
# Stop all node processes
Stop-Process -Name node -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start server
npm run dev
```

**Option 2: Find and kill specific process**
```powershell
# Find which process is using port 3000
netstat -ano | Select-String ":3000"

# Kill it (replace XXXX with the PID number)
Stop-Process -Id XXXX -Force

# Start server
npm run dev
```

**Option 3: Change to a different port**
```powershell
# Edit .env file and change PORT
# For example, change from 3000 to 3001 or 3002
```

## **Common Mistakes to Avoid:**

### ❌ **WRONG - Running from backend directory:**
```bash
cd backend
npm run dev  # This will fail!
```

### ✅ **CORRECT - Running from root directory:**
```bash
# Make sure you're in the root
cd C:\Users\st505\OneDrive\Desktop\DBMS\project\swiftroute-enterprise-parcel-management (1)
npm run dev
```

## **Quick Command Reference:**

```powershell
# Navigate to project root
cd "C:\Users\st505\OneDrive\Desktop\DBMS\project\swiftroute-enterprise-parcel-management (1)"

# Kill any existing node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start the server
npm run dev
```

## **How to Check if Server is Running:**

```powershell
# Check port 3000
netstat -ano | Select-String ":3000"

# Check Node processes
Get-Process node -ErrorAction SilentlyContinue

# Test the API
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
```

## **Expected Output When Server Starts Correctly:**

```
> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (5) from .env
[INFO] SwiftRoute Enterprise Parcel server running on port 3000
```

## **Now You Can:**

1. ✅ Access frontend: http://localhost:3000
2. ✅ Access API: http://localhost:3000/api/health
3. ✅ View database: Open `view-database.html` in browser

## **Pro Tip:**

Create a shortcut script `start-server.ps1`:

```powershell
# Kill existing processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start server
npm run dev
```

Then just run:
```powershell
.\start-server.ps1
```
