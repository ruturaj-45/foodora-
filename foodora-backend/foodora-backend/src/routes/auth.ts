import { Router } from 'express';
import { signup, login, getMe, updateProfile, getAddresses, addAddress, deleteAddress } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login',  login);
router.get('/me',      authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/addresses',        authenticate, getAddresses);
router.post('/addresses',       authenticate, addAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;
