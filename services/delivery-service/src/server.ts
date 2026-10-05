import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4005', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] [DeliveryService] ${message}`)),
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
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { role: true, deliveryAgentProfile: true } });
    if (!user) return res.status(401).json({ success: false, error: { message: 'User not found' } });
    req.user = {
      id: user.id, email: user.email, full_name: user.fullName,
      role: user.role.code === 'ADMIN' ? 'admin' : user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
      agentId: user.deliveryAgentProfile?.id,
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

app.get('/health', (_req, res) => res.json({ service: 'delivery-service', status: 'ok', timestamp: new Date().toISOString() }));

// GET /api/delivery/assignments — Agent's assigned parcels
app.get('/api/delivery/assignments', authenticate, requireRole('agent', 'admin'), async (req: any, res: Response) => {
  try {
    const where: any = { deletedAt: null };
    if (req.user.role === 'agent') where.assignedAgentId = req.user.id;

    const parcels = await prisma.parcel.findMany({
      where,
      include: { trackingHistory: { take: 1, orderBy: { recordedAt: 'desc' } } },
      orderBy: { assignedAt: 'desc' },
    });

    const mapped = parcels.map((p: any) => ({
      id: p.id, tracking_number: p.trackingNumber, sender_name: p.senderName,
      recipient_name: p.recipientName, recipient_phone: p.recipientPhone,
      pickup_address: p.pickupAddress, delivery_address: p.deliveryAddress,
      weight_kg: parseFloat(p.weightKg), parcel_type: p.parcelType.toLowerCase(),
      status: p.status.toLowerCase(), assigned_agent_id: p.assignedAgentId,
      estimated_delivery: p.estimatedDeliveryDate.toISOString(),
      special_instructions: p.specialInstructions || null,
      created_at: p.createdAt.toISOString(), updated_at: p.updatedAt.toISOString(),
    }));
    return res.json({ success: true, data: mapped });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/delivery/assign — Assign parcel to agent (admin only)
app.post('/api/delivery/assign', authenticate, requireRole('admin'), async (req: any, res: Response) => {
  try {
    const { parcel_id, agent_id } = req.body;
    if (!parcel_id || !agent_id) return res.status(422).json({ success: false, error: { message: 'parcel_id and agent_id required' } });

    const updated = await prisma.parcel.update({
      where: { id: parcel_id },
      data: { assignedAgentId: agent_id, assignedAt: new Date(), status: 'ASSIGNED' as any },
    });

    return res.json({ success: true, data: { id: updated.id, status: 'assigned', assigned_agent_id: agent_id }, message: 'Agent assigned' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/delivery/:id/status — Update delivery status
app.patch('/api/delivery/:id/status', authenticate, requireRole('agent', 'admin'), async (req: any, res: Response) => {
  try {
    const { status, location, description } = req.body;
    if (!status) return res.status(400).json({ success: false, error: { message: 'Status required' } });

    const parcel = await prisma.parcel.findUnique({ where: { id: req.params.id } });
    if (!parcel) return res.status(404).json({ success: false, error: { message: 'Parcel not found' } });

    // Agents can only update their own assignments
    if (req.user.role === 'agent' && parcel.assignedAgentId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Not your assignment' } });
    }

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

// POST /api/delivery/:id/proof — Submit delivery proof
app.post('/api/delivery/:id/proof', authenticate, requireRole('agent', 'admin'), async (req: any, res: Response) => {
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

    await prisma.trackingHistory.create({
      data: {
        parcelId: req.params.id,
        status: 'DELIVERED' as any,
        description: `Delivered to ${recipient_name}`,
        recordedAt: new Date(),
      },
    });

    logger.info(`Delivery proof submitted for parcel ${req.params.id}`);
    return res.status(201).json({ success: true, data: { id: proof.id, recipient_name: proof.recipientName, delivered_at: proof.deliveredAt.toISOString() }, message: 'Proof recorded' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message } });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

app.listen(PORT, () => logger.info(`🏃 Delivery Service running on port ${PORT}`));
export default app;
