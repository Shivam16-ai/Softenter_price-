import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4003', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system';

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] [OrderService] ${message}`)),
  transports: [new winston.transports.Console()],
});

// Prisma
const prisma = new PrismaClient({ log: ['error'] });

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Auth middleware
const authenticate = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'Token missing' } });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true, customerProfile: true },
    });
    if (!user) return res.status(401).json({ success: false, error: { message: 'User not found' } });
    req.user = {
      id: user.id, email: user.email, full_name: user.fullName,
      role: user.role.code === 'ADMIN' ? 'admin' : user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
      customerId: user.customerProfile?.id,
    };
    next();
  } catch { return res.status(401).json({ success: false, error: { message: 'Invalid token' } }); }
};

const requireRole = (...roles: string[]) => (req: any, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  }
  next();
};

// Health
app.get('/health', (_req, res) => res.json({ service: 'order-service', status: 'ok', timestamp: new Date().toISOString() }));

// ============================================================
// ORDER HUB ROUTES (Universal Order Hub)
// ============================================================

// GET /api/order-hub/stats
app.get('/api/order-hub/stats', authenticate, async (req: any, res: Response) => {
  try {
    const customerId = req.user.customerId;
    const [totalOrders, pendingOrders] = await Promise.all([
      prisma.externalOrder.count({ where: customerId ? { customerId } : {} }),
      prisma.externalOrder.count({ where: { status: 'PENDING', ...(customerId ? { customerId } : {}) } }),
    ]);

    // Aggregate from parcels for SwiftRoute orders
    const swiftOrders = await prisma.parcel.count({
      where: req.user.role === 'customer' ? { senderId: req.user.id } : {},
    });

    return res.json({
      success: true,
      data: {
        total_orders: totalOrders + swiftOrders,
        pending_orders: pendingOrders,
        swiftroute_orders: swiftOrders,
        external_orders: totalOrders,
      },
    });
  } catch (err: any) {
    logger.error(`Stats error: ${err.message}`);
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/orders/all
app.get('/api/order-hub/orders/all', authenticate, async (req: any, res: Response) => {
  try {
    const { status, platform, search, sort_by = 'date', sort_order = 'desc' } = req.query;
    const where: any = {};
    if (req.user.role === 'customer' && req.user.customerId) where.customerId = req.user.customerId;
    if (status && status !== 'all') where.status = String(status).toUpperCase();

    const externalOrders = await prisma.externalOrder.findMany({
      where,
      include: { tracking: true },
      orderBy: { createdAt: sort_order === 'asc' ? 'asc' : 'desc' },
    });

    // Also fetch SwiftRoute parcels
    const parcelWhere: any = {};
    if (req.user.role === 'customer') parcelWhere.senderId = req.user.id;
    const parcels = await prisma.parcel.findMany({
      where: parcelWhere,
      include: { trackingHistory: { take: 3, orderBy: { recordedAt: 'desc' } } },
      orderBy: { createdAt: sort_order === 'asc' ? 'asc' : 'desc' },
    });

    const externalMapped = externalOrders.map((o: any) => ({
      id: o.id, platform: o.platform || 'external', order_number: o.externalOrderId,
      status: o.status.toLowerCase(), customer_name: o.customerName || '',
      tracking_number: o.trackingNumber, created_at: o.createdAt.toISOString(),
      updated_at: o.updatedAt.toISOString(), source: 'external',
    }));

    const parcelsMapped = parcels.map((p: any) => ({
      id: p.id, platform: 'swiftroute', order_number: p.trackingNumber,
      status: p.status.toLowerCase(), customer_name: p.senderName,
      tracking_number: p.trackingNumber, created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(), source: 'swiftroute',
    }));

    return res.json({ success: true, data: [...parcelsMapped, ...externalMapped] });
  } catch (err: any) {
    logger.error(`Orders all error: ${err.message}`);
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/orders — External orders only
app.get('/api/order-hub/orders', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = {};
    if (req.user.role === 'customer' && req.user.customerId) where.customerId = req.user.customerId;
    const orders = await prisma.externalOrder.findMany({
      where,
      include: { tracking: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/order-hub/orders — Create external order
app.post('/api/order-hub/orders', authenticate, async (req: any, res: Response) => {
  try {
    const { platform, external_order_id, customer_name, tracking_number, status, items, total_value } = req.body;
    if (!platform || !external_order_id) {
      return res.status(422).json({ success: false, error: { message: 'Platform and external_order_id are required' } });
    }
    const order = await prisma.externalOrder.create({
      data: {
        platform: platform.toUpperCase(),
        externalOrderId: external_order_id,
        customerName: customer_name || req.user.full_name,
        trackingNumber: tracking_number || null,
        status: (status || 'PENDING').toUpperCase() as any,
        totalValue: total_value ? parseFloat(total_value) : null,
        ...(req.user.customerId ? { customerId: req.user.customerId } : {}),
      },
    });
    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/orders/:id
app.get('/api/order-hub/orders/:id', authenticate, async (req: any, res: Response) => {
  try {
    const order = await prisma.externalOrder.findUnique({
      where: { id: req.params.id },
      include: { tracking: true },
    });
    if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    return res.json({ success: true, data: { order, tracking: order.tracking } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/order-hub/orders/:id/status
app.patch('/api/order-hub/orders/:id/status', authenticate, async (req: any, res: Response) => {
  try {
    const { status, location, description } = req.body;
    const updated = await prisma.externalOrder.update({
      where: { id: req.params.id },
      data: { status: status.toUpperCase() as any },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/order-hub/orders/:id
app.delete('/api/order-hub/orders/:id', authenticate, async (req: any, res: Response) => {
  try {
    await prisma.externalOrder.delete({ where: { id: req.params.id } });
    return res.json({ success: true, data: null, message: 'Order deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/order-hub/orders/import-tracking
app.post('/api/order-hub/orders/import-tracking', authenticate, async (req: any, res: Response) => {
  try {
    const { tracking_number, courier } = req.body;
    if (!tracking_number) return res.status(422).json({ success: false, error: { message: 'tracking_number required' } });
    const order = await prisma.externalOrder.create({
      data: {
        platform: (courier || 'EXTERNAL').toUpperCase() as any,
        externalOrderId: `IMP-${Date.now()}`,
        customerName: req.user.full_name,
        trackingNumber: tracking_number,
        status: 'IN_TRANSIT' as any,
        ...(req.user.customerId ? { customerId: req.user.customerId } : {}),
      },
    });
    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/returns
app.get('/api/order-hub/returns', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = {};
    if (req.user.customerId) where.customerId = req.user.customerId;
    const returns = await prisma.returnRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: returns });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/order-hub/returns
app.post('/api/order-hub/returns', authenticate, async (req: any, res: Response) => {
  try {
    const { order_id, reason, description, preferred_resolution } = req.body;
    if (!order_id || !reason) return res.status(422).json({ success: false, error: { message: 'order_id and reason required' } });
    const returnReq = await prisma.returnRequest.create({
      data: {
        externalOrderId: order_id,
        reason,
        description: description || '',
        preferredResolution: preferred_resolution || 'REFUND',
        status: 'PENDING' as any,
        ...(req.user.customerId ? { customerId: req.user.customerId } : {}),
      },
    });
    return res.status(201).json({ success: true, data: returnReq });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/preferences
app.get('/api/order-hub/preferences', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = {};
    if (req.user.customerId) where.customerId = req.user.customerId;
    const prefs = await prisma.deliveryPreference.findMany({ where });
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/order-hub/preferences
app.post('/api/order-hub/preferences', authenticate, async (req: any, res: Response) => {
  try {
    const { preference_type, value, enabled } = req.body;
    const pref = await prisma.deliveryPreference.create({
      data: {
        preferenceType: preference_type,
        value: value || '',
        enabled: enabled !== false,
        ...(req.user.customerId ? { customerId: req.user.customerId } : {}),
      },
    });
    return res.status(201).json({ success: true, data: pref });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/order-hub/preferences/toggle
app.patch('/api/order-hub/preferences/toggle', authenticate, async (req: any, res: Response) => {
  try {
    const { preference_type } = req.body;
    const existing = await prisma.deliveryPreference.findFirst({
      where: { preferenceType: preference_type, ...(req.user.customerId ? { customerId: req.user.customerId } : {}) },
    });
    if (!existing) return res.status(404).json({ success: false, error: { message: 'Preference not found' } });
    const updated = await prisma.deliveryPreference.update({
      where: { id: existing.id },
      data: { enabled: !existing.enabled },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/notifications
app.get('/api/order-hub/notifications', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = {};
    if (req.user.customerId) where.customerId = req.user.customerId;
    const { unread_only, limit } = req.query;
    if (unread_only === 'true') where.isRead = false;
    const notifications = await prisma.customerNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(String(limit)) : 50,
    });
    return res.json({ success: true, data: notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/order-hub/notifications/unread/count
app.get('/api/order-hub/notifications/unread/count', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = { isRead: false };
    if (req.user.customerId) where.customerId = req.user.customerId;
    const count = await prisma.customerNotification.count({ where });
    return res.json({ success: true, data: { count } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/order-hub/notifications/:id/read
app.patch('/api/order-hub/notifications/:id/read', authenticate, async (req: any, res: Response) => {
  try {
    const notif = await prisma.customerNotification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });
    return res.json({ success: true, data: notif });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/order-hub/notifications/read-all
app.post('/api/order-hub/notifications/read-all', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = { isRead: false };
    if (req.user.customerId) where.customerId = req.user.customerId;
    const { count } = await prisma.customerNotification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });
    return res.json({ success: true, data: { count } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

app.listen(PORT, () => logger.info(`📦 Order Service running on port ${PORT}`));

export default app;
