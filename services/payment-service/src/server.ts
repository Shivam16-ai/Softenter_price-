import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4006', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system';

// ─── Logger ───────────────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] [${level.toUpperCase()}] [PaymentService] ${message}`)
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
  res.json({ service: 'payment-service', status: 'ok', timestamp: new Date().toISOString() })
);

// ─── PAYMENT ROUTES ───────────────────────────────────────────────────────────

/**
 * POST /api/payments/checkout
 * Process payment for a parcel
 */
app.post('/api/payments/checkout', authenticate, requireRole('customer', 'admin'), async (req: any, res: Response) => {
  try {
    const { parcel_id, payment_method = 'CREDIT_CARD' } = req.body;

    if (!parcel_id) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FIELD', message: 'parcel_id is required' } });
    }

    // Find the parcel — schema field: totalShippingCost, paymentStatus, senderId
    const parcel = await prisma.parcel.findUnique({ where: { id: parcel_id } });
    if (!parcel) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parcel not found' } });
    }

    // Customers can only pay for their own parcels
    if (req.user.role === 'customer' && parcel.senderId !== req.user.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You can only pay for your own parcels' } });
    }

    if ((parcel as any).paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_PAID', message: 'This shipment has already been paid' } });
    }

    const paymentReference = `PAY-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const amount = parseFloat((parcel as any).totalShippingCost?.toString() || '0');

    // Create Payment record using the schema's Payment model
    const payment = await (prisma as any).payment.create({
      data: {
        paymentReference,
        parcelId: parcel_id,
        payerUserId: req.user.id,
        amount: amount,
        currencyCode: 'INR',
        paymentMethod: payment_method.toUpperCase(),
        transactionId,
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Mark parcel as PAID
    await prisma.parcel.update({
      where: { id: parcel_id },
      data: { paymentStatus: 'PAID' as any },
    });

    logger.info(`Payment processed: ${paymentReference} for parcel ${parcel.trackingNumber}`);

    return res.status(201).json({
      success: true,
      data: {
        payment_id: payment.id,
        payment_reference: paymentReference,
        transaction_id: transactionId,
        amount,
        status: 'completed',
        parcel_tracking: parcel.trackingNumber,
      },
      message: 'Payment authorized and settled successfully',
    });
  } catch (err: any) {
    logger.error(`Payment error: ${err.message}`);
    return res.status(500).json({ success: false, error: { code: 'PAYMENT_FAILED', message: err.message } });
  }
});

/**
 * GET /api/payments/history
 * Get payment history (customer: own; admin: all)
 */
app.get('/api/payments/history', authenticate, async (req: any, res: Response) => {
  try {
    const where: any = {};

    if (req.user.role === 'customer') {
      where.payerUserId = req.user.id;
    }
    // admin and agent get all

    const payments = await (prisma as any).payment.findMany({
      where,
      include: {
        parcel: {
          select: { trackingNumber: true, recipientName: true, senderName: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = payments.map((p: any) => ({
      id: p.id,
      payment_reference: p.paymentReference,
      parcel_id: p.parcelId,
      parcel_tracking: p.parcel?.trackingNumber,
      parcel_recipient: p.parcel?.recipientName,
      amount: parseFloat(p.amount?.toString() || '0'),
      currency: p.currencyCode,
      payment_method: p.paymentMethod?.toLowerCase(),
      transaction_id: p.transactionId,
      status: p.status?.toLowerCase(),
      created_at: p.createdAt?.toISOString(),
      processed_at: p.processedAt?.toISOString() || null,
    }));

    return res.json({ success: true, data: mapped, meta: { total: mapped.length } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/payments/invoice/:parcelId
 * Generate invoice for a parcel
 */
app.get('/api/payments/invoice/:parcelId', authenticate, async (req: any, res: Response) => {
  try {
    const parcel = await prisma.parcel.findUnique({
      where: { id: req.params.parcelId },
      include: {
        sender: true,
      },
    });

    if (!parcel) {
      return res.status(404).json({ success: false, error: { message: 'Parcel not found' } });
    }

    if (req.user.role === 'customer' && parcel.senderId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const payment = await (prisma as any).payment.findFirst({
      where: { parcelId: req.params.parcelId },
      orderBy: { createdAt: 'desc' },
    });

    const totalShipping = parseFloat((parcel as any).totalShippingCost?.toString() || '0');
    const baseShipping = parseFloat((parcel as any).baseShippingCost?.toString() || '0');
    const surcharge = parseFloat((parcel as any).surchargeAmount?.toString() || '0');
    const taxAmount = parseFloat((parcel as any).taxAmount?.toString() || '0');

    const invoice = {
      invoiceNumber: `INV-${parcel.trackingNumber}`,
      invoiceDate: parcel.createdAt.toISOString(),
      dueDate: parcel.createdAt.toISOString(),
      company: {
        name: 'SwiftRoute Enterprise Logistics',
        email: 'support@swiftroute.com',
        phone: '+1 (555) 019-2831',
        address: 'One Maritime Plaza, Suite 2400, San Francisco, CA 94111',
        taxId: 'US-EIN-88-2910481',
      },
      sender: {
        name: parcel.senderName,
        email: (parcel as any).sender?.email || 'N/A',
        address: parcel.pickupAddress,
      },
      recipient: {
        name: parcel.recipientName,
        phone: parcel.recipientPhone,
        address: parcel.deliveryAddress,
      },
      parcelDetails: {
        trackingNumber: parcel.trackingNumber,
        type: parcel.parcelType?.toLowerCase(),
        weight: `${parcel.weightKg} kg`,
        status: parcel.status?.toLowerCase(),
      },
      charges: [
        { description: `Base freight charge`, amount: baseShipping },
        { description: `Service & handling surcharge`, amount: surcharge },
        { description: `Applicable taxes`, amount: taxAmount },
      ],
      subtotal: totalShipping - taxAmount,
      tax: taxAmount,
      total: totalShipping,
      paymentStatus: (parcel as any).paymentStatus?.toLowerCase(),
      transactionId: payment?.transactionId || 'PENDING',
      paymentMethod: payment?.paymentMethod?.toLowerCase() || 'PENDING',
    };

    return res.json({ success: true, data: invoice, message: 'Invoice generated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/payments/:id
 * Single payment record
 */
app.get('/api/payments/:id', authenticate, async (req: any, res: Response) => {
  try {
    const payment = await (prisma as any).payment.findUnique({
      where: { id: req.params.id },
      include: {
        parcel: { select: { trackingNumber: true, recipientName: true, senderId: true } },
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: { message: 'Payment not found' } });
    }

    if (req.user.role === 'customer' && payment.payerUserId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    return res.json({
      success: true,
      data: {
        id: payment.id,
        payment_reference: payment.paymentReference,
        amount: parseFloat(payment.amount?.toString()),
        currency: payment.currencyCode,
        payment_method: payment.paymentMethod?.toLowerCase(),
        transaction_id: payment.transactionId,
        status: payment.status?.toLowerCase(),
        created_at: payment.createdAt?.toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

app.listen(PORT, () => logger.info(`💳 Payment Service running on port ${PORT}`));
export default app;
