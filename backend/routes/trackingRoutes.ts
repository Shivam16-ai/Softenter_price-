import { Router } from 'express';
import * as trackingController from '../controllers/trackingController';

const router = Router();

// Public shipment tracking endpoint
router.get('/:trackingNumber', trackingController.trackParcel);

export default router;
