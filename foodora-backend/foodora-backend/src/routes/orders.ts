import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrderById,
  getRestaurantOrders, updateOrderStatus
} from '../controllers/orderController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/',                              requireRole('customer'), createOrder);
router.get('/',                               getMyOrders);
router.get('/restaurant/:restaurantId',       requireRole('restaurant','admin'), getRestaurantOrders);
router.get('/:id',                            getOrderById);
router.patch('/:id/status',                   requireRole('restaurant','admin'), updateOrderStatus);

export default router;
