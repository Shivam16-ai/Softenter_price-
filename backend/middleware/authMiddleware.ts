import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../database/prisma';
import { sendError } from '../utils/apiResponse';
import { User } from '../../shared/types';

export interface AuthenticatedRequest extends Request {
  user?: any; // Will contain mapped user object
}

export const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
    
    // Fetch user from PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: true,
        customerProfile: true,
        deliveryAgentProfile: true,
      },
    });

    if (!user) {
      return sendError(res, 'User account no longer exists', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Your account is suspended. Please contact dispatch support.', 403);
    }

    // Map to legacy format for backward compatibility with existing controllers
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
      // Additional Prisma data
      roleId: user.roleId,
      roleCode: user.role.code,
      customerProfile: user.customerProfile,
      deliveryAgentProfile: user.deliveryAgentProfile,
    };
    
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired session token', 401);
  }
};
