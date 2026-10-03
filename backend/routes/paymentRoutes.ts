import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { sanitizeInputs } from '../middleware/validationMiddleware';

const router = Router();

router.use(authenticateJwt);

router.post('/checkout', sanitizeInputs, paymentController.processPaymentHandler);
router.get('/history', paymentController.getPaymentsHandler);
router.get('/invoice/:parcelId', paymentController.getInvoiceHandler);

export default router;
