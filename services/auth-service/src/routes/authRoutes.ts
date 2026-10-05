import { Router } from 'express';
import passport from '../config/passport';
import * as authController from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

// Traditional auth
router.post('/register', authController.register);
router.post('/register-agent', authController.registerAgent);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticateJwt, authController.getCurrentUser);
router.put('/profile', authenticateJwt, authController.updateProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=google_auth_failed' }),
  authController.googleCallback
);

export default router;
