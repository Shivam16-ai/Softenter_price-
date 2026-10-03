/**
 * Real-Time Controller
 * Handles SSE (Server-Sent Events) connections for real-time updates
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { realtimeService } from '../services/realtimeService';
import { sendSuccess } from '../utils/apiResponse';

/**
 * Establish SSE connection for real-time updates
 * GET /api/realtime/stream
 */
export const streamUpdates = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  // Only customers can stream updates
  if (user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Real-time updates are only available for customers',
    });
  }

  // Register the SSE connection
  realtimeService.addConnection(user.id, res);

  // Connection will stay open until client disconnects
  // The realtimeService will handle sending events
};

/**
 * Get connection status
 * GET /api/realtime/status
 */
export const getConnectionStatus = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const connectionCount = realtimeService.getCustomerConnections(user.id);
  const totalConnections = realtimeService.getTotalConnections();

  sendSuccess(res, {
    customerId: user.id,
    connections: connectionCount,
    totalSystemConnections: totalConnections,
    status: connectionCount > 0 ? 'connected' : 'disconnected',
  }, 'Connection status retrieved');
};

/**
 * Test endpoint to trigger a test notification (dev/debug only)
 * POST /api/realtime/test
 */
export const sendTestNotification = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  realtimeService.notifyCustomer(user.id, 'test_notification', {
    message: 'This is a test notification',
    timestamp: new Date().toISOString(),
  });

  sendSuccess(res, null, 'Test notification sent');
};
