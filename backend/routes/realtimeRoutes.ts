/**
 * Real-Time Routes
 * Server-Sent Events (SSE) for real-time customer notifications
 */

import { Router } from 'express';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import * as realtimeController from '../controllers/realtimeController';

const router = Router();

// All realtime routes require authentication
router.use(authenticateJwt);

/**
 * @route   GET /api/realtime/stream
 * @desc    Establish SSE connection for real-time updates
 * @access  Customer only
 */
router.get('/stream', requireRoles('customer'), realtimeController.streamUpdates);

/**
 * @route   GET /api/realtime/status
 * @desc    Get connection status
 * @access  Authenticated users
 */
router.get('/status', realtimeController.getConnectionStatus);

/**
 * @route   POST /api/realtime/test
 * @desc    Send test notification (dev/debug)
 * @access  Authenticated users
 */
router.post('/test', realtimeController.sendTestNotification);

export default router;
