import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4007', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system';

// ─── Logger ───────────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] [${level.toUpperCase()}] [NotificationService] ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// ─── Prisma ───────────────────────────────────────────────────────────────────
const prisma = new PrismaClient({ log: ['error'] });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authenticate = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_MISSING', message: 'Authentication required' } });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true, customerProfile: true },
    });
    if (!user) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role.code === 'ADMIN' ? 'admin' : user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
      customerId: user.customerProfile?.id,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid token' } });
  }
};

const requireRole = (...roles: string[]) => (req: any, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }
  next();
};

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ service: 'notification-service', status: 'ok', timestamp: new Date().toISOString() })
);

// ─── NOTIFICATION ROUTES ──────────────────────────────────────────────────────
// Note: Schema has TWO notification models:
//   - Notification (Module 7): system-level, linked to User via recipientUserId
//   - CustomerNotification (Module 11): customer-portal, linked to Customer via customerId
// This service manages BOTH.

/**
 * GET /api/notifications
 * Get in-app Notifications for the current user (from Notification table, Module 7)
 */
app.get('/api/notifications', authenticate, async (req: any, res: Response) => {
  try {
    const { unread_only, limit } = req.query;

    const where: any = { recipientUserId: req.user.id };
    if (unread_only === 'true') where.isRead = false;

    const notifications = await (prisma as any).notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(String(limit)) : 50,
    });

    const mapped = notifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      channel: n.channel,
      entity_type: n.entityType,
      entity_id: n.entityId,
      is_read: n.isRead,
      read_at: n.readAt?.toISOString() || null,
      created_at: n.createdAt?.toISOString(),
    }));

    const unreadCount = mapped.filter((n: any) => !n.is_read).length;
    return res.json({ success: true, data: mapped, meta: { total: mapped.length, unread: unreadCount } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a Notification as read
 */
app.patch('/api/notifications/:id/read', authenticate, async (req: any, res: Response) => {
  try {
    const notification = await (prisma as any).notification.findUnique({ where: { id: req.params.id } });

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    if (req.user.role !== 'admin' && notification.recipientUserId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const updated = await (prisma as any).notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ success: true, data: { id: updated.id, is_read: updated.isRead }, message: 'Marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for current user
 */
app.patch('/api/notifications/mark-all-read', authenticate, async (req: any, res: Response) => {
  try {
    const result = await (prisma as any).notification.updateMany({
      where: { recipientUserId: req.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return res.json({ success: true, data: { updated: result.count }, message: `${result.count} notifications marked as read` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/notifications/unread-count
 * Unread notification count
 */
app.get('/api/notifications/unread-count', authenticate, async (req: any, res: Response) => {
  try {
    const count = await (prisma as any).notification.count({
      where: { recipientUserId: req.user.id, isRead: false },
    });
    return res.json({ success: true, data: { unread_count: count } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/notifications/internal
 * Internal: create a Notification record (called by other services)
 */
app.post('/api/notifications/internal', authenticate, async (req: any, res: Response) => {
  try {
    const { recipient_user_id, title, message, type, entity_type, entity_id } = req.body;

    if (!recipient_user_id || !title || !message) {
      return res.status(422).json({ success: false, error: { message: 'recipient_user_id, title, message are required' } });
    }

    const notification = await (prisma as any).notification.create({
      data: {
        recipientUserId: recipient_user_id,
        title,
        message,
        type: type || 'STATUS_UPDATE',
        channel: 'IN_APP',
        entityType: entity_type || null,
        entityId: entity_id || null,
        isRead: false,
        deliveryStatus: 'SENT',
      },
    });

    return res.status(201).json({ success: true, data: { id: notification.id }, message: 'Notification created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── CUSTOMER NOTIFICATIONS (Module 11) ───────────────────────────────────────
// CustomerNotification: linked to Customer (not User directly), used in customer portal

/**
 * GET /api/notifications/customer
 * Get CustomerNotifications for the current customer user
 */
app.get('/api/notifications/customer', authenticate, async (req: any, res: Response) => {
  try {
    if (!req.user.customerId) {
      return res.json({ success: true, data: [], meta: { total: 0, unread: 0 } });
    }

    const { unread_only, limit } = req.query;
    const now = new Date();

    const where: any = {
      customerId: req.user.customerId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };
    if (unread_only === 'true') where.isRead = false;

    const notifications = await (prisma as any).customerNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(String(limit)) : 50,
    });

    const mapped = notifications.map((n: any) => ({
      id: n.id,
      customer_id: n.customerId,
      title: n.title,
      message: n.message,
      type: n.type,
      priority: n.priority,
      is_read: n.isRead,
      read_at: n.readAt?.toISOString() || null,
      parcel_id: n.parcelId || null,
      external_order_id: n.externalOrderId || null,
      action_url: n.actionUrl || null,
      action_label: n.actionLabel || null,
      created_at: n.createdAt?.toISOString(),
    }));

    const unreadCount = mapped.filter((n: any) => !n.is_read).length;
    return res.json({ success: true, data: mapped, meta: { total: mapped.length, unread: unreadCount } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PATCH /api/notifications/customer/:id/read
 * Mark a CustomerNotification as read
 */
app.patch('/api/notifications/customer/:id/read', authenticate, async (req: any, res: Response) => {
  try {
    const notification = await (prisma as any).customerNotification.findUnique({ where: { id: req.params.id } });

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    if (req.user.role !== 'admin' && notification.customerId !== req.user.customerId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const updated = await (prisma as any).customerNotification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ success: true, data: { id: updated.id, is_read: updated.isRead }, message: 'Marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PATCH /api/notifications/customer/mark-all-read
 * Mark all CustomerNotifications as read
 */
app.patch('/api/notifications/customer/mark-all-read', authenticate, async (req: any, res: Response) => {
  try {
    if (!req.user.customerId) {
      return res.json({ success: true, data: { updated: 0 } });
    }

    const result = await (prisma as any).customerNotification.updateMany({
      where: { customerId: req.user.customerId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ success: true, data: { updated: result.count }, message: `${result.count} marked as read` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/notifications/customer/internal
 * Internal: create a CustomerNotification (called by other services like order/shipment)
 * Schema fields: customerId, title, message, type (NotificationType enum), priority (string), parcelId, actionUrl, actionLabel
 */
app.post('/api/notifications/customer/internal', authenticate, async (req: any, res: Response) => {
  try {
    const { customer_id, title, message, type, priority, parcel_id, external_order_id, action_url, action_label } = req.body;

    if (!customer_id || !title || !message || !type) {
      return res.status(422).json({ success: false, error: { message: 'customer_id, title, message, type are required' } });
    }

    const notification = await (prisma as any).customerNotification.create({
      data: {
        customerId: customer_id,
        title,
        message,
        type: type,
        priority: priority || 'medium',
        parcelId: parcel_id || null,
        externalOrderId: external_order_id || null,
        isRead: false,
        actionUrl: action_url || null,
        actionLabel: action_label || null,
        sentViaEmail: false,
        sentViaSms: false,
        sentViaPush: false,
      },
    });

    logger.info(`CustomerNotification created for customer ${customer_id}: ${title}`);
    return res.status(201).json({ success: true, data: { id: notification.id }, message: 'Notification created' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * DELETE /api/notifications/customer/:id
 * Delete a CustomerNotification
 */
app.delete('/api/notifications/customer/:id', authenticate, async (req: any, res: Response) => {
  try {
    const notification = await (prisma as any).customerNotification.findUnique({ where: { id: req.params.id } });

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Not found' } });
    }

    if (req.user.role !== 'admin' && notification.customerId !== req.user.customerId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    await (prisma as any).customerNotification.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

app.listen(PORT, () => logger.info(`🔔 Notification Service running on port ${PORT}`));
export default app;
