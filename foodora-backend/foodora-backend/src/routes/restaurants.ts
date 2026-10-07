import { Router } from 'express';
import {
  listRestaurants, getRestaurant, getMenu,
  addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability
} from '../controllers/restaurantController';
import { getReviews } from '../controllers/reviewController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/',           listRestaurants);
router.get('/:id',        getRestaurant);
router.get('/:id/menu',   getMenu);
router.get('/:id/reviews', getReviews as any);

// Restaurant-owner protected
router.post  ('/:id/menu',                    authenticate, requireRole('restaurant','admin'), addMenuItem);
router.put   ('/:id/menu/:foodId',            authenticate, requireRole('restaurant','admin'), updateMenuItem);
router.delete('/:id/menu/:foodId',            authenticate, requireRole('restaurant','admin'), deleteMenuItem);
router.patch ('/:id/menu/:foodId/availability', authenticate, requireRole('restaurant','admin'), toggleAvailability);

export default router;
