import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4008', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system';

// ─── Logger ───────────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] [${level.toUpperCase()}] [AdminService] ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// ─── Prisma ───────────────────────────────────────────────────────────────────
const prisma = new PrismaClient({ log: ['error'] });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));

// ─── Admin-Only Auth ──────────────────────────────────────────────────────────
const authenticateAdmin = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_MISSING', message: 'Authentication required' } });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });
    if (!user) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'];
    if (!adminRoles.includes(user.role.code)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } });
    }
    req.user = { id: user.id, email: user.email, full_name: user.fullName, role: 'admin', roleCode: user.role.code };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid token' } });
  }
};

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ service: 'admin-service', status: 'ok', timestamp: new Date().toISOString() })
);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Dashboard statistics from real DB
 */
app.get('/api/admin/stats', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const [
      totalParcels, pendingParcels, inTransitParcels, deliveredParcels,
      failedParcels, totalUsers, activeAgents, totalCustomers,
    ] = await Promise.all([
      prisma.parcel.count({ where: { deletedAt: null } }),
      prisma.parcel.count({ where: { deletedAt: null, status: { in: ['PENDING', 'ASSIGNED'] as any[] } } }),
      prisma.parcel.count({ where: { deletedAt: null, status: { in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'IN_SORTING', 'ARRIVED_AT_HUB'] as any[] } } }),
      prisma.parcel.count({ where: { deletedAt: null, status: 'DELIVERED' as any } }),
      prisma.parcel.count({ where: { deletedAt: null, status: 'FAILED' as any } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: { code: 'COURIER_AGENT' }, status: 'ACTIVE' as any } }),
      prisma.user.count({ where: { role: { code: 'CUSTOMER' } } }),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const deliveredToday = await prisma.parcel.count({
      where: { deletedAt: null, status: 'DELIVERED' as any, actualDeliveryDate: { gte: todayStart } },
    });

    // Sum from Payment model (schema Module 6)
    const revenueAgg = await (prisma as any).payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    const totalRevenue = parseFloat(revenueAgg._sum?.amount?.toString() || '0');

    const finishedTotal = deliveredParcels + failedParcels;
    const deliverySuccessRate = finishedTotal > 0 ? Math.round((deliveredParcels / finishedTotal) * 100) : 98;

    return res.json({
      success: true,
      data: {
        totalParcels, pendingDeliveries: pendingParcels, pending: pendingParcels,
        inTransit: inTransitParcels, deliveredToday, delivered: deliveredParcels, failed: failedParcels,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeAgents, totalCustomers, totalUsers, deliverySuccessRate,
      },
    });
  } catch (err: any) {
    logger.error(`Stats error: ${err.message}`);
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/users
 * List all users
 */
app.get('/api/admin/users', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { role } = req.query;
    const where: any = {};
    if (role && role !== 'all') {
      const codeMap: Record<string, string> = { admin: 'ADMIN', agent: 'COURIER_AGENT', customer: 'CUSTOMER' };
      const code = codeMap[String(role)];
      if (code) where.role = { code };
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true, deliveryAgentProfile: true, customerProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = users.map((u: any) => ({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      phone: u.phone,
      address: u.address || '',
      role: u.role.code === 'ADMIN' ? 'admin' : u.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
      status: u.status.toLowerCase(),
      created_at: u.createdAt.toISOString(),
      updated_at: u.updatedAt.toISOString(),
      employee_id: u.deliveryAgentProfile?.employeeCode || null,
      verification_status: u.status === 'PENDING_VERIFICATION' ? 'pending_verification' :
                           u.status === 'ACTIVE' ? 'approved' : u.status.toLowerCase(),
    }));

    return res.json({ success: true, data: mapped, meta: { total: mapped.length } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/couriers
 * List all delivery agents
 */
app.get('/api/admin/couriers', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const agents = await prisma.user.findMany({
      where: { role: { code: 'COURIER_AGENT' } },
      include: { role: true, deliveryAgentProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = agents.map((u: any) => ({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.status.toLowerCase(),
      created_at: u.createdAt.toISOString(),
      employee_id: u.deliveryAgentProfile?.employeeCode,
      employment_status: u.deliveryAgentProfile?.employmentStatus?.toLowerCase(),
      rating: u.deliveryAgentProfile?.rating ? parseFloat(u.deliveryAgentProfile.rating.toString()) : 5.0,
      total_deliveries: u.deliveryAgentProfile?.totalDeliveriesCount || 0,
      successful_deliveries: u.deliveryAgentProfile?.successfulDeliveriesCount || 0,
      verification_status: u.status === 'PENDING_VERIFICATION' ? 'pending_verification' :
                           u.status === 'ACTIVE' ? 'approved' : u.status.toLowerCase(),
    }));

    return res.json({ success: true, data: mapped, meta: { total: mapped.length } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/admin/couriers
 * Create a delivery agent directly
 */
app.post('/api/admin/couriers', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { full_name, email, password, phone, address, employee_id } = req.body;
    if (!full_name || !email || !password || !phone) {
      return res.status(422).json({ success: false, error: { message: 'full_name, email, password, phone required' } });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Email already registered' } });

    const agentRole = await prisma.role.findUnique({ where: { code: 'COURIER_AGENT' } });
    if (!agentRole) return res.status(500).json({ success: false, error: { message: 'COURIER_AGENT role not found' } });

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(), passwordHash, fullName: full_name,
        phone, address: address || '', roleId: agentRole.id, status: 'ACTIVE' as any, isEmailVerified: true,
      },
      include: { role: true },
    });

    await prisma.deliveryAgent.create({
      data: {
        userId: newUser.id,
        employeeCode: employee_id?.toUpperCase() || `EMP-${Date.now().toString().slice(-6)}`,
        employmentStatus: 'ACTIVE' as any,
        rating: 5.0, totalDeliveriesCount: 0, successfulDeliveriesCount: 0, failedDeliveriesCount: 0,
      },
    });

    logger.info(`Admin created courier: ${email}`);
    return res.status(201).json({
      success: true,
      data: { id: newUser.id, email: newUser.email, full_name: newUser.fullName, role: 'agent', status: 'active' },
      message: 'Courier agent onboarded',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Update user status
 */
app.patch('/api/admin/users/:id/status', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: { message: 'status required' } });

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: status.toUpperCase() as any },
    });

    return res.json({
      success: true,
      data: { id: updated.id, full_name: updated.fullName, status: updated.status.toLowerCase() },
      message: `User status updated to ${status}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PATCH /api/admin/couriers/:id/verify
 * Verify or reject a courier
 */
app.patch('/api/admin/couriers/:id/verify', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected', 'pending_verification'].includes(status)) {
      return res.status(422).json({ success: false, error: { message: 'Valid status required: approved, rejected, pending_verification' } });
    }

    const agent = await prisma.user.findFirst({ where: { id: req.params.id, role: { code: 'COURIER_AGENT' } } });
    if (!agent) return res.status(404).json({ success: false, error: { message: 'Agent not found' } });

    const statusMap: Record<string, string> = {
      approved: 'ACTIVE', rejected: 'DEACTIVATED', pending_verification: 'PENDING_VERIFICATION',
    };
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: statusMap[status] as any },
    });

    if (status === 'approved') {
      await prisma.deliveryAgent.updateMany({
        where: { userId: req.params.id },
        data: { employmentStatus: 'ACTIVE' as any },
      });
    }

    logger.info(`Admin set courier ${req.params.id} to ${status}`);
    return res.json({ success: true, data: { id: updated.id, verification_status: status }, message: `Agent ${status}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/parcels
 * List all parcels with pagination
 */
app.get('/api/admin/parcels', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const where: any = { deletedAt: null };

    if (status && status !== 'all') where.status = String(status).toUpperCase() as any;
    if (search) {
      where.OR = [
        { trackingNumber: { contains: String(search), mode: 'insensitive' } },
        { recipientName: { contains: String(search), mode: 'insensitive' } },
        { senderName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [parcels, total] = await Promise.all([
      prisma.parcel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(String(limit)),
      }),
      prisma.parcel.count({ where }),
    ]);

    const mapped = parcels.map((p: any) => ({
      id: p.id, tracking_number: p.trackingNumber, sender_id: p.senderId,
      sender_name: p.senderName, recipient_name: p.recipientName, recipient_phone: p.recipientPhone,
      pickup_address: p.pickupAddress, delivery_address: p.deliveryAddress,
      weight_kg: parseFloat(p.weightKg?.toString()),
      parcel_type: p.parcelType?.toLowerCase(), status: p.status?.toLowerCase(),
      payment_status: p.paymentStatus?.toLowerCase(),
      shipping_cost: parseFloat(p.totalShippingCost?.toString() || '0'),
      assigned_agent_id: p.assignedAgentId,
      estimated_delivery: p.estimatedDeliveryDate?.toISOString(),
      created_at: p.createdAt.toISOString(), updated_at: p.updatedAt.toISOString(),
    }));

    return res.json({ success: true, data: mapped, meta: { total, page: parseInt(String(page)), limit: parseInt(String(limit)) } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/payments
 * All payment records
 */
app.get('/api/admin/payments', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    // Use `payment` model (Payment in Prisma, table `payments`)
    const payments = await (prisma as any).payment.findMany({
      include: {
        parcel: { select: { trackingNumber: true, recipientName: true, senderName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = payments.map((p: any) => ({
      id: p.id,
      payment_reference: p.paymentReference,
      parcel_id: p.parcelId,
      parcel_tracking: p.parcel?.trackingNumber,
      sender_name: p.parcel?.senderName,
      amount: parseFloat(p.amount?.toString()),
      currency: p.currencyCode,
      payment_method: p.paymentMethod?.toLowerCase(),
      transaction_id: p.transactionId,
      status: p.status?.toLowerCase(),
      created_at: p.createdAt?.toISOString(),
    }));

    return res.json({ success: true, data: mapped, meta: { total: mapped.length } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/reports
 * Monthly delivery and revenue reports
 */
app.get('/api/admin/reports', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();

    const monthlyDeliveries = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [delivered, inTransit, failed] = await Promise.all([
        prisma.parcel.count({ where: { status: 'DELIVERED' as any, actualDeliveryDate: { gte: start, lte: end } } }),
        prisma.parcel.count({ where: { status: { in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] as any[] }, createdAt: { gte: start, lte: end } } }),
        prisma.parcel.count({ where: { status: 'FAILED' as any, updatedAt: { gte: start, lte: end } } }),
      ]);

      monthlyDeliveries.push({
        month: months[(currentMonthIdx - i + 12) % 12],
        delivered, inTransit, failed, volume: delivered + inTransit + failed,
      });
    }

    // Revenue by parcel type (group by parcelType on Parcel, sum totalShippingCost)
    const typeGroups = await prisma.parcel.groupBy({
      by: ['parcelType'],
      _sum: { totalShippingCost: true },
      where: { deletedAt: null },
    });

    const byType = typeGroups.map((g: any) => ({
      type: String(g.parcelType || 'STANDARD').charAt(0).toUpperCase() + String(g.parcelType || 'standard').slice(1).toLowerCase(),
      amount: parseFloat(g._sum?.totalShippingCost?.toString() || '0'),
    }));

    // Total from Payment model
    const revenueAgg = await (prisma as any).payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    const pendingCollectionAgg = await prisma.parcel.aggregate({
      _sum: { totalShippingCost: true },
      where: { paymentStatus: 'UNPAID' as any, deletedAt: null },
    });

    return res.json({
      success: true,
      data: {
        monthlyDeliveries,
        revenueReports: {
          totalRevenue: parseFloat(revenueAgg._sum?.amount?.toString() || '0'),
          pendingCollection: parseFloat(pendingCollectionAgg._sum?.totalShippingCost?.toString() || '0'),
          byType,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/audit
 * ActivityLog records (action log from all services)
 * Schema: ActivityLog { userId, userName, userRole, action, entityType, entityId, details, createdAt }
 */
app.get('/api/admin/audit', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const { limit = '100' } = req.query;

    const logs = await (prisma as any).activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(limit)),
      include: { user: { select: { fullName: true, email: true } } },
    });

    const mapped = logs.map((l: any) => ({
      id: l.id,
      user_id: l.userId,
      user_name: l.user?.fullName || l.userName || 'System',
      action: l.action,
      entity_type: l.entityType,
      entity_id: l.entityId,
      details: l.details,
      created_at: l.createdAt?.toISOString(),
    }));

    return res.json({ success: true, data: mapped, meta: { total: mapped.length } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/shippers
 * All customers
 */
app.get('/api/admin/shippers', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: { code: 'CUSTOMER' } },
      include: {
        role: true,
        customerProfile: true,
        createdParcels: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = customers.map((u: any) => ({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.status.toLowerCase(),
      total_shipments: u.createdParcels?.length || 0,
      created_at: u.createdAt.toISOString(),
      account_type: u.customerProfile?.accountType?.toLowerCase() || 'individual',
    }));

    return res.json({ success: true, data: mapped });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/dispatch
 * Dispatch management data
 */
app.get('/api/admin/dispatch', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const [unassigned, activeDeliveries, availableAgents] = await Promise.all([
      prisma.parcel.findMany({
        where: { deletedAt: null, status: 'PENDING' as any, assignedAgentId: null },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
      prisma.parcel.count({ where: { deletedAt: null, status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] as any[] } } }),
      prisma.user.findMany({
        where: { role: { code: 'COURIER_AGENT' }, status: 'ACTIVE' as any },
        include: { deliveryAgentProfile: true },
      }),
    ]);

    // Count active assignments per agent
    const agentWithCounts = await Promise.all(
      availableAgents.map(async (a: any) => {
        const activeCount = await prisma.parcel.count({
          where: {
            assignedAgentId: a.id,
            status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] as any[] },
          },
        });
        return {
          id: a.id,
          full_name: a.fullName,
          email: a.email,
          phone: a.phone,
          active_deliveries: activeCount,
          employee_id: a.deliveryAgentProfile?.employeeCode,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        unassigned_count: unassigned.length,
        active_deliveries: activeDeliveries,
        available_agents: agentWithCounts,
        pending_items: unassigned.map((p: any) => ({
          id: p.id,
          tracking_number: p.trackingNumber,
          pickup_address: p.pickupAddress,
          delivery_address: p.deliveryAddress,
          parcel_type: p.parcelType?.toLowerCase(),
          created_at: p.createdAt.toISOString(),
        })),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/admin/system-health
 * System health status
 */
app.get('/api/admin/system-health', authenticateAdmin, async (_req: any, res: Response) => {
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const [totalUsers, totalParcels] = await Promise.all([
      prisma.user.count(),
      prisma.parcel.count(),
    ]);

    return res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: { status: 'connected', latency_ms: dbLatency },
        counts: { users: totalUsers, parcels: totalParcels },
        uptime: process.uptime(),
        services: {
          'auth-service': { port: 4001, url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001' },
          'order-service': { port: 4003 },
          'shipment-service': { port: 4004 },
          'delivery-service': { port: 4005 },
          'payment-service': { port: 4006 },
          'notification-service': { port: 4007 },
          'admin-service': { port: 4008 },
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, data: { status: 'degraded', error: err.message } });
  }
});

/**
 * GET /api/admin/couriers/:id/document
 * Get agent identity document
 */
app.get('/api/admin/couriers/:id/document', authenticateAdmin, async (req: any, res: Response) => {
  try {
    const agent = await prisma.deliveryAgent.findFirst({ where: { userId: req.params.id } });
    if (!agent) return res.status(404).json({ success: false, error: { message: 'Agent not found' } });

    const secureDir = path.resolve(process.cwd(), 'backend/secure_storage/documents');
    if (!fs.existsSync(secureDir)) {
      return res.status(404).json({ success: false, error: { message: 'Document storage not found' } });
    }

    const files = fs.readdirSync(secureDir);
    const docFile = files.find(f => agent.employeeCode && f.includes(agent.employeeCode));
    if (!docFile) {
      return res.status(404).json({ success: false, error: { message: 'Identity document not found' } });
    }

    const filePath = path.join(secureDir, docFile);
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    };
    res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${docFile}"`);
    res.setHeader('Cache-Control', 'private, no-cache');
    return fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

app.listen(PORT, () => logger.info(`🛡️  Admin Service running on port ${PORT}`));
export default app;
