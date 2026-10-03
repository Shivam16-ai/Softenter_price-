import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../database/connection';
import * as assistantController from '../controllers/assistantController';

const router = Router();

// Optional auth helper: decodes JWT if present, but does not block visitors/guests
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
      const users = db.getTable('users');
      const user = users.find((u) => u.id === decoded.id);
      if (user && user.status !== 'suspended') {
        const { password_hash, ...safeUser } = user;
        (req as any).user = safeUser;
      }
    } catch {
      // ignore invalid token in optional auth
    }
  }
  next();
};

router.post('/chat', optionalAuth, assistantController.handleAssistantChat);
router.get('/suggestions', optionalAuth, assistantController.getAssistantSuggestions);

export default router;
