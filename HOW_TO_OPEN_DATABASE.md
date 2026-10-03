# 🗄️ How to Open Your Database - Quick Guide

## **Option 1: View in Browser (Easiest)** ⭐

1. **Make sure your server is running:**
   ```bash
   npm run dev
   ```

2. **Open the database viewer:**
   - Open this file in your browser: `view-database.html`
   - OR navigate to: `file:///C:/Users/st505/OneDrive/Desktop/DBMS/project/swiftroute-enterprise-parcel-management%20(1)/view-database.html`

3. **Features:**
   - ✅ Live data view
   - ✅ Interactive tables
   - ✅ Statistics dashboard
   - ✅ Beautiful UI
   - ✅ No installation needed

---

## **Option 2: View in VS Code** 

1. **Open the file directly:**
   - Press `Ctrl + P` in VS Code
   - Type: `backend/database/datastore.json`
   - Press Enter

2. **Install JSON Viewer Extension (Optional):**
   - Press `Ctrl + Shift + X`
   - Search for: "JSON Crack" or "JSON Editor"
   - Install and open the JSON file

---

## **Option 3: Use PowerShell Script**

Run this command in PowerShell:

```powershell
# View JSON database
.\open-database.ps1 json

# Backup database
.\open-database.ps1 backup

# View help
.\open-database.ps1 help
```

---

## **Option 4: Open in Text Editor**

**Location:** `backend/database/datastore.json`

**Quick access commands:**

```powershell
# Open in VS Code
code backend\database\datastore.json

# Open in Notepad
notepad backend\database\datastore.json

# View in PowerShell
Get-Content backend\database\datastore.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## **Option 5: Use PostgreSQL (Advanced)**

If you want to use a real database instead of JSON:

1. **Check if PostgreSQL is running:**
   ```powershell
   Get-Service postgresql*
   ```

2. **Start PostgreSQL:**
   ```powershell
   Start-Service postgresql-x64-16
   ```

3. **Connect with pgAdmin:**
   - Location: `C:\Program Files\PostgreSQL\16\pgAdmin 4\bin\pgAdmin4.exe`
   - Connect to: localhost
   - Database: swiftroute_logistics

4. **Or use command line:**
   ```powershell
   psql -U postgres -d swiftroute_logistics
   ```

---

## **Quick Database Info**

### **Current Database:**
- **Type:** JSON-based (file storage)
- **Location:** `backend/database/datastore.json`
- **Format:** Human-readable JSON

### **Current Data:**
```
📊 Database Contents:
├── 👥 Users: 5
│   ├── Admin: 1 (admin@swiftroute.com)
│   ├── Agents: 2 (marcus, elena)
│   └── Customers: 2 (david, sophia)
│
├── 📦 Parcels: 4
│   ├── Delivered: 1
│   ├── In Transit: 2
│   └── Pending: 1
│
├── 📍 Tracking Events: 7
├── 💳 Payments: 3
├── ✍️ Delivery Proofs: 1
└── 📋 Activity Logs: 4
```

---

## **Common Database Operations**

### **View All Users:**
```powershell
$db = Get-Content backend/database/datastore.json | ConvertFrom-Json
$db.users | Format-Table full_name, email, role
```

### **View All Parcels:**
```powershell
$db = Get-Content backend/database/datastore.json | ConvertFrom-Json
$db.parcels | Format-Table tracking_number, sender_name, recipient_name, status
```

### **Search for Specific Parcel:**
```powershell
$db = Get-Content backend/database/datastore.json | ConvertFrom-Json
$db.parcels | Where-Object { $_.tracking_number -eq "SR-2026CA-892104" }
```

### **Backup Database:**
```powershell
Copy-Item backend/database/datastore.json backend/database/datastore.backup.json
```

---

## **Troubleshooting**

### **Problem: Database file not found**
**Solution:** Start the server first:
```bash
npm run dev
```
The database file is created automatically on first run.

### **Problem: Can't see changes**
**Solution:** Refresh your browser or reload the file in VS Code.

### **Problem: Want to reset database**
**Solution:** 
1. Backup first: `.\open-database.ps1 backup`
2. Delete: `backend/database/datastore.json`
3. Restart server: `npm run dev`

---

## **Recommended Approach**

For most users, we recommend:

1. **Development:** Use `view-database.html` in browser (easiest, visual)
2. **Quick Edits:** Open JSON file directly in VS Code
3. **Production:** Migrate to PostgreSQL for better performance

---

## **Need Help?**

- 📖 Full guide: `DATABASE_SETUP_GUIDE.md`
- 🔧 Setup guide: `SETUP_GUIDE.md`
- 💻 Server should be running: `npm run dev`

---

## **Quick Access Checklist**

✅ Server running on http://localhost:3000  
✅ Database file exists at `backend/database/datastore.json`  
✅ HTML viewer available at `view-database.html`  
✅ PowerShell script available at `open-database.ps1`  

**Current Status:** All files are ready. Just choose your preferred method above!
