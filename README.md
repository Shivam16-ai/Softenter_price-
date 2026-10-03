# 🚚 SwiftRoute Enterprise Parcel Management System

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Node](https://img.shields.io/badge/Node-24+-green)

A comprehensive, enterprise-grade parcel and logistics management platform with role-based dashboards, real-time tracking, and AI-powered voice assistant.

---

## ✨ Features

### 🎯 **Multi-Role Support**
- **Admin Dashboard** - System management, analytics, user control
- **Agent Dashboard** - Delivery management, proof of delivery, route updates
- **Customer Dashboard** - Book parcels, track shipments, manage payments

### 📦 **Parcel Management**
- Real-time parcel tracking
- Multiple parcel types (Standard, Express, Fragile, Document)
- Automated tracking number generation
- Status checkpoints with timeline view
- Electronic proof of delivery with signatures

### 💳 **Payment Processing**
- Multiple payment methods (Card, Bank Transfer, Wallet, COD)
- Invoice generation and management
- Payment status tracking
- Revenue analytics

### 🎨 **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations with Framer Motion
- Interactive components
- Real-time updates

### 🤖 **AI Assistant**
- Voice-enabled parcel tracking
- Natural language queries
- Intelligent navigation
- Context-aware responses

### 🔒 **Security**
- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- Secure API endpoints
- Input validation

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 20+ installed
- npm or yarn package manager
- (Optional) PostgreSQL for production database

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd swiftroute-enterprise-parcel-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # .env file is already configured
   # Optionally update with your settings
   ```

4. **Start the application**
   ```powershell
   # Interactive menu
   .\swiftroute.ps1
   
   # Or direct start
   .\swiftroute.ps1 start
   
   # Or standard start
   npm run dev
   ```

5. **Access the application**
   ```
   Frontend: http://localhost:3000
   API:      http://localhost:3000/api
   Health:   http://localhost:3000/api/health
   ```

---

## 👤 Test Accounts

### **Admin Account**
```
Email:    admin@swiftroute.com
Password: admin123
Features: Full system control, analytics, user management
```

### **Courier Agent**
```
Email:    agent.marcus@swiftroute.com
Password: agent123
Features: Delivery management, proof of delivery
```

### **Customer**
```
Email:    customer@swiftroute.com
Password: customer123
Features: Book parcels, track shipments, view invoices
```

---

## 📁 Project Structure

```
swiftroute-enterprise-parcel-management/
│
├── 🎨 Frontend (src/)
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── customer/       # Customer dashboard
│   │   ├── agent/          # Agent dashboard
│   │   └── admin/          # Admin dashboard
│   ├── components/         # Reusable UI components
│   ├── context/            # React context (Auth, Theme)
│   └── services/           # API client
│
├── ⚙️ Backend (backend/)
│   ├── routes/             # API endpoints
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, validation, errors
│   └── database/           # Data layer
│       └── datastore.json  # JSON database
│
├── 📚 Documentation
│   ├── README.md           # This file
│   ├── STARTUP_GUIDE.md    # Complete setup guide
│   ├── NEXT_STEPS.md       # Enhancement ideas
│   └── DATABASE_SETUP_GUIDE.md
│
├── 🔧 Scripts
│   ├── swiftroute.ps1      # Master control script
│   ├── dashboard.ps1       # System dashboard
│   ├── start-clean.ps1     # Clean server start
│   └── test-app.ps1        # Test suite
│
└── 🗄️ Configuration
    ├── server.ts           # Main server
    ├── package.json        # Dependencies
    ├── tsconfig.json       # TypeScript config
    └── vite.config.ts      # Vite config
```

---

## 🛠️ Available Scripts

### **Development**

```bash
# Start development server
npm run dev

# Run TypeScript check
npm run lint

# Run test suite
.\test-app.ps1
```

### **Production**

```bash
# Build for production
npm run build

# Start production server
npm start

# Preview production build
npm run preview
```

### **Database**

```bash
# Generate Prisma client
npm run db:generate

# Validate schema
npm run db:validate

# Seed database
npm run db:seed
```

### **Convenience Scripts**

```powershell
# Interactive menu
.\swiftroute.ps1

# System dashboard
.\dashboard.ps1

# Start with cleanup
.\start-clean.ps1

# Database management
.\open-database.ps1 json
```

---

## 🎯 Key Features Breakdown

### **Customer Features**
- 📦 Book new parcels with instant tracking numbers
- 🔍 Real-time parcel tracking with timeline
- 💳 View and pay invoices
- 📜 Complete shipment history
- 🎙️ Voice assistant for quick tracking
- 📊 Personal analytics dashboard

### **Agent Features**
- 🚚 View assigned deliveries
- ✅ Update parcel status in real-time
- 📸 Submit proof of delivery with signatures
- 📍 Checkpoint scanning
- 📊 Performance metrics
- 🗺️ Delivery route management

### **Admin Features**
- 👥 User management (CRUD operations)
- 📦 System-wide parcel oversight
- 💰 Financial reports and analytics
- ⚙️ System configuration
- 📈 Revenue and performance charts
- 📋 Activity audit logs
- 🔒 Role and permission management

---

## 🗄️ Database

### **Current Setup: JSON File Storage**
- Location: `backend/database/datastore.json`
- Perfect for development and testing
- Easy to view and edit
- No external dependencies

### **Production Option: PostgreSQL**
Complete Prisma schema included for production deployment:
- Full relational database support
- ACID compliance
- Advanced queries
- Automatic migrations

See `DATABASE_SETUP_GUIDE.md` for migration instructions.

---

## 🔌 API Endpoints

### **Authentication**
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user
PUT    /api/auth/profile       # Update profile
```

### **Parcels**
```
GET    /api/parcels            # List parcels
POST   /api/parcels            # Create parcel
GET    /api/parcels/:id        # Get parcel details
PUT    /api/parcels/:id/status # Update status
PUT    /api/parcels/:id/assign # Assign agent
POST   /api/parcels/:id/proof  # Submit delivery proof
```

### **Tracking**
```
GET    /api/tracking/:number   # Track parcel (public)
```

### **Payments**
```
GET    /api/payments           # List payments
POST   /api/payments           # Process payment
GET    /api/payments/:id       # Get payment details
```

### **Admin**
```
GET    /api/admin/users        # List all users
PUT    /api/admin/users/:id    # Update user
GET    /api/admin/stats        # Dashboard statistics
GET    /api/admin/analytics    # Analytics data
GET    /api/admin/reports      # Generate reports
```

---

## 🧪 Testing

### **Run All Tests**
```powershell
.\test-app.ps1
```

### **Manual Testing**
1. Start server: `.\swiftroute.ps1 start`
2. Open: http://localhost:3000
3. Login with test account
4. Test features:
   - Book parcel
   - Track parcel
   - Update status
   - Process payment
   - View analytics

---

## 🚢 Deployment

### **Option 1: Vercel (Recommended for Quick Deploy)**
```bash
npm install -g vercel
vercel deploy
```

### **Option 2: Docker**
```bash
docker build -t swiftroute .
docker run -p 3000:3000 swiftroute
```

### **Option 3: Traditional VPS**
```bash
# On server
git clone <repo>
npm install
npm run build
pm2 start dist/server.cjs
```

See `NEXT_STEPS.md` for detailed deployment guides.

---

## 🔒 Security

- ✅ JWT authentication with 7-day expiry
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Role-based access control
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting ready

---

## 🎨 Tech Stack

### **Frontend**
- React 19 with TypeScript
- TailwindCSS v4 for styling
- Framer Motion for animations
- Lucide React for icons
- Context API for state management

### **Backend**
- Node.js with Express
- TypeScript for type safety
- JWT for authentication
- Bcrypt for password hashing
- Prisma ORM (optional)

### **Development**
- Vite for fast builds
- ESBuild for bundling
- TSX for TypeScript execution
- Hot Module Replacement (HMR)

---

## 📊 Database Schema

### **Tables**
- `users` - User accounts with roles
- `parcels` - Parcel shipments
- `parcel_tracking` - Tracking checkpoints
- `payments` - Payment transactions
- `delivery_proofs` - Delivery confirmations
- `activity_logs` - System audit logs
- `system_settings` - Configuration

See full schema in `prisma/schema.prisma`

---

## 🐛 Troubleshooting

### **Port Already in Use**
```powershell
.\swiftroute.ps1 stop
.\swiftroute.ps1 start
```

### **Dependencies Issue**
```bash
rm -rf node_modules
npm install
```

### **TypeScript Errors**
```bash
npm run lint
```

### **Database Issues**
```powershell
# Backup and reset
.\open-database.ps1 backup
# Delete datastore.json
# Restart server to recreate
```

See `STARTUP_GUIDE.md` for more solutions.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README_START_HERE.md` | Quick start guide for beginners |
| `STARTUP_GUIDE.md` | Complete setup and troubleshooting |
| `NEXT_STEPS.md` | Enhancement ideas and roadmap |
| `DATABASE_SETUP_GUIDE.md` | Database configuration options |
| `AUTH_REDIRECT_FIX.md` | Authentication flow details |
| `FINAL_STATUS.md` | Current system status |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Development Team

Built with ❤️ for enterprise logistics management.

---

## 🙏 Acknowledgments

- React team for React 19
- Vercel for Vite and deployment
- The open-source community

---

## 📞 Support

For issues and questions:
- Check documentation in `/docs`
- Review `STARTUP_GUIDE.md`
- Check existing issues
- Open a new issue

---

## 🎉 Get Started Now!

```powershell
# Interactive dashboard
.\dashboard.ps1

# Or quick start
.\swiftroute.ps1 start
```

Then open: **http://localhost:3000**

---

**Happy Shipping! 📦🚚**
