import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { serviceRegistry } from './config/serviceRegistry';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`[Gateway] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceRegistry.getHealthStatus()
  });
});

// ============================================================================
// ROUTING CONFIGURATION
// ============================================================================
// Initially, ALL routes go to the monolith
// As services are migrated, routes will be updated to point to new services
// ============================================================================

const MONOLITH_URL = process.env.MONOLITH_URL || 'http://localhost:3000';

// Route: /api/auth/* → MONOLITH (will migrate to auth-service in Phase 3)
app.use('/api/auth', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/auth${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Auth proxy error: ${err.message}`);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}));

// Route: /api/parcels/* → MONOLITH
app.use('/api/parcels', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/parcels${req.url}`);
  }
}));

// Route: /api/order-hub/* → MONOLITH
app.use('/api/order-hub', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/order-hub${req.url}`);
  }
}));

// Route: /api/payments/* → MONOLITH
app.use('/api/payments', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/payments${req.url}`);
  }
}));

// Route: /api/tracking/* → MONOLITH
app.use('/api/tracking', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/tracking${req.url}`);
  }
}));

// Route: /api/admin/* → MONOLITH
app.use('/api/admin', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/admin${req.url}`);
  }
}));

// Route: /api/assistant/* → MONOLITH
app.use('/api/assistant', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/assistant${req.url}`);
  }
}));

// Route: /api/realtime/* → MONOLITH
app.use('/api/realtime', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} /api/realtime${req.url}`);
  }
}));

// Catch-all: Everything else → MONOLITH
app.use('/', createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(`[Gateway → Monolith] ${req.method} ${req.url}`);
  }
}));

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[Gateway] Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    error: 'Gateway error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 SwiftRoute API Gateway running on port ${PORT}`);
  logger.info(`📡 Routing mode: MONOLITH PASSTHROUGH`);
  logger.info(`🔗 Monolith URL: ${MONOLITH_URL}`);
  logger.info(`⚠️  All requests currently forwarded to monolith`);
  logger.info(`✨ Ready for incremental service migration`);
});

export default app;
