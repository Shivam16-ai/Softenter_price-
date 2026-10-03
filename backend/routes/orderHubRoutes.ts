import { Router } from 'express';
import * as orderHubController from '../controllers/orderHubController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { sanitizeInputs } from '../middleware/validationMiddleware';

const router = Router();

// All order hub operations require authentication
router.use(authenticateJwt);

// =============================================================================
// UNIVERSAL ORDER HUB - EXTERNAL ORDERS
// =============================================================================

// Get order hub dashboard stats
router.get('/stats', orderHubController.getOrderHubStatsHandler);

// Get all orders (SwiftRoute + External combined)
router.get('/orders/all', orderHubController.getAllOrdersHandler);

// Get external orders only
router.get('/orders', orderHubController.getExternalOrdersHandler);

// Create external order (manual import)
router.post('/orders', requireRoles('customer'), sanitizeInputs, orderHubController.createExternalOrderHandler);

// Import by tracking number
router.post('/orders/import-tracking', requireRoles('customer'), sanitizeInputs, orderHubController.importTrackingNumberHandler);

// Get specific external order
router.get('/orders/:id', orderHubController.getExternalOrderByIdHandler);

// Update external order status (Admin/Agent)
router.patch('/orders/:id/status', requireRoles('agent', 'admin'), sanitizeInputs, orderHubController.updateExternalOrderStatusHandler);

// Delete external order (Customer only their own)
router.delete('/orders/:id', requireRoles('customer'), orderHubController.deleteExternalOrderHandler);

// =============================================================================
// RETURNS / REVERSE LOGISTICS
// =============================================================================

// Get return requests
router.get('/returns', orderHubController.getReturnRequestsHandler);

// Create return request (Customer only)
router.post('/returns', requireRoles('customer'), sanitizeInputs, orderHubController.createReturnRequestHandler);

// Get specific return request
router.get('/returns/:id', orderHubController.getReturnRequestByIdHandler);

// =============================================================================
// NOTIFICATIONS
// =============================================================================

// Get customer notifications
router.get('/notifications', requireRoles('customer'), orderHubController.getNotificationsHandler);

// Get unread notification count
router.get('/notifications/unread/count', requireRoles('customer'), orderHubController.getUnreadCountHandler);

// Mark notification as read
router.patch('/notifications/:id/read', requireRoles('customer'), orderHubController.markNotificationReadHandler);

// Mark all notifications as read
router.post('/notifications/read-all', requireRoles('customer'), orderHubController.markAllNotificationsReadHandler);

// =============================================================================
// DELIVERY PREFERENCES
// =============================================================================

// Get delivery preferences
router.get('/preferences', requireRoles('customer'), orderHubController.getDeliveryPreferencesHandler);

// Set/update delivery preference
router.post('/preferences', requireRoles('customer'), sanitizeInputs, orderHubController.setDeliveryPreferenceHandler);

// Toggle delivery preference
router.patch('/preferences/toggle', requireRoles('customer'), sanitizeInputs, orderHubController.toggleDeliveryPreferenceHandler);

export default router;
