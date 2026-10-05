import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config';
import { logger } from './config/logger';
import passport from './config/passport';
import authRoutes from './routes/authRoutes';
import prisma from './config/prisma';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session (required for Google OAuth)
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: config.nodeEnv === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}) as any);

app.use(passport.initialize() as any);
app.use(passport.session() as any);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ service: 'auth-service', status: 'ok', timestamp: new Date().toISOString() });
});

// Routes — mounted at /api/auth to match gateway routing
app.use('/api/auth', authRoutes);

// Also mount at /auth for internal service-to-service calls
app.use('/auth', authRoutes);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

// Bootstrap: ensure admin account exists
async function ensureAdminExists() {
  try {
    const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
    if (!adminRole) { logger.warn('ADMIN role not found — run prisma db seed first'); return; }

    const existing = await prisma.user.findUnique({ where: { email: config.adminEmail } });
    if (!existing) {
      const hash = await bcrypt.hash(config.adminPassword, 12);
      await prisma.user.create({
        data: {
          email: config.adminEmail,
          passwordHash: hash,
          fullName: 'System Administrator',
          phone: '',
          address: '',
          roleId: adminRole.id,
          status: 'ACTIVE',
          isEmailVerified: true,
        },
      });
      logger.info(`Admin account created: ${config.adminEmail}`);
    }
  } catch (err: any) {
    logger.warn(`Admin bootstrap skipped: ${err.message}`);
  }
}

app.listen(config.port, async () => {
  logger.info(`🔐 Auth Service running on port ${config.port}`);
  await ensureAdminExists();
});

export default app;
