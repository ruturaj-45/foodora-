import { Router } from 'express';
import {
  getRestaurants,
  updateRestaurantStatus,
  getCustomers,
  updateCustomerStatus,
  getAllOrders,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/restaurants', getRestaurants);
router.patch('/restaurants/:id/status', updateRestaurantStatus);
router.get('/customers', getCustomers);
router.patch('/customers/:id/status', updateCustomerStatus);
router.get('/orders', getAllOrders);

export default router;
