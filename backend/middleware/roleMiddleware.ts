import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { sendError } from '../utils/apiResponse';
import { UserRole } from '../../shared/types';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized: please sign in first', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};
