import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { sanitizeInputs } from '../middleware/validationMiddleware';

const router = Router();

// Traditional auth routes
router.post('/register', sanitizeInputs, authController.register);
router.post('/register-agent', sanitizeInputs, authController.registerAgent);
router.post('/login', sanitizeInputs, authController.login);
router.post('/reset-password', sanitizeInputs, authController.resetPassword);
router.get('/me', authenticateJwt, authController.getCurrentUser);
router.put('/profile', authenticateJwt, sanitizeInputs, authController.updateProfile);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/auth?error=google_auth_failed' 
  }),
  authController.googleCallback
);

export default router;
