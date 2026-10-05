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
const PORT = parseInt(process.env.PORT || '4004', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] [ShipmentService] ${message}`)),
  transports: [new winston.transports.Console()],
});

const prisma = new PrismaClient({ log: ['error'] });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const authenticate = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, error: { message: 'Token missing' } });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { role: true, customerProfile: true } });
    if (!user) return res.status(401).json({ success: false, error: { message: 'User not found' } });
    req.user = {
      id: user.id, email: user.email, full_name: user.fullName,
      role: user.role.code === 'ADMIN' ? 'admin' : user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
      customerId: user.customerProfile?.id,
    };
    next();
  } catch { return res.status(401).json({ success: false, error: { message: 'Invalid token' } }); }
};

// Generate tracking number
const generateTrackingNumber = () => {
  const year = new Date().getFullYear();
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SR-${year}CA-${code}`;
};

// Calculate cost
const calculateCost = (weightKg: number, parcelType: string): number => {
  const base = 8.99;
  const perKg = 2.5;
  const expressMult = parcelType === 'express' ? 1.8 : 1.0;
  const fragileSurcharge = parcelType === 'fragile' ? 5.0 : 0;
  return parseFloat((base + weightKg * perKg * expressMult + fragileSurcharge).toFixed(2));
};

app.get('/health', (_req, res) => res.json({ service: 'shipment-service', status: 'ok', timestamp: new Date().toISOString() }));

