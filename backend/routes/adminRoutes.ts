import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { sanitizeInputs } from '../middleware/validationMiddleware';

const router = Router();

// Admin protection for all admin routes
router.use(authenticateJwt, requireRoles('admin'));

router.get('/stats', adminController.getDashboardStatsHandler);
router.get('/reports', adminController.getReportsHandler);
router.get('/users', adminController.getUsersHandler);
router.post('/agents', sanitizeInputs, adminController.createAgentHandler);
router.patch('/users/:id/status', sanitizeInputs, adminController.updateUserStatusHandler);
router.patch('/agents/:id/verification', sanitizeInputs, adminController.updateAgentVerificationHandler);
router.get('/agents/:id/document', adminController.getAgentDocumentHandler);
router.get('/activity-logs', adminController.getActivityLogsHandler);
router.get('/settings', adminController.getSettingsHandler);
router.put('/settings', sanitizeInputs, adminController.updateSettingsHandler);

export default router;
