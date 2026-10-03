# SwiftRoute Enterprise - Setup Guide

## ✅ Issues Fixed

### 1. Port Conflict Resolution
- **Problem**: Port 3001 was already in use by another Node.js process
- **Solution**: 
  - Stopped the conflicting process (PID 22716)
  - Changed default port from 3001 to 3000
  - Updated `.env` and `server.ts` to use port 3000

### 2. TypeScript Compilation Errors
- Fixed `backend/services/assistantService.ts`:
  - Changed `db.parcels` to `db.getTable('parcels')`
  - Fixed destructuring: `tracking_history` → `tracking`
  
- Fixed `prisma/seed.ts`:
  - Removed invalid Prisma enum imports
  - Replaced enum references with string literals

## 🚀 Running the Application

### Development Server (Currently Running)
```bash
npm run dev
```

**Access the application at:**
- Frontend & API: http://localhost:3000
- API Health Check: http://localhost:3000/api/health

### Build for Production
```bash
npm run build
npm start
```

## 📂 Project Structure

```
swiftroute-enterprise-parcel-management/
├── src/                    # React frontend source
├── backend/               
│   ├── controllers/        # API route handlers
│   ├── services/           # Business logic
│   ├── database/           # Database connection & storage
│   ├── middleware/         # Express middleware
│   ├── routes/            # API routes
│   └── utils/             # Utility functions
├── server.ts              # Main server entry point
└── .env                   # Environment configuration
```

## 🔑 Default Test Accounts

### Admin Account
- **Email**: admin@swiftroute.com
- **Password**: admin123

### Courier Agent Account
- **Email**: agent.marcus@swiftroute.com
- **Password**: agent123

### Customer Account
- **Email**: customer@swiftroute.com
- **Password**: customer123

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check TypeScript types |
| `npm run db:generate` | Generate Prisma client (if using PostgreSQL) |
| `npm run db:seed` | Seed database with sample data |

## ⚙️ Environment Variables

Current configuration in `.env`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/swiftroute_logistics?schema=public"
GEMINI_API_KEY=""
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📊 Current Database Setup

The application is currently running with:
- **In-memory JSON database** (backend/database/datastore.json)
- Pre-populated with sample users, parcels, and tracking data
- No PostgreSQL connection required for basic functionality

## 🎯 Next Steps

1. ✅ **Server is Running** - Access at http://localhost:3000
2. Open your browser and navigate to the application
3. Try logging in with one of the test accounts above
4. Explore the parcel management features

## ⚠️ Troubleshooting

### Port Already in Use
If you see "EADDRINUSE" error:
```powershell
# Find process using port 3000
netstat -ano | Select-String ":3000"

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### Database Warning
The warning "Failed to load database from disk" is normal on first run. The app will create and use an in-memory database automatically.

### TypeScript Errors
Run type checking:
```bash
npm run lint
```

## 📞 Support

For issues or questions:
- Check the console output for detailed error messages
- Review the logs in the terminal where the server is running
- Ensure all dependencies are installed: `npm install`
