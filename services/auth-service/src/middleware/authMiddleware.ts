import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/prisma';
import { logger } from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_MISSING', message: 'Authentication token missing' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true, customerProfile: true, deliveryAgentProfile: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists' } });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Account suspended' } });
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      address: user.address || '',
      avatar_url: user.avatarUrl || null,
      role: user.role.code === 'ADMIN' ? 'admin' :
            user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
      status: user.status.toLowerCase(),
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      customerProfile: user.customerProfile,
      deliveryAgentProfile: user.deliveryAgentProfile,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' } });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
};