// GET /api/parcels — List parcels
app.get('/api/parcels', authenticate, async (req: any, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = { deletedAt: null };

    if (req.user.role === 'customer') where.senderId = req.user.id;
    if (req.user.role === 'agent') where.assignedAgentId = req.user.id;
    if (status && status !== 'all') where.status = String(status).toUpperCase() as any;
    if (search) {
      where.OR = [
        { trackingNumber: { contains: String(search), mode: 'insensitive' } },
        { recipientName: { contains: String(search), mode: 'insensitive' } },
        { senderName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const parcels = await prisma.parcel.findMany({
      where,
      include: { trackingHistory: { take: 1, orderBy: { recordedAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = parcels.map((p: any) => ({
      id: p.id, tracking_number: p.trackingNumber,
      sender_id: p.senderId, sender_name: p.senderName,
      recipient_name: p.recipientName, recipient_phone: p.recipientPhone,
      recipient_email: p.recipientEmail, pickup_address: p.pickupAddress,
      delivery_address: p.deliveryAddress, weight_kg: parseFloat(p.weightKg),
      dimensions: p.dimensionsText || 'Standard', parcel_type: p.parcelType.toLowerCase(),
      status: p.status.toLowerCase(), assigned_agent_id: p.assignedAgentId,
      shipping_cost: parseFloat(p.totalShippingCost), payment_status: p.paymentStatus.toLowerCase(),
      estimated_delivery: p.estimatedDeliveryDate.toISOString(),
      special_instructions: p.specialInstructions || null,
      created_at: p.createdAt.toISOString(), updated_at: p.updatedAt.toISOString(),
    }));

    return res.json({ success: true, data: mapped, meta: { total: mapped.length } });
  } catch (err: any) {
    logger.error(`Get parcels error: ${err.message}`);
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/parcels — Create parcel
app.post('/api/parcels', authenticate, async (req: any, res: Response) => {
  try {
    const { recipient_name, recipient_phone, recipient_email, pickup_address, delivery_address, weight_kg, dimensions, parcel_type = 'standard', special_instructions } = req.body;
    if (!recipient_name || !recipient_phone || !pickup_address || !delivery_address || !weight_kg) {
      return res.status(422).json({ success: false, error: { message: 'Missing required fields' } });
    }

    // Get or create default category
    let category = await prisma.parcelCategory.findFirst({ where: { code: parcel_type.toUpperCase() } });
    if (!category) category = await prisma.parcelCategory.findFirst();
    if (!category) return res.status(500).json({ success: false, error: { message: 'Parcel categories not seeded' } });

    const weightNum = parseFloat(weight_kg);
    const cost = calculateCost(weightNum, parcel_type);
    const hoursToAdd = parcel_type === 'express' ? 24 : 72;
    const estimatedDelivery = new Date(Date.now() + hoursToAdd * 3600000);

    const parcel = await prisma.parcel.create({
      data: {
        trackingNumber: generateTrackingNumber(),
        senderId: req.user.id,
        senderName: req.user.full_name,
        senderPhone: req.user.phone || '',
        senderEmail: req.user.email,
        recipientName: recipient_name,
        recipientPhone: recipient_phone,
        recipientEmail: recipient_email || null,
        pickupAddress: pickup_address,
        deliveryAddress: delivery_address,
        weightKg: weightNum,
        dimensionsText: dimensions || null,
        parcelType: parcel_type.toUpperCase() as any,
        categoryId: category.id,
        status: 'PENDING',
        baseShippingCost: cost,
        totalShippingCost: cost,
        paymentStatus: 'UNPAID',
        paymentTerms: 'PREPAID',
        estimatedDeliveryDate: estimatedDelivery,
        specialInstructions: special_instructions || null,
        ...(req.user.customerId ? { customerId: req.user.customerId } : {}),
      },
    });

    // Initial tracking entry
    await prisma.trackingHistory.create({
      data: {
        parcelId: parcel.id,
        status: 'PENDING' as any,
        description: 'Shipment booked and registered',
        recordedAt: new Date(),
      },
    });

    const mapped = {
      id: parcel.id, tracking_number: parcel.trackingNumber, sender_id: parcel.senderId,
      sender_name: parcel.senderName, recipient_name: parcel.recipientName,
      pickup_address: parcel.pickupAddress, delivery_address: parcel.deliveryAddress,
      weight_kg: weightNum, parcel_type, status: 'pending',
      shipping_cost: cost, payment_status: 'unpaid',
      estimated_delivery: estimatedDelivery.toISOString(),
      created_at: parcel.createdAt.toISOString(), updated_at: parcel.updatedAt.toISOString(),
    };
    return res.status(201).json({ success: true, data: mapped, message: 'Shipment booked successfully' });
  } catch (err: any) {
    logger.error(`Create parcel error: ${err.message}`);
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/parcels/:id
app.get('/api/parcels/:id', authenticate, async (req: any, res: Response) => {
  try {
    const parcel = await prisma.parcel.findUnique({
      where: { id: req.params.id },
      include: {
        trackingHistory: { orderBy: { recordedAt: 'asc' } },
        deliveryProof: true,
      },
    });
    if (!parcel) return res.status(404).json({ success: false, error: { message: 'Parcel not found' } });
    if (req.user.role === 'customer' && parcel.senderId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    const tracking = parcel.trackingHistory.map((t: any) => ({
      id: t.id, parcel_id: t.parcelId, status: t.status.toLowerCase(),
      location: t.locationName || '', description: t.description || '',
      timestamp: t.recordedAt.toISOString(),
    }));

    const proof = parcel.deliveryProof ? {
      id: parcel.deliveryProof.id, recipient_name: parcel.deliveryProof.recipientName,
      signature_url: parcel.deliveryProof.signatureUrl, photo_url: parcel.deliveryProof.photoUrl,
      notes: parcel.deliveryProof.notes, delivered_at: parcel.deliveryProof.deliveredAt.toISOString(),
    } : null;

    return res.json({
      success: true,
      data: {
        parcel: {
          id: parcel.id, tracking_number: parcel.trackingNumber, sender_id: parcel.senderId,
          sender_name: parcel.senderName, recipient_name: parcel.recipientName,
          pickup_address: parcel.pickupAddress, delivery_address: parcel.deliveryAddress,
          weight_kg: parseFloat(parcel.weightKg as any), parcel_type: parcel.parcelType.toLowerCase(),
          status: parcel.status.toLowerCase(), assigned_agent_id: parcel.assignedAgentId,
          shipping_cost: parseFloat(parcel.totalShippingCost as any), payment_status: parcel.paymentStatus.toLowerCase(),
          estimated_delivery: parcel.estimatedDeliveryDate.toISOString(),
          special_instructions: parcel.specialInstructions || null,
          created_at: parcel.createdAt.toISOString(), updated_at: parcel.updatedAt.toISOString(),
        },
        tracking,
        proof,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/parcels/:id/status
app.patch('/api/parcels/:id/status', authenticate, async (req: any, res: Response) => {
  try {
    const { status, location, description } = req.body;
    if (!status) return res.status(400).json({ success: false, error: { message: 'Status required' } });

    const updated = await prisma.parcel.update({
      where: { id: req.params.id },
      data: {
        status: status.toUpperCase() as any,
        ...(status.toUpperCase() === 'DELIVERED' ? { actualDeliveryDate: new Date() } : {}),
      },
    });

    await prisma.trackingHistory.create({
      data: {
        parcelId: updated.id,
        status: status.toUpperCase() as any,
        locationName: location || null,
        description: description || `Status updated to ${status}`,
        recordedAt: new Date(),
      },
    });

    return res.json({ success: true, data: { id: updated.id, status: updated.status.toLowerCase() }, message: `Status updated to ${status}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/parcels/:id/assign
app.patch('/api/parcels/:id/assign', authenticate, async (req: any, res: Response) => {
  try {
    const { agent_id } = req.body;
    if (!agent_id) return res.status(400).json({ success: false, error: { message: 'agent_id required' } });

    const agent = await prisma.user.findUnique({ where: { id: agent_id }, include: { role: true } });
    if (!agent) return res.status(404).json({ success: false, error: { message: 'Agent not found' } });

    const updated = await prisma.parcel.update({
      where: { id: req.params.id },
      data: { assignedAgentId: agent_id, assignedAt: new Date(), status: 'ASSIGNED' as any },
    });
    return res.json({ success: true, data: { id: updated.id, assigned_agent_id: agent_id, status: 'assigned' }, message: 'Agent assigned' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/parcels/:id/proof — Delivery proof
app.post('/api/parcels/:id/proof', authenticate, async (req: any, res: Response) => {
  try {
    const { recipient_name, signature_url, photo_url, notes } = req.body;
    if (!recipient_name) return res.status(422).json({ success: false, error: { message: 'recipient_name required' } });

    const proof = await prisma.deliveryProof.create({
      data: {
        parcelId: req.params.id,
        agentId: req.user.id,
        recipientName: recipient_name,
        signatureUrl: signature_url || null,
        photoUrl: photo_url || null,
        notes: notes || null,
        deliveredAt: new Date(),
        recipientRelationship: 'SELF' as any,
      },
    });

    await prisma.parcel.update({
      where: { id: req.params.id },
      data: { status: 'DELIVERED' as any, actualDeliveryDate: new Date() },
    });

    return res.status(201).json({ success: true, data: proof, message: 'Delivery proof recorded' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/tracking/:trackingNumber — Public tracking
app.get('/api/tracking/:trackingNumber', async (req: any, res: Response) => {
  try {
    const parcel = await prisma.parcel.findUnique({
      where: { trackingNumber: req.params.trackingNumber },
      include: { trackingHistory: { orderBy: { recordedAt: 'asc' } }, deliveryProof: true },
    });
    if (!parcel) return res.status(404).json({ success: false, error: { message: 'Parcel not found' } });

    return res.json({
      success: true,
      data: {
        parcel: { id: parcel.id, tracking_number: parcel.trackingNumber, status: parcel.status.toLowerCase(), recipient_name: parcel.recipientName, delivery_address: parcel.deliveryAddress, estimated_delivery: parcel.estimatedDeliveryDate.toISOString() },
        tracking: parcel.trackingHistory.map((t: any) => ({ id: t.id, status: t.status.toLowerCase(), location: t.locationName || '', description: t.description || '', timestamp: t.recordedAt.toISOString() })),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

app.listen(PORT, () => logger.info(`🚚 Shipment Service running on port ${PORT}`));
export default app;
