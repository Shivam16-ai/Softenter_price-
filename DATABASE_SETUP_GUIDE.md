# Database Setup Guide - SwiftRoute Enterprise

## 📊 Current Database Status

Your application is currently using **JSON-based storage** with data stored in:
```
backend/database/datastore.json
```

You have **PostgreSQL installed** on your system and can optionally upgrade to it.

---

## Option 1: View/Edit Current JSON Database (Quick & Easy)

### **View Database in VS Code**

1. **Open the database file:**
   ```
   backend/database/datastore.json
   ```

2. **Install JSON Viewer Extension (Optional):**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search for "JSON Viewer" or "JSON Editor"
   - Install any of these:
     - "JSON Crack" - Visual tree view
     - "JSON Editor" - GUI editor
     - "vscode-json-editor" - Table view

### **View Database in Browser**

1. **Online JSON Viewer:**
   - Copy content from `backend/database/datastore.json`
   - Visit: https://jsoncrack.com/editor
   - Paste and visualize as a tree/graph

### **Current Database Contents:**

```json
Tables:
├── users (5 users)
│   ├── Admin: admin@swiftroute.com
│   ├── Agent: agent.marcus@swiftroute.com
│   ├── Agent: agent.elena@swiftroute.com
│   ├── Customer: customer@swiftroute.com
│   └── Customer: sophia.m@gmail.com
│
├── parcels (4 parcels)
│   ├── SR-2026CA-892104 (out_for_delivery)
│   ├── SR-2026NY-419082 (in_transit)
│   ├── SR-2026TX-654321 (delivered)
│   └── SR-2026WA-118833 (pending)
│
├── parcel_tracking (7 tracking checkpoints)
├── payments (3 payments)
├── delivery_proofs (1 proof)
├── activity_logs (4 logs)
└── system_settings (1 config)
```

### **Edit Database Directly**

Simply open and edit:
```
backend/database/datastore.json
```

Changes are auto-saved and loaded on next server restart.

---

## Option 2: Setup PostgreSQL Database (Production-Ready)

### **Step 1: Start PostgreSQL Service**

```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL service (if not running)
Start-Service postgresql-x64-16  # Adjust version number
```

### **Step 2: Create Database**

```powershell
# Open PostgreSQL command line
psql -U postgres

# Create database (in psql prompt)
CREATE DATABASE swiftroute_logistics;

# Create user (optional - more secure)
CREATE USER swiftroute WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE swiftroute_logistics TO swiftroute;

# Exit psql
\q
```

### **Step 3: Update Environment Variables**

Edit `.env` file:

```env
# Change this:
DATABASE_URL="postgresql://postgres:password@localhost:5432/swiftroute_logistics?schema=public"

# To match your setup:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/swiftroute_logistics?schema=public"
```

### **Step 4: Generate Prisma Client & Migrate**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npx prisma db push

# Seed database with sample data
npm run db:seed
```

### **Step 5: Update Backend to Use Prisma**

The backend already has Prisma configured! Just need to switch from JSON to Prisma client.

Edit `backend/database/connection.ts` - you can toggle between JSON and Prisma mode.

---

## Option 3: Use Database GUI Tools

### **Option A: Prisma Studio (Built-in)**

```bash
# Start Prisma Studio (if using PostgreSQL)
npx prisma studio
```

Opens at: http://localhost:5555

**Features:**
- Visual database browser
- Edit records directly
- Run queries
- View relationships

### **Option B: pgAdmin (PostgreSQL GUI)**

1. **Find pgAdmin:** Usually installed with PostgreSQL
2. **Location:** `C:\Program Files\PostgreSQL\16\pgAdmin 4\bin\pgAdmin4.exe`
3. **Connect to localhost server**
4. **Navigate to:** Servers → PostgreSQL → Databases → swiftroute_logistics

### **Option C: DBeaver (Universal Database Tool)**

1. **Download:** https://dbeaver.io/download/
2. **Install and create new connection:**
   - Database: PostgreSQL
   - Host: localhost
   - Port: 5432
   - Database: swiftroute_logistics
   - Username: postgres
   - Password: (your password)

### **Option D: VS Code Extensions**

Install one of these in VS Code:

1. **PostgreSQL** by Chris Kolkman
2. **SQLTools** - Database management
3. **Database Client** by Weijan Chen

---

## Quick Commands Reference

### **JSON Database (Current)**

```bash
# View database
code backend/database/datastore.json

# Backup database
Copy-Item backend/database/datastore.json backend/database/datastore.backup.json

# Reset to default
npm run dev  # Auto-creates if missing
```

### **PostgreSQL Database**

```bash
# Check service status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-16

# Connect via psql
psql -U postgres -d swiftroute_logistics

# View tables (in psql)
\dt

# View specific table
SELECT * FROM users;

# Exit
\q
```

### **Prisma Commands**

```bash
# Generate client (after schema changes)
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name init

# Seed database
npm run db:seed

# View Prisma schema
code prisma/schema.prisma
```

---

## Database Schema Overview

### **Tables (PostgreSQL/Prisma Schema)**

```
users
├── id (Primary Key)
├── email (Unique)
├── passwordHash
├── fullName
├── phone
├── role (admin/agent/customer)
└── status (active/suspended)

parcels
├── id (Primary Key)
├── trackingNumber (Unique)
├── senderId (FK → users)
├── recipientName
├── status (pending/in_transit/delivered)
├── assignedAgentId (FK → delivery_agents)
└── paymentStatus

tracking_histories
├── id (Primary Key)
├── parcelId (FK → parcels)
├── status
├── location
├── description
└── checkpointTimestamp

delivery_agents
├── id (Primary Key)
├── userId (FK → users)
├── employeeCode
└── rating

payments
├── id (Primary Key)
├── parcelId (FK → parcels)
├── amount
└── status
```

---

## Troubleshooting

### **PostgreSQL Not Starting**

```powershell
# Find PostgreSQL installation
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter postgres.exe

# Check all services
Get-Service | Where-Object {$_.DisplayName -like "*postgres*"}

# Force start
Start-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
```

### **Can't Connect to PostgreSQL**

1. Check if service is running
2. Verify password in `.env`
3. Check PostgreSQL config:
   ```
   C:\Program Files\PostgreSQL\16\data\postgresql.conf
   C:\Program Files\PostgreSQL\16\data\pg_hba.conf
   ```

### **Prisma Errors**

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## Recommendation

### **For Development (Current):**
✅ **Use JSON Database** - Simple, no setup needed, already working

### **For Production:**
✅ **Migrate to PostgreSQL** - Better performance, ACID compliance, scalability

### **Best of Both:**
Keep JSON for quick testing, PostgreSQL for production deployment.

---

## Quick Access

### **Current JSON Database Location:**
```
File: backend/database/datastore.json
```

### **To View in VS Code:**
Press `Ctrl+P` and type:
```
backend/database/datastore.json
```

### **To View All Data:**
```powershell
Get-Content backend/database/datastore.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```
