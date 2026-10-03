import { Router } from 'express';
import authRoutes from './authRoutes';
import parcelRoutes from './parcelRoutes';
import trackingRoutes from './trackingRoutes';
import paymentRoutes from './paymentRoutes';
import adminRoutes from './adminRoutes';
import assistantRoutes from './assistantRoutes';
import orderHubRoutes from './orderHubRoutes';
import realtimeRoutes from './realtimeRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/parcels', parcelRoutes);
router.use('/tracking', trackingRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/assistant', assistantRoutes);
router.use('/order-hub', orderHubRoutes);
router.use('/realtime', realtimeRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwiftRoute Parcel Management API',
    version: '1.0.0',
  });
});

export default router;
