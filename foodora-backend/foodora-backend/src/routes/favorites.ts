import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoritesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;
