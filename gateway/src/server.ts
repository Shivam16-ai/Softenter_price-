import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './config/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Service URLs ─────────────────────────────────────────────────────────────
// All URLs come from environment variables — never hardcoded
const MONOLITH_URL       = process.env.MONOLITH_URL       || 'http://localhost:3000';
const AUTH_SERVICE_URL   = process.env.AUTH_SERVICE_URL   || 'http://localhost:4001';
const ORDER_SERVICE_URL  = process.env.ORDER_SERVICE_URL  || 'http://localhost:4003';
const SHIPMENT_SERVICE_URL = process.env.SHIPMENT_SERVICE_URL || 'http://localhost:4004';
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://localhost:4005';
const PAYMENT_SERVICE_URL  = process.env.PAYMENT_SERVICE_URL  || 'http://localhost:4006';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4007';
const ADMIN_SERVICE_URL    = process.env.ADMIN_SERVICE_URL    || 'http://localhost:4008';

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300'),
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Tighter rate limit for auth endpoints to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: { code: 'AUTH_RATE_LIMITED', message: 'Too many auth attempts.' } },
});

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[Gateway] ${req.method} ${req.originalUrl} → routing...`);
  next();
});

// ─── Gateway Health Check ─────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'api-gateway',
    status: 'ok',
    timestamp: new Date().toISOString(),
    routing: {
      '/api/auth/*':          AUTH_SERVICE_URL,
      '/api/order-hub/*':     ORDER_SERVICE_URL,
      '/api/parcels/*':       SHIPMENT_SERVICE_URL,
      '/api/shipments/*':     SHIPMENT_SERVICE_URL,
      '/api/tracking/*':      SHIPMENT_SERVICE_URL,
      '/api/delivery/*':      DELIVERY_SERVICE_URL,
      '/api/payments/*':      PAYMENT_SERVICE_URL,
      '/api/notifications/*': NOTIFICATION_SERVICE_URL,
      '/api/admin/*':         ADMIN_SERVICE_URL,
      '/api/assistant/*':     MONOLITH_URL,
      '/api/realtime/*':      MONOLITH_URL,
    },
  });
});

// ─── Helper: proxy options builder ───────────────────────────────────────────
const makeProxy = (target: string, label: string, extra: Partial<Options> = {}): Options => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (_proxyReq: any, req: any) => {
      logger.info(`[Gateway → ${label}] ${req.method} ${req.originalUrl}`);
    },
    error: (err: any, _req: any, res: any) => {
      logger.error(`[Gateway] ${label} proxy error: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `${label} is currently unavailable. Please try again later.`,
          },
        });
      }
    },
  },
  ...extra,
});

// ─── ROUTE DEFINITIONS ────────────────────────────────────────────────────────
// All API traffic goes through the gateway.
// Frontend MUST call /api/... — never individual service ports directly.

// ── Auth Service (port 4001) ──────────────────────────────────────────────────
// Handles: register, login, Google OAuth, /me, profile update, password reset
app.use('/api/auth', authLimiter, createProxyMiddleware(makeProxy(AUTH_SERVICE_URL, 'AuthService')));

// ── Order Service (port 4003) ─────────────────────────────────────────────────
// Handles: Universal Order Hub (external orders, returns, delivery preferences)
app.use('/api/order-hub', createProxyMiddleware(makeProxy(ORDER_SERVICE_URL, 'OrderService')));
app.use('/api/orders',    createProxyMiddleware(makeProxy(ORDER_SERVICE_URL, 'OrderService')));

// ── Shipment Service (port 4004) ──────────────────────────────────────────────
// Handles: parcel creation, tracking, shipment management
app.use('/api/parcels',   createProxyMiddleware(makeProxy(SHIPMENT_SERVICE_URL, 'ShipmentService')));
app.use('/api/shipments', createProxyMiddleware(makeProxy(SHIPMENT_SERVICE_URL, 'ShipmentService')));
app.use('/api/tracking',  createProxyMiddleware(makeProxy(SHIPMENT_SERVICE_URL, 'ShipmentService')));

// ── Delivery Service (port 4005) ──────────────────────────────────────────────
// Handles: agent assignments, delivery status, proof of delivery
app.use('/api/delivery', createProxyMiddleware(makeProxy(DELIVERY_SERVICE_URL, 'DeliveryService')));

// ── Payment Service (port 4006) ───────────────────────────────────────────────
// Handles: payments, invoices, payment history
app.use('/api/payments', createProxyMiddleware(makeProxy(PAYMENT_SERVICE_URL, 'PaymentService')));

// ── Notification Service (port 4007) ─────────────────────────────────────────
// Handles: user notifications, mark-read, unread count
app.use('/api/notifications', createProxyMiddleware(makeProxy(NOTIFICATION_SERVICE_URL, 'NotificationService')));

// ── Admin Service (port 4008) ─────────────────────────────────────────────────
// Handles: admin dashboard, user management, reports, audit, system health
app.use('/api/admin', createProxyMiddleware(makeProxy(ADMIN_SERVICE_URL, 'AdminService')));

// ── Monolith Fallback (port 3000) ─────────────────────────────────────────────
// AI assistant, realtime, and any remaining routes not yet migrated
app.use('/api/assistant', createProxyMiddleware(makeProxy(MONOLITH_URL, 'Monolith[assistant]')));
app.use('/api/realtime',  createProxyMiddleware(makeProxy(MONOLITH_URL, 'Monolith[realtime]', { ws: true })));

// Catch-all for SPA (Vite / built frontend) and unmatched API routes
// The frontend (React) is served by the monolith's Vite middleware
app.use('/', createProxyMiddleware(makeProxy(MONOLITH_URL, 'Monolith[catchall]', { ws: true })));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`[Gateway] Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: { code: 'GATEWAY_ERROR', message: 'API Gateway encountered an error' },
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 SwiftRoute API Gateway running on port ${PORT}`);
  logger.info(`📡 Auth      → ${AUTH_SERVICE_URL}`);
  logger.info(`📡 Orders    → ${ORDER_SERVICE_URL}`);
  logger.info(`📡 Shipments → ${SHIPMENT_SERVICE_URL}`);
  logger.info(`📡 Delivery  → ${DELIVERY_SERVICE_URL}`);
  logger.info(`📡 Payments  → ${PAYMENT_SERVICE_URL}`);
  logger.info(`📡 Notifs    → ${NOTIFICATION_SERVICE_URL}`);
  logger.info(`📡 Admin     → ${ADMIN_SERVICE_URL}`);
  logger.info(`📡 Fallback  → ${MONOLITH_URL}`);
});

export default app;
