import { Router } from 'express';
import { getRestaurantAnalytics, getAdminAnalytics } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/restaurant/:restaurantId', requireRole('restaurant', 'admin'), getRestaurantAnalytics);
router.get('/admin', requireRole('admin'), getAdminAnalytics);

export default router;
