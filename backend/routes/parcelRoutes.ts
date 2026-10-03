import { Router } from 'express';
import * as parcelController from '../controllers/parcelController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import { sanitizeInputs } from '../middleware/validationMiddleware';

const router = Router();

// All parcel operations require authentication
router.use(authenticateJwt);

// Book parcel (Customer & Admin)
router.post('/', requireRoles('customer', 'admin'), sanitizeInputs, parcelController.createParcelHandler);

// View list of parcels (Customer, Agent, Admin)
router.get('/', parcelController.getParcelsHandler);

// View specific parcel detail
router.get('/:id', parcelController.getParcelByIdHandler);

// Update parcel status (Agent & Admin)
router.patch('/:id/status', requireRoles('agent', 'admin'), sanitizeInputs, parcelController.updateStatusHandler);

// Assign courier agent (Admin only)
router.patch('/:id/assign', requireRoles('admin'), sanitizeInputs, parcelController.assignAgentHandler);

// Submit delivery proof (Agent only)
router.post('/:id/proof', requireRoles('agent', 'admin'), sanitizeInputs, parcelController.submitProofHandler);

export default router;
